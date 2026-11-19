'use client';

import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';
import { useCallback, useEffect, useRef, useState } from 'react';
import ChessGame from './ChessGame';
import ComputerModal from './ComputerModal';
import ContactModal from './ContactModal';
import ContentModal, { type ContentPage } from './ContentModal';
import ResumeDocument from './ResumeDocument';
import SiteMenu, { type MenuSection } from './SiteMenu';
import { useDialogFocus } from './useDialogFocus';


const SCENE_URL = 'https://prod.spline.design/kjrBhZa1G3SP0mmG/scene.splinecode';

// Spline's built-in camera controls let visitors drag/scroll the camera around. The room has its own
// gentle mouse-follow instead (in the Spline scene's script), so remove those controls as soon as the
// scene loads. Just switching them off isn't enough: they'd still re-aim the camera every frame and
// erase the mouse-follow. This is the same cleanup Spline does itself (dispose, then forget them).
function removeCameraControls(app: Application) {
  const controls = app.controls;
  if (!controls?.orbitControls) return;
  controls.orbitControls.dispose();
  controls.orbitControls = undefined;
}

// Which content modal each clickable object opens (the section name comes from the Spline scene)
//   military = Marine Corps flag + ATC tower,  ohio = Ohio flag
const CONTENT: Record<string, ContentPage> = {
  military: 'military',
  ohio: 'about',
};

// How long the "zoom out of the monitor" takes before the modal is removed (match globals.css)
const COMPUTER_CLOSE_MS = 750;

// The computer modal: where it zooms from (the click point) and whether it's closing.
// x/y = the click on the SCREEN (where the monitor flies out from); ox = the same spot measured inside the room,
// which differs once the room has been scrolled sideways (portrait screens).
type ComputerState = { x: number; y: number; ox: number; closing: boolean };

