'use client';
// ① IMPORTS: at the very top, outside everything
import { useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard, type PieceDropHandlerArgs } from 'react-chessboard';

export default function ChessGame({ onClose }: { onClose: () => void }) {
  // ② HOOKS: first thing inside the function
  const game = useRef(new Chess());
  const [fen, setFen] = useState(game.current.fen());

  // ③ HELPER FUNCTIONS: after the hooks, before return
  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
  if (!targetSquare) return false;           // dropped off the board
  try {
    game.current.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    setFen(game.current.fen());
    return true;                             // legal: keep the piece there
  } catch {
    return false;                            // illegal: piece snaps back
  }
}

  // ④ RETURN: only JSX (what shows on screen)
  return (
    <div className='absolute inset-0 bg-black/60 flex items-center justify-center'
        onClick={() => onClose()}>
          <div className='relative w-[min(600px,90vw)] bg-white p-4'
          onClick={(e) => e.stopPropagation()}>
        <Chessboard options={{ position: fen, onPieceDrop }} />
        <button
            aria-label="Close resume"
            onClick={() => onClose()}
            className='absolute top-0 right-0 w-6 h-6 rounded-full bg-black/70 text-white text-xl leading-none hover:bg-black'
          >
            ×
          </button>
      </div>
    </div>
  );
}
