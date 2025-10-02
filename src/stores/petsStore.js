import { defineStore } from 'pinia'

export const usePetsStore = defineStore('pets', {
  state: () => ({
    pets: []
  }),
  actions: {
    addPet(pet) {
      this.pets.push({
        id: Date.now(),
        ...pet
      })
    },
    removePet(id) {
      this.pets = this.pets.filter(p => p.id !== id)
    }
  }
})
