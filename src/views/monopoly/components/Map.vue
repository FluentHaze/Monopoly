<template>
  <div
    class="island-map"
    :class="{ compact }"
    aria-label="冒险棋盘，外围 30 格，特殊路线 7 格"
    :data-position="visualPosition"
    :data-phase="phase"
  >
    <div class="island-title">
      <span>LUCKY ISLAND</span><strong>第 {{ completed + 1 }} 圈</strong>
    </div>
    <svg class="route-lines" :viewBox="`0 0 720 ${compact ? 680 : 820}`" aria-hidden="true">
      <polyline
        :points="outerPoints"
        fill="none"
        stroke="#eddfab88"
        stroke-width="8"
        stroke-linejoin="round"
      />
      <polyline
        :points="innerPoints"
        fill="none"
        stroke="#e4b9ff"
        stroke-width="7"
        stroke-linejoin="round"
        stroke-dasharray="6 7"
      />
    </svg>
    <div class="route-sign">
      <span>✦</span> 特殊奖励路线 <span>✦</span><small>在第 28 格停留，下次投掷进入</small>
    </div>
    <Box
      v-for="tile in tiles"
      :key="tile.id"
      :tile="tile"
      :active="visualPosition === tile.id"
      @inspect="$emit('inspect', $event)"
    />
    <div
      class="explorer"
      :class="{
        walking: phase === 'moving',
        'teleport-out': phase === 'teleport-out',
        'teleport-in': phase === 'teleport-in',
      }"
      :style="[explorerStyle, { '--facing': facing }]"
      aria-hidden="true"
    >
      <div class="explorer-shadow"></div>
      <GameIcon name="explorer-v2" />
    </div>
    <div v-if="slow > 0" class="slow-badge">
      <GameIcon name="turtle" />慢行还剩 <strong>{{ slow }}</strong> 次
    </div>
    <div class="island-caption">点击格子，查看沿途惊喜</div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { BOARD, type GameEvent, type Tile } from '../game';
