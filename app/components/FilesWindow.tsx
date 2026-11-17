'use client';
import { useState } from "react";
import Image from "next/image";
import "7.css/dist/7.scoped.css";
import { useDialogFocus } from "./useDialogFocus";

// placeholder folders: rename these to whatever you want visitors to find
const ITEMS = [
  { name: "Projects",
    preview: "/projects-preview.png",
    files: [
    {name: 'My Wedding Website', thumb:'/projects-preview.png', href:'https://christianandraakel.com'},
    {name: 'Coffee Website', thumb:'/beans-place.png', href:'https://the-beans-place-two.vercel.app/'},
    {name: 'Furniture Website', thumb:'/furniture-site-ss.png', href:'https://furniture-website-plum-psi.vercel.app/'},
    {name: 'Barbershop Website', thumb:'/barbershop-website-ss.png', href:'https://barbershop-website-three-inky.vercel.app/'}
  ] },
  { name: "Resume", preview: "/resume-preview.png", files: [
    {name: 'Resume.pdf', thumb:'/resume-preview.png', href:'/resume.pdf'}
  ] },
  { name: "Certifications", preview: "/react-cert-preview.png", files: [
    {name: 'React Certificate', thumb:'/react-cert-preview.png', href:'/react-cert.pdf'},
    {name: 'JavaScript Certificate', thumb:'/javascript-cert-preview.png', href:'/javascript-cert.pdf'},
    {name: 'MySQL Certificate', thumb:'/mysql-cert-preview.png', href:'/mysql-cert.pdf'},
    {name: 'HTML & CSS Certificate', thumb:'/html-css-cert-preview.png', href:'/html-css-cert.pdf'}
  ] },
];


const NAV = [
  { heading: "Favorites", items: ["Desktop", "Downloads", "Recent Places"] },
  { heading: "Libraries", items: ["Documents", "Music", "Pictures", "Videos"] },
  { heading: "Computer", items: ["Local Disk (C:)"] },
];

const FOLDER = "/windows-7/windows7-files-logo.png";
const folderBack = '/windows-7/windows7-folder-stack-back.png';
const folderFront = '/windows-7/windows7-folder-stack-front.png';
const PILL = "/windows-7/pill_normal_27px.png";
const BACK = "/windows-7/back_normal_27px.png";
const FORWARD = "/windows-7/forward_normal_27px.png";


