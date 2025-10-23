import { getAxiosInstance } from './axiosInstance.js'

class OwnerApi {
    constructor() {
        // Los owners están en el microservicio de service (puerto 8083)
        this.ownerApi = getAxiosInstance('service')

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

    /**
     * Obtener todos los propietarios
     * GET /owners
     */
    getOwners() {
        return this.ownerApi.get('/owners')
    }

    /**
     * Obtener un propietario por ID
     * GET /owners/{id}
     */
    getOwnerById(ownerId) {
        return this.ownerApi.get(`/owners/${ownerId}`)
    }
}

export default new OwnerApi()