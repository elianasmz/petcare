import { defineStore } from 'pinia'
import OwnerApi from '../api/OwnerApi.js'

export const useOwnerStore = defineStore('owners', {
    state: () => ({
        owners: [],
        currentOwner: null,
        loading: false,
        error: null
    }),

    getters: {
        /**
         * Obtener propietario por ID desde el estado
         */
        getOwnerById: (state) => (id) => {
            return state.owners.find(o => o.id === id)
        },

        /**
         * Obtener nombre del propietario
         */
        getOwnerName: (state) => (id) => {
            const owner = state.owners.find(o => o.id === id)
            return owner?.user?.name || owner?.name || 'Desconocido'
        },

        /**
         * Obtener apellido del propietario
         */
        getOwnerLastName: (state) => (id) => {
            const owner = state.owners.find(o => o.id === id)
            return owner?.user?.lastName || owner?.lastName || 'Desconocido'
        },

        /**
         * Obtener email del propietario
         */
        getOwnerEmail: (state) => (id) => {
            const owner = state.owners.find(o => o.id === id)
            return owner?.user?.email || owner?.email || 'Desconocido'
        },

        /**
         * Obtener foto del propietario
         */
        getOwnerPhoto: (state) => (id) => {
            const owner = state.owners.find(o => o.id === id)
            if (owner?.user?.profilePhoto || owner?.photo) {
                return owner.user?.profilePhoto || owner.photo
            }
            // Imagen por defecto aleatoria
            const gender = id % 2 === 0 ? 'men' : 'women'
            const photoIndex = (id * 10) % 100
            return `https://randomuser.me/api/portraits/${gender}/${photoIndex}.jpg`
        },

        /**
         * Obtener nombre completo del propietario
         */
        getOwnerFullName: (state) => (id) => {
            const owner = state.owners.find(o => o.id === id)
            if (owner?.user) {
                return `${owner.user.name} ${owner.user.lastName}`
            }
            if (owner?.name) {
                return `${owner.name} ${owner.lastName || ''}`.trim()
            }
            return 'Desconocido'
        },

        /**
         * Verificar si hay propietarios cargados
         */
        hasOwners: (state) => state.owners.length > 0
    },

    actions: {
        // ==================== OWNERS ====================

        /**
         * Obtener todos los propietarios
         * GET /owners
         */
        async fetchOwners() {
            this.loading = true
            this.error = null
            try {
                const { data } = await OwnerApi.getOwners()
                this.owners = data || []
                return data
            } catch (err) {
                this.error = err.response?.data?.message || err.message || 'Error cargando propietarios'
                console.error('Error en fetchOwners:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        /**
         * Obtener propietario por ID
         * GET /owners/{id}
         */
        async fetchOwnerById(ownerId) {
            this.loading = true
            this.error = null
            try {
                const { data } = await OwnerApi.getOwnerById(ownerId)
                this.currentOwner = data

                // Actualizar o agregar en la lista local
                const index = this.owners.findIndex(o => o.id === ownerId)
                if (index >= 0) {
                    this.owners[index] = data
                } else {
                    this.owners.push(data)
                }

                return data
            } catch (err) {
                this.error = err.response?.data?.message || err.message || 'Error obteniendo propietario'
                console.error('Error en fetchOwnerById:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // ==================== UTILIDADES ====================

        /**
         * Limpiar la lista de propietarios
         */
        clearOwners() {
            this.owners = []
            this.currentOwner = null
            this.error = null
        },

        /**
         * Limpiar error
         */
        clearError() {
            this.error = null
        }
    }
})