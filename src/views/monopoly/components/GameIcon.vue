<template><img class="game-icon" :src="source" :alt="alt" draggable="false" /></template>
<script setup lang="ts">
import { computed } from 'vue';
const props = withDefaults(defineProps<{ name: string; alt?: string }>(), { alt: '' });
const assets = import.meta.glob(
  [
    '../../../assets/adventure/*.webp',
    '!../../../assets/adventure/back.webp',
    '!../../../assets/adventure/explorer-left.webp',
    '!../../../assets/adventure/explorer-right.webp',
  ],
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
) as Record<string, string>;
const source = computed(() => assets[`../../../assets/adventure/${props.name}.webp`]);
</script>
<style scoped>
.game-icon {
  width: 1.5em;
  height: 1.5em;
  object-fit: contain;
  flex-shrink: 0;
  user-select: none;
}
</style>
