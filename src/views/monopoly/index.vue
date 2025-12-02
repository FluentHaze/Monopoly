<template>
  <div class="container monopolyBox page-main">
    <PageHeader class="pageHeader">
      大富翁
      <template #rightIcon>
        <img class="tips" src="@/assets/img/monopoly/tips.png" alt="" />
      </template>
    </PageHeader>
    <TurnsReward :list="turnsRewardList" :complete="2"></TurnsReward>
    <Maps ref="maps" :data="{ BoxList, sourceId, turtleNumber: 3 }"></Maps>
    <!-- 掷骰子按钮 -->
    <div class="bet">
      <div class="bet-left">
        <Time :countdown="countdown"></Time>
        <div class="bet-left-txt">A cada R$ 10 apostados, você ganha um dado</div>
        <div class="bet-left-txt">Get one dice for every R$10 top-up</div>
      </div>
      <div :class="betBtnDownStatus ? 'pressDown bet-right' : 'bet-right'" @click="RollDice">
        <p>Jogando dados</p>
        <p>x99</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, onMounted, nextTick, ref } from 'vue';
import PageHeader from './components/PageHeader.vue';
import Time from './components/Time.vue';
import TurnsReward from './components/TurnsReward.vue';
import Maps from './components/Map.vue';
import Task from './components/Task.vue';

import reward1 from '@/assets/img/monopoly/hd_dfw02_01.png';
import reward2 from '@/assets/img/monopoly/hd_dfw02_02.png';
import reward3 from '@/assets/img/monopoly/hd_dfw02_03.png';
import reward4 from '@/assets/img/monopoly/hd_dfw02_04.png';
import reward5 from '@/assets/img/monopoly/hd_dfw02_05.png';
import reward6 from '@/assets/img/monopoly/hd_dfw02_06.png';
import dialogFun from '../../utils/dialog';


const sourceId = shallowRef(0); // 每次出发时的ID
const BoxList = shallowRef<BoxItem[]>([]); // 盒子列表
const maps = shallowRef(); // 地图ref
const countdown = ref<number>(60 * 60 * 24 * 3); // 倒计时
const betBtnDownStatus = ref(false);
const turnsRewardList = ref([
  { id: 1, showPopover: false },
  { id: 2, showPopover: false },
  { id: 3, showPopover: false },
  { id: 4, showPopover: false },
  { id: 5, showPopover: false },
]);

const testTask = () => {
  dialogFun(Task, { taskStatus: true }).then((res: any) => {
    console.log(res);
  });
}

const RollDice = async () => {
  testTask();
  return
  if (!maps.value.canMove) return;
  betBtnDownStatus.value = true;
  setTimeout(() => {
    betBtnDownStatus.value = false;
  }, 300);
  console.log('前进到5->传送到9->前进到27->前进到36->前进到12->后退到8->前进到29->前进到0');
  await playerMove(1, 5, 9);
  await playerMove(1, 27);
  await playerMove(1, 36);
  await playerMove(1, 12);
  await playerMove(-1, 8);
  await playerMove(1, 29);
  await playerMove(1, 0);
};
/**
 * 移动
 * @param direction 1前进 -1后退
 * @param boxId 目标盒子id
 * @param transmitId 传送目标盒子id
 */
const playerMove = async (direction: 1 | -1, boxId: number, transmitId?: number) => {
  await maps.value.playAnimation(5);
  const result: MoveResult = await maps.value.move(direction, boxId, sourceId.value);
  if (result.success) {
    sourceId.value = result.currentBoxId || 0;
    // 传送
    if (transmitId) {
      await maps.value.setUser(transmitId, 'transmit');
      sourceId.value = transmitId;
    }
  }
};

// 生成地图数组
const generateOuterBox = () => {
  const rewardImages = {
    1: reward1,
    2: reward2,
    3: reward3,
    4: reward4,
    5: reward5,
    6: reward6,
  };
  return Array.from({ length: 37 }, (_, i) => ({
    id: i,
    boxType: (Math.floor(Math.random() * 4) + 1) as 1 | 2 | 3 | 4,
    box_depth: 1,
    active: false,
    reward: {
      isReward: !!Math.floor(Math.random() * 2),
      img: `${rewardImages[(Math.floor(Math.random() * 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6]}`,
    },
  }));
};

// 获取地图数据以及设置用户历史坐标
onMounted(() => {
  BoxList.value = generateOuterBox();
  nextTick(() => {
    maps.value.setUser(0, 'script');
    sourceId.value = 0;
  });
});
</script>

<style lang="scss" scoped>
:deep(.topHeaderBack) {
  background: transparent;
}

.pageHeader {
  .tips {
    width: 21px;
    height: 21px;
  }
}

.tooltip-content {
  width: 330px;
}

.monopolyBox {
  width: 375px;
  height: 100vh;
  background: url('@/assets/img/monopoly/bcg.jpg') no-repeat;
  background-size: cover;
  padding-left: 10px;
  padding-right: 10px;
  position: relative;

  .bet {
    width: 175px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 10px;
    border: 2px solid rgba(127, 248, 0, 0.7);
    position: absolute;
    top: 500px;
    left: 85px;
    display: flex;
    align-items: center;
    padding: 5px 5px;

    .bet-left {
      width: 130px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .bet-left-txt {
        margin-top: 5px;
        font-weight: 400;
        font-size: 10px;
        line-height: 10px;
        color: #ffffff;
      }
    }

    .bet-right {
      width: 90px;
      height: 90px;
      position: absolute;
      left: 130px;
      background: url('@/assets/img/monopoly/button.png') no-repeat;
      background-size: cover;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 0 20px 15px 20px;
      font-weight: 600;
      font-size: 10px;
      line-height: 10px;
      text-align: center;
      color: #002f64;

      p:nth-child(2) {
        margin-top: 5px;
        font-size: 18px;
      }
    }

    .pressDown {
      animation: pressDown 0.3s ease-in-out 1;
    }

    @keyframes pressDown {
      0% {
        transform: scale3d(1, 1, 1);
      }

      50% {
        transform: scale3d(0.9, 0.9, 0.9);
      }

      100% {
        transform: scale3d(1, 1, 1);
      }
    }
  }
}
</style>
