<template>
  <button
    class="tile"
    :class="[{ 'tile-active': active, 'tile-inner': tile.id >= 30 }, `tile-${tile.kind}`]"
    :style="{ left: `${tile.x}px`, top: `${tile.y}px` }"
    :aria-label="`第 ${tile.id + 1} 格：${tile.label}`"
    :data-tile="tile.id"
    :aria-current="active ? 'location' : undefined"
    @click="$emit('inspect', tile)"
  >
    <GameIcon class="tile-base" :name="base" />
    <GameIcon class="tile-symbol" :name="symbol" :style="symbolStyle" />
    <span v-if="tile.kind === 'start'" class="start-label">起点</span>
    <span class="tile-number">{{ tile.id + 1 }}</span>
  </button>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { BOARD, type Tile } from '../game';
import GameIcon from './GameIcon.vue';
const props = defineProps<{ tile: Tile; active: boolean }>();
defineEmits<{ inspect: [tile: Tile] }>();
const base = computed(() =>
  props.tile.id >= 30
    ? 'tile-violet'
    : ['portal', 'slow', 'dice'].includes(props.tile.kind)
      ? 'tile-mint'
      : props.tile.kind === 'gate'
        ? 'tile-gold'
        : 'tile-ivory',
);
const symbolStyle = computed(() => {
  if (!['start', 'normal'].includes(props.tile.kind)) return {};
  const id = props.tile.id;
  const next = BOARD[id === 36 ? 11 : id === 29 ? 0 : id + 1]!;
  const current = BOARD[id]!;
  return {
    transform: `rotate(${(Math.atan2(next.y - current.y, next.x - current.x) * 180) / Math.PI}deg)`,
  };
});
const symbol = computed(
  () =>
    ({
      start: 'arrow',
      normal: 'arrow',
      coin: 'coin',
      gem: 'crystal',
      chest: 'chest-jade',
      back: 'back-v2',
      slow: 'turtle',
      portal: 'portal',
      dice: 'dice',
      gate: 'star',
    })[props.tile.kind],
);
</script>
<style scoped>
.tile {
  width: 94px;
  height: 82px;
  position: absolute;
  transform: translate(-50%, -50%);
  border: 0;
  padding: 0;
  background: transparent;
  isolation: isolate;
  transition: filter 0.2s;
}
.tile-base {
  position: absolute;
  inset: 0;
  left: 4%;
  width: 92%;
  height: 100%;
  object-fit: fill;
  filter: drop-shadow(0 6px 3px #253a2466);
}
.tile-symbol {
  position: absolute;
  width: 42px;
  height: 42px;
  left: 26px;
  top: 13px;
  filter: drop-shadow(0 2px 1px #5a410030);
}
.tile-normal .tile-symbol {
  width: 26px;
  height: 26px;
  left: 34px;
  top: 18px;
  opacity: 0.65;
}
.tile-number {
  position: absolute;
  bottom: 13px;
  right: 15px;
  font-size: 8px;
  font-weight: 800;
  color: #594322;
  opacity: 0.65;
}
.tile-inner .tile-number {
  color: #50275a;
}
.start-label {
  position: absolute;
  top: -15px;
  left: 24px;
  font-size: 13px;
  background: #294b21;
  color: #ffecb2;
  border: 1px solid #b2b36a;
  padding: 2px 8px;
  border-radius: 5px;
}
.tile-active .tile-base {
  filter: drop-shadow(0 0 1px #fff9be) drop-shadow(0 0 4px #ddec87) drop-shadow(0 5px 3px #29412188);
}
.tile-active .tile-number {
  color: #193b19;
  opacity: 1;
}
.tile-active::after {
  content: '✦';
  position: absolute;
  right: 12px;
  top: 2px;
  color: #fff7b5;
  font-size: 13px;
  text-shadow: 0 0 6px #c8f572;
  pointer-events: none;
}
.tile:hover {
  filter: brightness(1.12);
}
.tile:focus-visible {
  outline: 3px solid #fff2a5;
  border-radius: 18px;
}
</style>
