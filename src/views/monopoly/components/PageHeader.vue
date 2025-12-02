<template>
  <div ref="dom" class="headerBox" style="z-index: 999">
    <div class="topHeaderBack" />
    <div class="header">
      <div class="backBtn" @click="handleGoBack">
        <img src="@/assets/img/monopoly/btReturn.png" alt="">
      </div>
      <div class="title">
        <slot />
      </div>
      <div class="rightIcon">
        <slot name="rightIcon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();
const dom = ref();

const props = defineProps({
  goBack: {
    type: Function,
    default: null,
  },
});

const handleGoBack = () => {
  if (props.goBack) {
    props.goBack();
  }
  else {
    if (history.length > 1) {
      router.go(-1);
    }
  }
};

defineExpose({
  dom,
});
</script>

<style lang="scss" scoped>
.headerBox {
  width: 375px;
  margin-left: -10px;
}

.topHeaderBack {
  background: #111111;
  height: 49px;
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
}

.header {
  position: relative;
  height: 49px;

  .title {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
    color: #fff;

    img {
      margin-right: 6px;
      font-size: 18px;
      width: 32px;
      height: auto;
    }
  }

  .backBtn {
    position: absolute;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 49px;

    img {
      width: 32px;
      height: 32px;
    }
  }

  .rightIcon {
    height: 100%;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
