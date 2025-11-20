import { axiosInstance } from './axiosInstance.js'

class ReservationApi {
    constructor() {
        this.reservationApi = axiosInstance
    }

    /**
     * RESERVATION
     * Rutas a través del gateway: /reservations/** -> RESERVATION-MICROSERVICE (protegido)
     */
    /**
     * Obtener todas las reservaciones (paginadas)
     * @param params {page, size, sortBy, sortDir}
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    getAllReservations(params = {page: 0, size: 10, sortBy: 'id', sortDir: 'DESC'}) {
        return this.reservationApi.get('/reservations', { params })
    }

    /**
     * Crear una nueva reservación
     * @param data {ownerId, carerId, serviceDate, reservationState}
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    /*postReservation(data) {
        return this.reservationApi.post('/reservations', data)
    }*/
   async postReservation(data) {
  try {
    const response = await this.reservationApi.post('/reservations', data);
    console.log("Respuesta backend:", response.data); // 👀 confirma qué llega
    return response.data; // ✅ devuelve el objeto plano con id
  } catch (error) {
    console.error("[ReservationStore] Error al crear reservación:", error.response?.data || error);
    throw error;
  }
}

async postReservationService(data) {
  try {
    const response = await this.reservationApi.post('/reservation-services', data);
    console.log("Respuesta backend Reservation-Service:", response.data);
    return response.data;
  } catch (error) {
    console.error("[ReservationStore] Error al crear relación Reservation-Service:", error.response?.data || error);
    throw error;
  }
} 

    /**
     * Obtener una reservación por ID
     * @param id
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    getReservationById(id) {
        return this.reservationApi.get(`/reservations/${id}`)
    }

    /**
     *
     * @param id
     * @param data {ownerId, carerId, serviceDate, reservationState}
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    putReservation(id, data) {
        return this.reservationApi.put(`/reservations/${id}`, data)
    }

    /**
     * Eliminar una reservación por ID
     * @param id
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    deleteReservation(id) {
        return this.reservationApi.delete(`/reservations/${id}`)
    }

    /**
     * Buscar reservaciones por filtros
     * @param filters {ownerId, carerId, startDate, endDate, reservationState, page, size, sortBy, sortDir}
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    searchReservations(filters = {}) {
        return this.reservationApi.get('/reservations/search', { params: filters })
    }

    /**
     * RESERVATION SERVICE
     */
    /**
     * Obtener todas las relaciones Reservation-Service (paginadas)
     * @param params {page, size, sortBy, sortDir}
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    getAllRelations(params = {}) {
        // params: page, size, sortBy, sortDir
        return this.reservationApi.get('/reservation-services', { params })
    }

    /**
     * Crear una nueva relación Reservation-Service
     * @param data {reservationId, serviceId}
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    postRelation(data) {
        return this.reservationApi.post('/reservation-services', data)
    }

    /**
     * Obtener una relación Reservation-Service por ID
     * @param id
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    getRelationById(id) {
        return this.reservationApi.get(`/reservation-services/${id}`)
    }

    /**
     * Actualizar una relación Reservation-Service por ID
     * @param id
     * @param data {reservationId, serviceId}
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    putRelation(id, data) {
        return this.reservationApi.put(`/reservation-services/${id}`, data)
    }

    /**
     * Eliminar una relación Reservation-Service por ID
     * @param id
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    deleteRelation(id) {
        return this.reservationApi.delete(`/reservation-services/${id}`)
    }

    /**
     * Obtener relaciones por ID de reservación
     * @param reservationId
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    getServicesByReservation(reservationId) {
        return this.reservationApi.get(`/reservation-services/by-reservation/${reservationId}`)
    }
    
    async getReservationServicesByReservationId(reservationId) {
        try {
            const res = await this.reservationApi.get(`/reservation-services/by-reservation/${reservationId}`);
            // El backend devuelve una lista directamente, no un objeto con items
            return res.data || [];
        } catch (error) {
            console.error("Error al cargar servicios de la reserva:", error);
            throw error;
        }
    }



    /**
     * Eliminar relaciones por ID de reservación
     * @param reservationId
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    deleteByResevationId(reservationId) {
        return this.reservationApi.delete(`/reservation-services/by-reservation/${reservationId}`)
    }

    /**
     * Obtener relaciones por ID de servicio
     * @param serviceId
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    getReservationsByService(serviceId) {
        return this.reservationApi.get(`/reservation-services/by-service/${serviceId}`)
    }

    /**
     * Buscar relaciones por filtros
     * @param filters {reservationId, serviceId, page, size, sortBy, sortDir}
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    searchRelations(filters = {}) {
        // filters: reservationId, serviceId, page, size, sortBy, sortDir
        return this.reservationApi.get('/reservation-services/search', { params: filters })
    }
}

export default new ReservationApi()