export default function Room() {
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false); // the room hasn't loaded after a while (slow connection / old computer)
  const [resumeOpen, setResumeOpen] = useState(false);
  const [chessOpen, setChessOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [computer, setComputer] = useState<ComputerState | null>(null);
  const [content, setContent] = useState<ContentPage | null>(null); // About / Military modal
  // where the last click/tap in the room happened (the monitor, when the computer opens)
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  // the box the room scrolls sideways in (only on screens taller than they are wide)
  const scroller = useRef<HTMLDivElement>(null);

  // Portrait screens: the room is wider than the screen, so start with it centered on the desk.
  // Runs again when the room finishes loading and when the phone is turned or the window resized.
  useEffect(() => {
    const center = () => {
      const s = scroller.current;
      if (s) s.scrollLeft = (s.scrollWidth - s.clientWidth) / 2;
    };
    center();
    window.addEventListener('resize', center);
    return () => window.removeEventListener('resize', center);
  }, [loaded]);

  // Swiping the room sideways. Spline's canvas cancels the browser's own touch scrolling (it wants touches for
  // itself), so the swipe is done here by hand: the room moves with the finger. On wide screens there's nothing
  // to scroll, so this does nothing there. (A swipe that starts on an object doesn't count as a tap; the scene
  // script only treats a touch as a tap if the finger lifts without moving.)
  useEffect(() => {
    const s = scroller.current;
    if (!s) return;
    let startX = 0, startScroll = 0, swiping = false;
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || s.scrollWidth <= s.clientWidth) return;
      swiping = true;
      startX = e.touches[0].clientX;
      startScroll = s.scrollLeft;
    };
    const onMove = (e: TouchEvent) => {
      if (!swiping || e.touches.length !== 1) return;
      s.scrollLeft = startScroll - (e.touches[0].clientX - startX); // finger goes left -> room shows more of the right
    };
    const onEnd = () => { swiping = false; };
    s.addEventListener('touchstart', onStart, { passive: true });
    s.addEventListener('touchmove', onMove, { passive: true });
    s.addEventListener('touchend', onEnd);
    s.addEventListener('touchcancel', onEnd);
    return () => {
      s.removeEventListener('touchstart', onStart);
      s.removeEventListener('touchmove', onMove);
      s.removeEventListener('touchend', onEnd);
      s.removeEventListener('touchcancel', onEnd);
    };
  }, []);

  // remember every click position (capture = we see it before Spline does)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => { lastPointer.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('pointerdown', onPointerDown, true);
    return () => window.removeEventListener('pointerdown', onPointerDown, true);
  }, []);

  // play the zoom-out, then remove the modal
  const closeComputer = useCallback(() => {
    setComputer((c) => (c ? { ...c, closing: true } : c));
    setTimeout(() => setComputer((c) => (c?.closing ? null : c)), COMPUTER_CLOSE_MS);
  }, []);

  // Opens the modal for a section. Used by clicks in the 3D room AND by the menu.
  // `from` = where the computer zoom starts (the click point); none = the middle of the screen.
  const openSection = useCallback((section: string, from?: { x: number; y: number } | null) => {
    if (section === 'chess') { setChessOpen(true); return; }
    if (section === 'frame') { setResumeOpen(true); return; }
    if (section === 'contact') { setContactOpen(true); return; }
    if (section === 'computer') {
      const p = from ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      setComputer({ ...p, ox: p.x + (scroller.current?.scrollLeft ?? 0), closing: false });
      return;
    }
    // About / Military open as modals, so the room never leaves the page
    // (leaving with router.push destroys the Spline scene and breaks its clicks after Back)
    const page = CONTENT[section];
    if (page) setContent(page);
  }, []);

  // From the menu: close whatever is open first, so only one modal shows at a time
  const openFromMenu = useCallback((section: MenuSection) => {
    setResumeOpen(false);
    setChessOpen(false);
    setContactOpen(false);
    setContent(null);
    setComputer(null);
    openSection(section);
  }, [openSection]);

  useEffect(() => {
    // The scene reports a click on mouse DOWN. If a modal appeared right then, the mouse UP would
    // land on the modal instead of the scene, Spline would think the button is still held, and
    // every later click in the room would be ignored. So a modal waits for the mouse UP first.
    let pointerDown = false;
    let pendingOpen: (() => void) | null = null;
    let safety: ReturnType<typeof setTimeout> | undefined;
    const runPending = () => {
      clearTimeout(safety);
      const open = pendingOpen;
      pendingOpen = null;
      open?.();
    };
    const openWhenReleased = (open: () => void) => {
      if (!pointerDown) { open(); return; }
      pendingOpen = open;
      safety = setTimeout(runPending, 1500); // in case the mouse-up message never comes
    };

    const press = () => { pointerDown = true; };
    const release = () => {
      pointerDown = false;
      // open on the next frame, after Spline has handled the mouse-up itself
      if (pendingOpen) requestAnimationFrame(runPending);
    };

    // Newer Spline runtimes run the scene's script right in this page, so the real mouse events
    // arrive here directly. (Older ones ran it in a helper frame, which forwards them as messages below.)
    window.addEventListener('pointerdown', press, true);
    window.addEventListener('pointerup', release, true);
    window.addEventListener('pointercancel', release, true);

    const onMessage = (e: MessageEvent) => {
      const d = e.data;
      // the scene's helper frame forwards every pointer event to the page as { kind: 'input', event }
      if (d?.kind === 'input' && d.event) {
        const t = d.event.type;
        if (t === 'pointerdown') {
          press();
          lastPointer.current = { x: d.event.x, y: d.event.y };
        } else if (t === 'pointerup' || t === 'pointercancel') {
          release();
        }
        return;
      }
      if (d?.type === 'portfolio-ready') setReady(true);
      if (d?.type === 'portfolio-section') {
        const section = d.section as string;
        // a click in the room: the computer zooms from where you clicked
        openWhenReleased(() => openSection(section, lastPointer.current));
      }
    };
    window.addEventListener('message', onMessage);
    const fallback = setTimeout(() => setReady(true), 8000);
    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('pointerdown', press, true);
      window.removeEventListener('pointerup', release, true);
      window.removeEventListener('pointercancel', release, true);
      clearTimeout(fallback);
      clearTimeout(safety);
    };
  }, [openSection]);

  // If the room still isn't showing after 20 s, tell the visitor the menu works without it
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 20000);
    return () => clearTimeout(timer);
  }, []);

  // Escape closes whichever modal is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setResumeOpen(false);
      setChessOpen(false);
      setContactOpen(false);
      setContent(null);
      closeComputer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeComputer]);

  const showRoom = loaded && ready;
  const zoomed = !!computer && !computer.closing;

  return (
    <div className="relative h-lvh w-full overflow-hidden bg-black">
      {/* Screens taller than they are wide (phones held upright): the room keeps the computer's 16:9 shape at full
          height, so all of it is there, and this box scrolls it left and right. Only the room scrolls; the popups,
          menu and banner below are outside this box, so they stay put. */}
      {/* onScroll: Spline remembers where its canvas is on the screen and only re-measures when the PAGE scrolls
          (a 'scroll' event on document). This box scrolling doesn't send that, so without this every click after a
          swipe landed on the wrong spot in the room (the bulb opened a flag, or nothing happened). */}
      <div
        ref={scroller}
        className="absolute inset-0 overflow-hidden portrait:overflow-x-auto portrait:overscroll-x-contain"
        onScroll={() => document.dispatchEvent(new Event('scroll'))}
      >
        {/* the room; scales up toward the monitor while the computer is open */}
        <div
          className="room-zoom absolute inset-0 portrait:right-auto portrait:w-[calc(100lvh*16/9)]"
          data-zoomed={zoomed || undefined}
          style={computer ? { transformOrigin: `${computer.ox}px ${computer.y}px` } : undefined}
        >
          <Spline scene={SCENE_URL} onLoad={(app) => { removeCameraControls(app); setLoaded(true); }} />
        </div>
      </div>
        {computer && (
          <ComputerModal
            fromX={computer.x - window.innerWidth / 2}
            fromY={computer.y - window.innerHeight / 2}
            closing={computer.closing}
            onClose={closeComputer}
          />
        )}
        {chessOpen && <ChessGame onClose={() => setChessOpen(false)} />}
        {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}
        {content && <ContentModal page={content} onClose={() => setContent(null)} onSwitch={setContent} />}
        {resumeOpen && <ResumeModal onClose={() => setResumeOpen(false)} />}
      {!showRoom && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black px-6 text-center text-white">
          <p>Loading…</p>
          {slow && (
            <p className="max-w-sm text-sm text-white/70">
              The 3D room is taking a while to load. You can still open everything from the Menu in the top-left corner.
            </p>
          )}
        </div>
      )}
      <RotateHint />
      {/* on top of everything, even the loading screen: a recruiter can open the resume right away */}
      <SiteMenu onOpen={openFromMenu} />

    </div>
  );
}

