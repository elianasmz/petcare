import { defineStore } from "pinia"
import ReservationServiceApi from "../api/ReservationServiceApi.js"

export const useReservationServicesStore = defineStore("reservationServices", {
    state: () => ({
        reservationServices: [],   // lista de servicios de una reserva
        loading: false,
        error: null,
    }),

    actions: {
        async fetchByReservationId(reservationId) {
            this.loading = true
            this.error = null
            try {
                const res = await ReservationServiceApi.getByReservationId(reservationId)
                this.reservationServices = res.data
            } catch (err) {
                console.error("Error al obtener los servicios de la reservación:", err)
                this.error = err.message
            } finally {
                this.loading = false
            }
        },

        async addReservationService(payload) {
            this.loading = true
            try {
                const res = await ReservationServiceApi.create(payload)
                this.reservationServices.push(res.data)
                return res.data
            } catch (err) {
                console.error("Error al crear ReservationService:", err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async removeReservationService(id) {
            this.loading = true
            try {
                await ReservationServiceApi.remove(id)
                this.reservationServices = this.reservationServices.filter(s => s.id !== id)
            } catch (err) {
                console.error("Error al eliminar ReservationService:", err)
                throw err
            } finally {
                this.loading = false
            }
        },
    },
})
