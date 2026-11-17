import { CrossLink, Facts, T } from './contentTheme';

// The "About me" content, shown in a popup over the room (ContentModal.tsx).
// No background or height here; the popup decides those.
// Colors live in contentTheme.tsx.

const FACTS = [
  { label: 'Hometown', value: 'Cleveland, Ohio' },
  { label: 'High school', value: 'Strongsville, class of 2021' },
  { label: 'Now', value: 'Sergeant, U.S. Marine Corps' },
];

// onSwitch: given when shown in a modal; the Military link then swaps modals instead of leaving the room
export default function AboutContent({ onSwitch }: { onSwitch: () => void }) {
  return (
    <article className={T.article}>
      {/* ---------- intro ---------- */}
      <p className={T.eyebrow}>About me</p>
      <h1 className={T.h1}>U.S. Marine from Cleveland, OH, now living in Arizona</h1>
      {/* <p className={T.lead}>
        I&apos;m an Ohio kid who traded a semester of community college for the Marine Corps.
        Here&apos;s a bit about where I come from.
      </p> */}

      <Facts items={FACTS} />

      {/* ---------- sections ---------- */}
      <div className='mt-14 space-y-12'>
        <section>
          <h2 className={T.h2}>Growing up</h2>
          <div className={`mt-3 space-y-4 ${T.body}`}>
            <p>
              I grew up in Cleveland, Ohio, the youngest of three. I spent summers riding my bike around the neighborhood and playing basketball at the park, and winters playing video games inside.
            </p>
            {/* <p>When the Cleveland winters came, I traded the bike for video games.</p> */}
          </div>
        </section>

        <section>
          <h2 className={T.h2}>School</h2>
          <div className={`mt-3 space-y-4 ${T.body}`}>
            <p>
              I went to Strongsville High School and graduated in 2021. I did one semester at Cuyahoga County Community College before going to boot camp. While in the service, I took classes at Arizona Western College to work towards an associate&apos;s degree.
            </p>
          </div>
        </section>

        <section>
          <h2 className={T.h2}>The Marines</h2>
          <div className={`mt-3 space-y-4 ${T.body}`}>
            <p>
              I shipped out to boot camp at Parris Island in January 2022. Today I&apos;m
              a Sergeant working as an air traffic controller in Yuma, Arizona.
            </p>
            <p>
              <CrossLink onClick={onSwitch}>More about my time in the Marines →</CrossLink>
            </p>
          </div>
        </section>

        <section>
          <h2 className={T.h2}>Off duty</h2>
          <div className={`mt-3 space-y-4 ${T.body}`}>
            <p>
              My favorite hobbies are chess, basketball, and video games. The clickable chess board on the desk is a bot that mimics my play, so check it out and see if you can beat me!
            </p>
            <p className='flex flex-wrap gap-x-6 gap-y-2'>
              <a href='https://www.chess.com/member/youngfroo' target='_blank' rel='noreferrer' className={T.link}>
                Chess.com profile
              </a>
              <a href='https://ratings.uschess.org/player/32669108' target='_blank' rel='noreferrer' className={T.link}>
                US Chess rating
              </a>
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
