import { axiosInstance } from './axiosInstance.js'

class CarerApi {
    constructor() {
        // Los carers están en el mismo microservicio que services (puerto 8083)
        this.carerApi = axiosInstance

        // Interceptor de respuesta para manejo global de errores
        this.carerApi.interceptors.response.use(
            response => response,
            error => {
                // Solo loguear errores críticos (no 404, 503 esperados)
                const status = error.response?.status
                if (status !== 404 && status !== 503) {
                    console.error(`[CarerApi] Error:`, error.response?.data || error.message)
                }
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

    /**
     * Alias para getCarers (compatibilidad)
     */
    getAllCarers() {
        return this.getCarers()
    }

    /**
     * Obtener cuidador por ID
     * GET /users/{id} o /apirest-services/carers/{id}
     */
    getCarerById(id) {
        // Intentar primero con el endpoint de users ya que los carers son usuarios
        return this.carerApi.get(`/users/${id}`)
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