import { CrossLink, Facts, T } from './contentTheme';

// The "Military" content. Same idea as AboutContent:
//   used by app/military/page.tsx now, and by a modal over the room later.
// No background or height here; the wrapper decides those (T.page).
// Colors live in contentTheme.tsx. To change the words, edit the lists below.

const FACTS = [
  { label: 'Rank', value: 'Sergeant' },
  { label: 'MOS', value: '7257 Air Traffic Controller' },
  { label: 'Duty station', value: 'Yuma, Arizona' },
];

// The path from civilian to controller, in order
const TIMELINE = [
  {
    title: 'Shipped out',
    place: 'January 2022',
    text: 'Left Ohio for the Marine Corps.',
  },
  {
    title: 'Recruit training',
    place: 'Parris Island, South Carolina',
    text: 'Boot camp, where I earned the title of Marine.',
  },
  {
    title: 'Marine combat training',
    place: 'Camp Geiger, North Carolina',
    text: 'The combat skills every Marine learns, whatever their job.',
  },
  {
    title: 'Air traffic control school',
    place: 'Pensacola, Florida',
    text: 'Learned the rules, phraseology and procedures of air traffic control.',
  },
  {
    title: 'First duty station',
    place: 'Yuma, Arizona',
    text: 'Working as a controller, where I’ve been ever since.',
  },
];

const SKILLS = [
  {
    title: 'Quality assurance in high stakes environments',
    text: 'As an air traffic controller, there is no room for mistakes. The job is fast paced and high pressure and requires high attention to detail or the consequences could be fatal.',
  },
  {
    title: 'Strict adherence to rules and regulations',
    text: 'As a marine and especially as an air traffic controller, strict adherence to rules and regulations is a requirement. I  utilized multiple publications and needed tangible justification via publications for every action I made on the job.',
  },
  {
    title: 'Attention to detail',
    text: 'Having attention to detail as a Marine means being meticulous and disciplined in every small task, because precision in minor actions directly impacts team safety, mission success, and overall survival.',
  },
  {
    title: 'Leadership',
    text: 'As a Sergeant, I train and look out for the junior Marines under my charge. Every leader must be a good follower!',
  },
];

const AWARDS = ['National Defense Service Medal', 'Good Conduct Medal'];

// onSwitch: given when shown in a modal; the About link then swaps modals instead of leaving the room
export default function MilitaryContent({ onSwitch }: { onSwitch?: () => void }) {
  return (
    <article className={T.article}>
      {/* ---------- intro ---------- */}
      <p className={T.eyebrow}>Military Background</p>
      <h1 className={T.h1}>U.S. Marine Corps</h1>
      {/* <p className={T.lead}>
        I&apos;m a Sergeant and air traffic controller in the Marine Corps. I keep aircraft safely
        separated in the air and on the ground.
      </p> */}

      <Facts items={FACTS} />

      <div className='mt-14 space-y-14'>
        {/* ---------- timeline ---------- */}
        <section>
          <h2 className={T.h2}>My path</h2>
          {/* the vertical line is the <ol>'s left border; each step's dot sits on top of it */}
          <ol className={`mt-6 ml-2 border-l-2 ${T.line}`}>
            {TIMELINE.map((step) => (
              <li key={step.title} className='relative pb-8 pl-7 last:pb-0'>
                <span className={`absolute -left-[7px] top-1.5 size-3 ${T.dot}`} />
                <h3 className={T.h3}>{step.title}</h3>
                <p className={T.muted}>{step.place}</p>
                <p className={`mt-1 ${T.body}`}>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- what the job taught me ---------- */}
        <section>
          <h2 className={T.h2}>What I&apos;ve learned</h2>
          <div className='mt-6 grid gap-6 sm:grid-cols-2'>
            {SKILLS.map((s) => (
              <div key={s.title}>
                <h3 className={T.h3}>{s.title}</h3>
                <p className={`mt-1 ${T.body}`}>{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- awards ---------- */}
        <section>
          <h2 className={T.h2}>Awards</h2>
          <ul className='mt-4 space-y-2'>
            {AWARDS.map((a) => (
              <li key={a} className={`flex items-center gap-3 ${T.body}`}>
                <span className={`size-1.5 shrink-0 ${T.dot}`} />
                {a}
              </li>
            ))}
          </ul>
        </section>

        <p>
          <CrossLink href='/about' onClick={onSwitch}>← Where I come from</CrossLink>
        </p>
      </div>
    </article>
  );
}
