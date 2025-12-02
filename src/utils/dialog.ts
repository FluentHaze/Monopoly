import { usePublicStore } from '../stores';
import {shallowRef,markRaw,nextTick,type Component} from 'vue';

class DialogController {
  private modalInstance = shallowRef<any>();
  private dialogData: any;
  private resolveFn!: (value: { type: 'mask' | 'close'; data?: any }) => void;
  public promise: Promise<{ type: 'mask' | 'close'; data?: any }>;

  constructor(PopupComponent: Component, props: any) {
    this.promise = new Promise(resolve => {
      this.resolveFn = resolve;
      this.initDialog(PopupComponent, props);
    });
  }

  private initDialog(PopupComponent: Component, props: any) {
    const publicStore = usePublicStore();
    this.dialogData = {
      component: markRaw(PopupComponent),
      ref: (el: any) => {
        if (!el || this.modalInstance.value) return;
        nextTick(() => {
          this.modalInstance.value = el;
        });
      },
      props: {
        ...props,
        onClosed: () => {
          this.handleClose('mask');
          publicStore.deleteDialogs(this.dialogData);
        },
        onClose: () => {},
        close: (result: any) => {
          this.handleClose('close', result);
        },
      },
      dialogKey: Date.now(),
    };
    publicStore.setDialogs(this.dialogData);
  }

  private handleClose(type: 'mask' | 'close', data?: any) {
    this.resolveFn({ type, data });
    this.modalInstance.value?.modalRef?.hide();
    this.modalInstance.value = null;
  }

  public close() {
    this.handleClose('close');
  }
}

export default function dialogFun(PopupComponent: Component, props: any) {
  const controller = new DialogController(PopupComponent, props);
  return Object.assign(controller.promise, { close: () => controller.close() });
}
