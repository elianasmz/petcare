// src/api/HTTPClient.js
import { axiosInstance } from './axiosInstance.js'

class HTTPClient {
    constructor() {
        // Podés tener varios clientes según tu arquitectura
        this.reservationApi = axiosInstance
        this.serviceApi = axiosInstance
        this.paymentApi = axiosInstance
    }

    // ======================
    // RESERVACIONES
    // ======================
    getReservations() {
        return this.reservationApi.get('/reservations')
    }

    getReservationById(id) {
        return this.reservationApi.get(`/reservations/${id}`)
    }

    createReservation(data) {
        return this.reservationApi.post('/reservations', data)
    }

    // ======================
    // SERVICIOS
    // ======================
    getServices() {
        return this.serviceApi.get('/services')
    }

    getServiceById(id) {
        return this.serviceApi.get(`/services/${id}`)
    }

    createService(data) {
        return this.serviceApi.post('/services', data)
    }

    // ======================
    // PAGOS
    // ======================
    getPayments() {
        return this.paymentApi.get('/payments')
    }

    createPayment(data) {
        return this.paymentApi.post('/payments', data)
    }
}

export default new HTTPClient()
