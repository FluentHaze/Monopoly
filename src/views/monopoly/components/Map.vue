<template>
  <div style="margin-top: 30px">
    <div class="map">
      <Box :ref="el => {
        if (el) boxItemRefs[index] = el;
      }
        " v-for="(item, index) in props.data.BoxList" :key="index" v-bind="{ data: item }"></Box>
      <div :class="userInfo.isMove ? 'user-move user' : 'user'" :style="userPositionStyle">
        <div :class="userTransmitClass">
          <img :style="userDirectionStyle" src="@/assets/img/monopoly/user.png" alt="" />
        </div>
      </div>
      <div class="turtle" v-if="props.data.turtleNumber">
        <img src="@/assets/img/monopoly/turtle.png" alt="" />
        <p>Rodadas lentas e contínuas:</p>
        <p>{{ props.data.turtleNumber }}</p>
      </div>
    </div>
    <spine-player class="diceAnimation" v-show="showDiceAnimation" ref="diceAnimation" :jsonPath="jsonFile"
      :atlasPath="atlasFile" :rawDataURIs="{ 'dh_touzi.png': img }" @success="animationLoadSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, type ComponentPublicInstance } from 'vue';
import Box from './Box.vue';
import SpinePlayer from '../../../components/SpinePlayer/SpinePlayer.vue';

// 导入JSON、Atlas文件、图片资源
const jsonFile = `/spine/dice/dh_touzi.json`;
const atlasFile = `/spine/dice/dh_touzi.atlas`;
const img = `/spine/dice/dh_touzi.png`;
const props = defineProps<{ data: MapProps }>();

const boxItemRefs = ref<Array<Element | ComponentPublicInstance>>([]); // 存放所有盒子的ref
const canMove = shallowRef<boolean>(true); // 是否可以进行移动
const diceAnimation = shallowRef();
const showDiceAnimation = ref(false);
const showTransmitAnimation = ref<0 | 1 | 2>(0); // 0不播放传送动画  1播放出现动画 2播放消失动画
const transmitClassNames = ['', 'user-transmitShow', 'user-transmitHide'];
// 用户信息
const userInfo = ref<UserInfo>({
  boxId: 0,
  boxIndex: 0,
  top: 0,
  left: 0,
  topOffset: -10,
  leftOffset: 10,
  isMove: false,
  animation: false,
  rotateY: 0,
});
// 用户坐标
const userPositionStyle = computed(() => {
  return {
    top: `${userInfo.value.top + userInfo.value.topOffset}px`,
    left: `${userInfo.value.left + userInfo.value.leftOffset}px`,
    transition: `${userInfo.value.animation ? 'all 0.5s ease-out' : ''}`,
  };
});
// 用户传送
const userTransmitClass = computed(() => {
  return transmitClassNames[showTransmitAnimation.value];
});
// 用户方向
const userDirectionStyle = computed(() => {
  return {
    transform: `rotateY(${userInfo.value.rotateY}deg)`,
  };
});

/**
 * 通过盒子id设置用户位置
 * @param boxId 目标盒子id
 * @param source 来源  script情况下用户不会有移动动画 以及不会有延时动画 move播放移动动画  transmit播放传送动画
 */
const setUser = async (boxId: number, source: 'script' | 'move' | 'transmit') => {
  // 查找目标下标
  const targetBoxIndex = props.data.BoxList.findIndex((e: BoxItem) => e.id === boxId);
  if (targetBoxIndex < 0) return;
  const targetBox = props.data.BoxList[targetBoxIndex];
  // 清除地图上的激活状态
  props.data.BoxList.forEach((item: BoxItem) => (item.active = false));
  // 通过下标 拿到对应的ref 进而拿到left和top
  let box: any = boxItemRefs.value[targetBoxIndex];
  let top = box.$el.offsetTop;
  let left = box.$el.offsetLeft;
  userInfo.value.isMove = true;
  // 更新用户信息之前先播放消息动画 耗时1秒
  if (source === 'transmit') {
    showTransmitAnimation.value = 2;
    await sleep(1);
  }
  // 更新用户信息
  userInfo.value = {
    ...userInfo.value,
    boxId,
    boxIndex: targetBoxIndex,
    top,
    left,
    animation: source === 'move',
  };

  // 控制用户方向
  if (targetBoxIndex >= 7 && targetBoxIndex <= 21) {
    userInfo.value.rotateY = 180;
  } else {
    userInfo.value.rotateY = 0;
  }
  // 脚本模式立即激活
  if (source === 'script') {
    targetBox.active = true;
    userInfo.value.isMove = false;
    return;
  }
  // 传送处理动画
  if (source === 'transmit') {
    await new Promise<void>(async resolve => {
      targetBox.active = true;
      showTransmitAnimation.value = 1;
      await sleep(1);
      showTransmitAnimation.value = 0;
      userInfo.value.isMove = false;
      resolve();
    });
    return;
  }
  // 移动模式延迟激活
  await new Promise<void>(async resolve => {
    targetBox.active = true;
    await sleep(0.4);
    userInfo.value.isMove = false;
    await sleep(0.1);
    resolve();
  });
};
/**
 * 移动方法 得到下一个箱子的id完了调用setUser进行移动
 * @param direction 1前进 -1后退
 * @param boxId 目标盒子id
 * @param sourceId 来源盒子id
 */
