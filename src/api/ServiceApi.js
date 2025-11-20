// src/api/ServiceApi.js
import { axiosInstance } from './axiosInstance.js'

class ServiceApi {
    constructor() {
        this.serviceApi = axiosInstance

        this.serviceApi.interceptors.response.use(
            response => response,
            error => {
                // Solo loguear errores críticos (no 404, 503 esperados)
                const status = error.response?.status
                if (status !== 404 && status !== 503) {
                    console.error(`[ServiceApi] Error:`, error.response?.data || error.message)
                }
                return Promise.reject(error)
            }
        )
    }
    
    // ==================== SERVICE TYPES ====================
    // Rutas a través del gateway: /apirest-services/**
    
    getServiceTypes(params = {}) {
        return this.serviceApi.get('/service-types', { params })
    }

    getServiceTypeById(id) {
        return this.serviceApi.get(`/services/${id}`)
    }

    createServiceType(data) {
        return this.serviceApi.post('/service-types', data)
    }

    updateServiceType(id, data) {
        return this.serviceApi.put(`/service-types/${id}`, data)
    }

    deleteServiceType(id) {
        return this.serviceApi.delete(`/service-types/${id}`)
    }

    // ==================== SERVICES ====================
    // Rutas a través del gateway: /apirest-services/**
    
    /**
     * Obtener servicios.
     * @param {object} params
     */
    getServices(params = {}) {
        return this.serviceApi.get('/services', { params })
    }

    /**
     * Buscar servicios por texto en la descripción
     * @param {object} params
     */
    searchServices(params = {}) {
        return this.serviceApi.get('/services/search', { params })
    }

    getServiceById(id) {
        return this.serviceApi.get(`/services/${id}`)
    }

    createService(data) {
        return this.serviceApi.post('/services', data)
    }

    updateService(id, data) {
        return this.serviceApi.put(`/services/${id}`, data)
    }

    deleteService(id) {
        return this.serviceApi.delete(`/services/${id}`)
    }

    /**
     * Obtiene servicios de un cuidador
     * GET /services?carerId={id}&page=0&size=100
     */
    getServicesByCarer(carerId, page = 0, size = 100) {
    return this.serviceApi.get(`/services`, {
        params: { carerId, page, size }
    })
}

}

export default new ServiceApi()
