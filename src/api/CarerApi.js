import { getAxiosInstance } from './axiosInstance.js'

class CarerApi {
    constructor() {
        // Los carers están en el mismo microservicio que services (puerto 8083)
        this.carerApi = getAxiosInstance('service')

        // Interceptor de respuesta para manejo global de errores
        this.carerApi.interceptors.response.use(
            response => response,
            error => {
                console.error(`[CarerApi] Error:`, error.response?.data || error.message)
                return Promise.reject(error)
            }
        )
    }
    
    // ==================== CARERS ====================
    
    /**
     * Obtener todos los cuidadores (sin servicios)
     * GET /carers
     */
    getCarers() {
        return this.carerApi.get('/carers')
    }

    // ==================== CARER WITH SERVICES ====================
    
    /**
     * Crear cuidador con servicios (cabecera-detalle)
     * POST /carers-with-services
     */
    createCarerWithServices(data) {
        return this.carerApi.post('/carers-with-services', data)
    }

    /**
     * Obtener cuidador con servicios
     * GET /carers-with-services/{carerId}
     */
    getCarerWithServices(carerId) {
        return this.carerApi.get(`/carers-with-services/${carerId}`)
    }

    /**
     * Actualizar cuidador con servicios (cabecera-detalle)
     * PUT /carers-with-services/{carerId}
     */
    updateCarerWithServices(carerId, data) {
        return this.carerApi.put(`/carers-with-services/${carerId}`, data)
    }
}

export default new CarerApi()