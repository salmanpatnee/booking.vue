import http from "@@/services/HttpService";
import { defineStore, acceptHMRUpdate } from "pinia";

const apiEndpoint = `/api/cash-registers/me`;

export const useRegisterStore = defineStore({
  id: "register",
  state: () => ({
    registers: {
      isLoading: false,
      data: [],
    },
    register: {
      isLoading: false,
      data: {},
    },
  }),

  actions: {
    async getRegister(id) {
      try {
        this.register.isLoading = true;
        const data = await http.get(`${apiEndpoint}`);
     
        this.register.data = data;
        this.register.isLoading = false;
      } catch (error) {
        this.register.isLoading = false;
        this.register.data = {"message": "No register found"}
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useRegisterStore, import.meta.hot));
}

