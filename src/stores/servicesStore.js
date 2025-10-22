// src/stores/servicesStore.js
import { defineStore } from 'pinia'
import ServiceApi from '../api/ServiceApi.js'

export const useServicesStore = defineStore('services', {
  state: () => ({
    services: [],
    serviceTypes: [],
    currentService: null, // Para detalles de un servicio específico
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
    // Obtener servicio por ID desde el state
    getServiceById: (state) => (id) => {
      return state.services.find(s => s.id === id)
    },

    // Obtener servicios de un cuidador específico
    getServicesByCarerId: (state) => (carerId) => {
      return state.services.filter(s => s.carerId === carerId)
    },

    // Obtener servicios por tipo
    getServicesByTypeId: (state) => (typeId) => {
      return state.services.filter(s => s.serviceTypeId === typeId)
    },

    // Verificar si hay servicios cargados
    hasServices: (state) => state.services.length > 0,

    // Verificar si hay tipos de servicio cargados
    hasServiceTypes: (state) => state.serviceTypes.length > 0
  },

  actions: {
    // ==================== SERVICE TYPES ====================
    
    /**
     * Obtener todos los tipos de servicio (paginado)
     * @param {Object} params - { page, size, sort }
     */
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

    /**
     * Obtener un tipo de servicio por ID
     * @param {Number} id
     */
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

    /**
     * Crear un nuevo tipo de servicio
     * @param {Object} typeData - { name }
     */
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

    /**
     * Actualizar un tipo de servicio
     * @param {Number} id
     * @param {Object} typeData - { name }
     */
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

    /**
     * Eliminar un tipo de servicio
     * @param {Number} id
     */
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

    /**
     * Obtener todos los servicios (paginado)
     * @param {Object} params - { page, size }
     */
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

    /**
     * Obtener un servicio por ID
     * @param {Number} id
     */
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
     * Obtener servicios de un cuidador (paginado)
     * @param {Number} carerId
     * @param {Object} params - { page, size }
     */
    async fetchServicesByCarerId(carerId, params = {}) {
      this.loading = true
      this.error = null
      try {
        // Usando endpoint específico: /services/carer/{carerId}
        const response = await fetch(
          `http://localhost:8083/api/v1/services/carer/${carerId}?page=${params.page || 0}&size=${params.size || 10}`
        )
        const data = await response.json()
        
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
        this.error = err.message || 'Error cargando servicios del cuidador'
        console.error('Error en fetchServicesByCarerId:', err)
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener servicios por tipo (paginado)
     * @param {Number} serviceTypeId
     * @param {Object} params - { page, size }
     */
    async fetchServicesByType(serviceTypeId, params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await fetch(
          `http://localhost:8083/api/v1/services/type/${serviceTypeId}?page=${params.page || 0}&size=${params.size || 10}`
        )
        const data = await response.json()
        
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
        this.error = err.message || 'Error cargando servicios por tipo'
        console.error('Error en fetchServicesByType:', err)
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener servicios por rango de precio (paginado)
     * @param {Number} minPrice
     * @param {Number} maxPrice
     * @param {Object} params - { page, size }
     */
    async fetchServicesByPriceRange(minPrice, maxPrice, params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await fetch(
          `http://localhost:8083/api/v1/services/price-range/${minPrice}/${maxPrice}?page=${params.page || 0}&size=${params.size || 10}`
        )
        const data = await response.json()
        
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
        this.error = err.message || 'Error cargando servicios por rango de precio'
        console.error('Error en fetchServicesByPriceRange:', err)
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener servicios por cuidador y tipo (paginado)
     * @param {Number} carerId
     * @param {Number} serviceTypeId
     * @param {Object} params - { page, size }
     */
    async fetchServicesByCarerAndType(carerId, serviceTypeId, params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await fetch(
          `http://localhost:8083/api/v1/services/carer/${carerId}/type/${serviceTypeId}?page=${params.page || 0}&size=${params.size || 10}`
        )
        const data = await response.json()
        
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
        this.error = err.message || 'Error cargando servicios por cuidador y tipo'
        console.error('Error en fetchServicesByCarerAndType:', err)
      } finally {
        this.loading = false
      }
    },

    /**
     * Crear un nuevo servicio
     * @param {Object} serviceData - { carerId, serviceTypeId, description, price }
     */
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

    /**
     * Actualizar un servicio
     * @param {Number} id
     * @param {Object} serviceData - { carerId, serviceTypeId, description, price }
     */
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

    /**
     * Eliminar un servicio (soft delete)
     * @param {Number} id
     */
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

    /**
     * Limpiar el estado
     */
    clearServices() {
      this.services = []
      this.currentService = null
      this.error = null
    },

    /**
     * Limpiar errores
     */
    clearError() {
      this.error = null
    },

    /**
     * Resetear paginación
     */
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