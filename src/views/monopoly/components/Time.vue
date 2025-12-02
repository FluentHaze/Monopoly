<template>
  <div class="bet-left-time">
    <img src="@/assets/img/monopoly/time.png" alt="" />
    {{ formattedTime }}
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onBeforeUnmount, watch } from 'vue';


const props = defineProps<{ countdown: number }>();

const timerId = shallowRef<number>();
const remainingTime = shallowRef(0);
const formattedTime = shallowRef('');

// 更新倒计时
const updateDisplay = () => {
  formattedTime.value = remainingTime.value <= 0 ? '0' : formateTime(remainingTime.value * 1000);
};
const formateTime = (time: any) => {
  if (time <= 0) {
    return '00:00:00';
  }
  else {
    const day = Math.floor(time / (1000 * 60 * 60 * 24));
    const hour = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minute = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const second = Math.floor((time % (1000 * 60)) / 1000);
    const newTime =
      day === 0
        ? `${hour < 10 ? `0${hour}` : hour}:${minute < 10 ? `0${minute}` : minute}:${second < 10 ? `0${second}` : second}`
        : `${day < 10 ? `0${day}` : day}d ${hour < 10 ? `0${hour}` : hour}:${minute < 10 ? `0${minute}` : minute}`;
    return newTime;
  }
};
const clearCountdownTimer = () => {
  if (timerId.value) {
    clearInterval(timerId.value);
    timerId.value = undefined;
  }
};
watch(
  () => props.countdown,
  newVal => {
    clearCountdownTimer();
    if (newVal > 0) {
      remainingTime.value = newVal;
      updateDisplay();
      timerId.value = window.setInterval(() => {
        remainingTime.value--;
        updateDisplay();
        if (remainingTime.value <= 0) {
          clearCountdownTimer();
        }
      }, 1000);
    }
  },
  { immediate: true },
);
onBeforeUnmount(clearCountdownTimer);
</script>

<style lang="scss" scoped>
.bet-left-time {
  width: fit-content;
  padding: 0 5px;
  height: 15px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  font-weight: 300;
  font-size: 11px;
  color: #5eb504;

  img {
    flex-shrink: 0;
    width: 10px;
    height: 10.5px;
    margin-right: 5px;
  }
}
</style>
