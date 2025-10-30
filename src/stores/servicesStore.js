import { defineStore } from 'pinia'
import ServiceApi from '../api/ServiceApi.js'

export const useServicesStore = defineStore('services', {
  state: () => ({
    services: [],
    serviceTypes: [],
    currentService: null,
    loading: false,
    error: null,

    // Metadata de paginación
    pagination: {
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0
    }
  }),

  getters: {
    getServiceById: (state) => (id) => {
      return state.services.find(s => s.id === id)
    },

    getServicesByCarerId: (state) => (carerId) => {
      return state.services.filter(s => s.carerId === carerId)
    },

    getServicesByTypeId: (state) => (typeId) => {
      return state.services.filter(s => s.serviceTypeId === typeId)
    },

    hasServices: (state) => state.services.length > 0,

    hasServiceTypes: (state) => state.serviceTypes.length > 0
  },

  actions: {
    // ==================== SERVICE TYPES ====================

    async fetchServiceTypes(params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data } = await ServiceApi.getServiceTypes(params)
        this.serviceTypes = data.content || data

        if (data.totalElements !== undefined) {
          this.pagination = {
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            size: data.size,
            number: data.number
          }
        }
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error cargando tipos de servicio'
        console.error('Error en fetchServiceTypes:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchServiceTypeById(id) {
      this.loading = true
      this.error = null
      try {
        const { data } = await ServiceApi.getServiceTypeById(id)
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error obteniendo tipo de servicio'
        console.error('Error en fetchServiceTypeById:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async createServiceType(typeData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await ServiceApi.createServiceType(typeData)
        this.serviceTypes.push(data)
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error creando tipo de servicio'
        console.error('Error en createServiceType:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateServiceType(id, typeData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await ServiceApi.updateServiceType(id, typeData)
        const index = this.serviceTypes.findIndex(t => t.id === id)
        if (index >= 0) {
          this.serviceTypes[index] = data
        }
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error actualizando tipo de servicio'
        console.error('Error en updateServiceType:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteServiceType(id) {
      this.loading = true
      this.error = null
      try {
        await ServiceApi.deleteServiceType(id)
        this.serviceTypes = this.serviceTypes.filter(t => t.id !== id)
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error eliminando tipo de servicio'
        console.error('Error en deleteServiceType:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // ==================== SERVICES ====================

    async fetchServices(params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data } = await ServiceApi.getServices(params)
        this.services = data.content || data

        if (data.totalElements !== undefined) {
          this.pagination = {
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            size: data.size,
            number: data.number
          }
        }
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error cargando servicios'
        console.error('Error en fetchServices:', err)
      } finally {
        this.loading = false
      }
    },

    async fetchServiceById(id) {
      this.loading = true
      this.error = null
      try {
        const { data } = await ServiceApi.getServiceById(id)
        this.currentService = data
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error obteniendo servicio'
        console.error('Error en fetchServiceById:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
    * Acción para buscar servicios por texto
    * @param {object} params
    */
    async searchServices(params = {}) {
      this.loading = true
      this.error = null
      try {
        const { data } = await ServiceApi.searchServices(params)

        this.services = data.content || []
        if (data.totalElements !== undefined) {
          this.pagination = {
            totalElements: data.totalElements,
            totalPages: data.totalPages,
            size: data.size,
            number: data.number
          }
        }
      } catch (err) {
        this.error = err.response?.data?.message || err.message
      } finally {
        this.loading = false
      }
    },

    async createService(serviceData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await ServiceApi.createService(serviceData)
        this.services.push(data)
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error creando servicio'
        console.error('Error en createService:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateService(id, serviceData) {
      this.loading = true
      this.error = null
      try {
        const { data } = await ServiceApi.updateService(id, serviceData)
        const index = this.services.findIndex(s => s.id === id)
        if (index >= 0) {
          this.services[index] = data
        }
        if (this.currentService?.id === id) {
          this.currentService = data
        }
        return data
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error actualizando servicio'
        console.error('Error en updateService:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteService(id) {
      this.loading = true
      this.error = null
      try {
        await ServiceApi.deleteService(id)
        this.services = this.services.filter(s => s.id !== id)
        if (this.currentService?.id === id) {
          this.currentService = null
        }
      } catch (err) {
        this.error = err.response?.data?.message || err.message || 'Error eliminando servicio'
        console.error('Error en deleteService:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // ==================== UTILIDADES ====================

    clearServices() {
      this.services = []
      this.currentService = null
      this.error = null
    },

    clearError() {
      this.error = null
    },

    resetPagination() {
      this.pagination = {
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0
      }
    }
  }
})