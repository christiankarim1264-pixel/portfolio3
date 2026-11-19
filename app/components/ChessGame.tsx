'use client';
// ① IMPORTS: at the very top, outside everything
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Chess } from 'chess.js';
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from 'react-chessboard';
import { getBotMove, preloadBot } from '../lib/chess-bot/bot';
import { ChessComLogo, UsChessLogo } from './ChessLogos';
import { useDialogFocus } from './useDialogFocus';

// Which frame to show: true = CSS wood (globals.css), false = the PNG image
const USE_CSS_FRAME = true;

// The bot "thinks" for a random time in this range (ms), so it doesn't answer instantly
const THINK_MIN_MS = 500;
const THINK_MAX_MS = 1300;

type Color = 'white' | 'black';

export default function ChessGame({ onClose }: { onClose: () => void }) {
  // ② HOOKS: first thing inside the function
  const [game] = useState(() => new Chess());         // the rules + the real game (same object all game long)
  const [fen, setFen] = useState(() => game.fen());   // a copy of the position; changing it redraws the board
  const [player, setPlayer] = useState<Color | null>(null); // null = still picking a color
  const [thinking, setThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [bookMove, setBookMove] = useState(false);    // was the bot's last move from my opening book?
  const [error, setError] = useState<string | null>(null);
  const [resigned, setResigned] = useState(false);
  const [confirmResign, setConfirmResign] = useState(false); // first click asks "Sure?"
  // Goes up by 1 on every new game and when the modal closes. A bot move that finishes
  // "thinking" after that belongs to an old game, so it gets thrown away.
  const gameId = useRef(0);
  const dialog = useDialogFocus<HTMLDivElement>();

  useEffect(() => {
    preloadBot(); // start downloading the model + book as soon as the modal opens
    const ids = gameId;
    return () => { ids.current++; };
  }, []);

  // ③ HELPER FUNCTIONS: after the hooks, before return
  async function playBotMove() {
    const id = gameId.current;
    setThinking(true);
    const started = Date.now();
    try {
      const move = await getBotMove(game);
      const wait = THINK_MIN_MS + Math.random() * (THINK_MAX_MS - THINK_MIN_MS) - (Date.now() - started);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      if (id !== gameId.current) return; // the game was restarted or closed meanwhile

      const from = move.uci.slice(0, 2), to = move.uci.slice(2, 4);
      game.move({ from, to, promotion: move.uci[4] });
      setLastMove({ from, to });
      setBookMove(move.source === 'book');
      setFen(game.fen());
    } catch (err) {
      console.error(err);
      if (id === gameId.current) setError("I couldn't load my brain. Check your connection and start a new game.");
    } finally {
      if (id === gameId.current) setThinking(false);
    }
  }

  function startGame(choice: Color | 'random') {
    const color: Color = choice === 'random' ? (Math.random() < 0.5 ? 'white' : 'black') : choice;
    gameId.current++;
    game.reset();
    setFen(game.fen());
    setLastMove(null);
    setBookMove(false);
    setError(null);
    setResigned(false);
    setConfirmResign(false);
    setThinking(false);
    setPlayer(color);
    if (color === 'black') playBotMove(); // the bot plays white, so it moves first
  }

  function resign() {
    if (!confirmResign) {
      setConfirmResign(true); // ask first, so a stray click doesn't end the game
      return;
    }
    gameId.current++; // if the bot is mid-"thought", throw that move away
    setThinking(false);
    setResigned(true);
  }

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare || !player || thinking || resigned || game.isGameOver()) return false;
    try {
      game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    } catch {
      return false;                              // illegal: piece snaps back
    }
    setLastMove({ from: sourceSquare, to: targetSquare });
    setBookMove(false);
    setConfirmResign(false); // making a move cancels a half-clicked resign
    setFen(game.fen());
    if (!game.isGameOver()) playBotMove();
    return true;
  }

  // only your own pieces, only on your turn
  function canDragPiece({ piece }: PieceHandlerArgs) {
    return !!player && !thinking && !resigned && !game.isGameOver() && piece.pieceType[0] === player[0];
  }

  // what the line under the board says
  const over = !!player && (game.isGameOver() || !!error || resigned);
  let status = '';
  if (error) status = error;
  else if (resigned) status = 'You resigned. I win!';
  else if (game.isCheckmate()) status = game.turn() === player?.[0] ? 'Checkmate. I win!' : 'Checkmate. You beat me!';
  else if (game.isStalemate()) status = 'Stalemate. Draw.';
  else if (game.isThreefoldRepetition()) status = 'Draw by repetition.';
  else if (game.isInsufficientMaterial()) status = 'Draw: not enough pieces left to mate.';
  else if (game.isDraw()) status = 'Draw (50-move rule).';
  else if (thinking) status = 'Thinking…';
  else if (player) status = (game.inCheck() ? "Check! " : '') + 'Your move' + (bookMove ? ' · I played that from my opening book' : '');

  const highlight = { backgroundColor: 'rgb(255 230 90 / 0.45)' };
  const squareStyles: Record<string, React.CSSProperties> =
    lastMove ? { [lastMove.from]: highlight, [lastMove.to]: highlight } : {};
  // the king in check gets a red glow (added last, so it wins over the yellow)
  if (game.inCheck()) {
    const [kingSquare] = game.findPiece({ type: 'k', color: game.turn() });
    squareStyles[kingSquare] = {
      background: 'radial-gradient(circle, rgb(255 0 0) 0%, rgb(230 0 0 / 0.75) 35%, rgb(160 0 0 / 0) 75%)',
    };
  }
  const board = (
    <Chessboard
      options={{
        position: fen,
        onPieceDrop,
        canDragPiece,
        boardOrientation: player ?? 'white',
        squareStyles,
        darkSquareStyle: { backgroundColor: '#b58863' },
        lightSquareStyle: { backgroundColor: '#f0d9b5' },
      }}
    />
  );

  const buttonClass =
    // sized by the POPUP's width (container queries, see the dialog below): small board = small buttons,
    // @lg (board 512px+) = the original size, @3xl (board 768px+, computers) = 1.5x
    'rounded-md bg-[#f0d9b5] px-3 py-1.5 text-sm @lg:px-4 @lg:py-2 @lg:text-base @3xl:rounded-lg @3xl:px-6 @3xl:py-3 @3xl:text-2xl font-semibold text-[#3d220f] shadow hover:bg-white transition-colors';

  // ④ RETURN: only JSX (what shows on screen)
  return (
    <div className='absolute inset-0 bg-black/60 flex items-center justify-center'
        onClick={() => onClose()}>
          <div ref={dialog} tabIndex={-1} role='dialog' aria-modal='true' aria-label='Play chess against my bot'
          className='@container relative w-[min(1200px,92vw,calc(92dvh-3rem))] drop-shadow-2xl outline-none'
          onClick={(e) => e.stopPropagation()}>
        <div className='relative'>
          {USE_CSS_FRAME ? (
            <div className='wood-frame'>
              {/* dark groove + thin highlight where the board meets the wood */}
              <div className='shadow-[0_0_0_3px_#3d220f,0_0_0_4px_rgb(255_220_170/0.35)]'>
                {board}
              </div>
            </div>
          ) : (
            <>
              <div className='pt-[8.7%] pr-[9.5%] pb-[8.65%] pl-[9.6%]'>
                {board}
              </div>
              <Image src='/wooden-frame.webp' alt='' fill sizes='740px' className='pointer-events-none' />
            </>
          )}

          {/* before a game: pick a color.  after a game: play again */}
          {(!player || over) && (
            // sized by how wide the POPUP is, not the browser window (a phone held sideways has a wide window but a small board):
            // plain classes = board under 512px (phones), @lg: = 512px+ (tablets, the original sizes), @3xl: = 768px+ (computers, 1.5x)
            // justify-center-safe centers the content, but lines it up at the top if it's too tall (so overflow-y-auto can reach all of it)
            <div className='absolute inset-0 z-5 flex flex-col items-center justify-center-safe gap-2 @lg:gap-4 @3xl:gap-6 overflow-y-auto px-3 py-3 bg-black/55 text-white'>
              {!player ? (
                <>
                  <p className='text-xl @lg:text-2xl @3xl:text-4xl font-bold'>Can you beat me?</p>
                  {/* the least important line, so phones skip it */}
                  <p className='hidden @lg:block max-w-sm @3xl:max-w-xl text-center text-sm @3xl:text-xl text-white/80'>
                    This bot was programmed in Maia Chess to play my openings at my strength.
                  </p>
                  <div className='flex gap-2 @lg:gap-3 @3xl:gap-4'>
                    <button className={buttonClass} onClick={() => startGame('white')}>Play white</button>
                    <button className={buttonClass} onClick={() => startGame('random')}>Random</button>
                    <button className={buttonClass} onClick={() => startGame('black')}>Play black</button>
                  </div>
                    <div className='mt-1 @lg:mt-4 @3xl:mt-6 text-center text-sm @lg:text-base @3xl:text-2xl'>Check out my chess.com account and USCF rating here!</div>
                    <div className='flex items-center gap-4 @lg:gap-6 @3xl:gap-9'>
                    <a href='https://www.chess.com/member/youngfroo' target='_blank' rel='noreferrer' aria-label='My Chess.com profile'><ChessComLogo className='h-8 @lg:h-12 @3xl:h-18 w-auto' /></a>
                    <a href='https://ratings.uschess.org/player/32669108' target='_blank' rel='noreferrer' aria-label='My US Chess rating'><UsChessLogo className='h-8 @lg:h-12 @3xl:h-18 w-auto' /></a>
                    </div>
                </>
              ) : (
                <>
                  <p className='text-center text-xl @lg:text-2xl @3xl:text-4xl font-bold'>{status}</p>
                  <button className={buttonClass} onClick={() => setPlayer(null)}>Play again</button>
                </>
              )}
            </div>
          )}
        </div>

        {player && (
          <div className='mt-3 flex items-center justify-between gap-4 text-sm text-white'>
            <p className='min-h-5'>{status}</p>
            {!over && (
              <button
                onClick={resign}
                onBlur={() => setConfirmResign(false)}
                className={`shrink-0 rounded-md px-3 py-1 font-semibold transition-colors ${
                  confirmResign ? 'bg-red-700 hover:bg-red-600' : 'bg-white/15 hover:bg-white/25'
                }`}
              >
                {confirmResign ? 'Sure? Click to resign' : 'Resign'}
              </button>
            )}
          </div>
        )}

        {/* close button, styled like the other popups' close buttons.
            phones/tablets (below lg): 44px so it's easy to tap, and placed OUTSIDE the popup so it never covers the board:
              upright -> above the popup's top-right corner, sideways -> to the right of it (that's where the free space is).
            computers (lg+): centered on the wooden frame's top-right corner. The frame is 7% of the popup's width, so the
              button is 5.5% of it (never under 32px): it grows with the board and always fits inside the wood */}
        <button
          type='button'
          aria-label='Close chess'
          onClick={() => onClose()}
          className='absolute z-10 grid size-11 place-items-center rounded-full bg-[#151920]/90 text-[#f3ece1] ring-1 ring-[#2a2f38]
            shadow-[0_6px_18px_rgb(0_0_0/0.5)] transition-colors hover:bg-[#232832]
            max-lg:portrait:bottom-full max-lg:portrait:right-0 max-lg:portrait:mb-2
            max-lg:landscape:top-0 max-lg:landscape:left-full max-lg:landscape:ml-2
            lg:top-[3.5%] lg:right-[3.5%] lg:h-auto lg:w-[5.5%] lg:min-w-8 lg:aspect-square lg:translate-x-1/2 lg:-translate-y-1/2'
        >
          {/* an SVG × instead of the text character, so it sits exactly in the middle */}
          <svg viewBox='0 0 24 24' aria-hidden className='size-1/2' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
            <path d='M6 6l12 12M18 6L6 18' />
          </svg>
        </button>
      </div>
    </div>
  );
}
