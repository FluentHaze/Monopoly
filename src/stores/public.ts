import { defineStore } from 'pinia';

// 全局数据
const usePublicStore = defineStore('public', {
  state: () => ({
    dialogs: [] as any[],
  }),
  actions: {
    setDialogs(data: any) {
      this.dialogs.push(data);
    },
    deleteDialogs(data: any) {
      this.dialogs.splice(this.dialogs.indexOf(data), 1);
    },
  },
});

export default usePublicStore;
