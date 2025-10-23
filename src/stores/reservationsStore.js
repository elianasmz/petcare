import {defineStore} from "pinia"
import ReservationApi from "../api/ReservationApi.js"
import {useUserStore} from "./userStore.js";
import {useOwnerStore} from "./ownerStore.js";
import {useCarersStore} from "./carersStore.js";
import {useServicesStore} from "./servicesStore.js";

export const useReservationsStore = defineStore("reservations", {
    state: () => ({
        reservations: [], // Lista de reservaciones
        reservationServices: [], // Servicios asociados a una reservación

        //id: 0, // ID de reservación actual
        selectedReservation: null, // Detalle actual
        selectedService: null,

        // Parámetros de paginación y ordenamiento
        pagitation: {
            page: 0,
            size: 10,
            sortBy: 'id',
            sortDir: 'DESC',
        },

        // Estados de reservación
        states: {
            'PENDING': 'Pendiente',
            'ACCEPTED': 'Aceptada',
            'REJECTED': 'Rechazada',
            'FINISHED': 'Finalizada',
        },

        // Estado de carga y errores
        loading: false,
        error: null,
        searchQuery: '',
    }),

    getters: {
        /**
         * Obtiene las reservaciones filtradas por la consulta de búsqueda.
         * @param state
         * @returns
         */
        filteredReservations(state) {
            if (!state.searchQuery) return state.reservations
            const query = state.searchQuery.toLowerCase()
            return state.reservations.filter(r =>
                r.ownerId?.toLowerCase().includes(query) ||
                r.carerId?.toLowerCase().includes(query) ||
                r.state?.toLowerCase().includes(query)
            )
        },

        /**
         * Obtiene una reservación por su ID.
         * @returns {function(*): *}
         */
        getterReservationById: () => {
            return state.reservations.find(r => r.id === state.reservations.id)
        },

        /**
         * Obtiene la representación en texto del estado de una reservación.
         * @param estado
         * @returns {*|string}
         */
        getEstado(estado) {
            return this.states[estado] || 'Desconocido'
        },
    },

    actions: {
        /**
         * RESERVATION
         */
        /**
         * Obtiene todas las reservaciones con paginación y ordenamiento.
         * @param params {page, size, sortBy, sortDir}
         * @returns {Promise<void>}
         */
        async getAllReservations(params = {}) {
            this.loading = true
            this.error = null
            try {
                // Instancias de los stores
                const carerStore = useCarersStore()
                const ownerStore = useOwnerStore()

                // Obtener la reserva base
                const reservationBase = await ReservationApi.getAllReservations(params || this.pagitation)
                const reservation = reservationBase.data.content || []

                // Cargar datos adicionales de carer y owner
                if (reservation) {
                    const relationsUsers = reservation.map(async (res) => {
                        const carer = await carerStore.getCarerById(res.carerId)
                        const owner = await ownerStore.getOwnerById(res.ownerId)
                        return {
                            ...res,
                            carer: carer ? carer : 'Desconocido',
                            owner: owner ? owner : 'Desconocido',
                        }
                    })
                    this.reservations = await Promise.all(relationsUsers)
                }
            } catch (err) {
                console.error("Error al obtener reservaciones:", err)
                this.error = err.response?.data?.message || err.message || "Error al cargar reservaciones"
            } finally {
                this.loading = false
            }
        },

        /**
         * Crea una nueva reservación.
         * @param payload {ownerId, carerId, serviceDate, reservationState}
         * @returns {Promise<*>}
         */
        async postReservation(payload) {
            this.loading = true
            this.error = null
            try {
                const res = await ReservationApi.postReservation(payload)
                this.reservations.push(res.data.content)
                return res.data
            } catch (err) {
                console.error("Error al crear reservación:", err)
                this.error = err.response?.data?.message || err.message || "Error con la creación de la reservación"
            } finally {
                this.loading = false
            }
        },

        /**
         * Obtiene una reservación por su ID.
         * @param id
         * @returns {Promise<void>}
         */
        async getReservationById(id) {
            this.loading = true
            this.error = null
            try {
                // Instancias de los stores
                const carerStore = useCarersStore()
                const ownerStore = useOwnerStore()

                // Obtener la reservación base
                const reservationBase = await ReservationApi.getReservationById(id)
                this.selectedReservation = reservationBase.data || null

                // Cargar datos adicionales de carer y owner
                if (this.selectedReservation) {
                    const carer = await carerStore.getCarerById(this.selectedReservation.carerId)
                    const owner = await ownerStore.getOwnerById(this.selectedReservation.ownerId)
                    this.selectedReservation = {
                        ...this.selectedReservation,
                        carer: carer ? carer : 'Desconocido',
                        owner: owner ? owner : 'Desconocido',
                    }
                }
            } catch (err) {
                console.error(`Error al obtener la reservación ${id}:`, err)
                this.error = err.response?.data?.message || err.message || "Error al cargar la reservación"
            } finally {
                this.loading = false
            }
        },

        /**
         * Actualiza una reservación existente.
         * @param id
         * @param payload {ownerId, carerId, serviceDate, reservationState}
         * @returns {Promise<void>}
         */
        async putReservation(id, payload) {
            this.loading = true
            this.error = null
            try {
                const res = await ReservationApi.putReservation(id, payload)
                const idx = this.reservations.findIndex(r => r.id === id)
                if (idx !== -1) this.reservations[idx] = res.data
                if (this.selectedReservation?.id === id)
                    this.selectedReservation = res.data
            } catch (err) {
                console.error("Error al actualizar reservación:", err)
                this.error = err.response?.data?.message || err.message || "Error al cargar la reservación"
            } finally {
                this.loading = false
            }
        },

        /**
         * Elimina una reservación por su ID.
         * @param id
         * @returns {Promise<void>}
         */
        async deleteReservation(id) {
            this.loading = true
            this.error = null
            try {
                await ReservationApi.deleteReservation(id)
                this.reservations = this.reservations.filter(r => r.id !== id)
            } catch (err) {
                console.error("Error al eliminar reservación:", err)
                this.error = err.response?.data?.message || err.message || "Error al eliminar reservación"
            } finally {
                this.loading = false
            }
        },

        /**
         * Busca reservaciones según los filtros proporcionados.
         * @param filters {ownerId, carerId, dateFrom, dateTo, reservationState, page, size, sortBy, sortDir}
         * @returns {Promise<void>}
         */
        async searchReservations(filters = {}) {
            this.loading = true
            this.error = null
            try {
                const res = await ReservationApi.searchReservations(filters)
                this.reservations = res.data.content
            } catch (err) {
                console.error("Error al buscar reservaciones:", err)
                this.error = err.response?.data?.message || err.message || "Error al buscar reservaciones"
            } finally {
                this.loading = false
            }
        },

        /**
         * RESERVATION SERVICE
         */
        /**
         * Obtiene todos los servicios de reservación.
         * @param params
         * @returns {Promise<void>}
         */
        async getAllReservationServices(params = {}) {
            this.loading = true
            this.error = null
            try {
                // Instancia del store de services
                const serviceStore = useServicesStore()

                // Obtener la base de servicios de reservación
                const resBase = await ReservationApi.getAllRelations()
                const services = resBase.data.content || []

                // Cargar datos adicionales de service
                if (services) {
                    const relationsServices = services.map(async (rs) => {
                        const service = await serviceStore.fetchServiceTypeById(rs.serviceId)
                        return {
                            ...rs,
                            service: service ? service : 'Desconocido',
                        }
                    })
                    this.reservationServices = await Promise.all(relationsServices)
                }
            } catch (err) {
                console.error("Error al obtener los servicios de reservación:", err)
                this.error = err.response?.data?.message || err.message || "Error al obtener los servicios de reservación"
            } finally {
                this.loading = false
            }
        },

        /**
         * Crea un nuevo servicio de reservación.
         * @param payload {reservationId, serviceId}
         * @returns {Promise<*>}
         */
        async postReservationService(payload) {
            this.loading = true
            this.error = null
            try {
                const res = await ReservationApi.postRelation(payload)
                this.reservationServices.push(res.data)
                return res.data
            } catch (err) {
                console.error("Error al crear ReservationService:", err)
                this.error = err.response?.data?.message || err.message || "Error al crear el servicio de reservación"
            } finally {
                this.loading = false
            }
        },

        /**
         * Obtiene los servicios de una reservación por su ID.
         * @param reservationId
         * @returns {Promise<void>}
         */
        async getReservationServiceById(reservationId) {
            this.loading = true
            this.error = null
            try {
                // Instancia del store de services
                const serviceStore = useServicesStore()

                // Obtener la base de servicios de reservación
                const resBase = await ReservationApi.getRelationById(reservationId)
                const services = resBase.data

                // Cargar datos adicionales de service
                const relationsServices = services.map(async (rs) => {
                    const service = await serviceStore.fetchServiceTypeById(rs.serviceId)
                    return {
                        ...rs,
                        service: service ? service : 'Desconocido',
                    }
                })
                this.selectedService = await Promise.all(relationsServices)
            } catch (err) {
                console.error("Error al obtener los servicios de la reservación:", err)
                this.error = err.response?.data?.message || err.message || "Error al obtener los servicios de la reservación"
            } finally {
                this.loading = false
            }
        },

        /**
         * Actualiza un servicio de reservación existente.
         * @param id
         * @param payload {reservationId, serviceId}
         * @returns {Promise<void>}
         */
        async putReservationService(id, payload) {
            this.loading = true
            this.error = null
            try {
                const res = await ReservationApi.putRelation(id, payload)
                const idx = this.reservationServices.findIndex(s => s.id === id)
                if (idx !== -1) this.reservationServices[idx] = res.data
            } catch (err) {
                console.error("Error al actualizar ReservationService:", err)
                this.error = err.response?.data?.message || err.message || "Error al actualizar el servicio de reservación"
            } finally {
                this.loading = false
            }
        },

        /**
         * Elimina un servicio de reservación por su ID.
         * @param id
         * @returns {Promise<void>}
         */
        async deleteReservationService(id) {
            this.loading = true
            this.error = null
            try {
                await ReservationApi.deleteRelation(id)
                this.reservationServices = this.reservationServices.filter(s => s.id !== id)
            } catch (err) {
                console.error("Error al eliminar ReservationService:", err)
                throw err
            } finally {
                this.loading = false
            }
        },

        /**
         * Obtiene los servicios asociados a una reservación específica.
         * @param reservationId
         * @returns {Promise<void>}
         */
        async getServicesByReservation(reservationId) {
            this.loading = true
            this.error = null
            try {
                // Instancia del store de services
                const serviceStore = useServicesStore()

                // Obtener la base de servicios de reservación
                const resBase = await ReservationApi.getServicesByReservation(reservationId)
                const services = resBase.data || []
                console.log(services)
                // Cargar datos adicionales de service
                if (services) {
                    const relationsServices = services.map(async (rs) => {
                        const service = await serviceStore.fetchServiceTypeById(rs.serviceId)
                        console.log(service)
                        return {
                            ...rs,
                            service: service ? service : 'Desconocido',
                        }
                    })
                    this.reservationServices = await Promise.all(relationsServices)
                    console.log(this.reservationServices)
                }
            } catch (err) {
                console.error("Error al obtener los servicios de la reservación:", err)
                this.error = err.response?.data?.message || err.message || "Error al obtener los servicios de la reservación"
            } finally {
                this.loading = false
            }
        },

        /**
         * Elimina todos los servicios asociados a una reservación específica.
         * @param reservationId
         * @returns {Promise<void>}
         */
        async deleteServicesByReservation(reservationId) {
            this.loading = true
            this.error = null
            try {
                await ReservationApi.deleteByResevationId(reservationId)
                this.reservationServices = this.reservationServices.filter(s => s.reservationId !== reservationId)
            } catch (err) {
                console.error("Error al eliminar los servicios de la reservación:", err)
                this.error = err.response?.data?.message || err.message || "Error al eliminar los servicios de la reservación"
            } finally {
                this.loading = false
            }
        },

        /**
         * Obtiene las relaciones de reservación por ID de servicio.
         * @param serviceId
         * @returns {Promise<void>}
         */
        async getReservationServicesByService(serviceId) {
            this.loading = true
            this.error = null
            try {
                const res = await ReservationApi.getReservationsByService(serviceId)
                this.reservationServices = res.data
            } catch (err) {
                console.error("Error al obtener las relaciones por servicio:", err)
                this.error = err.response?.data?.message || err.message || "Error al obtener las relaciones por servicio"
            } finally {
                this.loading = false
            }
        },

        /**
         * Busca relaciones de reservación según los filtros proporcionados.
         * @param filters {reservationId, serviceId, page, size, sortBy, sortDir}
         * @returns {Promise<void>}
         */
        async searchReservationServices(filters = {}) {
            this.loading = true
            this.error = null
            try {
                const res = await ReservationApi.searchRelations(filters)
                this.reservationServices = res.data.content
            } catch (err) {
                console.error("Error al buscar relaciones de reservación:", err)
                this.error = err.response?.data?.message || err.message || "Error al buscar relaciones de reservación"
            } finally {
                this.loading = false
            }
        },
    },
})
