import { defineStore } from "pinia"
import ReservationApi from "../api/ReservationApi.js"

export const useReservationsStore = defineStore("reservations", {
    state: () => ({
        reservations: [],     // Lista de reservaciones
        selectedReservation: null, // Detalle actual
        loading: false,
        error: null,
        searchQuery: "",
    }),

    getters: {
        filteredReservations(state) {
            if (!state.searchQuery) return state.reservations
            const query = state.searchQuery.toLowerCase()
            return state.reservations.filter(r =>
                r.ownerId?.toLowerCase().includes(query) ||
                r.carerId?.toLowerCase().includes(query) ||
                r.state?.toLowerCase().includes(query)
            )
        },
    },

    actions: {
        async fetchReservations() {
            this.loading = true
            this.error = null
            try {
                const res = await ReservationApi.getAllReservations({ page: 0, size: 10, sortBy: 'id', sortDir: 'DESC' })
                console.log(res);
                this.reservations = res.data.content
            } catch (err) {
                console.error("Error al obtener reservaciones:", err)
                this.error = err.message || "Error al cargar reservaciones"
            } finally {
                this.loading = false
            }
        },

        async getReservationById(id) {
            this.loading = true
            this.error = null
            try {
                const res = await ReservationApi.getReservationById(id)
                this.selectedReservation = res.data
            } catch (err) {
                console.error(`Error al obtener la reservación ${id}:`, err)
                this.error = err.message
            } finally {
                this.loading = false
            }
        },

        async createReservation(payload) {
            this.loading = true
            try {
                const res = await ReservationApi.createReservation(payload)
                this.reservations.push(res.data)
                return res.data
            } catch (err) {
                console.error("Error al crear reservación:", err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async updateReservation(id, payload) {
            this.loading = true
            try {
                const res = await ReservationApi.updateReservation(id, payload)
                const idx = this.reservations.findIndex(r => r.id === id)
                if (idx !== -1) this.reservations[idx] = res.data
                if (this.selectedReservation?.id === id)
                    this.selectedReservation = res.data
            } catch (err) {
                console.error("Error al actualizar reservación:", err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async deleteReservation(id) {
            this.loading = true
            try {
                await ReservationApi.deleteReservation(id)
                this.reservations = this.reservations.filter(r => r.id !== id)
            } catch (err) {
                console.error("Error al eliminar reservación:", err)
                throw err
            } finally {
                this.loading = false
            }
        },
    },
})
