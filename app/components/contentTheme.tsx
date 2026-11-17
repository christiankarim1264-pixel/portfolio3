// Shared look for the About and Military content, matched to the room:
//   dark room, warm desk-lamp light (#ffd9a6), cool monitor light (#8fb6ff), maroon curtains.
// Change a color here and both popups update.

// background: dark room, warm lamp glow top-left, cool monitor glow top-right
const BG =
  'bg-[#0e1116] bg-[radial-gradient(ellipse_at_10%_0%,rgb(255_217_166/0.11),transparent_55%),radial-gradient(ellipse_at_90%_0%,rgb(143_182_255/0.10),transparent_50%)]';

export const T = {
  bg: BG,                                  // the modal panel uses this
  article: 'mx-auto max-w-2xl px-6 py-14 font-sans sm:py-20',

  eyebrow: 'text-sm font-semibold uppercase tracking-[0.18em] text-[#e8b98a]',
  h1: 'mt-3 text-4xl font-bold leading-tight tracking-tight text-[#f3ece1] sm:text-5xl',
  lead: 'mt-5 text-lg leading-relaxed text-[#c9c1b5]',
  h2: 'text-2xl font-semibold text-[#f3ece1]',
  h3: 'font-semibold text-[#f3ece1]',
  body: 'leading-relaxed text-[#b3ab9f]',
  muted: 'text-sm font-medium text-[#8b857c]',
  link:
    'font-semibold text-[#ffd9a6] underline decoration-[#ffd9a6]/40 underline-offset-4 ' +
    'transition-colors hover:decoration-[#ffd9a6]',

  // maroon dot (the curtain color) with a soft glow so it shows on the dark background
  dot: 'rounded-full bg-[#9a2a33] shadow-[0_0_10px_rgb(154_42_51/0.8)]',
  line: 'border-[#2a2f38]',
};

// The row of quick facts at the top of each page
export function Facts({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className='mt-10 grid gap-px overflow-hidden rounded-lg border border-[#262b34] bg-[#262b34] sm:grid-cols-3'>
      {items.map((f) => (
        <div key={f.label} className='bg-[#151920] px-5 py-4'>
          <dt className='text-xs font-semibold uppercase tracking-wider text-[#8b857c]'>{f.label}</dt>
          <dd className='mt-1 font-medium text-[#f3ece1]'>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// The link at the bottom of each popup that swaps to the other one (About <-> Military),
// so the visitor stays in the room.
export function CrossLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button type='button' onClick={onClick} className={T.link}>{children}</button>;
}
