import { defineStore } from 'pinia'

export const useContadorStore = defineStore('contador', {
  state: () => ({
    count: 0,  // valor inicial
  }),
  getters: {
    doubleCount: (state) => state.count * 2, // ejemplo de getter
  },
  actions: {
    increment() {
      this.count++
    },
    decrement() {
      this.count--
    },
    reset() {
      this.count = 0
    }
  }
})
