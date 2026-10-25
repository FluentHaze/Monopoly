/** Pure local game rules. IDs intentionally retain the original 0–36 map contract. */
export type TileKind =
  'start' | 'normal' | 'coin' | 'gem' | 'chest' | 'back' | 'slow' | 'portal' | 'dice' | 'gate';
export interface Tile {
  id: number;
  kind: TileKind;
  label: string;
  amount?: number;
  target?: number;
  x: number;
  y: number;
}
const positions: [number, number][] = [
  ...Array.from({ length: 7 }, (_, i): [number, number] => [85 + i * 90, 690 + (i % 2 ? -8 : 0)]),
  ...Array.from({ length: 8 }, (_, i): [number, number] => [625, 630 - i * 60]),
  ...Array.from({ length: 7 }, (_, i): [number, number] => [625 - i * 90, 150 + (i % 2 ? -8 : 0)]),
  ...Array.from({ length: 8 }, (_, i): [number, number] => [85, 210 + i * 60]),
  [175, 510],
  [265, 475],
  [355, 450],
  [445, 450],
  [445, 390],
  [445, 330],
  [535, 350],
];
const specials: Record<number, Partial<Tile>> = {
  0: { kind: 'start', label: '起点' },
  3: { kind: 'coin', label: '金币 +25', amount: 25 },
  5: { kind: 'portal', label: '传送至第 10 格', target: 9 },
  7: { kind: 'slow', label: '慢行 3 次', amount: 3 },
  9: { kind: 'coin', label: '金币 +20', amount: 20 },
  12: { kind: 'back', label: '后退 4 格', amount: 4 },
  15: { kind: 'coin', label: '金币 +35', amount: 35 },
  18: { kind: 'dice', label: '骰子 +2', amount: 2 },
  21: { kind: 'slow', label: '慢行 3 次', amount: 3 },
  24: { kind: 'back', label: '后退 2 格', amount: 2 },
  27: { kind: 'gate', label: '下次进入特殊路线' },
  29: { kind: 'coin', label: '金币 +50', amount: 50 },
  30: { kind: 'coin', label: '金币 +40', amount: 40 },
  31: { kind: 'gem', label: '水晶 +1', amount: 1 },
  32: { kind: 'chest', label: '宝箱金币 +100', amount: 100 },
  33: { kind: 'coin', label: '金币 +60', amount: 60 },
  34: { kind: 'gem', label: '水晶 +2', amount: 2 },
  35: { kind: 'dice', label: '骰子 +2', amount: 2 },
  36: { kind: 'coin', label: '金币 +80', amount: 80 },
};
export const BOARD: readonly Tile[] = positions.map(([x, y], id) => ({
  id,
  // Keep all outer/inner junctions aligned while tightening the horizontal pitch.
  x: 355 + (x - 355) * (84 / 90),
  y,
  kind: 'normal',
  label: '继续前进',
  ...specials[id],
}));
export const MILESTONE_REWARDS = [50, 100, 150, 200, 300] as const;
export const STORAGE_KEY = 'monopoly-adventure-v2';
export interface GameState {
  version: 2;
  position: number;
  dice: number;
  completed: number;
  slow: number;
  coins: number;
  gems: number;
  claimed: number[];
  trail: number[];
  expiresAt: number;
}
export interface GameEvent {
  kind: 'move' | 'teleport' | 'effect' | 'lap';
  to: number;
  message: string;
  direction?: 1 | -1;
}
export interface TurnPlan {
  state: GameState;
  events: GameEvent[];
  points: number;
  steps: number;
}
export function createGame(now = Date.now()): GameState {
  return {
    version: 2,
    position: 0,
    dice: 99,
    completed: 0,
    slow: 0,
    coins: 0,
    gems: 0,
    claimed: [],
    trail: [],
    expiresAt: now + 3 * 86400_000,
  };
}
export function restoreGame(raw: string | null, now = Date.now()): GameState {
  try {
    const state = JSON.parse(raw ?? 'null') as GameState;
    if (!state || state.version !== 2 || !Number.isFinite(state.expiresAt)) return createGame(now);
    const nonnegative = [
      state.position,
      state.dice,
      state.completed,
      state.slow,
      state.coins,
      state.gems,
    ];
    if (
      nonnegative.some(n => !Number.isSafeInteger(n) || n < 0) ||
      state.position > 36 ||
      state.slow > 3
    )
      return createGame(now);
    if (
      !Array.isArray(state.trail) ||
      state.trail.length > 512 ||
      state.trail.some(n => !Number.isInteger(n) || n < 0 || n > 36)
    )
      return createGame(now);
    if (
      !Array.isArray(state.claimed) ||
      new Set(state.claimed).size !== state.claimed.length ||
      state.claimed.some(n => !Number.isInteger(n) || n < 1 || n > Math.min(state.completed, 5))
    )
      return createGame(now);
    return { ...state, claimed: [...state.claimed], trail: [...state.trail] };
  } catch {
    return createGame(now);
  }
}
/** Compute a whole turn before animating it. An invalid effect chain never partly commits state. */
export function planTurn(
  current: GameState,
  points: number,
  board: readonly Tile[] = BOARD,
  now = Date.now(),
): TurnPlan {
  if (!Number.isInteger(points) || points < 1 || points > 6) throw new Error('骰子点数必须为 1–6');
  if (current.dice <= 0) throw new Error('骰子已用完');
  if (current.expiresAt <= now) throw new Error('本轮活动已结束');
  if (!board[current.position]) throw new Error('角色位置无效');
  const state: GameState = {
    ...current,
    claimed: [...current.claimed],
    trail: [...current.trail],
    dice: current.dice - 1,
  };
  const events: GameEvent[] = [];
  const steps = state.slow > 0 ? 1 : points;
  if (state.slow > 0) {
    state.slow--;
    events.push({
      kind: 'effect',
      to: state.position,
      message: `慢行生效：本次前进 1 格，剩余 ${state.slow} 次`,
    });
  }
  const walk = (count: number, direction: 1 | -1, branch = false) => {
    for (let i = 0; i < count; i++) {
      const from = state.position;
      if (direction === -1 && from === 0) break; // Original rule: backward movement stops at start.
      let to: number;
      if (direction === 1) {
        to = from === 36 ? 11 : from === 29 ? 0 : branch && i === 0 && from === 27 ? 30 : from + 1;
        state.trail.push(from);
        if (state.trail.length > 512) state.trail.shift();
      } else {
        to = state.trail.pop() ?? (from === 30 ? 27 : from - 1);
      }
      if (!board[to]) throw new Error('路线指向不存在的格子');
      state.position = to;
      events.push({
        kind: 'move',
        to,
        direction,
        message: `${direction === 1 ? '前进' : '后退'}至第 ${to + 1} 格`,
      });
      if (direction === 1 && from === 29 && to === 0) {
        state.completed++;
        events.push({ kind: 'lap', to, message: `完成第 ${state.completed} 圈，圈数宝箱已解锁` });
      }
    }
  };
  walk(steps, 1, state.position === 27);
  const visited = new Set<number>();
  for (let depth = 0; ; depth++) {
    const tile = board[state.position]!;
    if (depth >= 16 || visited.has(tile.id)) throw new Error('道具触发形成循环');
    visited.add(tile.id);
    if (tile.kind !== 'normal' && tile.kind !== 'start')
      events.push({ kind: 'effect', to: tile.id, message: tile.label });
    if (tile.kind === 'portal') {
      if (tile.target === undefined || !board[tile.target]) throw new Error('传送目标无效');
      state.position = tile.target;
      state.trail = [];
      events.push({ kind: 'teleport', to: tile.target, message: `传送至第 ${tile.target + 1} 格` });
      continue;
    }
    if (tile.kind === 'back') {
      walk(tile.amount ?? 0, -1);
      continue;
    }
    if (tile.kind === 'slow') state.slow = tile.amount ?? 3;
    if (tile.kind === 'coin' || tile.kind === 'chest') state.coins += tile.amount ?? 0;
    if (tile.kind === 'gem') state.gems += tile.amount ?? 0;
    if (tile.kind === 'dice') state.dice += tile.amount ?? 0;
    break;
  }
  return { state, events, points, steps };
}
export function claimMilestone(current: GameState, lap: number): GameState {
  if (
    !Number.isInteger(lap) ||
    lap < 1 ||
    lap > 5 ||
    lap > current.completed ||
    current.claimed.includes(lap)
  )
    throw new Error('宝箱未解锁或已领取');
  return {
    ...current,
    claimed: [...current.claimed, lap],
    trail: [...current.trail],
    coins: current.coins + MILESTONE_REWARDS[lap - 1]!,
  };
}
