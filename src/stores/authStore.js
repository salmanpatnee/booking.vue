import axios from "axios";
import { defineStore } from "pinia";

export const useAuthStore = defineStore({
  id: "auth",
  state: () => ({
    user: null,
    token: null,
  }),
  getters: {
    isRegisterOpen:(state) => {
      return state.user &&  state.user.cash_registers;
    }, 
    getRegisterDate:(state) => {
      return state.user &&  state.user.cash_registers.date;
    }
  },

  actions: {
    async getUser() {
      const localToken = localStorage.getItem("token");
      if (!localToken) return false;
      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${localToken}`;
        const { data: response } = await axios.get(`/api/users/me`);
        this.user = response.data;
      } catch (error) {
        console.log(error);
        this.logout();
      }
    },
    async userLoggedIn(token) {
      this.token = token;
      localStorage.setItem("token", token);
      try {
        await this.getUser();
      } catch (error) {
        console.log(error);
      }
    },
    logout() {
      localStorage.removeItem("token");
      this.user = null;
      this.token = null;
      axios.defaults.headers.common["Authorization"] = null;
    },
  },
});
