import { axiosInstance } from './axiosInstance.js'

class CarerApi {
    constructor() {
        // Los carers están en el mismo microservicio que services (puerto 8083)
        this.carerApi = axiosInstance

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
    // Rutas a través del gateway: /apirest-services/**
    
    /**
     * Obtener todos los cuidadores (sin servicios)
     * GET /apirest-services/carers
     */
    getCarers() {
        return this.carerApi.get('/users/carers/available')
    }

    // ==================== CARER WITH SERVICES ====================
    // Rutas a través del gateway: /apirest-services/**
    
    /**
     * Crear cuidador con servicios (cabecera-detalle)
     * POST /apirest-services/carers-with-services
     */
    createCarerWithServices(data) {
        return this.carerApi.post('/apirest-services/carers-with-services', data)
    }

    /**
     * Obtener cuidador con servicios
     * GET /apirest-services/carers-with-services/{carerId}
     */
    getCarerWithServices(carerId) {
        return this.carerApi.get(`/apirest-services/carers-with-services/${carerId}`)
    }

    /**
     * Actualizar cuidador con servicios (cabecera-detalle)
     * PUT /apirest-services/carers-with-services/{carerId}
     */
    updateCarerWithServices(carerId, data) {
        return this.carerApi.put(`/apirest-services/carers-with-services/${carerId}`, data)
    }
}

export default new CarerApi()