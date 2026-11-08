'use client';

import Spline from '@splinetool/react-spline';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChessGame from './ChessGame';


const SCENE_URL = 'https://prod.spline.design/kjrBhZa1G3SP0mmG/scene.splinecode';

// Which page each clickable object in the room opens
const ROUTES: Record<string, string> = {
  military: '/military',
  ohio: '/about',
  computer: '/computer',
};

export default function Room() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [chessOpen, setChessOpen] = useState(false);




  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data.section === 'chess') { setChessOpen(true); return; }
      if (e.data?.type === 'portfolio-ready') setReady(true);
      if (e.data?.type === 'portfolio-section') {
        if (e.data.section === 'frame') {
          setResumeOpen(true);
          return; // stop here, don't look for a route
        }
        const route = ROUTES[e.data.section];
        if (route) router.push(route);
      }
    };
    window.addEventListener('message', onMessage);
    const fallback = setTimeout(() => setReady(true), 8000);
    return () => {
      window.removeEventListener('message', onMessage);
      clearTimeout(fallback);
    };
  }, [router]);

  // close the resume with the Escape key (only listens while it's open)
  useEffect(() => {
    if (!resumeOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setResumeOpen(false),setChessOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resumeOpen]);

  const showRoom = loaded && ready;

  return (
    <div className="relative h-screen w-full bg-black">
      <Spline scene={SCENE_URL} onLoad={() => setLoaded(true)} />
        {chessOpen && <ChessGame onClose={() => setChessOpen(false)} />}
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
    </div>
  );
}
