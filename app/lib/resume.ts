// My resume as data. ResumeDocument.tsx displays it; nothing about the layout lives here.
// When the resume changes, edit the text in THIS file (and export a new public/resume.pdf for downloads).
//
// Copied word for word from public/resume.pdf. Separators match the PDF:
//   ·  (middle dot)  between items on one line
//   —  (em dash)     between a name and its details
//   –  (en dash)     in date ranges

export type ResumeLink = { label: string; href: string };

export type Resume = {
  name: string;
  /** first item is shown in bold (the job title) */
  headline: string[];
  contact: { text: string[]; links: ResumeLink[] };
  summary: string;
  skills: { label: string; items: string }[];
  projects: { name: string; tech: string; links: ResumeLink[]; bullets: string[] }[];
  experience: { title: string; organization: string; dates: string; bullets: string[] }[];
  education: { schools: { name: string; place: string }[]; details: string };
  certifications: string[];
};

const GITHUB = 'https://github.com/christiankarim1264-pixel';
const PORTFOLIO = 'https://christiankarim.dev/';

export const resume: Resume = {
  name: 'Christian Karim',
  headline: ['Full-Stack Software Engineer', 'U.S. Marine Corps Veteran', 'Secret Clearance'],
  contact: {
    text: ['Arizona', '(440) 212-9401', 'christiankarim1264@gmail.com'],
    links: [
      { label: 'LinkedIn', href: 'https://linkedin.com/in/christian-karim-8a0b8a3b8' },
      { label: 'GitHub', href: GITHUB },
      { label: 'Portfolio', href: PORTFOLIO },
    ],
  },

  summary:
    'Marine Corps Sergeant and FAA-certified air traffic controller transitioning into software engineering. ' +
    'Trained in HTML, CSS, JavaScript, React and MySQL, with 5 projects built. Five years of military air traffic ' +
    'control, where errors aren’t an option: following strict regulations, making fast decisions under pressure, ' +
    'and training 18 new controllers to full qualification. Brings that same attention to detail to writing and ' +
    'testing code. Holds Secret security clearance eligibility. Available December 2026.',

  skills: [
    { label: 'Languages', items: 'JavaScript (ES6+), TypeScript, HTML5, CSS3, SQL' },
    { label: 'Frameworks & libraries', items: 'React, Next.js, Tailwind CSS' },
    { label: 'Databases', items: 'MySQL, PostgreSQL (Neon)' },
    { label: 'Tools', items: 'Git, GitHub, VS Code, npm, Chrome DevTools, Vercel, Spline' },
  ],

  projects: [
    {
      name: 'My Wedding Website',
      tech: 'Next.js 16, React 19, TypeScript, Tailwind CSS, PostgreSQL (Neon)',
      links: [
        { label: 'GitHub', href: `${GITHUB}/wedding-site` },
        { label: 'christianandraakel.com', href: 'https://christianandraakel.com/' },
      ],
      bullets: [
        'Built and deployed a full-stack wedding website where guests view photos, venue details and the registry, and RSVP online, with a live countdown to the wedding day.',
        'Designed a relational PostgreSQL schema (RSVPs and guests linked by a foreign key) and used Next.js Server Actions so a single form submission saves an entire party.',
        'Built reusable React components (header with countdown, photo carousel, venue gallery, dismissible banner) and a responsive layout with Tailwind CSS that works on phones and desktops.',
      ],
    },
    {
      name: 'Interactive 3D Portfolio',
      tech: 'Next.js 16, React 19, TypeScript, Tailwind CSS, Spline, ONNX Runtime Web',
      links: [{ label: 'christiankarim.dev', href: PORTFOLIO }],
      bullets: [
        'Designed a single-screen 3D office in Spline where each object opens a section of the site in a modal, including a recreated Windows 7 desktop with a working file explorer for projects, resume and certificates.',
        'Built a chess bot that mimics my own playing style: an opening book drawn from my past games, then a Maia neural network that runs entirely in the browser with ONNX Runtime Web, so no server is needed.',
      ],
    },
  ],

  experience: [
    {
      title: 'Air Traffic Controller, Sergeant (E-5)',
      organization: 'United States Marine Corps, MCAS Yuma, AZ',
      dates: 'Jan 2022 – Dec 2026',
      bullets: [
        'Controlled live military and civil air traffic at the busiest Marine Corps airfield (200,000 operations per year) with zero errors, where a single mistake can be fatal.',
        'Primary position instructor for 2 control positions and on-the-job training instructor (OJTI); led 18 trainees to qualification through simulations, classroom sessions and live-traffic coaching.',
        'Backed every control action with FAA orders and military publications, maintaining strict compliance with rules and regulations.',
        'Forecast traffic spikes and conflicts from flight plans, weather and schedules, adjusting sequencing before problems formed.',
        'Supervised and mentored 25 Marines while managing several concurrent duties as a non-commissioned officer.',
      ],
    },
  ],

  education: {
    schools: [
      { name: 'Arizona Western College', place: 'Yuma, AZ' },
      { name: 'Cuyahoga Community College', place: 'Cleveland, OH' },
    ],
    details:
      'Coursework toward an associate degree · 20 civilian credit hours completed, plus military training credit on Joint Services Transcript',
  },

  certifications: [
    'FAA Air Traffic Controller certification',
    'COITB: HTML & CSS (Apr 2026) · JavaScript (May 2026) · MySQL (Jun 2026) · React (Jul 2026)',
  ],
};
