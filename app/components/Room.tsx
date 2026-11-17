'use client';

import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';
import { useCallback, useEffect, useRef, useState } from 'react';
import ChessGame from './ChessGame';
import ComputerModal from './ComputerModal';
import ContactModal from './ContactModal';
import ContentModal, { type ContentPage } from './ContentModal';
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

// The computer modal: where it zooms from (the click point) and whether it's closing
type ComputerState = { x: number; y: number; closing: boolean };

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
      setComputer({ ...p, closing: false });
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
    <div className="relative h-dvh w-full overflow-hidden bg-black">
      {/* the room; scales up toward the monitor while the computer is open */}
      <div
        className="room-zoom absolute inset-0"
        data-zoomed={zoomed || undefined}
        style={computer ? { transformOrigin: `${computer.x}px ${computer.y}px` } : undefined}
      >
        <Spline scene={SCENE_URL} onLoad={(app) => { removeCameraControls(app); setLoaded(true); }} />
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
      {/* on top of everything, even the loading screen: a recruiter can open the resume right away */}
      <SiteMenu onOpen={openFromMenu} />

    </div>
  );
}

// The resume, shown as a popup over the room.
// Phone browsers often can't show a PDF inside a page (blank box, or only page 1),
// so there's also a button that opens it in its own tab, where every browser can show it.
function ResumeModal({ onClose }: { onClose: () => void }) {
  const dialog = useDialogFocus<HTMLDivElement>();
  return (
    <div className='absolute inset-0 z-20 flex items-center justify-center bg-black/60' onClick={onClose}>
      <div
        ref={dialog}
        tabIndex={-1}
        role='dialog'
        aria-modal='true'
        aria-label='Resume'
        className='relative h-[90dvh] w-[min(850px,92vw)] bg-white outline-none'
        onClick={(e) => e.stopPropagation()}
      >
        <iframe src='/resume.pdf' title='Resume' className='h-full w-full' />
        {/* close button, pinned to the top-right corner of the box */}
        <button
          aria-label='Close resume'
          onClick={onClose}
          className='absolute right-8 top-14 h-8 w-8 rounded-full bg-black/70 text-xl leading-none text-white hover:bg-black'
        >
          ×
        </button>
        {/* backup for phones: open the PDF in its own tab */}
        <a
          href='/resume.pdf'
          target='_blank'
          rel='noreferrer'
          className='absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:bg-black'
        >
          Open PDF in a new tab
        </a>
      </div>
    </div>
  );
}