export default function FilesWindow({ onClose }: { onClose: () => void }) {
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const current = ITEMS.find((item) => item.name === openFolder);
  const dialog = useDialogFocus<HTMLDivElement>();
  return (
    // glass frame
    <div
      ref={dialog}
      tabIndex={-1}
      role="dialog"
      aria-label="Files"
      className="outline-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10
      w-[min(900px,92cqw)] h-[min(600px,75cqh)] flex flex-col px-2 pb-2
      rounded-lg border border-[#2b4f75]/60 backdrop-blur-md text-black font-segoe
      bg-[linear-gradient(to_bottom,rgba(200,225,245,0.80),rgba(160,195,225,0.70))]
      shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6),0_10px_40px_rgba(0,0,0,0.45)]"
    >
      {/* minimize / maximize / close, hanging from the top edge */}
      {/* 7.css styles only work inside "win7"; "title-bar active" turns on the bright colors */}
      <div className="win7 flex justify-end">
        <div className="title-bar active bg-none! bg-transparent! border-0! shadow-none! p-0!">
          <div className="title-bar-controls">
            <button aria-label="Minimize" />
            <button aria-label="Maximize" />
            <button aria-label="Close" onClick={onClose} />
          </div>
        </div>
      </div>

      {/* back / forward, address bar, search */}
      <div className="flex items-center gap-2 py-2">
        {/* pill behind the buttons, with back and forward stacked on top */}
        <div className="relative w-[72px] h-[27px] shrink-0">
          <Image src={PILL} alt="" width={72} height={27} unoptimized className="absolute inset-0" />
          <button
            aria-label="Back"
            disabled={openFolder === null}
            onClick={() => setOpenFolder(null)}
            className="absolute left-0 top-0 hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100"
          >
            <Image src={BACK} alt="" width={27} height={27} unoptimized />
          </button>
          <button aria-label="Forward" disabled className="absolute left-[27px] top-0 hover:brightness-110">
            <Image src={FORWARD} alt="" width={27} height={27} unoptimized />
          </button>
        </div>
        <div className="flex-1 h-7 flex items-center gap-2 px-2 text-sm bg-white/90 border border-[#7a99bd] rounded-sm">
          <Image src={FOLDER} alt="" width={16} height={16} className="w-4 h-auto" />
          <span>▸ Computer ▸ Files ▸ {openFolder && <>{openFolder} ▸</>}</span>
        </div>
        <div className="hidden sm:flex w-56 h-7 items-center px-2 text-sm italic text-gray-500 bg-white/90 border border-[#7a99bd] rounded-sm">
          Search Files
        </div>
      </div>

      {/* white inside of the window */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-[#8aa3c2]">
        {/* toolbar */}
        <div className="h-8 flex items-center gap-1 px-2 text-sm text-[#1e395b] border-b border-[#b9cbe0]
        bg-[linear-gradient(to_bottom,#f5f9fd,#dde8f4)]">
          <button className="px-2 py-0.5 rounded-sm hover:bg-white/60 hover:shadow-[inset_0_0_0_1px_#a8c2df]">Organize ▾</button>
          <button className="px-2 py-0.5 rounded-sm hover:bg-white/60 hover:shadow-[inset_0_0_0_1px_#a8c2df]">New folder</button>
        </div>

        <div className="flex-1 min-h-0 flex">
          {/* left navigation pane */}
          <nav className="hidden sm:block w-48 shrink-0 overflow-y-auto py-2 text-sm border-r border-[#d5dfe9]">
            {NAV.map((group) => (
              <div key={group.heading} className="mb-3">
                <p className="px-3 py-0.5 text-[#1e395b]">{group.heading}</p>
                {group.items.map((item) => (
                  <p key={item} className="pl-8 py-0.5 cursor-default hover:bg-[#e5f3fb]">
                    {item}
                  </p>
                ))}
              </div>
            ))}
          </nav>

          {/* folder contents */}
          <div className="flex-1 overflow-y-auto">
            <p className="px-4 py-2 text-lg text-[#1e395b] border-b border-[#eef2f7]">{openFolder ?? "Files"}</p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-8 p-4">
              {current ? (
                current.files.map((file) => (
                  <a
                    key={file.name}
                    href={file.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 p-2 text-sm text-center rounded-sm border border-transparent
                    hover:bg-[#e5f3fb] hover:border-[#b8d6fb]"
                  >
                    {file.thumb && (
                      <Image src={file.thumb} alt="" width={192} height={192} className="w-30 h-20 object-contain" />
                    )}
                    {file.name}
                  </a>
                ))
              ) : (
                ITEMS.map(({ name, preview }) => (
                  <button
                    key={name}
                    onClick={() => setOpenFolder(name)}
                    className="flex flex-col items-center gap-1 p-2 text-sm rounded-sm border border-transparent
                    hover:bg-[#e5f3fb] hover:border-[#b8d6fb] focus:bg-[#cce8ff] focus:border-[#99d1ff]"
                  >
                    <div className='relative w-32 h-32 perspective-[300px]'>
                      <Image src={folderBack} alt="" width={192} height={192} className="w-full h-full absolute inset-0" />
                      {preview && (<Image src={preview} alt="" width={192} height={192} className="absolute inset-[20%] w-[60%] h-[60%] object-cover rotate-y-[-25deg] rotate-x-[-28deg] origin-left" />)}
                      <Image src={folderFront} alt="" width={192} height={192} className="w-full h-full absolute inset-0" />
                    </div>
                    {name}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* status bar */}
        <div className="h-12 flex items-center gap-3 px-4 text-sm text-[#1e395b] border-t border-[#c5d5e8]
        bg-[linear-gradient(to_bottom,#f1f5fb,#dbe6f3)]">
          <Image src={FOLDER} alt="" width={32} height={32} className="w-8 h-auto" />
          {current ? current.files.length : ITEMS.length} items
        </div>
      </div>
    </div>
  );
}
