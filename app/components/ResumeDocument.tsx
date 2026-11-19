import { Fragment, type ReactNode } from 'react';
import { resume, type ResumeLink } from '../lib/resume';

// My resume as a real web page, styled like a sheet of paper.
// All the words come from app/lib/resume.ts; this file is only the layout.
//
// Why a component instead of the PDF: on a phone a PDF (or a picture of one) is a letter-size page shrunk down, so the
// text is tiny. Here the text keeps a readable size and wraps to the screen. Links are real links, text can be
// selected, and screen readers get proper headings and lists.
//
// Sizes: on a computer the sheet is letter-page width (8.5in) with page-like margins; on narrow screens the margins
// shrink (clamp) so the text gets the room.

const DOT = ' · ';

const link = 'text-[#2563a8] underline decoration-[#2563a8]/40 underline-offset-2 hover:decoration-[#2563a8]';

// a list of items with " · " between them (strings or links)
function Dotted({ items }: { items: ReactNode[] }) {
  return items.map((item, i) => (
    <Fragment key={i}>
      {i > 0 && DOT}
      {item}
    </Fragment>
  ));
}

const Links = ({ links }: { links: ResumeLink[] }) =>
  links.map((l) => (
    <a key={l.href + l.label} href={l.href} target='_blank' rel='noreferrer' className={link}>
      {l.label}
    </a>
  ));

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='mt-7 sm:mt-8'>
      <h2 className='font-serif text-[1.35rem] leading-tight text-[#1a1a1a] sm:text-[1.45rem]'>{title}</h2>
      <div className='mt-2.5'>{children}</div>
    </section>
  );
}

const Bullets = ({ items }: { items: string[] }) => (
  <ul className='mt-1.5 list-disc space-y-1 pl-5 marker:text-[#1a1a1a]'>
    {items.map((b) => <li key={b}>{b}</li>)}
  </ul>
);

export default function ResumeDocument() {
  const r = resume;
  return (
    <article
      className='mx-auto w-full max-w-[8.5in] bg-white px-[clamp(20px,7vw,72px)] py-[clamp(28px,7vw,64px)] font-sans
        text-[0.95rem] leading-relaxed text-[#2a2a2a] shadow-[0_10px_40px_rgb(0_0_0/0.18)] sm:text-base'
    >
      <header>
        <h1 className='font-serif text-[2rem] leading-tight text-[#1a1a1a] sm:text-[2.3rem]'>{r.name}</h1>
        <p className='mt-2'>
          <Dotted items={r.headline.map((h, i) => (i === 0 ? <strong key={h} className='font-semibold text-[#1a1a1a]'>{h}</strong> : h))} />
        </p>
        <p className='mt-1'>
          <Dotted items={[...r.contact.text, ...Links({ links: r.contact.links })]} />
        </p>
      </header>

      <Section title='Summary'>
        <p>{r.summary}</p>
      </Section>

      <Section title='Technical Skills'>
        <ul className='list-disc space-y-1 pl-5 marker:text-[#1a1a1a]'>
          {r.skills.map((s) => (
            <li key={s.label}>
              <strong className='font-semibold text-[#1a1a1a]'>{s.label}:</strong> {s.items}
            </li>
          ))}
        </ul>
      </Section>

      <Section title='Live Projects'>
        <div className='space-y-4'>
          {r.projects.map((p) => (
            <div key={p.name}>
              <p>
                <strong className='font-semibold text-[#1a1a1a]'>{p.name}</strong> {'—'} {p.tech}
                {DOT}
                <Dotted items={Links({ links: p.links })} />
              </p>
              <Bullets items={p.bullets} />
            </div>
          ))}
        </div>
      </Section>

      <Section title='Experience'>
        {r.experience.map((e) => (
          <div key={e.title}>
            <p>
              <strong className='font-semibold text-[#1a1a1a]'>{e.title}</strong> {'—'} {e.organization}
              {DOT}
              {/* a date range never splits across two lines */}
              <span className='whitespace-nowrap'>{e.dates}</span>
            </p>
            <Bullets items={e.bullets} />
          </div>
        ))}
      </Section>

      <Section title='Education'>
        <p>
          {r.education.schools.map((s, i) => (
            <Fragment key={s.name}>
              {i > 0 && ' and '}
              <strong className='font-semibold text-[#1a1a1a]'>{s.name}</strong> ({s.place})
            </Fragment>
          ))}{' '}
          {'—'} {r.education.details}
        </p>
      </Section>

      <Section title='Certifications'>
        <ul className='list-disc space-y-1 pl-5 marker:text-[#1a1a1a]'>
          {r.certifications.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </Section>
    </article>
  );
}
