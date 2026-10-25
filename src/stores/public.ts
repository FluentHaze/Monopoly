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
      const index = this.dialogs.indexOf(data);
      if (index >= 0) this.dialogs.splice(index, 1);
    },
  },
});

export default usePublicStore;
