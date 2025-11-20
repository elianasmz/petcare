import { axiosInstance } from './axiosInstance.js'

class OwnerApi {
    constructor() {
        this.ownerApi = axiosInstance;

        this.ownerApi.interceptors.response.use(
            response => response,
            error => {
                const status = error.response?.status;
                if (status !== 404 && status !== 503) {
                    console.error(`[OwnerApi] Error:`, error.response?.data || error.message);
                }
                return Promise.reject(error);
            }
        );
    }

    // Obtener cuidadores disponibles
    getOwners() {
        return this.ownerApi.get('/users/carers/available');
    }

    // Obtener usuario por ID (puede ser dueño)
    getOwnerById(ownerId) {
        return this.ownerApi.get(`/users/${ownerId}`);
    }
}

export default new OwnerApi();
