// Translates between chess positions and the Maia neural network (lc0 "classical" format).
// Pure functions, no imports, so it also runs in plain Node for testing.
//
// INPUT  (encodePlanes): 112 planes of 8x8 numbers = Float32Array(112 * 64)
//   For each of the last 8 positions (i = 0 is the current one), 13 planes:
//     0-5   the side-to-move's pieces:  P N B R Q K   (1 where that piece stands)
//     6-11  the opponent's pieces:      P N B R Q K
//     12    all 1s if this position happened before (repetition)
//   Then 8 extra planes (104-111):
//     104 we can castle queenside   105 we can castle kingside
//     106 they can castle queenside 107 they can castle kingside
//     108 all 1s if black to move   109 fifty-move counter (half-moves)
//     110 all 0s                    111 all 1s (helps the net find the board edge)
//   Everything is seen from the side to move: when black moves, the board is
//   mirrored top-to-bottom so "my pieces" always start at the bottom.
//
// OUTPUT (policyToMoves): 1858 scores, one per possible move in POLICY_MOVES.
//   Also from the side to move's view, so black's moves are mirrored back.

const FILES = 'abcdefgh';
const PIECES = 'pnbrqk';
const squareName = (sq: number) => FILES[sq % 8] + (Math.floor(sq / 8) + 1);

// The 1858 moves in lc0's order:
// 1) for every from-square a1, b1 ... h8: every queen-line or knight jump target, sorted by square
// 2) then promotions from rank 7 to rank 8 as queen, rook, bishop
//    (knight promotion uses the plain move, e.g. "a7a8")
function buildPolicyMoves(): string[] {
  const lines = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const jumps = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  const onBoard = (f: number, r: number) => f >= 0 && f < 8 && r >= 0 && r < 8;
  const moves: string[] = [];

  for (let from = 0; from < 64; from++) {
    const f = from % 8, r = Math.floor(from / 8);
    const targets: number[] = [];
    for (const [df, dr] of lines) {
      for (let k = 1; onBoard(f + df * k, r + dr * k); k++) targets.push((r + dr * k) * 8 + f + df * k);
    }
    for (const [df, dr] of jumps) {
      if (onBoard(f + df, r + dr)) targets.push((r + dr) * 8 + f + df);
    }
    targets.sort((a, b) => a - b);
    for (const to of targets) moves.push(squareName(from) + squareName(to));
  }

  for (let f = 0; f < 8; f++) {
    for (const df of [-1, 0, 1]) {
      if (f + df < 0 || f + df > 7) continue;
      for (const p of 'qrb') moves.push(`${FILES[f]}7${FILES[f + df]}8${p}`);
    }
  }
  return moves;
}

export const POLICY_MOVES = buildPolicyMoves();
const POLICY_INDEX = new Map(POLICY_MOVES.map((m, i) => [m, i]));

// Same position = same pieces, side to move, castling rights and en passant square
const positionKey = (fen: string) => fen.split(' ').slice(0, 4).join(' ');

/** history = every FEN of the game so far, oldest first; the last one is the current position. */
export function encodePlanes(history: string[]): Float32Array {
  const planes = new Float32Array(112 * 64);
  const current = history[history.length - 1].split(' ');
  const black = current[1] === 'b';

  // how often each position has appeared up to each point (for the repetition plane)
  const seen = new Map<string, number>();
  const repeated = history.map((fen) => {
    const k = positionKey(fen);
    const n = seen.get(k) ?? 0;
    seen.set(k, n + 1);
    return n > 0;
  });

  // Fewer than 8 positions? From the normal start, the missing ones stay empty (all 0).
  // From a custom position (FEN), lc0 repeats the oldest position instead, so we do too.
  const fromStart = history[0].startsWith('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w');

  for (let i = 0; i < 8; i++) {
    let h = history.length - 1 - i;
    if (h < 0) {
      if (fromStart) break;
      h = 0;
    }
    const rows = history[h].split(' ')[0].split('/'); // rows[0] is rank 8

    for (let row = 0; row < 8; row++) {
      const rank = 7 - row;
      let file = 0;
      for (const ch of rows[row]) {
        if (ch >= '1' && ch <= '8') { file += Number(ch); continue; }
        const isWhite = ch === ch.toUpperCase();
        const mine = isWhite !== black;
        const plane = i * 13 + (mine ? 0 : 6) + PIECES.indexOf(ch.toLowerCase());
        const r = black ? 7 - rank : rank; // mirror for black
        planes[plane * 64 + r * 8 + file] = 1;
        file++;
      }
    }
    if (repeated[h]) planes.fill(1, (i * 13 + 12) * 64, (i * 13 + 13) * 64);
  }

  const castling = current[2];
  const [ourK, ourQ, theirK, theirQ] = black ? ['k', 'q', 'K', 'Q'] : ['K', 'Q', 'k', 'q'];
  const fillPlane = (p: number, v: number) => planes.fill(v, p * 64, (p + 1) * 64);
  if (castling.includes(ourQ)) fillPlane(104, 1);
  if (castling.includes(ourK)) fillPlane(105, 1);
  if (castling.includes(theirQ)) fillPlane(106, 1);
  if (castling.includes(theirK)) fillPlane(107, 1);
  if (black) fillPlane(108, 1);
  fillPlane(109, Number(current[4]) || 0);
  fillPlane(111, 1);
  return planes;
}

// A real move (like "e7e5" for black) -> its name in the network's view (mirrored for black,
// castling written as king-to-rook, knight promotion without a letter).
function toNetworkMove(uci: string, black: boolean): string {
  let m = uci;
  if (m === 'e1g1' || m === 'e8g8') m = m.slice(0, 2) + 'h' + m[3];
  if (m === 'e1c1' || m === 'e8c8') m = m.slice(0, 2) + 'a' + m[3];
  if (m.length === 5 && m[4] === 'n') m = m.slice(0, 4);
  if (black) m = m[0] + (9 - Number(m[1])) + m[2] + (9 - Number(m[3])) + m.slice(4);
  return m;
}

export type MoveChance = { uci: string; p: number };

/**
 * Turns the network's 1858 raw scores into chances for the legal moves only.
 * legalUci = legal moves in UCI form ("e2e4", "e7e8q", castling as "e1g1").
 * Castling must only be passed when it's actually legal (chess.js does this).
 * Returns moves sorted from most to least likely; chances add up to 1.
 */
export function policyToMoves(scores: Float32Array, legalUci: string[], black: boolean): MoveChance[] {
  const raw = legalUci.map((uci) => {
    const idx = POLICY_INDEX.get(toNetworkMove(uci, black));
    return { uci, s: idx === undefined ? -Infinity : scores[idx] };
  });
  const max = Math.max(...raw.map((m) => m.s));
  const exps = raw.map((m) => ({ uci: m.uci, e: Math.exp(m.s - max) }));
  const total = exps.reduce((sum, m) => sum + m.e, 0);
  return exps.map((m) => ({ uci: m.uci, p: m.e / total })).sort((a, b) => b.p - a.p);
}
