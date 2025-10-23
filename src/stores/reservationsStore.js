import {defineStore} from "pinia"
import ReservationApi from "../api/ReservationApi.js"
import {useOwnerStore} from "./ownerStore.js";
import {useCarersStore} from "./carersStore.js";
import {useServicesStore} from "./servicesStore.js";

export const useReservationsStore = defineStore("reservations", {
    state: () => ({
        reservations: [], // Lista de reservaciones
        reservationServices: [], // Servicios asociados a una reservación
        selectedReservation: null, // Reservación seleccionada
        selectedServices: null, // Servicios seleccionados de una reservación

        // Parámetros de paginación y ordenamiento
        pagitation: {
            page: 0,
            size: 10,
            sortBy: 'id',
            sortDir: 'DESC',
        },

        // Información de paginación recibida del backend
        pageable: {
            pageNumber: 0,
            pageSize: 10,
            totalElements: 0,
            totalPages: 0,
        },

        // Estados de reservación
        states: {
            'PENDING': 'Pendiente',
            'ACCEPTED': 'Aceptada',
            'REJECTED': 'Rechazada',
            'FINISHED': 'Finalizada',
        },
        statesBack:{
            "Pendiente": "PENDING",
            "Aceptada": "ACCEPTED",
            "Rechazada": "REJECTED",
            "Finalizada": "FINISHED",
        },

        // Filtros de búsqueda
        filter: {
            state: "Todas",
            ownerId: null,
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
                await carerStore.fetchAllCarers();
                const ownerStore = useOwnerStore()

                // Obtener la reserva base
                const reservationBase = await ReservationApi.getAllReservations(params || this.pagitation)
                const reservation = reservationBase.data.content || []
                // Actualizar la información de paginación
                this.pageable.pageNumber = reservationBase.data.pageable.pageNumber;
                this.pageable.pageSize = reservationBase.data.pageable.pageSize;
                this.pageable.totalElements = reservationBase.data.totalElements;
                this.pageable.totalPages = reservationBase.data.totalPages;

                // Cargar datos adicionales de carer y owner
                const relationsUsers = reservation.map(async (res) => {
                    const carer = await carerStore.getCarerByIdMy(res.carerId)
                    const owner = await ownerStore.getOwnerById(res.ownerId)
                    return {
                        ...res,
                        carer: carer ? carer : 'Desconocido',
                        owner: owner ? owner : 'Desconocido',
                    }
                })
                this.reservations = await Promise.all(relationsUsers)

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
                await carerStore.fetchAllCarers()
                const ownerStore = useOwnerStore()

                // Obtener la reservación base
                const reservationBase = await ReservationApi.getReservationById(id)
                const reservation = reservationBase.data || null

                // Cargar datos adicionales de carer y owner
                const carer = await carerStore.getCarerByIdMy(reservation.carerId)
                const owner = await ownerStore.getOwnerById(reservation.ownerId)
                this.selectedReservation = {
                    ...reservation,
                    carer: carer ? carer : 'Desconocido',
                    owner: owner ? owner : 'Desconocido',
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
         * @param filters {ownerId, carerId, startDate, endDate, reservationState, page, size, sortBy, sortDir}
         * @returns {Promise<void>}
         */
        async searchReservations(params = {}) {
            this.loading = true
            this.error = null
            try {
                // Instancias de los stores
                const carerStore = useCarersStore()
                await carerStore.fetchAllCarers();
                const ownerStore = useOwnerStore()

                const query = {
                    ownerId: this.filter.ownerId || params.ownerId,
                    state: this.filter.state !== "Todas" ? this.statesBack[this.filter.state] : undefined,
                    page: params.page ?? this.pageable.pageNumber,
                    size: params.size ?? this.pageable.pageSize,
                    sortBy: params.sortBy || "serviceDate",
                    sortDir: params.sortDir || "desc",
                };

                // Obtener la base de reservaciones
                const res = await ReservationApi.searchReservations(query)
                const reservationBase = res.data.content
                // Actualizar la información de paginación
                this.pageable.pageNumber = res.data.pageable.pageNumber;
                this.pageable.pageSize = res.data.pageable.pageSize;
                this.pageable.totalElements = res.data.totalElements;
                this.pageable.totalPages = res.data.totalPages;

                // Cargar datos adicionales de carer y owner
                const relationsUsers = reservationBase.map(async (res) => {
                    const carer = carerStore.getCarerByIdMy(res.carerId)
                    const owner = await ownerStore.getOwnerById(res.ownerId)
                    return {
                        ...res,
                        carer: carer ? carer.user : 'Desconocido',
                        owner: owner ? owner : 'Desconocido',
                    }
                })
                this.reservations = await Promise.all(relationsUsers)
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
        async getAllReservationServices(params = {sortDir: 'ASC'}) {
            this.loading = true
            this.error = null
            try {
                // Instancia del store de services
                const serviceStore = useServicesStore()

                // Obtener la base de servicios de reservación
                const resBase = await ReservationApi.getAllRelations({sortDir: 'ASC'})
                const services = resBase.data.content || []
                // Actualizar la información de paginación
                //this.pageable.pageNumber = resBase.data.pageable.pageNumber;
                //this.pageable.pageSize = resBase.data.pageable.pageSize;
                //this.pageable.totalElements = resBase.data.totalElements;
                //this.pageable.totalPages = resBase.data.totalPages;

                // Cargar datos adicionales de service
                const relationsServices = services.map(async (rs) => {
                    const service = await serviceStore.fetchServiceTypeById(rs.serviceId)
                    return {
                        ...rs,
                        service: service ? service : 'Desconocido',
                    }
                })
                this.reservationServices = await Promise.all(relationsServices)
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
                const resBase = await ReservationApi.getRelationById(reservationId, {sortDir: 'ASC'})
                const services = resBase.data

                // Cargar datos adicionales de service
                const relationsServices = services.map(async (rs) => {
                    const service = await serviceStore.fetchServiceTypeById(rs.serviceId)
                    return {
                        ...rs,
                        service: service ? service : 'Desconocido',
                    }
                })
                this.selectedServices = await Promise.all(relationsServices)
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
                // Actualizar la información de paginación
                this.pageable.pageNumber = resBase.data.pageable?.pageNumber || 0;
                this.pageable.pageSize = resBase.data.pageable?.pageSize || services.length;
                this.pageable.totalElements = resBase.data.totalElements || services.length;
                this.pageable.totalPages = resBase.data.totalPages || 1;

                // Cargar datos adicionales de service
                const relationsServices = services.map(async (rs) => {
                    const service = await serviceStore.fetchServiceTypeById(rs.serviceId)
                    console.log(service)
                    return {
                        ...rs,
                        service: service ? service : 'Desconocido',
                    }
                })
                this.selectedService = await Promise.all(relationsServices)
                console.log(this.selectedService.target)

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
                // Instancia del store de services
                const serviceStore = useServicesStore()
                //
                const res = await ReservationApi.searchRelations(filters)
                const resBase = res.data.content
                // Cargar datos adicionales de service
                const relationsServices = resBase.map(async (rs) => {
                    const service = await serviceStore.fetchServiceTypeById(rs.serviceId)
                    return {
                        ...rs,
                        service: service ? service : 'Desconocido',
                    }
                })
                this.reservationServices = await Promise.all(relationsServices)
            } catch (err) {
                console.error("Error al buscar relaciones de reservación:", err)
                this.error = err.response?.data?.message || err.message || "Error al buscar relaciones de reservación"
            } finally {
                this.loading = false
            }
        },
    },
})
