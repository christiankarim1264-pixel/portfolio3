// The bot's brain: my opening book first, Maia after that.
//
//   getBotMove(game)
//     1. Is this exact position in my opening book (public/chess/opening-book.json)?
//        -> play one of MY moves there, picked by how often I played each one.
//     2. Otherwise -> ask Maia (maia.ts).

import type { Chess } from 'chess.js';
import { getMaiaMoves, loadMaia, pickMove } from './maia';

/** How adventurous Maia is: 0 = always its top move, 1 = fully by its chances (see pickMove). */
export const MAIA_TEMPERATURE = 0.7;

type Book = Record<string, Record<string, number>>; // position -> { move: times I played it }
export type BotMove = { uci: string; source: 'book' | 'maia' };

let bookPromise: Promise<Book> | null = null;

function loadBook(): Promise<Book> {
  bookPromise ??= fetch('/chess/opening-book.json')
    .then((res) => {
      if (!res.ok) throw new Error(`opening book: HTTP ${res.status}`);
      return res.json() as Promise<Book>;
    })
    .catch((err) => {
      bookPromise = null; // let the next call try again
      throw err;
    });
  return bookPromise;
}

/** Start downloading the book and the model (call when the chess modal opens). */
export function preloadBot() {
  loadBook().catch(() => {});
  loadMaia().catch(() => {});
}

// Same key format build-book.mjs uses: pieces, turn, castling, en passant
const positionKey = (fen: string) => fen.split(' ').slice(0, 4).join(' ');

export async function getBotMove(game: Chess): Promise<BotMove> {
  try {
    const entry = (await loadBook())[positionKey(game.fen())];
    if (entry) {
      const legal = new Set(game.moves({ verbose: true }).map((m) => m.lan));
      const options = Object.entries(entry)
        .filter(([uci]) => legal.has(uci))
        .map(([uci, count]) => ({ uci, p: count }));
      if (options.length) return { uci: pickMove(options, 1), source: 'book' };
    }
  } catch {
    // no book (network error)? Maia alone still works
  }
  return { uci: pickMove(await getMaiaMoves(game), MAIA_TEMPERATURE), source: 'maia' };
}
