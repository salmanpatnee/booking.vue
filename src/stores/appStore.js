import { defineStore } from 'pinia'

export const useAppStore = defineStore({
    id: 'app',
    state: () => ({
      isAppLoading: false, 
      isDayOpen: false
    }),
    getters: {},
    actions: {}
})
