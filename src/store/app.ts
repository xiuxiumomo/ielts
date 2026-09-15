import * as api from "@/api/app";
import { defineStore } from "pinia";

export const useAppStore = defineStore({
  id: "app",
  state: () => ({
    home: {
      data: [],
    },
  }),
  actions: {
    async getUserList() {
      const res: any = await api.getUserList();
      console.log(res);
      if (res.code == 200) {
        this.home = res.data;
      }
      return res;
    },
  },
});
