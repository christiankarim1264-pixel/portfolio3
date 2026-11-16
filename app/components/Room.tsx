'use client';

import Spline from '@splinetool/react-spline';
import type { Application } from '@splinetool/runtime';
import { useCallback, useEffect, useRef, useState } from 'react';
import ChessGame from './ChessGame';
import ComputerModal from './ComputerModal';
import ContentModal, { type ContentPage } from './ContentModal';
import SiteMenu, { type MenuSection } from './SiteMenu';


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
  const [resumeOpen, setResumeOpen] = useState(false);
  const [chessOpen, setChessOpen] = useState(false);
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

  // Escape closes whichever modal is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setResumeOpen(false);
      setChessOpen(false);
      setContent(null);
      closeComputer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeComputer]);

  const showRoom = loaded && ready;
  const zoomed = !!computer && !computer.closing;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
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
        {content && <ContentModal page={content} onClose={() => setContent(null)} onSwitch={setContent} />}
        {resumeOpen &&
        <div className='absolute inset-0 bg-black/60 flex items-center justify-center'
        onClick={() => setResumeOpen(false)}>
          <div className='relative w-[min(850px,92vw)] h-[90dvh] bg-white'
          onClick={(e) => e.stopPropagation()}>
        <iframe src="/resume.pdf" title="Resume" className="w-full h-full"
         />
          {/* close button, pinned to the top-right corner of the box */}
          <button
            aria-label="Close resume"
            onClick={() => setResumeOpen(false)}
            className='absolute top-14 right-8 w-8 h-8 rounded-full bg-black/70 text-white text-xl leading-none hover:bg-black'
          >
            ×
          </button>
         </div></div>
        }
      {!showRoom && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
          Loading…
        </div>
      )}
      {/* on top of everything, even the loading screen: a recruiter can open the resume right away */}
      <SiteMenu onOpen={openFromMenu} />

    </div>
  );
}
