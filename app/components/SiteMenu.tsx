'use client';
import { useEffect, useRef, useState } from 'react';

// The hamburger menu in the top-left corner: a fast path for recruiters (and keyboard /
// screen-reader users) to every modal without hunting for objects in the room.
// It only says WHICH section to open; Room.tsx does the opening (same code the 3D clicks use).

export type MenuSection = 'frame' | 'ohio' | 'military' | 'computer' | 'chess' | 'contact';

const ITEMS: { section: MenuSection; title: string; detail: string }[] = [
  { section: 'frame', title: 'Resume', detail: 'Skills, projects and experience' },
  { section: 'ohio', title: 'About me', detail: 'Cleveland, Ohio to the Marine Corps' },
  { section: 'military', title: 'Military Background', detail: 'Sergeant · 7257 Air Traffic Controller' },
  { section: 'computer', title: 'Projects and Certificates', detail: 'Open the computer on my desk' },
  { section: 'chess', title: 'Play chess', detail: 'Can you beat the bot that plays like me?' },
];

const EMAIL = 'christiankarim1264@gmail.com';

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/christiankarim1264-pixel' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/christian-karim-8a0b8a3b8' },
];

export default function SiteMenu({ onOpen }: { onOpen: (section: MenuSection) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // "Contact me" only works if the visitor has an email app set up, so this copies the address instead
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // older browsers / blocked clipboard: copy the old-fashioned way
      const box = document.createElement('textarea');
      box.value = EMAIL;
      document.body.appendChild(box);
      box.select();
      document.execCommand('copy');
      box.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // close on Escape or on a click anywhere outside the menu
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div ref={root} className='absolute left-4 top-4 z-40 font-sans'>
      {/* the button: three lines that turn into an X while open */}
      <button
        type='button'
        aria-expanded={open}
        aria-controls='site-menu'
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((o) => !o)}
        className='flex h-11 items-center gap-2.5 rounded-full bg-[#151920]/85 pl-3.5 pr-4 text-sm font-semibold text-[#f3ece1]
          shadow-[0_8px_24px_rgb(0_0_0/0.45)] ring-1 ring-[#2a2f38] backdrop-blur transition-colors hover:bg-[#1c212a]'
      >
        <span className='relative block h-3.5 w-4.5' aria-hidden>
          <span className={`absolute left-0 h-0.5 w-full rounded bg-current transition-transform duration-200 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
          <span className={`absolute left-0 top-1.5 h-0.5 w-full rounded bg-current transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`absolute left-0 h-0.5 w-full rounded bg-current transition-transform duration-200 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
        </span>
        Menu
      </button>

      {open && (
        <nav
          id='site-menu'
          aria-label='Site'
          className='mt-2 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-xl bg-[#11151b]/95 ring-1 ring-[#262b34]
            shadow-[0_24px_60px_rgb(0_0_0/0.6)] backdrop-blur transition-[opacity,transform] duration-200
            starting:-translate-y-1 starting:opacity-0'
        >
          <div className='border-b border-[#262b34] px-5 py-4'>
            <p className='font-semibold text-[#f3ece1]'>Christian Karim</p>
            <p className='mt-0.5 text-sm text-[#8b857c]'>Full-Stack Software Engineer · U.S. Marine Corps Veteran</p>
          </div>

          <ul className='p-2'>
            {ITEMS.map((item) => (
              <li key={item.section}>
                <button
                  type='button'
                  onClick={() => { setOpen(false); onOpen(item.section); }}
                  className='group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[#1c212a] focus-visible:bg-[#1c212a] focus-visible:outline-none'
                >
                  <span>
                    <span className='block font-medium text-[#f3ece1]'>{item.title}</span>
                    <span className='block text-sm text-[#8b857c]'>{item.detail}</span>
                  </span>
                  <span aria-hidden className='text-[#ffd9a6] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100'>→</span>
                </button>
              </li>
            ))}
          </ul>

          <div className='flex flex-wrap gap-x-5 gap-y-2 border-t border-[#262b34] px-5 py-3.5 text-sm'>
            {/* opens the contact form (ContactModal.tsx) instead of the visitor's email app */}
            <button
              type='button'
              onClick={() => { setOpen(false); onOpen('contact'); }}
              className='font-semibold text-[#ffd9a6] underline decoration-[#ffd9a6]/40 underline-offset-4 hover:decoration-[#ffd9a6]'
            >
              Contact me
            </button>
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target='_blank'
                rel='noreferrer'
                className='font-semibold text-[#ffd9a6] underline decoration-[#ffd9a6]/40 underline-offset-4 hover:decoration-[#ffd9a6]'
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* the email as plain text plus a copy button: works on every computer */}
          <div className='flex items-center justify-between gap-3 border-t border-[#262b34] px-5 py-3 text-sm'>
            <span className='truncate text-[#8b857c] select-all'>{EMAIL}</span>
            {/* aria-live: screen readers announce "Copied!" when the text changes */}
            <button
              type='button'
              onClick={copyEmail}
              aria-live='polite'
              className='shrink-0 rounded-md px-2.5 py-1 font-semibold text-[#f3ece1] ring-1 ring-[#2a2f38] transition-colors hover:bg-[#1c212a]'
            >
              {copied ? 'Copied!' : 'Copy email'}
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