const move = (direction: 1 | -1, boxId: number, sourceId: number): Promise<MoveResult> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(
        `用户当前所在ID:${userInfo.value.boxId}`,
        `用户当前所在下标:${userInfo.value.boxIndex}`,
        `目标id:${boxId}`,
        `来源id:${sourceId}`,
      );
      // 检查是否已到达目标
      if (userInfo.value.boxId === boxId) {
        resolve({
          success: true,
          message: '已在目标位置',
          currentBoxId: boxId,
        });
        canMove.value = true;
        return;
      }
      // 处理后退到起点的情况  理论不存在这种情况
      if (userInfo.value.boxIndex + direction < 0) {
        resolve({
          success: true,
          message: '到达起点  不能倒退',
          currentBoxId: props.data.BoxList[userInfo.value.boxIndex].id,
        });
        canMove.value = true;
        return;
      }
      // 执行移动 在用户当前所在下标 +1 或者 -1来进行移动
      let currentIndex = userInfo.value.boxIndex;
      // 这里会存在超出边界的情况  currentIndex===36就会直接重置id
      let nextId = props.data.BoxList[currentIndex + direction]?.id;
      // 处理转弯点   直接下标+2  跳过28 29
      if (sourceId === 27 && currentIndex === 27) {
        nextId = props.data.BoxList[30].id;
      }
      // 处理下一圈的情况 29之后就变成-1
      if (currentIndex === 29) {
        nextId = props.data.BoxList[0].id;
      }
      // 处理内圈跳外圈的情况
      if (currentIndex === 36) {
        nextId = props.data.BoxList[11].id;
      }
      // 移动
      await setUser(nextId, 'move').catch((err: any) => {
        userInfo.value.isMove = false;
        throw err;
      });
      // 递归继续移动
      const result = await move(direction, boxId, sourceId);
      resolve(result);
    } catch (error) {
      reject({
        success: false,
        message: error instanceof Error ? error.message : '移动过程中发生未知错误',
      });
    }
  });
};

/**
 * 播放丢骰子动画
 * @param points 骰子点数
 */
const playAnimation = async (points: number) => {
  // 设置禁止移动
  canMove.value = false;
  showDiceAnimation.value = true;
  diceAnimation.value.playAnimation(`animation${points}`, false);
  await sleep(0.5); // 0.5秒动画播放完成
  await sleep(0.5); // 停留0.5秒 让用户看见
  showDiceAnimation.value = false;
};
// 骰子动画加载完成
const animationLoadSuccess = () => {
  // diceAnimation.value.playAnimation('animation1', false);
};
// 辅助函数
const sleep = (seconds: number) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

defineExpose({
  playAnimation,
  setUser,
  move,
  canMove,
});
</script>

<style lang="scss" scoped>
.map {
  width: 355px;
  height: 545px;
  position: relative;

  .user {
    width: 40px;
    height: 40px;
    position: absolute;

    img {
      width: 40px;
      height: 40px;
      transition: all 0.2s;
      position: absolute;
    }
  }

  .user-move {
    animation: scalePulse 0.5s ease-in-out 1;
  }

  @keyframes scalePulse {
    0% {
      transform: scale3d(1, 1, 1);
    }

    50% {
      transform: scale3d(1.2, 1.2, 1.2);
    }

    100% {
      transform: scale3d(1, 1, 1);
    }
  }

  .user-transmitShow {
    animation: transmitShow 1s ease-in-out forwards;
  }

  .user-transmitHide {
    animation: transmitHide 1s ease-in-out forwards;
  }

  @keyframes transmitShow {
    0% {
      transform: scale(0.8) rotate(-30deg);
      opacity: 0;
    }

    100% {
      transform: scale(1) rotate(360deg);
      opacity: 1;
    }
  }

  @keyframes transmitHide {
    0% {
      transform: scale(1) rotate(360deg);
      opacity: 1;
    }

    100% {
      transform: scale(0.8) rotate(30deg);
      opacity: 0;
    }
  }

  .turtle {
    position: absolute;
    left: 50%;
    top: 90px;
    transform: translateX(-50%);
    padding: 0 5px;
    height: 18px;
    width: fit-content;
    border-radius: 18px;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    font-weight: 400;
    line-height: 18px;

    img {
      width: 19px;
      height: 17px;
    }

    p:nth-child(2) {
      margin: 0 5px;
      font-size: 10px;
      color: #5eb504;
    }

    p:nth-child(3) {
      font-size: 12px;
      color: #ffffff;
    }
  }
}

.diceAnimation {
  position: absolute;
  width: 150px;
  height: 150px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
}
</style>
