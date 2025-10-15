import { getAxiosInstance } from './axiosInstance.js'

class ServiceApi {
    constructor() {
        this.serviceApi = getAxiosInstance('service') // Microservicio en el puerto 8083

        // Interceptor de respuesta para manejo global de errores (opcional)
        this.serviceApi.interceptors.response.use(
            response => response,
            error => {
                console.error(`[ServiceApi] Error:`, error.response?.data || error.message)
                return Promise.reject(error)
            }
        )
    }
    
    // ================= Tipos de servicio =================
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

    // ================= Servicios =================
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
}

export default new ServiceApi()