<script lang="ts" setup>
import { useRoute } from 'vue-router';
import usePublicStore from './stores/public';
import { storeToRefs } from 'pinia';

const publicStore = usePublicStore();
const route = useRoute();
const { dialogs } = storeToRefs(publicStore);

const transitionName = (route.meta.transition as string) || 'default-transition';
</script>

<template>
  <router-view v-slot="{ Component }">
    <Transition :name="transitionName || 'slide-left'">
      <div>
        <component :is="Component" />
      </div>
    </Transition>
  </router-view>
  <!-- 动态弹窗组件 -->
  <component :is="dialog.component" v-for="dialog in dialogs" :key="dialog.dialogKey" :ref="dialog.ref"
    v-bind="dialog.props" />
</template>

<style lang="scss" scoped></style>
