import type { Metadata } from 'next';
import Link from 'next/link';
import ResumeDocument from '../components/ResumeDocument';

// /resume: the resume as a web page (a preview; the homepage and its popups don't use it yet).

export const metadata: Metadata = {
  title: 'Resume | Christian Karim',
  description: 'Resume of Christian Karim, full-stack software engineer and U.S. Marine Corps veteran.',
};

const button =
  'rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffd9a6]';

export default function ResumePage() {
  return (
    <main className='min-h-dvh bg-[#0d1015] px-3 py-4 font-sans sm:px-6 sm:py-8'>
      <nav className='mx-auto mb-4 flex w-full max-w-[8.5in] items-center justify-between gap-3'>
        <Link href='/' className={`${button} text-[#f3ece1] ring-1 ring-[#2a2f38] hover:bg-[#1c212a]`}>
          {'←'} Back to the room
        </Link>
        <a href='/resume.pdf' download className={`${button} bg-[#ffd9a6] text-[#14110d] hover:brightness-105`}>
          Download PDF
        </a>
      </nav>
      <ResumeDocument />
    </main>
  );
}
