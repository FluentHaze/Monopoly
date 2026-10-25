<template>
  <main class="adventure-page">
    <div class="page-scenery" aria-hidden="true"></div>
    <div class="page-content">
      <header class="site-header">
        <a class="brand" href="#/" aria-label="幸运冒险岛首页"
          ><GameIcon name="dice" /><strong>MONOPOLY</strong><span>幸运冒险岛</span></a
        >
        <nav aria-label="主导航">
          <a href="#board" class="nav-active" @click.prevent="scrollToSection('board')"
            >✦ 冒险地图</a
          ><a href="#rewards" @click.prevent="scrollToSection('rewards')">♙ 奖励中心</a>
        </nav>
        <button class="help-button" aria-label="查看玩法说明" @click="rulesOpen = true">?</button
        ><span class="event-badge"><span></span> 限时冒险活动 <b>↗</b></span>
      </header>
      <section class="hero">
        <div>
          <p class="eyebrow">A LITTLE LUCK. A GRAND ADVENTURE.</p>
          <h1>好运<span class="leaf">，</span>每一步。</h1>
          <p class="hero-copy"><span>✧</span> 掷出幸运点数，开启你的寻宝之旅</p>
        </div>
        <div class="countdown">
          <span>◷ 活动倒计时</span><strong data-testid="countdown">{{ countdownText }}</strong>
        </div>
      </section>
      <div class="game-layout">
        <section id="board" class="board-panel" aria-label="大富翁冒险地图">
          <div
            ref="boardViewport"
            class="board-viewport"
            :style="{ height: `${(compactBoard ? 680 : 820) * boardScale}px` }"
          >
            <div class="board-canvas" :style="{ transform: `scale(${boardScale})` }">
              <Maps
                ref="maps"
                :compact="compactBoard"
                :position="game.position"
                :completed="game.completed"
                :slow="game.slow"
                @inspect="selectedTile = $event"
                @event="onGameEvent"
              />
            </div>
          </div>
          <div class="board-legend">
            <span><GameIcon name="back-v2" />后退</span><span><GameIcon name="turtle" />慢行</span
            ><span><GameIcon name="portal" />传送</span
            ><span><GameIcon name="crystal" />特殊路线</span>
          </div>
        </section>
        <section class="play-panel" aria-label="掷骰子操作区">
          <h2>✦ 下一步，好运出发</h2>
          <p class="play-caption">每一次投掷，都有新的可能</p>
          <Dice ref="dice" />
          <div class="play-controls">
            <div class="balance">
              <span><GameIcon name="dice" />可用骰子</span
              ><strong data-testid="dice-count">{{ game.dice }} <small>次</small></strong>
            </div>
            <button
              class="roll-button"
              :disabled="busy || game.dice <= 0 || expired"
              @click="rollDice"
            >
              <GameIcon name="dice" />{{
                expired
                  ? '本轮活动已结束'
                  : busy
                    ? '冒险进行中…'
                    : game.dice <= 0
                      ? '骰子已用完'
                      : '掷骰子'
              }}
            </button>
            <p class="roll-status" role="status" aria-live="polite">{{ status }}</p>
          </div>
          <div class="player-summary">
            <span
              ><GameIcon name="coin" /><strong data-testid="coins">{{ game.coins }}</strong>
              金币</span
            ><span
              ><GameIcon name="crystal" /><strong data-testid="gems">{{ game.gems }}</strong>
              水晶</span
            ><span v-if="game.slow" class="slow-state" data-testid="slow"
              ><GameIcon name="turtle" />{{ game.slow }} 次慢行</span
            >
          </div>
          <p class="demo-note">本地冒险体验 · 进度自动保存 · 奖励仅供演示</p>
        </section>
        <div id="rewards" class="reward-panel">
          <TurnsReward :complete="game.completed" :claimed="game.claimed" @claim="claim" />
        </div>
        <section class="journal-panel">
          <div class="journal-heading">
            <h2>冒险手记</h2>
            <span
              >第 {{ game.completed + 1 }} 圈 · 第
              <b data-testid="position">{{ game.position + 1 }}</b> 格</span
            >
          </div>
          <ol aria-label="最近冒险记录">
            <li v-for="(entry, index) in journal" :key="index">
              <span class="journal-dot"></span>{{ entry }}
            </li>
          </ol>
          <button @click="rulesOpen = true">玩法说明 <span>↗</span></button>
        </section>
      </div>
      <footer class="site-footer">
        <span>MONOPOLY · LUCKY ISLAND</span><span>让每一步，都值得期待。</span
        ><button @click="resetOpen = true">重新冒险</button>
      </footer>
    </div>
    <div
      v-if="selectedTile || rulesOpen || resetOpen"
      class="modal-backdrop"
      @click.self="closeModal"
      @keydown.esc="closeModal"
    >
      <section
        ref="modal"
        class="game-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="rulesOpen ? '玩法说明' : resetOpen ? '重新冒险' : '格子详情'"
        tabindex="-1"
        @keydown.tab="trapFocus"
      >
        <button class="modal-close" aria-label="关闭弹窗" @click="closeModal">×</button>
        <template v-if="rulesOpen"
          ><p class="eyebrow">ISLAND GUIDE</p>
          <h2>每一步，都有惊喜</h2>
          <ul class="rules-list">
            <li>
              <GameIcon name="dice" />
              <div>
                <strong>掷骰子</strong>
                <p>每次消耗 1 个骰子，前进 1–6 格。移动中无法再次投掷。</p>
              </div>
            </li>
            <li>
              <GameIcon name="back-v2" />
              <div>
                <strong>后退格</strong>
                <p>按格子标注后退 2 或 4 格；到起点即停，不倒扣圈数。</p>
              </div>
            </li>
            <li>
              <GameIcon name="turtle" />
              <div>
                <strong>慢行格</strong>
                <p>接下来 3 次投掷各走 1 格，每次消耗一个骰子；再次踩中会重置为 3 次。</p>
              </div>
            </li>
            <li>
              <GameIcon name="portal" />
              <div>
                <strong>传送格</strong>
                <p>从第 6 格传送至第 10 格，落地奖励继续结算。传送不计跨圈。</p>
              </div>
            </li>
            <li>
              <GameIcon name="crystal" />
              <div>
                <strong>特殊奖励路线</strong>
                <p>
                  停留在第 28 格后，下一次投掷从第 31 格进入内圈，经第 37 格回到外围第 12
                  格。仅经过第 28 格不会转入内圈。
                </p>
              </div>
            </li>
            <li>
              <GameIcon name="chest-jade" />
              <div>
                <strong>圈数奖励</strong>
                <p>
                  正常向前从第 30 格走回起点计 1 圈；前 5
                  圈宝箱可分别领取一次。只有最终落地格触发道具与奖励。
                </p>
              </div>
            </li>
          </ul></template
        >
        <template v-else-if="resetOpen"
          ><GameIcon class="modal-hero" name="explorer-v2" />
          <h2>开启新的冒险？</h2>
          <p>当前本地圈数、道具与奖励记录将重置。</p>
          <div class="modal-actions">
            <button class="secondary-button" @click="closeModal">继续当前冒险</button
            ><button class="confirm-button" @click="resetGame">重新开始</button>
          </div></template
        >
        <template v-else-if="selectedTile"
          ><GameIcon class="modal-hero" :name="tileIcon(selectedTile.kind)" />
          <p class="eyebrow">{{ selectedTile.id >= 30 ? 'SPECIAL REWARD' : 'ISLAND DISCOVERY' }}</p>
          <h2>第 {{ selectedTile.id + 1 }} 格</h2>
          <p>{{ selectedTile.label }}</p>
          <p class="tile-detail">{{ tileDescription(selectedTile) }}</p>
          <button class="confirm-button" @click="closeModal">继续冒险</button></template
        >
      </section>
    </div>
  </main>
