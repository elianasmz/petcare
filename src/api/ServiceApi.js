import { getAxiosInstance } from './axiosInstance.js'

class ServiceApi {
    constructor() {
        this.serviceApi = getAxiosInstance('service') // Microservicio en el puerto 8083

        // Interceptor de respuesta para manejo global de errores
        this.serviceApi.interceptors.response.use(
            response => response,
            error => {
                console.error(`[ServiceApi] Error:`, error.response?.data || error.message)
                return Promise.reject(error)
            }
        )
    }
    
    // ==================== SERVICE TYPES ====================
    
    getServiceTypes(params = {}) {
        return this.serviceApi.get('/service-types', { params })
    }

    getServiceTypeById(id) {
        return this.serviceApi.get(`/service-types/${id}`)
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
    
    getServices(params = {}) {
        return this.serviceApi.get('/services', { params })
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

    // ==================== SERVICES - FILTROS ====================
    
    /**
     * Obtener servicios de un cuidador
     * GET /services/carer/{carerId}
     */
    getServicesByCarerId(carerId, params = {}) {
        return this.serviceApi.get(`/services/carer/${carerId}`, { params })
    }

    /**
     * Obtener servicios por tipo
     * GET /services/type/{serviceTypeId}
     */
    getServicesByServiceTypeId(serviceTypeId, params = {}) {
        return this.serviceApi.get(`/services/type/${serviceTypeId}`, { params })
    }

    /**
     * Obtener servicios por rango de precio
     * GET /services/price-range/{minPrice}/{maxPrice}
     */
    getServicesByPriceRange(minPrice, maxPrice, params = {}) {
        return this.serviceApi.get(`/services/price-range/${minPrice}/${maxPrice}`, { params })
    }

    /**
     * Obtener servicios por cuidador y tipo
     * GET /services/carer/{carerId}/type/{serviceTypeId}
     */
    getServicesByCarerAndType(carerId, serviceTypeId, params = {}) {
        return this.serviceApi.get(`/services/carer/${carerId}/type/${serviceTypeId}`, { params })
    }

    // ==================== CARER WITH SERVICES ====================
    
    /**
     * Crear cuidador con servicios (cabecera-detalle)
     * POST /carers-with-services
     */
    createCarerWithServices(data) {
        return this.serviceApi.post('/carers-with-services', data)
    }

    /**
     * Obtener cuidador con servicios
     * GET /carers-with-services/{carerId}
     */
    getCarerWithServices(carerId) {
        return this.serviceApi.get(`/carers-with-services/${carerId}`)
    }

    /**
     * Actualizar cuidador con servicios (cabecera-detalle)
     * PUT /carers-with-services/{carerId}
     */
    updateCarerWithServices(carerId, data) {
        return this.serviceApi.put(`/carers-with-services/${carerId}`, data)
    }
}

export default new ServiceApi()