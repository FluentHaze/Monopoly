import { createPinia, setActivePinia } from 'pinia';
import usePublicStore from '../src/stores/public.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BOARD,
  createGame,
  planTurn,
  claimMilestone,
  restoreGame,
  type GameState,
  type Tile,
} from '../src/views/monopoly/game.ts';
const fresh = (overrides: Partial<GameState> = {}) => ({ ...createGame(0), ...overrides });
const turn = (state: GameState, points: number, board: readonly Tile[] = BOARD) =>
  planTurn(state, points, board, 0);
const path = (state: GameState, points: number) =>
  turn(state, points)
    .events.filter(e => e.kind === 'move')
    .map(e => e.to);

test('map preserves 30 outer + 7 inner unique, usable cells', () => {
  assert.equal(BOARD.length, 37);
  assert.equal(new Set(BOARD.map(t => t.id)).size, 37);
  for (const t of BOARD) {
    assert(t.x >= 40 && t.x <= 680 && t.y >= 40 && t.y <= 780);
  }
});
test('all six dice outcomes advance; only final landing triggers effects', () => {
  for (let p = 1; p <= 6; p++) {
    const plan = turn(fresh(), p);
    assert.equal(plan.events.filter(e => e.kind === 'move').length, p);
    assert.equal(plan.state.dice, 98);
  }
  const plan = turn(fresh(), 4);
  assert.equal(plan.state.position, 4);
  assert.equal(plan.state.coins, 0); // passes coin at 3
});
test('portal 5→9 includes landing reward, does not add lap', () => {
  const p = turn(fresh(), 5);
  assert.equal(p.state.position, 9);
  assert.equal(p.state.coins, 20);
  assert.equal(p.state.completed, 0);
  assert(p.events.some(e => e.kind === 'teleport' && e.to === 9));
});
test('retreat 12→8 animates each backward cell and charges one dice', () => {
  const s = turn(fresh(), 5).state;
  const p = turn(s, 3);
  assert.equal(p.state.position, 8);
  assert.deepEqual(
    p.events.filter(e => e.direction === -1).map(e => e.to),
    [11, 10, 9, 8],
  );
  assert.equal(p.state.dice, 97);
});
test('slow landing sets three future rolls; each consumes one dice and advances one', () => {
  let s = turn(fresh({ position: 6 }), 1).state;
  assert.equal(s.slow, 3);
  for (const remaining of [2, 1, 0]) {
    const p = turn(s, 6);
    assert.equal(p.steps, 1);
    assert.equal(p.state.slow, remaining);
    assert.equal(p.state.position, s.position + 1);
    assert.equal(p.state.dice, s.dice - 1);
    s = p.state;
  }
});
test('slow re-entry refreshes duration rather than stacking', () => {
  assert.equal(turn(fresh({ position: 6, slow: 1 }), 6).state.slow, 3);
});
test('slow and retreat combination cannot permanently trap the player', () => {
  let s = fresh({ position: 21, slow: 3 });
  for (let i = 0; i < 3; i++) s = turn(s, 6).state;
  assert.equal(s.position, 22);
  assert.equal(s.slow, 0);
  assert.equal(turn(s, 5).state.position, 27);
});
test('landing at gate enters 27→30; merely passing gate stays outer', () => {
  assert.deepEqual(path(fresh({ position: 27 }), 3), [30, 31, 32]);
  assert.deepEqual(path(fresh({ position: 26 }), 3), [27, 28, 29]);
});
test('all seven inner cells join at 36→11 without phantom laps', () => {
  let s = turn(fresh({ position: 27 }), 6).state;
  assert.equal(s.position, 35);
  assert.equal(s.dice, 100);
  s = turn(s, 1).state;
  assert.equal(s.position, 36);
  assert.equal(s.coins, 80);
  s = turn(s, 1).state;
  assert.equal(s.position, 11);
  assert.equal(s.completed, 0);
});
test('backward effects after inner exit reverse actual traversed branch', () => {
  const board = BOARD.map(t => (t.id === 11 ? { ...t, kind: 'back' as const, amount: 2 } : t));
  const p = turn(fresh({ position: 35 }), 2, board);
  assert.equal(p.state.position, 35);
  assert.deepEqual(
    p.events.filter(e => e.direction === -1).map(e => e.to),
    [36, 35],
  );
});
test('normal crossing 29→0 counts once even when continuing beyond start', () => {
  const p = turn(fresh({ position: 28 }), 4);
  assert.equal(p.state.position, 2);
  assert.equal(p.state.completed, 1);
  assert.equal(p.events.filter(e => e.kind === 'lap').length, 1);
});
test('teleport to zero is valid and never counts as a lap', () => {
  const board = BOARD.map(t => (t.id === 5 ? { ...t, target: 0 } : t));
  const p = turn(fresh(), 5, board);
  assert.equal(p.state.position, 0);
  assert.equal(p.state.completed, 0);
});
test('retreat stops at start without going negative or subtracting laps', () => {
  const board = BOARD.map(t => (t.id === 1 ? { ...t, kind: 'back' as const, amount: 4 } : t));
  const p = turn(fresh({ completed: 2 }), 1, board);
  assert.equal(p.state.position, 0);
  assert.equal(p.state.completed, 2);
});
test('retreat into slow triggers slow effect', () => {
  const board = BOARD.map(t => (t.id === 12 ? { ...t, amount: 5 } : t));
  const p = turn(fresh({ position: 11 }), 1, board);
  assert.equal(p.state.position, 7);
  assert.equal(p.state.slow, 3);
});
test('coin, gem, chest and extra dice rewards apply to final landing', () => {
  assert.equal(turn(fresh({ position: 2 }), 1).state.coins, 25);
  assert.equal(turn(fresh({ position: 30 }), 1).state.gems, 1);
  assert.equal(turn(fresh({ position: 31 }), 1).state.coins, 100);
  assert.equal(turn(fresh({ position: 17, dice: 1 }), 1).state.dice, 2);
});
test('zero dice and expired rounds reject without mutation', () => {
  for (const s of [fresh({ dice: 0 }), fresh({ expiresAt: 0 })]) {
    const copy = structuredClone(s);
    assert.throws(() => turn(s, 2));
    assert.deepEqual(s, copy);
  }
});
test('invalid dice and targets reject', () => {
  for (const p of [0, 7, -1, 1.5, NaN]) assert.throws(() => turn(fresh(), p));
  const board = BOARD.map(t => (t.id === 5 ? { ...t, target: 99 } : t));
  assert.throws(() => turn(fresh(), 5, board), /传送目标/);
});
test('portal/effect cycles reject atomically rather than recurse forever', () => {
  const board = BOARD.map(t => (t.id === 9 ? { ...t, kind: 'portal' as const, target: 5 } : t));
  const s = fresh();
  const before = structuredClone(s);
  assert.throws(() => turn(s, 5, board), /循环/);
  assert.deepEqual(s, before);
});
test('planning never changes input state or board', () => {
  const s = fresh();
  const before = structuredClone(s),
    board = structuredClone(BOARD);
  turn(s, 5);
  assert.deepEqual(s, before);
  assert.deepEqual(BOARD, board);
});
test('milestones unlock once, award correct coins, reject invalid claims', () => {
  let s = fresh({ completed: 5 });
  for (let lap = 1; lap <= 5; lap++) {
    s = claimMilestone(s, lap);
    assert.throws(() => claimMilestone(s, lap));
  }
  assert.equal(s.coins, 800);
  assert.deepEqual(s.claimed, [1, 2, 3, 4, 5]);
  for (const lap of [0, 6, 1.5]) assert.throws(() => claimMilestone(s, lap));
  assert.throws(() => claimMilestone(fresh(), 1));
});
test('save/restore preserves route history, slow, laps and claimed milestones', () => {
  const s = claimMilestone(
    fresh({ position: 35, slow: 2, completed: 3, trail: [27, 30, 31, 32, 33, 34] }),
    2,
  );
  assert.deepEqual(restoreGame(JSON.stringify(s), 0), s);
});
test('corrupted storage is safely reset; expired storage remains expired', () => {
  for (const raw of [
    'garbage',
    'null',
    '{}',
    JSON.stringify(fresh({ position: 99 })),
    JSON.stringify(fresh({ slow: 7 })),
    JSON.stringify(fresh({ claimed: [1] })),
    JSON.stringify({ ...fresh(), trail: [null] }),
  ])
    assert.deepEqual(restoreGame(raw, 0), fresh());
  assert.equal(restoreGame(JSON.stringify(fresh({ expiresAt: 1 })), 2).expiresAt, 1);
});
test('whole adventure: portal, backward, slow, inner rewards, outer return, lap, claim', () => {
  let s = fresh();
  const visited: number[] = [];
  for (const p of [5, 3, 6, 4, 3, 1, 6, 6, 5, 6, 1, 1, 6, 6, 6, 1]) {
    s = turn(s, p).state;
    visited.push(s.position);
  }
  assert.deepEqual(visited, [9, 8, 14, 18, 21, 22, 23, 22, 27, 35, 36, 11, 17, 23, 29, 0]);
  assert.equal(s.completed, 1);
  assert.equal(s.slow, 0);
  assert.equal(s.dice, 87);
  assert.equal(s.coins, 150);
  s = claimMilestone(s, 1);
  assert.equal(s.coins, 200);
});
test('10000 deterministic turns: valid positions, no loops, accurate lap events and bounded history', () => {
  let seed = 81723,
    s = fresh({ dice: 20000 }),
    laps = 0;
  const visited = new Set<number>();
  for (let i = 0; i < 10000; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const p = turn(s, (seed % 6) + 1);
    s = p.state;
    laps += p.events.filter(e => e.kind === 'lap').length;
    p.events.forEach(e => visited.add(e.to));
    assert(s.position >= 0 && s.position < 37);
    assert(s.slow >= 0 && s.slow <= 3);
    assert(s.trail.length <= 512);
  }
  assert.equal(s.completed, laps);
  assert(laps > 10);
  assert.equal(visited.size, 37);
});

test('closing an unknown or already closed dialog preserves other dialogs', () => {
  setActivePinia(createPinia());
  const store = usePublicStore();
  const first = { dialogKey: 1 },
    second = { dialogKey: 2 };
  store.setDialogs(first);
  store.setDialogs(second);
  store.deleteDialogs({ dialogKey: 999 });
  assert.equal(store.dialogs.length, 2);
  store.deleteDialogs(first);
  store.deleteDialogs(first);
  assert.equal(store.dialogs.length, 1);
  assert.equal(store.dialogs[0].dialogKey, 2);
});