import { pause } from '../animation';
import Box from './Box.vue';
import GameIcon from './GameIcon.vue';
const props = defineProps<{
  position: number;
  completed: number;
  slow: number;
  compact: boolean;
}>();
const emit = defineEmits<{ inspect: [tile: Tile]; event: [event: GameEvent] }>();
const visualPosition = ref(props.position);
const phase = ref('idle');
const facing = ref<1 | -1>(1);
watch(
  () => props.position,
  value => {
    if (phase.value === 'idle') visualPosition.value = value;
  },
);
const tiles = computed(() => BOARD.map(t => ({ ...t, y: props.compact ? t.y * 0.8 : t.y })));
const outerPoints = computed(() =>
  [...tiles.value.slice(0, 30), tiles.value[0]!].map(t => `${t.x},${t.y}`).join(' '),
);
const innerPoints = computed(() =>
  [tiles.value[27]!, ...tiles.value.slice(30), tiles.value[11]!]
    .map(t => `${t.x},${t.y}`)
    .join(' '),
);
const explorerStyle = computed(() => {
  const tile = tiles.value[visualPosition.value]!;
  return { left: `${tile.x}px`, top: `${tile.y}px` };
});
async function animate(events: GameEvent[], signal?: AbortSignal) {
  try {
    for (const event of events) {
      if (signal?.aborted) throw new DOMException('Animation cancelled', 'AbortError');
      emit('event', event);
      if (event.kind === 'move') {
        const previous = BOARD[visualPosition.value]!;
        facing.value = BOARD[event.to]!.x < previous.x ? -1 : 1;
        phase.value = 'moving';
        visualPosition.value = event.to;
        await pause(270, signal);
      } else if (event.kind === 'teleport') {
        phase.value = 'teleport-out';
        await pause(320, signal);
        visualPosition.value = event.to;
        phase.value = 'teleport-in';
        await pause(320, signal);
      } else {
        await pause(240, signal);
      }
    }
  } finally {
    phase.value = 'idle';
  }
}
function reset(position: number) {
  visualPosition.value = position;
  phase.value = 'idle';
}
defineExpose({ animate, reset });
</script>
<style scoped lang="scss">
.island-map {
  width: 720px;
  height: 820px;
  position: relative;
  isolation: isolate;
  background: url('@/assets/adventure/island.webp') center / 100% 100%;
  border-radius: 18px;
  box-shadow:
    0 0 0 1px #bfdba42b,
    0 10px 30px #00251d40;
}
.island-map::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 60px 12px #06392c70;
  pointer-events: none;
  z-index: -1;
}
.route-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.island-title {
  position: absolute;
  left: 50%;
  top: 54px;
  transform: translateX(-50%) rotate(-2deg);
  min-width: 190px;
  text-align: center;
  padding: 9px 30px;
  border-radius: 8px;
  border: 3px solid #b28542;
  background: linear-gradient(110deg, #704319, #392411, #754a21);
  box-shadow:
    0 5px 0 #33220d,
    0 8px 14px #102a2a66;
  color: #fff0bb;
}
.island-title span {
  display: block;
  font-size: 8px;
  letter-spacing: 4px;
  margin-bottom: 4px;
}
.island-title strong {
  font-family: Georgia, 'Songti SC', serif;
  font-size: 26px;
}
.route-sign {
  position: absolute;
  top: 270px;
  left: 170px;
  width: 220px;
  text-align: center;
  color: #fff0bf;
  background: linear-gradient(110deg, #795025, #442b17);
  border: 2px solid #d7ad66;
  border-radius: 9px;
  padding: 10px 6px;
  font-size: 18px;
  box-shadow: 0 5px 0 #39230f;
  transform: rotate(-5deg);
}
.route-sign span {
  color: #d8b2ff;
}
.route-sign small {
  display: block;
  font-size: 9px;
  margin-top: 5px;
  color: #f0dcb2;
}
.explorer {
  position: absolute;
  width: 108px;
  height: 108px;
  margin-left: -54px;
  margin-top: -92px;
  pointer-events: none;
  z-index: 5;
  transition: none;
}
.explorer > img {
  width: 108px;
  height: 108px;
  filter: drop-shadow(0 4px 2px #19352455);
  transform: scaleX(var(--facing, 1));
}
.explorer-shadow {
  position: absolute;
  width: 30px;
  height: 10px;
  bottom: 12px;
  left: 39px;
  border-radius: 50%;
  background: #193a2360;
  filter: blur(2px);
}
.walking {
  transition:
    left 0.25s linear,
    top 0.25s linear;
}
.walking > img {
  animation: hop 0.27s ease-in-out infinite;
}
.teleport-out {
  transition: none;
  animation: vanish 0.32s ease-in forwards;
}
.teleport-in {
  transition: none;
  animation: arrive 0.32s ease-out;
}
@keyframes hop {
  50% {
    transform: translateY(-12px) rotate(-4deg) scaleX(var(--facing, 1));
  }
}
@keyframes vanish {
  to {
    opacity: 0;
    transform: scale(0.15) rotate(120deg);
    filter: hue-rotate(80deg);
  }
}
@keyframes arrive {
  from {
    opacity: 0;
    transform: scale(0.15) rotate(-120deg);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.slow-badge {
  position: absolute;
  bottom: 57px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 14px;
  border: 1px solid #a4d99b77;
  border-radius: 24px;
  background: #083d2bec;
  font-size: 12px;
  color: #d9efb5;
}
.slow-badge img {
  width: 29px;
  height: 27px;
}
.slow-badge strong {
  color: #ebf891;
}
.island-caption {
  position: absolute;
  bottom: 18px;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 10px;
  color: #f2edcf;
  text-shadow: 0 1px 4px #052b22;
}
.compact {
  height: 680px;
}
.compact .island-title {
  top: 35px;
  padding: 7px 24px;
}
.compact .route-sign {
  top: 205px;
}
.compact :deep(.tile) {
  height: 65px;
}
.compact :deep(.tile-symbol) {
  width: 35px;
  height: 35px;
  left: 29px;
  top: 8px;
}
.compact :deep(.tile-number) {
  bottom: 10px;
}
.compact :deep(.tile-normal .tile-symbol) {
  width: 26px;
  height: 26px;
  left: 34px;
  top: 12px;
}

@media (prefers-reduced-motion: reduce) {
  .explorer,
  .walking {
    transition: none;
  }
  .walking > img,
  .teleport-out,
  .teleport-in {
    animation: none;
  }
}
</style>
