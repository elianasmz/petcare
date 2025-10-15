import { getAxiosInstance } from './axiosInstance.js'

class ReservationApi {
    constructor() {
        this.reservationApi = getAxiosInstance('reservation')
    }

    // Crear una nueva reservación
    createReservation(data) {
        return this.reservationApi.post('/reservations', data)
    }

    // Actualizar reservación
    updateReservation(id, data) {
        return this.reservationApi.put(`/reservations/${id}`, data)
    }

    // Obtener reservación por ID
    getReservationById(id) {
        return this.reservationApi.get(`/reservations/${id}`)
    }

    // Listar todas las reservaciones (con paginación y orden)
    getAllReservations(params = {}) {
        // params puede tener: page, size, sortBy, sortDir
        return this.reservationApi.get('/reservations', { params })
    }

    // Buscar reservaciones con filtros opcionales
    searchReservations(filters = {}) {
        // filters puede incluir: ownerId, carerId, state, startDate, endDate, page, size, sortBy, sortDir
        return this.reservationApi.get('/reservations/search', { params: filters })
    }

    // Eliminar reservación (borrado lógico)
    deleteReservation(id) {
        return api.reservationServiceApi.delete(`/reservations/${id}`)
    }
}

export default new ReservationApi()