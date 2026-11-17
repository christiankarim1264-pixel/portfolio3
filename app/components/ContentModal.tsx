'use client';
import AboutContent from './AboutContent';
import MilitaryContent from './MilitaryContent';
import { T } from './contentTheme';
import { useDialogFocus } from './useDialogFocus';

// The About / Military pages, shown as a popup over the room.
// The content is the same component the standalone pages use; this file only adds the frame:
// a dark backdrop, a scrollable panel, and a close button.

export type ContentPage = 'about' | 'military';

type Props = {
  page: ContentPage;
  onClose: () => void;
  onSwitch: (page: ContentPage) => void; // the link at the bottom of each page swaps to the other one
};

export default function ContentModal({ page, onClose, onSwitch }: Props) {
  const dialog = useDialogFocus<HTMLDivElement>();
  return (
    <div
      className='content-backdrop absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-3 sm:p-6'
      onClick={onClose}
    >
      {/* the panel: doesn't scroll itself (so the close button stays put); the inner div scrolls */}
      <div
        ref={dialog}
        tabIndex={-1}
        role='dialog'
        aria-modal='true'
        aria-label={page === 'about' ? 'About me' : 'Military'}
        className={`content-panel relative outline-none h-full max-h-[min(900px,94dvh)] w-[min(820px,100%)] overflow-hidden rounded-xl
          border border-[#262b34] shadow-[0_30px_80px_rgb(0_0_0/0.7)] ${T.bg}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* key={page}: switching pages makes a fresh scroll box, so the new page starts at the top */}
        <div key={page} className='h-full overflow-y-auto overscroll-contain [scrollbar-color:#3a404b_transparent] [scrollbar-width:thin]'>
          {page === 'about'
            ? <AboutContent onSwitch={() => onSwitch('military')} />
            : <MilitaryContent onSwitch={() => onSwitch('about')} />}
        </div>

        <button
          aria-label='Close'
          onClick={onClose}
          className='absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-[#151920]/90 text-xl leading-none
            text-[#f3ece1] ring-1 ring-[#2a2f38] transition-colors hover:bg-[#232832]'
        >
          ×
        </button>
      </div>
    </div>
  );
}
