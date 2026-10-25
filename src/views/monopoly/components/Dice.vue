<template>
  <div
    class="dice-scene"
    :class="{ rolling }"
    :data-result="points"
    :data-rolling="rolling"
    :aria-label="`骰子点数 ${points}`"
  >
    <div class="dice-orbit"></div>
    <GameIcon
      v-if="!rolling || !spineReady"
      name="dice"
      class="dice-art"
      :class="{ spinning: rolling }"
    />
    <SpinePlayer
      v-show="rolling && spineReady"
      ref="spine"
      class="spine-dice"
      :json-path="`${base}spine/dice/dh_touzi.json`"
      :atlas-path="`${base}spine/dice/dh_touzi.atlas`"
      @success="spineReady = true"
      @error="spineReady = false"
    />
    <span class="dice-result">{{ rolling ? '好运转动中' : `${points} 点好运` }}</span>
  </div>
</template>
<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import GameIcon from './GameIcon.vue';
import SpinePlayer from '../../../components/SpinePlayer/SpinePlayer.vue';
import { pause } from '../animation';
const base = import.meta.env.BASE_URL;
const points = ref(1);
const rolling = ref(false);
const spineReady = ref(false);
const spine = shallowRef<InstanceType<typeof SpinePlayer>>();
async function roll(value: number, signal?: AbortSignal) {
  points.value = value;
  rolling.value = true;
  try {
    if (spineReady.value) spine.value?.playAnimation(`animation${value}`, false);
    await pause(1050, signal);
  } finally {
    rolling.value = false;
  }
}
defineExpose({ roll });
</script>
<style scoped>
.dice-scene {
  height: 206px;
  position: relative;
  display: grid;
  place-items: center;
}
.dice-orbit {
  position: absolute;
  width: 210px;
  height: 115px;
  border: 1px solid #d2e86355;
  border-top: 2px solid #dcf879c9;
  border-radius: 50%;
  transform: rotate(-25deg);
  box-shadow:
    0 0 32px #b4ed4e1c,
    inset 0 0 30px #b4ed4e16;
}
.dice-orbit::after {
  content: '✦';
  position: absolute;
  top: 4px;
  left: 12px;
  color: #f4ffa4;
  text-shadow: 0 0 14px #e9ff73;
}
.dice-art {
  width: 155px;
  height: 155px;
  position: relative;
  object-fit: contain;
  filter: drop-shadow(0 12px 16px #001e1c66);
}
.dice-result {
  position: absolute;
  bottom: 5px;
  color: #b4ce91;
  font-size: 10px;
  letter-spacing: 2px;
}
.spine-dice {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.spine-dice :deep(.spine) {
  width: 100%;
  height: 100%;
}
.spinning {
  animation: tumble 0.35s linear infinite;
}
@keyframes tumble {
  0% {
    transform: rotate(-12deg) scale(0.9);
  }
  50% {
    transform: rotate(168deg) scale(1);
  }
  100% {
    transform: rotate(348deg) scale(0.9);
  }
}
@media (prefers-reduced-motion: reduce) {
  .spinning {
    animation: none;
  }
}
</style>
