'use client';
import ComputerDesktop from './ComputerDesktop';
import { useDialogFocus } from './useDialogFocus';

// The Windows 7 desktop inside a monitor, shown over the room.
//
// Animation (CSS in globals.css: .computer-backdrop and .monitor-zoom):
//   opening: the monitor starts tiny at the spot you clicked in the room (fromX/fromY)
//            and grows to the middle of the screen while the background darkens.
//   closing: `closing` = true plays the same thing backwards; Room removes the modal afterwards.
//
// fromX / fromY = where you clicked, measured from the CENTER of the screen (px).

type Props = { fromX: number; fromY: number; closing: boolean; onClose: () => void };

export default function ComputerModal({ fromX, fromY, closing, onClose }: Props) {
  const dialog = useDialogFocus<HTMLDivElement>();
  return (
    <div
      className='computer-backdrop absolute inset-0 z-20 flex items-center justify-center'
      data-closing={closing || undefined}
      onClick={onClose}
    >
      <div
        ref={dialog}
        tabIndex={-1}
        role='dialog'
        aria-modal='true'
        aria-label='Computer: projects and certificates'
        className='monitor-zoom relative outline-none flex w-(--mw) flex-col items-center'
        data-closing={closing || undefined}
        style={{
          '--mw': 'min(1400px, 94vw, 132dvh)', // monitor width: fits wide AND short screens; stand sizes use it too
          '--from-x': `${fromX}px`,
          '--from-y': `${fromY}px`,
        } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        {/* bezel: dark plastic with a soft top highlight; the bottom "chin" is a bit thicker */}
        <div
          className='relative w-full rounded-[clamp(10px,1.6%,20px)] p-[1.5%] pb-[3%]
          bg-[linear-gradient(to_bottom,#2c2f36,#17191d_60%,#101114)]
          shadow-[0_40px_90px_rgb(0_0_0/0.65),inset_0_1px_0_rgb(255_255_255/0.14),inset_0_-2px_0_rgb(0_0_0/0.6)]'
        >
          {/* the screen */}
          <div className='relative aspect-video overflow-hidden rounded-[3px] bg-black shadow-[0_0_0_2px_#050506]'>
            <ComputerDesktop />
            {/* faint glass reflection across the top-left */}
            <div className='pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(115deg,rgb(255_255_255/0.07)_0%,transparent_30%)]' />
          </div>

          {/* power light (same cool blue as the monitor light in the room) */}
          <span className='absolute bottom-[1.1%] right-[3%] size-[clamp(4px,0.5%,7px)] rounded-full bg-[#8fb6ff] shadow-[0_0_6px_2px_rgb(143_182_255/0.7)]' />

          <button
            aria-label='Close computer'
            onClick={onClose}
            className='absolute -top-3 -right-3 z-40 h-7 w-7 rounded-full bg-black/80 text-lg leading-none text-white shadow ring-1 ring-white/20 hover:bg-black'
          >
            ×
          </button>
        </div>

        {/* stand: neck + base */}
        <div className='h-[calc(var(--mw)*0.045)] w-[8%] bg-[linear-gradient(to_right,#15171a,#383c44_50%,#15171a)]' />
        <div className='h-[calc(var(--mw)*0.011)] w-[26%] rounded-t-sm rounded-b-[50%] bg-[linear-gradient(to_bottom,#3a3e46,#121316)] shadow-[0_10px_24px_rgb(0_0_0/0.55)]' />
      </div>
    </div>
  );
}
