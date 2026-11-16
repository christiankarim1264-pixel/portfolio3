'use client';
// ① IMPORTS: at the very top, outside everything
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Chess } from 'chess.js';
import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from 'react-chessboard';
import { getBotMove, preloadBot } from '../lib/chess-bot/bot';
import { ChessComLogo, UsChessLogo } from './ChessLogos';

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
    'rounded-md bg-[#f0d9b5] px-4 py-2 font-semibold text-[#3d220f] shadow hover:bg-white transition-colors';

  // ④ RETURN: only JSX (what shows on screen)
  return (
    <div className='absolute inset-0 bg-black/60 flex items-center justify-center'
        onClick={() => onClose()}>
          <div className='relative w-[min(740px,92vw)] drop-shadow-2xl'
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
            <div className='absolute inset-0 z-5 flex flex-col items-center justify-center gap-4 bg-black/55 text-white'>
              {!player ? (
                <>
                  <p className='text-2xl font-bold'>Can you beat me?</p>
                  <p className='max-w-sm text-center text-sm text-white/80'>
                    This bot was programmed in Maia Chess to play my openings at my strength.
                  </p>
                  <div className='flex gap-3'>
                    <button className={buttonClass} onClick={() => startGame('white')}>Play white</button>
                    <button className={buttonClass} onClick={() => startGame('random')}>Random</button>
                    <button className={buttonClass} onClick={() => startGame('black')}>Play black</button>
                  </div>
                    <div className='mt-4'>Check out my chess.com account and uscf rating here!</div>
                    <div className='flex items-center gap-6'>
                    <a href='https://www.chess.com/member/youngfroo' target='blank'><ChessComLogo className='h-12 w-auto' /></a>
                    <a href='https://ratings.uschess.org/player/32669108' target='blank'><UsChessLogo className='h-12 w-auto' /></a>
                    </div>
                </>
              ) : (
                <>
                  <p className='text-2xl font-bold'>{status}</p>
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

        <button
            aria-label="Close chess"
            onClick={() => onClose()}
            className='absolute top-4 right-4 z-10 w-6 h-6 rounded-full bg-black/70 text-white text-xl leading-none hover:bg-black'
          >
            ×
          </button>
      </div>
    </div>
  );
}
