<template>
  <Popup v-model:show="showModal" v-bind="attrs" style="--van-popup-background: transparent; max-width: 100vw">
    <slot></slot>
  </Popup>
</template>

<script setup lang="ts">
import { useAttrs, ref, onMounted } from 'vue';
import { Popup } from 'vant';

const showModal = ref(false);

const attrs = useAttrs();

const hide = () => {
  showModal.value = false;
};

const show = () => {
  showModal.value = true;
};

onMounted(() => {
  show();
});

defineExpose({ hide });
</script>

<style lang="scss" scoped></style>
