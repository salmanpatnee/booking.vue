import { defineStore } from 'pinia'

export const useUserStore = defineStore({
    id: 'user',
    state: () => ({
        user: {
            data: { name: 'Salman' },
            token: '123'
        }
    }),
    getters: {},
    actions: {}
})
