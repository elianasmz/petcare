import { axiosInstance } from './axiosInstance.js'

class OwnerApi {
    constructor() {
        // Los owners están en el microservicio de service (puerto 8083)
        this.ownerApi = axiosInstance

        // Interceptor de respuesta para manejo global de errores
        this.ownerApi.interceptors.response.use(
            response => response,
            error => {
                console.error(`[OwnerApi] Error:`, error.response?.data || error.message)
                return Promise.reject(error)
            }
        )
    }

    // ==================== OWNERS ====================
    // Rutas a través del gateway: /apirest-services/**

    /**
     * Obtener todos los propietarios
     * GET /apirest-services/owners
     */
    getOwners() {
        return this.ownerApi.get('/apirest-services/owners')
    }

    /**
     * Obtener un propietario por ID
     * GET /apirest-services/owners/{id}
     */
    getOwnerById(ownerId) {
        return this.ownerApi.get(`/apirest-services/owners/${ownerId}`)
    }
}

export default new OwnerApi()