// "Turn your device to landscape" banner, just under the Menu button.
// It only shows while the screen is taller than it is wide (portrait: in Tailwind), so turning the phone hides it.
// The X hides it until the page is reloaded. z-10: above the room, below the popups (z-20) and the menu (z-40).
function RotateHint() {
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  return (
    <div
      role='status'
      className='absolute left-4 right-4 top-17 z-10 hidden items-center gap-3 rounded-xl bg-[#11151b]/95 py-3 pl-4 pr-2
        font-sans text-[#f3ece1] shadow-[0_12px_32px_rgb(0_0_0/0.5)] ring-1 ring-[#262b34] backdrop-blur portrait:flex'
    >
      {/* a phone turning sideways */}
      <svg viewBox='0 0 24 24' aria-hidden className='size-7 shrink-0 text-[#ffd9a6]' fill='none' stroke='currentColor'
        strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
        <rect x='7' y='2.5' width='10' height='17' rx='2' />
        <path d='M11 16.5h2' />
        <path d='M19 13.5a6 6 0 0 1-4.5 7.3M15.8 18.6l-1.3 2.2 2.4.6' />
      </svg>
      <div className='flex-1 text-sm leading-snug'>
        <p className='font-semibold'>For the best experience, turn your device to landscape.</p>
        <p className='text-[#8b857c]'>Or swipe left and right to look around the room.</p>
      </div>
      <button
        type='button'
        aria-label='Close'
        onClick={() => setClosed(true)}
        className='grid size-11 shrink-0 place-items-center rounded-full text-[#f3ece1] transition-colors hover:bg-[#1c212a]'
      >
        <svg viewBox='0 0 24 24' aria-hidden className='size-5' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round'>
          <path d='M6 6l12 12M18 6L6 18' />
        </svg>
      </button>
    </div>
  );
}

// The resume, shown as a popup over the room: a web version of it (ResumeDocument, with the
// text in app/lib/resume.ts). Unlike a PDF inside a page, it works on every device: on phones the text wraps to the
// screen instead of a shrunken letter page, links work, and it scrolls inside the popup.
function ResumeModal({ onClose }: { onClose: () => void }) {
  const dialog = useDialogFocus<HTMLDivElement>();
  const bar = 'grid h-10 place-items-center rounded-full text-sm font-semibold shadow-lg transition-colors';
  return (
    <div className='absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-3 sm:p-6' onClick={onClose}>
      <div
        ref={dialog}
        tabIndex={-1}
        role='dialog'
        aria-modal='true'
        aria-label='Resume'
        className='flex h-full max-h-[94dvh] w-full max-w-[8.5in] flex-col font-sans outline-none'
        onClick={(e) => e.stopPropagation()}
      >
        {/* top bar: download + close, above the sheet so they never cover the text */}
        <div className='mb-2 flex shrink-0 items-center justify-end gap-2'>
          <a href='/resume.pdf' download className={`${bar} bg-[#ffd9a6] px-4 text-[#14110d] hover:brightness-105`}>
            Download PDF
          </a>
          <button
            type='button'
            aria-label='Close resume'
            onClick={onClose}
            className={`${bar} w-10 bg-[#151920]/90 text-[#f3ece1] ring-1 ring-[#2a2f38] hover:bg-[#232832]`}
          >
            <svg viewBox='0 0 24 24' aria-hidden className='size-5' fill='none' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round'>
              <path d='M6 6l12 12M18 6L6 18' />
            </svg>
          </button>
        </div>
        {/* the sheet scrolls inside the popup; overscroll-contain stops the room behind it from moving */}
        <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain'>
          <ResumeDocument />
        </div>
      </div>
    </div>
  );
}
