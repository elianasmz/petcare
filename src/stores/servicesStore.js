import { defineStore } from 'pinia'

export const useServicesStore = defineStore('services', {
  state: () => ({
    services: [
      { id: 1, type: "Paseo", price: 50, carer: "Jazmín" },
      { id: 2, type: "Alojamiento", price: 200, carer: "Cristian" }
    ]
  }),
  actions: {
    addService(service) {
      this.services.push({ id: Date.now(), ...service })
    }
  }
})
