# Portfolio 3: An Interactive 3D Office

My personal portfolio website. Instead of a scrolling page, the homepage is a 3D office room built in [Spline](https://spline.design). Every object in the room opens a different part of the site: the flags, the window, the chessboard, the computer and the frame on the wall.

## What's inside

### The room (homepage)
- A low poly office scene that fills one screen, with no scrolling.
- The room starts dark, lit only by the monitor. Pull the chain on the hanging bulb, open the curtains for daylight, or switch on the desk lamp. Each light changes the mood of the room.
- Objects glow on hover. Clicking one opens its section in a modal, so the 3D scene never reloads.
- The camera gently follows the mouse and eases back to center. Click-and-drag camera controls are turned off so the view can't get lost.

| Object in the room | Opens |
|---|---|
| Ohio flag | About me |
| Marine Corps flag / ATC tower in the window | Military background |
| Computer monitor | A Windows 7 style desktop (projects and certificates) |
| Chessboard and clock | Play chess against my bot |
| Frame on the wall | Resume |

### The computer
Clicking the monitor zooms into a recreated Windows 7 desktop with a working **Files** window. It has folders for Projects (with links to my other sites), my Resume, and my Certifications (React, JavaScript, MySQL, HTML & CSS). You can open each one in a new tab.

### The chess bot
"Can you beat me?" The bot is built to play like me:
1. **Opening book:** in positions from my own games, it plays the moves I actually played, chosen by how often I played each one.
2. **Maia:** after the book runs out, a [Maia](https://maiachess.com) neural network picks human-like moves. It runs right in the browser with ONNX Runtime Web, so no server is needed.

The rules come from chess.js and the board from react-chessboard.

### Menu
A small menu in the corner links to every section. It's there for quick visitors, keyboard users and screen readers.

## Tech stack
- [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript
- Tailwind CSS 4
- Spline (`@splinetool/react-spline`, `@splinetool/runtime`) for the 3D room
- chess.js, react-chessboard, onnxruntime-web for the chess bot
- 7.css for the Windows 7 window controls

## Project structure
```
app/
  page.tsx               homepage (renders the room)
  components/
    Room.tsx             loads the Spline scene and opens modals when objects are clicked
    SiteMenu.tsx         corner menu
    ComputerDesktop.tsx  Windows 7 desktop
    ComputerModal.tsx    zoom-into-the-monitor modal
    FilesWindow.tsx      file explorer (projects, resume, certificates)
    ChessGame.tsx        chess board and game logic
    ContentModal.tsx     About / Military modal
    ContactModal.tsx     contact form (sent through Formspree)
  lib/chess-bot/         opening book + Maia move picking
public/
  chess/                 Maia model (maia.onnx) and opening book
  windows-7/             desktop images and icons
  *.pdf, *-preview.png   resume, certificates and their thumbnails
```

## Running it locally
You need [Node.js](https://nodejs.org) (version 20 or newer).

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Other commands:
- `npm run build`: production build
- `npm run start`: run the production build
- `npm run lint`: check the code with ESLint

## Status
Work in progress. Still to come: mobile tap hints and deployment on Vercel.
