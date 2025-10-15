// src/api/HTTPClient.js
import { getAxiosInstance } from './axiosInstance.js'

class HTTPClient {
    constructor() {
        // Podés tener varios clientes según tu arquitectura
        this.reservationApi = getAxiosInstance('reservation')
        this.serviceApi = getAxiosInstance('service')
        this.paymentApi = getAxiosInstance('payment')
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
