<template>
  <bt-modal ref="modalRef">
    <div class="task">
      <div class="task-title">Conclua tarefas para obter recompensas</div>
      <div class="task-content">
        <div class="task-content-top">Aposte R$ 100 no Coelho da Fortuna</div>
        <div class="task-content-center">
          <div v-for="(item, index) in prizeList" :key="index" class="prizeBox">
            <img src="@/assets/img/monopoly/resultBack.png" alt="" class="light" />
            <div :class="['prizeWrap', `bgc${item.propQuality ? item.propQuality : 1}`]">
              <img :src="imagePath" alt="" />
            </div>
            <div :class="[
              'moneyNum',
              prizeList.length === 1 ? 'moneyNum1' : 'moneyNum2',
              item.propType === 6 && 'colorfulText',
            ]">
              <span v-if="item.propType === 6">{{ item.propNumReal / 1000 }}
              </span>
              <span v-else>{{ item.propNumReal / 10000 }}</span>
            </div>
          </div>
        </div>
        <div class="task-content-bottom">
          <div class="receive" v-if="!props.taskStatus" @click="testHandler">Ganhe</div>
          <div class="cancel" v-if="props.taskStatus" @click="testHandler">Abandon the task</div>
          <div class="confirm" v-if="props.taskStatus" @click="testHandler">Go to</div>
        </div>
      </div>
    </div>
  </bt-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BtModal from '../../../components/BtModal.vue';
import imagePath from '@/assets/img/monopoly/moneyIcon.png';
const modalRef = ref();

const prizeList = ref([
  {
    propQuality: 1,
    propIcon: '',
    propType: 6,
    propNumReal: 10000,
  },
  {
    propQuality: 3,
    propIcon: '',
    propType: 6,
    propNumReal: 10000,
  },
  {
    propQuality: 2,
    propIcon: '',
    propType: 6,
    propNumReal: 10000,
  },
]);


const props = defineProps({
  close: {
    type: Function,
    required: true,
  },
  taskStatus: {
    type: Boolean,
  },
});
const testHandler = () => {
  props.close(true);
};
defineExpose({ modalRef })
</script>

<style lang="scss" scoped>
.task {
  width: 345px;
  height: 280px;
  overflow: hidden;
  border-radius: 15px;
  border: 2px solid transparent;
  background-clip: padding-box, border-box;
  background-origin: padding-box, border-box;
  background-image: linear-gradient(180deg, #213918 0%, #000000 100%),
    linear-gradient(180deg, #009a3a 0%, #aac512 100%);

  .task-title {
    width: 100%;
    height: 30px;
    background: #1c5118;
    font-weight: 700;
    font-size: 16px;
    line-height: 30px;
    text-align: center;
  }

  .task-content {
    width: 345px;
    height: 245px;
    padding-top: 20px;
    padding-bottom: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;

    .task-content-top {
      height: 20px;
      font-weight: 400;
      font-size: 12px;
      line-height: 20px;
      color: #fff;
    }

    .task-content-center {
      max-width: 100%;
      padding-bottom: 30px;
      display: flex;
      overflow-x: scroll;

      &::-webkit-scrollbar {
        width: 0;
        height: 0;
      }

      .prizeBox {
        position: relative;
        width: 105px;
        height: 105px;
        flex-shrink: 0;

        .light {
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          animation: rotateAnimation 3s linear infinite;
        }

        .prizeWrap {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 65px;
          height: 65px;
          border-radius: 9px;
          border: 2px solid #61c648;

          img {
            width: 100%;
            height: 100%;
          }
        }

        .bgc1 {
          background: linear-gradient(180deg, #54ac2b 0%, #1c430f 100%);
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          border: 1px solid #61c648;
        }

        .bgc2 {
          background: linear-gradient(180deg, #2980b9 0%, #2c3e50 100%);
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          border: 1px solid #489ad4;
        }

        .bgc3 {
          background: linear-gradient(180deg, #9d50bb 0%, #482a77 100%);
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          border: 1px solid #a66cc8;
        }

        .bgc4 {
          background: linear-gradient(180deg, #d04725 0%, #541e1e 100%);
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          border: 1px solid #ee441a;
        }

        .bgc5 {
          background: linear-gradient(180deg, #faab00 0%, #9c4e00 100%);
          box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
          border: 1px solid #edc900;
        }

        .moneyNum {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          font-weight: 700;
          white-space: nowrap;
        }

        .moneyNum1 {
          bottom: -34px;
          font-size: 32px;
        }

        .moneyNum2 {
          bottom: -14px;
          font-size: 20px;
        }

        .colorfulText {
          color: #59c512;
        }
      }
    }

    .task-content-bottom {
      margin-top: auto;
      width: 100%;
      padding: 0 18px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      div {
        height: 42px;
        border-radius: 42px;
        font-weight: 700;
        font-size: 18px;
        line-height: 42px;
        text-align: center;
      }

      .receive {
        margin: 0 auto;
        width: 250px;
        background: #fadf2e;
        color: #000;
      }

      .cancel {
        width: 140px;
        border: 2px solid #58c411;
        color: #58c411;
        padding: 0 20px;
        line-height: 18px;
      }

      .confirm {
        width: 140px;
        background: linear-gradient(270deg, #009a3a 0%, #aac512 100%);
        color: #ffffff;
      }
    }
  }
}
</style>