</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import Maps from './components/Map.vue';
import Dice from './components/Dice.vue';
import TurnsReward from './components/TurnsReward.vue';
import GameIcon from './components/GameIcon.vue';
import {
  claimMilestone,
  createGame,
  planTurn,
  restoreGame,
  STORAGE_KEY,
  type GameEvent,
  type Tile,
  type TileKind,
} from './game';
function readGame() {
  try {
    return restoreGame(localStorage.getItem(STORAGE_KEY));
  } catch {
    return createGame();
  }
}
const game = ref(readGame());
const now = ref(Date.now());
const expired = computed(() => now.value >= game.value.expiresAt);
const countdownText = computed(() => {
  const sec = Math.max(0, Math.floor((game.value.expiresAt - now.value) / 1000));
  return `${String(Math.floor(sec / 86400)).padStart(2, '0')}天 ${[Math.floor((sec % 86400) / 3600), Math.floor((sec % 3600) / 60), sec % 60].map(n => String(n).padStart(2, '0')).join(':')}`;
});
const busy = ref(false);
const status = ref('准备好了吗？你的冒险从这里开始。');
const journal = ref(['新的旅程已经开始，向幸运出发。']);
const maps = shallowRef<InstanceType<typeof Maps>>();
const dice = shallowRef<InstanceType<typeof Dice>>();
const boardViewport = ref<HTMLElement>();
const boardScale = ref(0.8);
const compactBoard = ref(window.innerWidth > 760);
let observer: ResizeObserver | undefined;
let timer: number | undefined;
let controller: AbortController | undefined;
let disposed = false;
const selectedTile = ref<Tile | null>(null);
const rulesOpen = ref(false);
const resetOpen = ref(false);
const modal = ref<HTMLElement>();
const modalOpen = computed(() => Boolean(selectedTile.value || rulesOpen.value || resetOpen.value));
let previousFocus: HTMLElement | null = null;
watch(modalOpen, async open => {
  if (open) {
    previousFocus = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    await nextTick();
    modal.value?.focus();
  } else {
    document.body.style.overflow = '';
    previousFocus?.focus();
  }
});
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'start',
  });
}
function closeModal() {
  selectedTile.value = null;
  rulesOpen.value = false;
  resetOpen.value = false;
}
function trapFocus(event: KeyboardEvent) {
  const elements = modal.value?.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]');
  if (!elements?.length) return;
  const first = elements[0]!,
    last = elements[elements.length - 1]!;
  if (
    event.shiftKey &&
    (document.activeElement === first || document.activeElement === modal.value)
  ) {
    event.preventDefault();
    last.focus();
  } else if (
    !event.shiftKey &&
    (document.activeElement === last || document.activeElement === modal.value)
  ) {
    event.preventDefault();
    first.focus();
  }
}
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game.value));
  } catch {
    status.value += '（当前浏览器无法保存进度）';
  }
}
function addEntry(message: string) {
  status.value = message;
  journal.value = [message, ...journal.value].slice(0, 4);
}
function onGameEvent(event: GameEvent) {
  status.value = event.message;
  if (event.kind !== 'move') addEntry(event.message);
}
async function rollDice() {
  if (busy.value || game.value.dice <= 0 || expired.value || !maps.value || !dice.value) return;
  busy.value = true;
  controller = new AbortController();
  try {
    const plan = planTurn(game.value, Math.floor(Math.random() * 6) + 1);
    status.value = game.value.slow ? '慢行生效，本次前进 1 格' : `幸运骰子转动中…`;
    await dice.value.roll(plan.steps, controller.signal);
    await maps.value.animate(plan.events, controller.signal);
    if (disposed) return;
    game.value = plan.state;
    const effects = plan.events.filter(e => e.kind !== 'move');
    addEntry(
      `本次前进 ${plan.steps} 格 · ${effects.length ? effects[effects.length - 1]!.message : `抵达第 ${game.value.position + 1} 格`}`,
    );
    persist();
  } catch (error) {
    if (disposed) return;
    maps.value?.reset(game.value.position);
    addEntry(
      error instanceof Error ? `本次冒险未结算：${error.message}` : '本次冒险未完成，请重试',
    );
  } finally {
    busy.value = false;
    controller = undefined;
  }
}
function claim(lap: number) {
  if (busy.value) {
    status.value = '请等待本次冒险结束后领取';
    return;
  }
  try {
    const before = game.value.coins;
    game.value = claimMilestone(game.value, lap);
    addEntry(`第 ${lap} 圈宝箱已领取，金币 +${game.value.coins - before}`);
    persist();
  } catch {
    status.value = '宝箱未解锁或已经领取';
  }
}
function resetGame() {
  if (busy.value) {
    status.value = '请等待本次冒险结束后重新开始';
    closeModal();
    return;
  }
  game.value = createGame();
  maps.value?.reset(0);
  journal.value = [];
  addEntry('新的旅程已经开始，向幸运出发。');
  persist();
  closeModal();
}
const tileIcon = (kind: TileKind) =>
  ({
    start: 'explorer-v2',
    normal: 'arrow',
    coin: 'coin',
    gem: 'crystal',
    chest: 'chest-jade',
    back: 'back-v2',
    slow: 'turtle',
    portal: 'portal',
    dice: 'dice',
    gate: 'star',
  })[kind];
