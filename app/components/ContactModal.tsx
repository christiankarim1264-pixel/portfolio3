'use client';
import { useState, type FormEvent } from 'react';
import { T } from './contentTheme';
import { useDialogFocus } from './useDialogFocus';

// The contact form, shown as a popup over the room.
// Messages are sent through Formspree (formspree.io), which emails them to you,
// so visitors don't need an email app set up.
//
// SETUP: make a free form at formspree.io, then paste its ID here.
// The form's URL looks like https://formspree.io/f/abcdwxyz -> the ID is 'abcdwxyz'.
const FORMSPREE_ID = 'xrpqpozj';

type Status = 'idle' | 'sending' | 'sent' | 'error';

// What the visitor has typed so far. It lives outside the component, so closing the popup
// (Escape, the X, or a stray click outside) doesn't erase it; reopening shows it again.
// It's cleared once the message is sent, and a page reload starts fresh.
type Draft = { name: string; email: string; message: string };
const EMPTY: Draft = { name: '', email: '', message: '' };
let savedDraft: Draft = EMPTY;

const field =
  'mt-1.5 w-full rounded-lg bg-[#151920] px-3.5 py-2.5 text-[#f3ece1] ring-1 ring-[#2a2f38] placeholder:text-[#5f5a53] ' +
  'transition-shadow focus:outline-none focus:ring-2 focus:ring-[#ffd9a6]/70';

export default function ContactModal({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<Status>('idle');
  const [draft, setDraft] = useState<Draft>(savedDraft);
  const dialog = useDialogFocus<HTMLDivElement>();

  // every keystroke updates both the form and the saved copy
  const change = (field: keyof Draft) => (e: { target: { value: string } }) => {
    const next = { ...draft, [field]: e.target.value };
    savedDraft = next;
    setDraft(next);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // stop the browser from leaving the page; we send it ourselves
    const form = e.currentTarget;
    setStatus('sending');
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }, // ask Formspree for a reply instead of its own thank-you page
      });
      if (!res.ok) throw new Error(`Formspree: HTTP ${res.status}`);
      form.reset();
      savedDraft = EMPTY;
      setDraft(EMPTY);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div
      className='content-backdrop absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-3 sm:p-6'
      onClick={onClose}
    >
      <div
        ref={dialog}
        tabIndex={-1}
        role='dialog'
        aria-modal='true'
        aria-label='Contact me'
        className={`content-panel relative outline-none max-h-[94dvh] w-[min(560px,100%)] overflow-y-auto rounded-xl
          border border-[#262b34] px-6 py-10 font-sans shadow-[0_30px_80px_rgb(0_0_0/0.7)] sm:px-10 ${T.bg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={T.eyebrow}>Contact</p>
        <h2 className='mt-2 text-3xl font-bold tracking-tight text-[#f3ece1]'>Send me a message</h2>

        {status === 'sent' ? (
          <div className='mt-8' aria-live='polite'>
            <p className={T.lead}>Thanks, your message was sent. I&apos;ll get back to you soon.</p>
            <button type='button' onClick={() => setStatus('idle')} className={`mt-6 ${T.link}`}>
              Send another message
            </button>
          </div>
        ) : !FORMSPREE_ID ? (
          <p className={`mt-8 ${T.body}`}>The contact form isn&apos;t set up yet (no Formspree ID in ContactModal.tsx).</p>
        ) : (
          <form onSubmit={onSubmit} className='mt-8 space-y-5'>
            <label className='block'>
              <span className={T.muted}>Name</span>
              <input name='name' required autoComplete='name' value={draft.name} onChange={change('name')} className={field} />
            </label>
            <label className='block'>
              <span className={T.muted}>Email</span>
              <input name='email' type='email' required autoComplete='email' value={draft.email} onChange={change('email')} className={field} />
            </label>
            <label className='block'>
              <span className={T.muted}>Message</span>
              <textarea name='message' required rows={6} value={draft.message} onChange={change('message')} className={`${field} resize-y`} />
            </label>
            {/* spam trap: hidden from people, but bots fill it in and Formspree throws those away */}
            <input type='text' name='_gotcha' tabIndex={-1} autoComplete='off' className='hidden' aria-hidden />

            {status === 'error' && (
              <p className='text-sm text-[#f0a3a3]' aria-live='polite'>
                Something went wrong and the message wasn&apos;t sent. Please try again, or use Copy email in the menu.
              </p>
            )}

            <button
              type='submit'
              disabled={status === 'sending'}
              className='rounded-lg bg-[#ffd9a6] px-5 py-2.5 font-semibold text-[#14110d] transition-[filter,opacity]
                hover:brightness-105 disabled:opacity-60'
            >
              {status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}

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
