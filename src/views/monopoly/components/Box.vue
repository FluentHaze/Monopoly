<template>
  <div class="box" :style="{ backgroundImage: `url('${boxImages(props.data.boxType)}')` }">
    <p style="position: absolute; left: 10%; color: #fff">{{ props.data.id }}</p>
    <img class="active" v-if="props.data.active" src="@/assets/img/monopoly/box-active.png" alt="" />
    <img class="reward" v-if="props.data.reward.isReward" :src="props.data.reward.img" alt="" />
  </div>
</template>

<script setup lang="ts">
import box1 from '@/assets/img/monopoly/box1.png';
import box2 from '@/assets/img/monopoly/box2.png';
import box3 from '@/assets/img/monopoly/box3.png';
import box4 from '@/assets/img/monopoly/box4.png';

const props = defineProps<{ data: BoxItem }>();
const boxBcgMap = {
  1: box1,
  2: box2,
  3: box3,
  4: box4,
};
const boxImages = (type: BoxItem['boxType']) => {
  return boxBcgMap[type];
};
</script>

<style lang="scss" scoped>
@use '../box.scss' as box;

.box {
  width: box.$boxWidth;
  height: box.$boxHeight;
  background-repeat: no-repeat;
  background-size: cover;
  position: absolute;

  .active {
    width: 72px;
    height: 57px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  p {
    font-size: 12px;
  }

  .reward {
    width: 35px;
    height: 35px;
    margin: 0 auto;
    display: block;
  }
}
</style>