const tileDescription = (tile: Tile) =>
  tile.kind === 'start'
    ? '正常向前从第 30 格回到这里，累计一圈并解锁对应宝箱。'
    : tile.kind === 'gate'
      ? '在此停留，下一次掷骰子将进入中间的七格特殊路线。'
      : tile.kind === 'slow'
        ? '接下来三次投掷各走一格；再次踩中会重置次数。'
        : tile.kind === 'back'
          ? '按箭头后退，落地后继续触发对应格子的效果。'
          : tile.kind === 'portal'
            ? '传送后继续结算目标格子；传送不会增加圈数。'
            : tile.kind === 'normal'
              ? '享受沿途风景，继续向下一份惊喜出发。'
              : '仅在本次移动最终停留时获得奖励；途经格子不会触发。';
onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    if (entry) {
      boardScale.value = entry.contentRect.width / 720;
      compactBoard.value = window.innerWidth > 760;
    }
  });
  if (boardViewport.value) observer.observe(boardViewport.value);
  timer = window.setInterval(() => (now.value = Date.now()), 1000);
  persist();
});
onBeforeUnmount(() => {
  disposed = true;
  controller?.abort();
  observer?.disconnect();
  clearInterval(timer);
  document.body.style.overflow = '';
});
</script>
<style scoped lang="scss">
.adventure-page {
  min-height: 100dvh;
  position: relative;
  overflow: clip;
  background: radial-gradient(ellipse at 20% 30%, #0b5b4a44, transparent 65%), #032d25;
  color: #f7edc9;
}
.page-scenery {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, #01271a95, #032b2470 55%, #02291ffa),
    url('@/assets/adventure/island.webp') center 38% / cover;
  opacity: 0.5;
  pointer-events: none;
}
.page-content {
  max-width: 1440px;
  margin: auto;
  padding: 0 48px;
  position: relative;
}
.site-header {
  height: 84px;
  display: flex;
  align-items: center;
  gap: 30px;
  border-bottom: 1px solid #a5d59824;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #faeccb;
  white-space: nowrap;
}
.brand img {
  width: 40px;
  height: 44px;
}
.brand strong {
  font-size: 26px;
  letter-spacing: -1px;
}
.brand > span {
  font-size: 17px;
  margin-left: 4px;
  padding-left: 20px;
  border-left: 1px solid #96ac6e77;
  font-weight: 700;
}
nav {
  display: flex;
  align-self: stretch;
  align-items: center;
  margin-left: auto;
  gap: 24px;
}
nav a {
  color: #acc9af;
  text-decoration: none;
  font-size: 14px;
  padding: 12px 0;
  white-space: nowrap;
}
nav .nav-active {
  color: #e3ee9a;
  border-bottom: 2px solid #d7ee86;
}
.event-badge {
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid #d3df98;
  padding: 8px 14px;
  border-radius: 30px;
  font-size: 12px;
  background: #2c65455c;
  white-space: nowrap;
}
.event-badge > span {
  width: 6px;
  height: 6px;
  background: #d3f88e;
  border-radius: 50%;
}
.event-badge b {
  color: #284735;
  background: #b9d790;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.help-button {
  display: none;
}
.hero {
  display: flex;
  justify-content: space-between;
  align-items: end;
  padding: 32px 0 12px;
  gap: 20px;
}
.eyebrow {
  color: #c1d896;
  font-size: 9px;
  letter-spacing: 3px;
}
.hero h1 {
  font-family: Georgia, 'Songti SC', 'STSong', serif;
  font-size: clamp(38px, 5vw, 66px);
  font-weight: 800;
  line-height: 1.2;
  margin: 9px 0 12px;
  letter-spacing: 2px;
  text-shadow: 0 3px 10px #00251b;
}
.leaf {
  color: #c2e88a;
}
.hero-copy {
  color: #f3e8b8;
  font-size: 15px;
  letter-spacing: 2px;
}
.hero-copy > span {
  margin-right: 6px;
  font-size: 24px;
}
.countdown {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  margin-bottom: 5px;
  border: 1px solid #9fbb7355;
  background: #002c21b0;
  border-radius: 30px;
  white-space: nowrap;
}
.countdown > span {
  color: #dedfa9;
  font-size: 11px;
}
.countdown strong {
  font-size: 18px;
  color: #f6e6a1;
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
}
.game-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  grid-template-areas: 'board play' 'board rewards' 'board journal';
  gap: 16px 28px;
  align-items: start;
}
.board-panel {
  grid-area: board;
  min-width: 0;
  position: relative;
  scroll-margin-top: 15px;
}
.board-viewport {
  position: relative;
}
.board-canvas {
  width: 720px;
  position: absolute;
  left: 50%;
  margin-left: -360px;
  transform-origin: top center;
}
.board-legend {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 12px 20px;
  margin-top: 14px;
  padding: 10px 16px;
  border: 1px solid #99bc7833;
  border-radius: 12px;
  background: #052f25e6;
  color: #d4e4be;
  font-size: 10px;
}
.board-legend > span {
  display: flex;
  align-items: center;
  gap: 5px;
}
.board-legend img {
  width: 23px;
  height: 23px;
}
.play-panel {
  grid-area: play;
  padding: 20px 22px 16px;
  border-radius: 22px;
  border: 1px solid #79b58b66;
  background: linear-gradient(140deg, #0b432fee, #022a20ed);
  box-shadow:
    inset 0 1px 0 #cdebb81a,
    0 15px 35px #001c1840;
}
.play-panel h2 {
  font-size: 21px;
}
.play-caption {
  color: #9fc1a6;
  font-size: 11px;
  margin-top: 7px;
}
.balance {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 8px 13px;
  background: #01291ee0;
  border-radius: 13px;
  border: 1px solid #7aa26325;
}
.balance > span {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #e2e8c3;
  font-size: 12px;
}
.balance img {
  width: 25px;
  height: 25px;
}
.balance strong {
  color: #deef81;
  font-size: 35px;
  line-height: 1;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
}
.balance small {
  font-size: 13px;
  color: #e9edd0;
  font-weight: 400;
}
.roll-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 56px;
  padding: 8px 14px;
  margin-top: 12px;
  border: 2px solid #e4fb9b;
  border-radius: 32px;
  color: #183f15;
  background: linear-gradient(180deg, #e5fb89, #b9df45 60%, #a8cb32);
  box-shadow:
    inset 0 2px 1px #fbffd0,
    0 4px 0 #476d25,
    0 7px 20px #001e1d80;
  font-size: 23px;
  font-weight: 800;
  transition:
    filter 0.2s,
    transform 0.2s;
}
.roll-button img {
  width: 32px;
  height: 32px;
}
.roll-button:hover:enabled {
  filter: brightness(1.08);
  transform: translateY(-2px);
}
.roll-button:active:enabled {
  transform: translateY(2px);
  box-shadow: 0 1px 0 #476d25;
}
.roll-button:disabled {
  opacity: 0.7;
  font-size: 18px;
}
.roll-status {
  margin: 14px 0 8px;
  min-height: 34px;
  font-size: 11px;
  line-height: 1.6;
  text-align: center;
  color: #c1dbab;
}
.player-summary {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
  padding: 10px 0;
  border-top: 1px solid #cbe6a41a;
}
.player-summary > span {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: #a7c49c;
}
.player-summary img {
  width: 22px;
  height: 22px;
}
.player-summary strong {
  color: #f0e3b3;
  font-size: 13px;
}
.player-summary .slow-state {
  color: #d6e99d;
}
.demo-note {
  font-size: 9px;
  text-align: center;
  color: #83aa8e;
  margin-top: 3px;
}
.reward-panel {
  grid-area: rewards;
  scroll-margin-top: 20px;
}
.journal-panel {
  grid-area: journal;
  padding: 16px 20px;
  border: 1px solid #79b58b55;
  border-radius: 20px;
  background: #052f23ed;
}
.journal-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.journal-heading h2 {
  font-size: 15px;
}
.journal-heading > span {
  font-size: 10px;
  color: #b0cb9b;
}
.journal-heading b {
  font-weight: 400;
}
.journal-panel ol {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 13px 0;
  list-style: none;
  min-height: 62px;
}
.journal-panel li {
  color: #a0bf9f;
  font-size: 10px;
  line-height: 1.6;
  display: flex;
  gap: 7px;
  align-items: baseline;
}
.journal-dot {
  display: block;
  width: 4px;
  height: 4px;
  background: #93bc79;
  border-radius: 50%;
  flex-shrink: 0;
}
.journal-panel > button {
  display: flex;
  width: 100%;
  justify-content: space-between;
  background: transparent;
  color: #d4e4b1;
  font-size: 11px;
  border: 0;
  border-top: 1px solid #b6d2a329;
  padding-top: 10px;
}
.site-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 25px 0;
  font-size: 9px;
  letter-spacing: 1px;
  color: #8bab90;
}
.site-footer > button {
  background: transparent;
  color: #9bb58e;
  font-size: 9px;
  border: 0;
}
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: #001b16b8;
  backdrop-filter: blur(7px);
  display: grid;
  place-items: center;
  padding: 20px;
}
.game-modal {
  width: min(480px, 100%);
  max-height: 85dvh;
  overflow-y: auto;
  padding: 32px;
  border-radius: 24px;
  border: 1px solid #bbcf87;
  box-shadow: 0 20px 80px #00150d99;
  background: linear-gradient(140deg, #0d4833, #032b22);
  position: relative;
  text-align: center;
}
.modal-close {
  position: absolute;
  top: 10px;
  right: 14px;
  border: 0;
  background: transparent;
  color: #d0e4ba;
  font-size: 28px;
  width: 32px;
  height: 32px;
}
.game-modal h2 {
  margin: 14px 0;
  font-size: 25px;
}
.game-modal > p {
  color: #bed0ab;
  font-size: 13px;
  line-height: 1.8;
}
.game-modal .modal-hero {
  width: 100px;
  height: 110px;
}
.tile-detail {
  margin: 12px 0 22px;
}
.confirm-button,
.secondary-button {
  border: 1px solid #d9ed8b;
  border-radius: 24px;
  padding: 12px 24px;
  background: #c3e96f;
  color: #1c3b1c;
  font-size: 13px;
  font-weight: 600;
}
.secondary-button {
  background: transparent;
  color: #d9edb3;
}
.modal-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
}
.rules-list {
  list-style: none;
  text-align: left;
  margin-top: 25px;
  display: grid;
  gap: 20px;
}
.rules-list li {
  display: flex;
  gap: 14px;
}
.rules-list img {
  width: 36px;
  height: 36px;
}
.rules-list strong {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
  color: #e9edba;
}
.rules-list p {
  font-size: 12px;
  line-height: 1.8;
  color: #aac5a4;
}
@media (min-width: 1500px) {
  .page-content {
    max-width: 1510px;
  }
  .game-layout {
    grid-template-columns: minmax(0, 1fr) 390px;
  }
}
@media (min-width: 761px) and (max-width: 1100px) {
  .page-content {
    padding: 0 24px;
  }
  .site-header {
    gap: 16px;
  }
  .brand strong {
    font-size: 22px;
  }
  .brand > span {
    display: none;
  }
  .event-badge {
    display: none;
  }
  nav {
    margin-left: auto;
  }
  .game-layout {
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 14px;
  }
  .play-panel {
    padding: 18px;
  }
  .play-panel h2 {
    font-size: 18px;
  }
  .hero h1 {
    font-size: 46px;
  }
  .hero-copy {
    font-size: 12px;
    letter-spacing: 0;
  }
  .countdown {
    display: grid;
    gap: 4px;
    border-radius: 12px;
  }
  .countdown strong {
    font-size: 15px;
  }
  .board-legend {
    gap: 8px;
    font-size: 9px;
  }
}
@media (max-width: 760px) {
  .page-content {
    padding: 0 14px;
    max-width: 560px;
  }
  .page-scenery {
    background-size: auto 1050px;
    background-position: center 130px;
    background-repeat: no-repeat;
  }
  .site-header {
    height: 64px;
    gap: 10px;
    justify-content: space-between;
    border-bottom: 0;
  }
  .brand {
    gap: 7px;
  }
  .brand img {
    width: 25px;
    height: 30px;
  }
  .brand strong {
    font-size: 18px;
    letter-spacing: -0.6px;
  }
  .brand > span {
    font-size: 12px;
    padding-left: 9px;
    margin-left: 1px;
  }
  nav,
  .event-badge {
    display: none;
  }
  .help-button {
    display: block;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid #92bb85;
    color: #f8ecc2;
    background: #064733;
    font:
      23px Georgia,
      serif;
    flex-shrink: 0;
  }
  .hero {
    padding: 7px 0 18px;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }
  .eyebrow {
    font-size: 7px;
    letter-spacing: 2px;
  }
  .hero h1 {
    font-size: clamp(34px, 9.5vw, 51px);
    margin: 9px 0 8px;
    line-height: 1.25;
    letter-spacing: 1px;
  }
  .hero-copy {
    font-size: 10px;
    letter-spacing: 1px;
  }
  .hero-copy > span {
    font-size: 15px;
  }
  .countdown {
    padding: 7px 12px;
    gap: 9px;
    margin: 0;
  }
  .countdown > span {
    font-size: 9px;
  }
  .countdown strong {
    font-size: 13px;
  }
  .game-layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'rewards' 'board' 'play' 'journal';
    gap: 10px;
  }
  .board-panel {
    margin: -5px -10px 0;
  }
  .board-legend {
    padding: 8px 10px;
    margin-top: 12px;
    gap: 14px;
    font-size: 8px;
  }
  .board-legend img {
    width: 18px;
    height: 18px;
  }
  .play-panel {
    position: relative;
    z-index: 10;
    display: grid;
    grid-template-columns: 82px minmax(0, 1fr);
    gap: 0 8px;
    padding: 13px 14px 10px;
    border-radius: 22px;
    box-shadow: 0 -4px 20px #02261a99;
  }
  .play-panel h2,
  .play-caption {
    display: none;
  }
  .play-panel :deep(.dice-scene) {
    grid-column: 1;
    grid-row: 1;
    width: 82px;
    height: 127px;
  }
  .play-panel :deep(.dice-art) {
    width: 88px;
    height: 88px;
  }

  .play-panel :deep(.dice-orbit) {
    width: 90px;
    height: 65px;
  }
  .play-panel :deep(.dice-result) {
    font-size: 8px;
    bottom: 1px;
    letter-spacing: 0;
  }
  .play-controls {
    grid-column: 2;
  }
  .balance {
    padding: 5px 9px;
    border-radius: 20px;
  }
  .balance > span {
    font-size: 10px;
    gap: 3px;
  }
  .balance img {
    width: 19px;
    height: 19px;
  }
  .balance strong {
    font-size: 29px;
  }
  .balance small {
    font-size: 10px;
  }
  .roll-button {
    min-height: 43px;
    font-size: 21px;
    margin-top: 8px;
    padding: 4px;
  }
  .roll-button img {
    width: 26px;
    height: 26px;
  }
  .roll-button:disabled {
    font-size: 16px;
  }
  .roll-status {
    font-size: 9px;
    line-height: 1.5;
    margin: 9px 0 0;
    min-height: 27px;
  }
  .player-summary {
    grid-column: 1 / -1;
    padding: 7px 0 0;
    gap: 14px;
    margin-top: 5px;
  }
  .player-summary img {
    width: 18px;
    height: 18px;
  }
  .player-summary > span {
    font-size: 9px;
  }
  .player-summary strong {
    font-size: 11px;
  }
  .demo-note {
    grid-column: 1 / -1;
    font-size: 8px;
    margin-top: 5px;
  }
  .journal-panel {
    padding: 14px 16px;
  }
  .journal-heading h2 {
    font-size: 13px;
  }
  .journal-panel ol {
    min-height: 36px;
  }
  .site-footer {
    font-size: 7px;
    padding: 20px 0 calc(20px + env(safe-area-inset-bottom));
    gap: 7px;
    letter-spacing: 0.4px;
  }
  .site-footer > button {
    font-size: 8px;
  }
  .game-modal {
    padding: 28px 22px;
  }
  .game-modal h2 {
    font-size: 22px;
  }
  .rules-list {
    gap: 16px;
  }
  .rules-list p {
    font-size: 11px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .roll-button {
    transition: none;
  }
}
</style>
