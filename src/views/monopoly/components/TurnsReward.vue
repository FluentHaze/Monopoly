<template>
  <div class="reward">
    <div class="reward-title">Recompensas de volta</div>
    <div class="reward-list">
      <div class="boxs">
        <div v-for="(item, index) in boxList" :key="index">
          <div class="item" @click="toggleToolTip(item)">
            <img class="light" src="@/assets/img/monopoly/light.png" alt="" />
            <img class="gift" src="@/assets/img/monopoly/reward_box1.png" alt="" />
            <img class="receive" src="@/assets/img/monopoly/receive.png" alt="" />
          </div>
        </div>
      </div>
      <div class="line">
        <div class="dots" :style="{ '--progress-value': props.complete }">
          <div class="dot" v-for="(_, index) in props.list" :key="index" :style="dotStyle(index)">
            {{ index + 1 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
interface Props {
  list: { showPopover: boolean; id: number }[];
  complete: number;
}

const props = defineProps<Props>();
let boxList = reactive<Props['list'][number][]>([]);

watch(
  () => props.list,
  () => {
    boxList = props.list;
  },
  { immediate: true },
);

const dotStyle = computed(() => (index: number) => {
  return {
    background: index + 1 <= props.complete ? `#fce403` : '#000000',
    color: index + 1 <= props.complete ? `#674000` : '#BCBCBC',
  };
});

const toggleToolTip = (item: Props['list'][number]) => {
  boxList.forEach(e => {
    if (e.id === item.id) {
      e.showPopover = !e.showPopover;
    } else {
      e.showPopover = false;
    }
  });
};
</script>

<style lang="scss" scoped>
.reward {
  width: 355px;
  height: 78px;
  margin-top: 5px;
  border: 2px solid #7ff800;
  border-radius: 10px;
  overflow: hidden;

  .reward-title {
    width: 355px;
    height: 15px;
    background: #7ff800;
    text-align: center;
    line-height: 15px;
    font-weight: 400;
    font-size: 12px;
    color: #214100;
  }

  .reward-list {
    width: 355px;
    height: 59px;
    background: rgba(0, 0, 0, 0.5);
    overflow-x: scroll;
    overflow-y: hidden;

    .boxs {
      width: fit-content;
      height: 44px;
      display: flex;
      align-items: center;
      overflow: visible;

      .item {
        flex-shrink: 0;
        margin: 0 20px;
        position: relative;
        width: 40px;
        height: 40px;
        overflow: visible;

        .light {
          width: 100px;
          height: 100px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .gift {
          width: 40px;
          height: 40px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .receive {
          width: 32px;
          height: 32px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }

    .line {
      margin-top: -5px;
      height: 15px;

      .dots {
        width: fit-content;
        display: flex;
        align-items: center;
        position: relative;

        &::before {
          content: '';
          width: calc(100% - 65px);
          height: 7px;
          border-radius: 7px;
          background: #000000;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        &::after {
          content: '';
          width: calc(var(--progress-value) * 80px + 7.5px - 80px);
          height: 7px;
          border-radius: 7px;
          background: #fce403;
          position: absolute;
          top: 50%;
          left: 32.5px;
          transform: translateY(-50%);
        }

        .dot {
          margin: 0 32.5px;
          width: 15px;
          height: 15px;
          flex-shrink: 0;
          border-radius: 15px;

          font-weight: 400;
          font-size: 12px;
          text-align: center;
          line-height: 15px;

          position: relative;
          z-index: 2;
        }
      }
    }
  }

  .reward-list::-webkit-scrollbar {
    height: 0 !important;
    width: 0 !important;
    background: transparent;
    display: none;
    /* Chrome, Safari 和 Opera */
  }
}

.giftList {
  display: flex;
  column-gap: 10px;

  .giftItem {
    text-align: center;

    .giftWrap {
      width: 50px;
      height: 50px;
      border-radius: 9px;
      border: 2px solid #61c648;
    }

    .bgc6 {
      background: linear-gradient(180deg, #54ac2b 0%, #1c430f 100%);
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    }

    .bgc {
      background: linear-gradient(180deg, #9d50bb 0%, #482a77 100%);
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    }
  }
}
</style>
