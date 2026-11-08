'use client';
import Image from "next/image";
import Clock from "../components/Clock";
import Banner from "../components/Banner";
import FilesWindow from "../components/FilesWindow";
import { useState } from "react";

export default function Computer() {
  const [filesOpen, setFilesOpen] = useState(false);
  return (
    <div>
      <Banner/>
      {/* wallpaper */}
      <Image
        src={"/windows-7/windows-7-official-3840x2160.jpg"}
        fill
        alt="doors 7 background"
        className="object-cover -z-10"
      />
      {/* apps */}

      <div className='flex flex-col'>
{/* reycle bin */}
        <div className='flex flex-col mx-4 my-3 items-center w-15 text-center leading-tight'>
        <Image
            src={"/windows-7/windows7-recycle.png"}
            alt="doors 7 files button"
            width="100"
            height="100"
            className="cursor-pointer my-1 h-auto w-[60px]"
          />

          <p className='font-segoe text-shadow-sm text-shadow-black'>Recycle Bin</p>

          </div>

          <button className='flex flex-col mx-4 my-3 items-center w-15 text-center leading-tight'
          onClick={() => setFilesOpen(true)}>
            <Image
            src={"/windows-7/windows7-files-logo.png"}
            alt="doors 7 files button"
            width="100"
            height="100"
            className="cursor-pointer my-1 h-auto w-[60px]"
          />

          <p className='font-segoe text-shadow-sm text-shadow-black'>Files</p>

          </button>

{/* files modal */}
          {filesOpen && <FilesWindow onClose={() => setFilesOpen(false)} />}

          <div className='flex flex-col mx-4 my-3 items-center w-15 text-center leading-tight'>
            <Image
            src={"/windows-7/windows7-files-logo.png"}
            alt="doors 7 files button"
            width="100"
            height="100"
            className="cursor-pointer my-1 h-auto w-[60px]"
          />

          <p className='font-segoe text-shadow-sm text-shadow-black'>Files</p>

          </div>

      </div>

      {/* taskbar */}
      <div className="fixed bottom-0 z-20 bg-[#2a5f95]/30 h-[clamp(30px,5dvh,80px)]
      
      bg-[linear-gradient(to_bottom,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.04)_50%,rgba(0,20,50,0.30)_100%)]

      
      backdrop-blur-md border-t border-white/30 flex items-center justify-between w-dvw">
        {/* start icons and apps */}
        <div className="z-1 h-full flex items-center">
          <Image
            src={"/windows-7/windows7-start-orb.png"}
            alt="doors 7 start button"
            width="100"
            height="100"
            className="cursor-pointer mr-4 mb-2 h-14/9 w-auto"
          />

          <Image
            src={"/windows-7/windows7-files-logo.png"}
            alt="doors 7 files button"
            width="100"
            height="100"
            className="cursor-pointer my-1 h-3/4 w-auto mx-4"
          />

          <Image
            src={"/windows-7/windows7-internet-explorer-logo.png"}
            alt="doors 7 files button"
            width="100"
            height="100"
            className="cursor-pointer my-1 h-3/4 w-auto mx-6"
          />

        </div>
        {/* battery sound etc */}
        <div className='flex h-full items-center'>

          <svg className='mx-4 w-[22px]'
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="32"
            height="32"
          >
            <defs>
              <linearGradient id="vol-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#d4d9df" />
              </linearGradient>
              <filter id="vol-sh" x="-25%" y="-25%" width="150%" height="150%">
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="1"
                  result="o"
                />
                <feFlood floodColor="#0b1a2c" floodOpacity=".55" />
                <feComposite in2="o" operator="in" result="outl" />
                <feGaussianBlur in="outl" stdDeviation=".5" result="b" />
                <feOffset in="b" dy=".6" result="s" />
                <feMerge>
                  <feMergeNode in="s" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#vol-sh)" fill="url(#vol-g)">
              <path d="M4 12h5l7-6v20l-7-6H4z" />
              <g
                fill="none"
                stroke="url(#vol-g)"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M19.5 12.3a5 5 0 0 1 0 7.4" />
                <path d="M22.8 9a9.4 9.4 0 0 1 0 14" />
                <path d="M26.1 5.8a13.8 13.8 0 0 1 0 20.4" />
              </g>
            </g>
          </svg>

          <svg className='mx-2 w-[22px]'
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="32"
            height="32"
          >
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#d4d9df" />
              </linearGradient>
              <filter id="sh" x="-25%" y="-25%" width="150%" height="150%">
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="1"
                  result="o"
                />
                <feFlood floodColor="#0b1a2c" floodOpacity=".55" />
                <feComposite in2="o" operator="in" result="outl" />
                <feGaussianBlur in="outl" stdDeviation=".5" result="b" />
                <feOffset in="b" dy=".6" result="s" />
                <feMerge>
                  <feMergeNode in="s" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g filter="url(#sh)" fill="url(#g)">
              <path
                fillRule="evenodd"
                d="M4 5h17.5A1.5 1.5 0 0 1 23 6.5v12a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 18.5v-12A1.5 1.5 0 0 1 4 5z       M5 7.5v10h16v-10z"
              />
              <path d="M11.3 20h3l.8 3.5h-4.6z" />
              <rect x="7.8" y="23.2" width="10" height="2.3" rx="1" />
            </g>
            <g transform="translate(20.5 10.5) scale(.72)">
              <g
                fill="#0b1a2c"
                fillOpacity=".6"
                stroke="#0b1a2c"
                strokeOpacity=".6"
                strokeWidth="2.4"
                strokeLinejoin="round"
              >
                <path
                  fillRule="evenodd"
                  d="M1 0h7a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z       M1.6 1.4h1.1V5H1.6z M3.3 1.4h1.1V5H3.3z M5 1.4h1.1V5H5z M6.7 1.4h1.1V5H6.7z"
                />
                <path d="M1 11.5h7l-1.3 4H2.3z" />
                <rect x="3.4" y="15" width="2.2" height="9.5" rx="1" />
              </g>
              <g filter="url(#sh)" fill="url(#g)">
                <path
                  fillRule="evenodd"
                  d="M1 0h7a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1a1 1 0 0 1 1-1z       M1.6 1.4h1.1V5H1.6z M3.3 1.4h1.1V5H3.3z M5 1.4h1.1V5H5z M6.7 1.4h1.1V5H6.7z"
                />
                <path d="M1 11.5h7l-1.3 4H2.3z" />
                <rect x="3.4" y="15" width="2.2" height="9.5" rx="1" />
                <rect
                  x="2.3"
                  y="6.6"
                  width="4.4"
                  height="1.4"
                  rx=".4"
                  fill="#9aa6b4"
                />
              </g>
            </g>
          </svg>

          <svg className='mx-2 w-[22px]'
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="32"
            height="32"
          >
            <defs>
              <linearGradient id="bat-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#d4d9df" />
              </linearGradient>
              <filter id="bat-sh" x="-25%" y="-25%" width="150%" height="150%">
                <feMorphology
                  in="SourceAlpha"
                  operator="dilate"
                  radius="1"
                  result="o"
                />
                <feFlood floodColor="#0b1a2c" floodOpacity=".55" />
                <feComposite in2="o" operator="in" result="outl" />
                <feGaussianBlur in="outl" stdDeviation=".5" result="b" />
                <feOffset in="b" dy=".6" result="s" />
                <feMerge>
                  <feMergeNode in="s" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g
              filter="url(#bat-sh)"
              fill="url(#bat-g)"
              transform="translate(3 0)"
            >
              <rect x="7" y="3" width="6" height="2.6" rx=".8" />
              <path
                fillRule="evenodd"
                d="M5.5 5h9a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z M6 7.5v19h8v-19z"
              />
              <rect x="7.5" y="12" width="5" height="13" rx=".6" />
            </g>
            <g transform="translate(16.5 10) scale(.85)">
              <g
                fill="#0b1a2c"
                fillOpacity=".6"
                stroke="#0b1a2c"
                strokeOpacity=".6"
                strokeWidth="2.4"
                strokeLinejoin="round"
              >
                <rect x="1.3" y="0" width="1.3" height="3.6" rx=".4" />
                <rect x="4.8" y="0" width="1.3" height="3.6" rx=".4" />
                <path d="M0 4.4a1 1 0 0 1 1-1h5.4a1 1 0 0 1 1 1v3.8a3.2 3.2 0 0 1-3.2 3.2h-1a3.2 3.2 0 0 1-3.2-3.2z" />
                <rect x="2.6" y="11" width="2.2" height="13" rx="1" />
              </g>
              <g filter="url(#bat-sh)" fill="url(#bat-g)">
                <rect x="1.3" y="0" width="1.3" height="3.6" rx=".4" />
                <rect x="4.8" y="0" width="1.3" height="3.6" rx=".4" />
                <path d="M0 4.4a1 1 0 0 1 1-1h5.4a1 1 0 0 1 1 1v3.8a3.2 3.2 0 0 1-3.2 3.2h-1a3.2 3.2 0 0 1-3.2-3.2z" />
                <rect x="2.6" y="11" width="2.2" height="13" rx="1" />
              </g>
            </g>
          </svg>

          <Clock className='mx-4'/>

          {/* thin rectangle */}
        <div className='w-3 h-full border-l border-t border-b bg-[linear-gradient(to_bottom,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.10)_50%,rgba(255,255,255,0.05)_100%)] border-l border-gray-400/40 shadow-[inset_1px_0_0_rgba(255,255,255,0.4)]'/>

        </div>

      </div>
    </div>
  );
}
