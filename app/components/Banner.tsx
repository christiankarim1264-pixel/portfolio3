"use client";

import { useState } from "react";

export default function Banner() {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div className="flex items-center justify-center gap-4 bg-[linear-gradient(to_right,#0244aa_0%,#0459b5_20%,#0a61b8_38%,#0559ac_60%,#024896_80%,#0b4a88_100%)] px-4 py-2 text-sm text-background font-main w-full relative">
      <p className='max-[600px]:text-center text-white'>Disclaimer: This is a non-commercial portfolio project. All logos and brands belong to their owners.</p>
      <button
        onClick={() => setOpen(false)}
        aria-label="Close banner"
        className="cursor-pointer text-lg leading-none absolute right-4 top-1/2 -translate-y-1/2 text-white"
      >
        ×
      </button>
    </div>
  );
}