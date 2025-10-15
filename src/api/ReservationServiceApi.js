import { getAxiosInstance } from './axiosInstance.js'

class ReservationServiceApi {
    constructor() {
        this.reservationServiceApi = getAxiosInstance('reservation')
    }

    // Crear relación Reservation-Service
    createRelation(data) {
        return this.reservationServiceApi.post('/reservation-services', data)
    }

    // Obtener relación por ID
    getRelationById(id) {
        return this.reservationServiceApi.get(`/reservation-services/${id}`)
    }

    // Listar todas las relaciones (paginadas)
    getAllRelations(params = {}) {
        // params: page, size, sortBy, sortDir
        return this.reservationServiceApi.get('/reservation-services', { params })
    }

    // Buscar relaciones por filtros
    searchRelations(filters = {}) {
        // filters: reservationId, serviceId, page, size, sortBy, sortDir
        return this.reservationServiceApi.get('/reservation-services/search', { params: filters })
    }

    // Obtener servicios de una reservación
    getServicesByReservation(reservationId) {
        return this.reservationServiceApi.get(`/reservation-services/by-reservation/${reservationId}`)
    }

    // Obtener reservaciones de un servicio
    getReservationsByService(serviceId) {
        return this.reservationServiceApi.get(`/reservation-services/by-service/${serviceId}`)
    }

    // Eliminar una relación
    deleteRelation(id) {
        return this.reservationServiceApi.delete(`/reservation-services/${id}`)
    }

    // Eliminar todas las relaciones por ID de reservación
    deleteAllByReservation(reservationId) {
        return this.reservationServiceApi.delete(`/reservation-services/by-reservation/${reservationId}`)
    }
}

export default new ReservationServiceApi()