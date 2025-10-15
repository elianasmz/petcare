import { defineStore } from 'pinia'
import ServiceApi from '../api/ServiceApi.js'

export const useServicesStore = defineStore('services', {
  state: () => ({
    services: [],
    serviceTypes: [],
    loading: false,
    error: null,
  }),
  actions: {
    // Cargar todos los servicios
    async fetchServices() {
      this.loading = true
      this.error = null
      try {
        const { data } = await ServiceApi.getServices()
        this.services = data.content || data
      } catch (err) {
        this.error = err.message || 'Error cargando los servicios'
      } finally {
        this.loading = false
      }
    },

    // Cargar solo los tipos de servicio (para Home.vue)
    async fetchServiceTypes() {
      this.loading = true
      this.error = null
      try {
        const { data } = await ServiceApi.getServiceTypes()
        this.serviceTypes = data.content || data
      } catch (err) {
        this.error = err.message || 'Error cargando los tipos de servicio'
      } finally {
        this.loading = false
      }
    }
  }
})
