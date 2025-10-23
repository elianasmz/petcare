import { defineStore } from 'pinia'
import CarerApi from '../api/CarerApi.js'

export const useCarersStore = defineStore('carers', {
    state: () => ({
        carers: [],
        currentCarer: null,
        loading: false,
        error: null
    }),

    getters: {
        /**
         * Obtener nombre del cuidador
         */
        getCarerName: (state) => (id) => {
            const carer = state.carers.find(c => c.id === id)
            return carer ? carer.user?.name || 'Desconocido' : 'Desconocido'
        },

        /**
         * Obtener apellido del cuidador
         */
        getCarerLastName: (state) => (id) => {
            const carer = state.carers.find(c => c.id === id)
            return carer ? carer.user?.lastName || 'Desconocido' : 'Desconocido'
        },

        /**
         * Obtener email del cuidador
         */
        getCarerEmail: (state) => (id) => {
            const carer = state.carers.find(c => c.id === id)
            return carer ? carer.user?.email || 'Desconocido' : 'Desconocido'
        },

        /**
         * Obtener foto del cuidador
         */
        getCarerPhoto: (state) => (id) => {
            const carer = state.carers.find(c => c.id === id)
            if (carer?.user?.profilePhoto) {
                return carer.user.profilePhoto
            }
            // Foto por defecto basada en el ID
            const gender = id % 2 === 0 ? 'men' : 'women'
            const photoIndex = (id * 10) % 100
            return `https://randomuser.me/api/portraits/${gender}/${photoIndex}.jpg`
        },

        /**
         * Obtener nombre completo del cuidador
         */
        getCarerFullName: (state) => (id) => {
            const carer = state.carers.find(c => c.id === id)
            if (carer?.user) {
                return `${carer.user.name} ${carer.user.lastName}`
            }
            return 'Desconocido'
        },

        /**
         * Verificar si hay cuidadores cargados
         */
        hasCarers: (state) => state.carers.length > 0,

        /**
         * Obtener solo cuidadores disponibles
         */
        availableCarers: (state) => {
            return state.carers.filter(c => c.availabilityState === 'AVAILABLE')
        }
    },

    actions: {
        // ==================== CARERS ====================

        /**
         * Obtener todos los cuidadores (sin servicios)
         * GET /carers
         */
        async fetchCarers() {
            this.loading = true
            this.error = null
            try {
                const { data } = await CarerApi.getCarers()
                this.carers = data || []
                //return data
            } catch (err) {
                this.error = err.response?.data?.message || err.message || 'Error cargando cuidadores'
                console.error('Error en fetchCarers:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        /**
         * Obtener cuidador por ID desde el estado
         */
        getCarerById(id) {
            return this.carers.find(c => c.user.id === id)
        },


        /**
         * Obtener cuidador con servicios
         * GET /carers-with-services/{carerId}
         */
        async fetchCarerWithServices(carerId) {
            this.loading = true
            this.error = null
            try {
                const { data } = await CarerApi.getCarerWithServices(carerId)
                this.currentCarer = data
                
                // También actualizar en el array si existe
                const index = this.carers.findIndex(c => c.id === carerId)
                if (index >= 0) {
                    this.carers[index] = data
                } else {
                    this.carers.push(data)
                }
                
                return data
            } catch (err) {
                this.error = err.response?.data?.message || err.message || 'Error obteniendo cuidador con servicios'
                console.error('Error en fetchCarerWithServices:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        /**
         * Crear cuidador con servicios (cabecera-detalle)
         * POST /carers-with-services
         */
        async createCarerWithServices(carerData) {
            this.loading = true
            this.error = null
            try {
                const { data } = await CarerApi.createCarerWithServices(carerData)
                this.carers.push(data)
                return data
            } catch (err) {
                this.error = err.response?.data?.message || err.message || 'Error creando cuidador con servicios'
                console.error('Error en createCarerWithServices:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        /**
         * Actualizar cuidador con servicios (cabecera-detalle)
         * PUT /carers-with-services/{carerId}
         */
        async updateCarerWithServices(carerId, carerData) {
            this.loading = true
            this.error = null
            try {
                const { data } = await CarerApi.updateCarerWithServices(carerId, carerData)
                const index = this.carers.findIndex(c => c.id === carerId)
                if (index >= 0) {
                    this.carers[index] = data
                }
                if (this.currentCarer?.id === carerId) {
                    this.currentCarer = data
                }
                return data
            } catch (err) {
                this.error = err.response?.data?.message || err.message || 'Error actualizando cuidador con servicios'
                console.error('Error en updateCarerWithServices:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // ==================== MÉTODOS DE COMPATIBILIDAD ====================
        /**
         * Obtener todos los cuidadores
         */
        getAllCarers() {
            return this.carers
        },

        // ==================== UTILIDADES ====================

        /**
         * Limpiar el estado de cuidadores
         */
        clearCarers() {
            this.carers = []
            this.currentCarer = null
            this.error = null
        },

        /**
         * Limpiar solo el error
         */
        clearError() {
            this.error = null
        }
    }
})