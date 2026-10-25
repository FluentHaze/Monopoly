<template>
  <div>
    <div ref="spineContainer" class="spine h-full w-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import type { SpinePlayerConfig } from '@esotericsoftware/spine-player';
import { SpinePlayer } from '@esotericsoftware/spine-player';

interface Layout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  jsonPath: string;
  atlasPath: string;
  premultipliedAlpha?: boolean;
  layout?: Layout;
  config?: SpinePlayerConfig;
  rawDataURIs?: Record<string, string>;
}

const props = defineProps<Props>();
const emit = defineEmits(['success', 'complete', 'error']);
const spineContainer = ref<HTMLElement | null>(null);
let player: SpinePlayer | null = null;

onMounted(() => {
  if (!spineContainer.value) return;
  const premultipliedAlpha = props.premultipliedAlpha ?? true;
  const layout = props.layout ?? {};

  // 动画配置
  const config: SpinePlayerConfig = {
    jsonUrl: props.jsonPath,
    atlasUrl: props.atlasPath,
    alpha: true,
    premultipliedAlpha,
    backgroundColor: '#00000000',
    preserveDrawingBuffer: false,
    showControls: false,
    showLoading: false,
    defaultMix: 0,
    // 处理资源路径，确保图片路径正确
    rawDataURIs: props.rawDataURIs || {},
    viewport: {
      // debugRender: true,
      padTop: 0,
      padLeft: 0,
      padBottom: 0,
      padRight: 0,
      ...layout,
    },
    // 加载完成回调函数
    success: player => {
      // 监听动画完成事件
      emit('success');
      player.animationState?.addListener({
        complete(entry) {
          // console.log('complete: ', entry)
          emit('complete', entry);
        },
      });
    },
    // 加载错误回调函数
    error(reason) {
      emit('error', reason);
      console.error('spine animation load error', reason);
      // 提供更详细的错误信息，帮助诊断问题
      if (reason.toString().includes('license')) {
        console.warn('This might be a license-related issue with production Spine assets');
      } else if (reason.toString().includes('load image')) {
        console.warn('Failed to load image assets. Check image paths and formats');
      }
    },
    ...props.config,
  };

  try {
    // 创建spine播放器
    player = new SpinePlayer(spineContainer.value, config);
  } catch (error: unknown) {
    emit('error', error);
    console.error('Failed to create SpinePlayer:', error);
    // 检查是否与许可证相关
    const errorMessage = String(error);
    if (errorMessage.includes('license') || errorMessage.includes('License')) {
      console.error('Spine license error detected. Please check your Spine license.');
    }
    // 检查是否与图片加载相关
    else if (
      errorMessage.includes('image') ||
      errorMessage.includes('texture') ||
      errorMessage.includes('atlas')
    ) {
      console.error(
        'Image loading error detected. Please check rawDataURIs mapping and image paths.',
      );
      console.log('Current rawDataURIs:', props.rawDataURIs);
    }
  }
});
const destroy = () => {
  player?.dispose();
  player = null;
  spineContainer.value = null;
};

onBeforeUnmount(destroy);

/**
 * 播放指定动画
 *
 * 此函数负责在SpinePlayer实例上设置动画名称和循环选项，最后调用play方法开始播放动画
 *
 * @param animationName 动画名称，用于指定玩家将要播放的动画
 * @param loop 循环选项，如果设置为true，动画将循环播放；如果为false，则动画播放一次后停止
 */
function playAnimation(animationName: string, loop: boolean): void {
  if (player) {
    player.setAnimation(animationName, loop);
    player.play();
  }
}

defineExpose({
  player,
  playAnimation,
});
</script>

<style scoped>
.spine {
  position: relative;
}

.h-full {
  height: 100%;
}

.w-full {
  width: 100%;
}
</style>
