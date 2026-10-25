<template>
  <section class="milestones" aria-label="圈数奖励">
    <div class="reward-heading">
      <h2><GameIcon name="chest-jade" />圈数奖励</h2>
      <span>{{ Math.min(complete, 5) }} / 5</span>
    </div>
    <p class="reward-caption">完成整圈探索，领取你的冒险宝藏</p>
    <div class="chests">
      <button
        v-for="lap in 5"
        :key="lap"
        :disabled="complete < lap || claimed.includes(lap)"
        :aria-label="`第 ${lap} 圈宝箱${claimed.includes(lap) ? '已领取' : complete < lap ? '未解锁' : '可领取'}`"
        @click="$emit('claim', lap)"
      >
        <GameIcon
          :name="lap >= 4 ? 'chest-jade' : 'chest-wood'"
          :class="{ available: complete >= lap && !claimed.includes(lap) }"
        />
        <span class="milestone-dot" :class="{ reached: complete >= lap }"></span
        ><span>{{ lap }} 圈</span
        ><small>{{
          claimed.includes(lap)
            ? '已领取'
            : complete >= lap
              ? '领取'
              : `${MILESTONE_REWARDS[lap - 1]} 金币`
        }}</small>
      </button>
    </div>
  </section>
</template>
<script setup lang="ts">
import GameIcon from './GameIcon.vue';
import { MILESTONE_REWARDS } from '../game';
defineProps<{ complete: number; claimed: number[] }>();
defineEmits<{ claim: [lap: number] }>();
</script>
<style scoped>
.milestones {
  padding: 20px 22px;
  border: 1px solid #79b58b66;
  background: linear-gradient(130deg, #0a3d2eef, #03281feb);
  box-shadow:
    inset 0 1px 0 #a7e6ab18,
    0 8px 30px #001b1850;
  border-radius: 20px;
}
.reward-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.reward-heading h2 {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 19px;
  color: #f5edc8;
}
.reward-heading h2 img {
  width: 28px;
  height: 28px;
}
.reward-heading > span {
  font-size: 13px;
  color: #d5e69b;
}
.reward-caption {
  font-size: 11px;
  color: #98b9a3;
  margin: 8px 0 13px;
}
.chests {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  position: relative;
  gap: 4px;
}
.chests::before {
  content: '';
  position: absolute;
  height: 3px;
  left: 10%;
  right: 10%;
  top: 66px;
  background: #547b54;
}
.chests button {
  display: flex;
  align-items: center;
  flex-direction: column;
  border: 0;
  background: transparent;
  color: #e6edcb;
  gap: 7px;
  padding: 0;
  border-radius: 8px;
  font-size: 12px;
}
.chests button:disabled {
  opacity: 1;
  cursor: default;
}
.chests img {
  width: 60px;
  height: 60px;
  max-width: 100%;
  object-fit: contain;
}
.chests .available {
  filter: drop-shadow(0 0 9px #eff67e99);
  animation: glow 2s ease-in-out infinite;
}
.milestone-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #789e71;
  border: 1px solid #b9ca8e;
  z-index: 1;
}
.milestone-dot.reached {
  background: #d5ef7a;
  box-shadow: 0 0 8px #ddf37870;
}
.chests small {
  font-size: 9px;
  color: #93b498;
}
.chests button:enabled small {
  color: #e2f795;
}
@keyframes glow {
  50% {
    transform: translateY(-3px);
  }
}
@media (max-width: 760px) {
  .milestones {
    padding: 12px 16px;
    border-radius: 17px;
  }
  .reward-heading h2 {
    font-size: 15px;
  }
  .reward-heading h2 img {
    width: 22px;
    height: 22px;
  }
  .reward-caption {
    font-size: 9px;
    margin: 3px 0 5px;
  }
  .chests img {
    width: 45px;
    height: 45px;
  }
  .chests::before {
    top: 51px;
  }
  .chests button {
    font-size: 10px;
    gap: 5px;
  }
  .chests small {
    font-size: 8px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .chests .available {
    animation: none;
  }
}
</style>
