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
    },

    // Obtener servicios de un cuidador específico
    async fetchServicesByCarerId(carerId, params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data } = await ServiceApi.getServices({ ...params, carerId })
        this.services = data.content || data
      } catch (err) {
        this.error = err.message || 'Error cargando los servicios del cuidador'
      } finally {
        this.loading = false
      }
    },

    // Crear un nuevo servicio
    async createService(serviceData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await ServiceApi.createService(serviceData)
        this.services.push(data)
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error creando el servicio'
        throw err
      } finally {
        this.loading = false
      }
    },

    // Actualizar un servicio
    async updateService(id, serviceData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await ServiceApi.updateService(id, serviceData)
        const index = this.services.findIndex(s => s.id === id)
        if (index >= 0) {
          this.services[index] = data
        }
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error actualizando el servicio'
        throw err
      } finally {
        this.loading = false
      }
    },

    // Eliminar un servicio
    async deleteService(id) {
      this.loading = true
      this.error = null
      try {
        await ServiceApi.deleteService(id)
        this.services = this.services.filter(s => s.id !== id)
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error eliminando el servicio'
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})