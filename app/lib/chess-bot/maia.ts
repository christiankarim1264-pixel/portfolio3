// Runs the Maia network in the browser and picks a move.
//
// Needs the model at /public/chess/maia.onnx (converted with lc0 leela2onnx).
// onnxruntime's engine file (.wasm) is bundled by Next.js automatically.
//
// onnxruntime is loaded with import() inside the functions, so it's only downloaded
// when the chess bot is actually used (not on every page load), and never on the server.

import type { Chess } from 'chess.js';
import type { InferenceSession } from 'onnxruntime-web';
import { encodePlanes, policyToMoves, type MoveChance } from './encode';

const MODEL_URL = '/chess/maia.onnx';

const loadOrt = () => import('onnxruntime-web/wasm');
let sessionPromise: Promise<InferenceSession> | null = null;

/** Loads the model once; later calls reuse it. Call early to warm it up. */
export function loadMaia(): Promise<InferenceSession> {
  sessionPromise ??= (async () => {
    const ort = await loadOrt();
    ort.env.wasm.numThreads = 1; // the model is tiny; threads would need extra server headers
    return ort.InferenceSession.create(MODEL_URL, { executionProviders: ['wasm'] });
  })().catch((err) => {
    sessionPromise = null; // let the next call try again
    throw err;
  });
  return sessionPromise;
}

/** Maia's chance for every legal move in the game's current position, most likely first. */
export async function getMaiaMoves(game: Chess): Promise<MoveChance[]> {
  const [ort, session] = await Promise.all([loadOrt(), loadMaia()]);
  const history = [...game.history({ verbose: true }).map((m) => m.before), game.fen()];
  const input = new ort.Tensor('float32', encodePlanes(history), [1, 112, 8, 8]);
  const output = await session.run({ '/input/planes': input });
  const legal = game.moves({ verbose: true }).map((m) => m.lan);
  return policyToMoves(output['/output/policy'].data as Float32Array, legal, game.turn() === 'b');
}

/**
 * Picks one move from the chances.
 * temperature 0   = always the most likely move (steady, a bit robotic)
 * temperature 1   = pick exactly by Maia's chances (most human, makes human mistakes)
 * in between      = favors the likely moves but still varies
 */
export function pickMove(moves: MoveChance[], temperature = 1): string {
  if (temperature <= 0) return moves[0].uci;
  const weights = moves.map((m) => Math.pow(m.p, 1 / temperature));
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < moves.length; i++) {
    r -= weights[i];
    if (r <= 0) return moves[i].uci;
  }
  return moves[0].uci;
}

/** One call: ask Maia and pick a move (UCI, e.g. "e2e4"). */
export async function getMaiaMove(game: Chess, temperature = 1): Promise<string> {
  return pickMove(await getMaiaMoves(game), temperature);
}
