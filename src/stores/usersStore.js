import { defineStore } from 'pinia'
import UserApi from '../api/UserApi.js'

export const useUsersStore = defineStore('users', {
    state: () => ({
        users: [],
        roles: [],
        userRoles: [],
        currentUser: null,
        currentUserRoles: [],
        loading: false,
        error: null,
        pagination: {
            totalElements: 0,
            totalPages: 0,
            size: 20,
            number: 0
        }
    }),

    getters: {
        getUserById: (state) => (id) => state.users.find(u => u.id === id),
        getRoleById: (state) => (id) => state.roles.find(r => r.id === id),
        getRoleByName: (state) => (name) => state.roles.find(r => r.name?.toLowerCase() === name?.toLowerCase()),
        hasUsers: (state) => state.users.length > 0,
        hasRoles: (state) => state.roles.length > 0
    },

    actions: {
        // ==================== USERS ====================

        async fetchUsers(params = {}) {
            this.loading = true
            this.error = null
            try {
                const { data } = await UserApi.getUsers(params)
                this.users = data.content || []
                if (data.totalElements !== undefined) {
                    this.pagination = { totalElements: data.totalElements, totalPages: data.totalPages, size: data.size, number: data.number }
                }
            } catch (err) { this.error = err.response?.data?.message || err.message }
            finally { this.loading = false }
        },

        async fetchUserById(id) {
            this.loading = true
            this.error = null
            try {
                const { data } = await UserApi.getUserById(id)
                this.currentUser = data
                if (data) {
                    await this.fetchUserRoles(id);
                }
                return data
            } catch (err) { this.error = err.response?.data?.message || err.message; throw err }
            finally { this.loading = false }
        },

        async fetchUserByEmail(email) {
            this.loading = true
            this.error = null
            try {
                const { data } = await UserApi.getUserByEmail(email)
                return data
            } catch (err) {
                this.error = err.response?.data?.message || err.message
                console.error('Error en fetchUserByEmail:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async createUser(userData) {
            this.loading = true
            this.error = null
            try {
                const { data } = await UserApi.createUser(userData)
                // Opcional: añadir a la lista local
                // this.users.push(data) 
                return data
            } catch (err) { this.error = err.response?.data?.message || err.message; throw err }
            finally { this.loading = false }
        },

        async updateUser(id, userData) {
            this.loading = true
            this.error = null
            try {
                const { data } = await UserApi.updateUser(id, userData)
                const index = this.users.findIndex(u => u.id === id)
                if (index >= 0) this.users[index] = data
                if (this.currentUser?.id === id) this.currentUser = data
                return data
            } catch (err) { this.error = err.response?.data?.message || err.message; throw err }
            finally { this.loading = false }
        },

        async deleteUser(id) {
            this.loading = true
            this.error = null
            try {
                await UserApi.deleteUser(id)
                this.users = this.users.filter(u => u.id !== id)
                if (this.currentUser?.id === id) this.currentUser = null
            } catch (err) { this.error = err.response?.data?.message || err.message; throw err }
            finally { this.loading = false }
        },

        async countUsers() {
            this.loading = true
            this.error = null
            try {
                const { data } = await UserApi.countUsers()
                return data // Devuelve un número (long)
            } catch (err) { this.error = err.response?.data?.message || err.message; throw err }
            finally { this.loading = false }
        },

        // ==================== USER ROLES ====================

        async fetchUserRoles(userId) {
            this.loading = true
            this.error = null
            try {
                const { data } = await UserApi.getUserRoles(userId)
                if (this.currentUser?.id === userId) {
                    this.currentUserRoles = data || [];
                }
                return data || [];
            } catch (err) { this.error = err.response?.data?.message || err.message; throw err }
            finally { this.loading = false }
        },

        async assignRoleToUser(userId, roleId) {
            this.loading = true
            this.error = null
            try {
                await UserApi.assignRoleToUser(userId, { roleId: roleId })
                if (this.currentUser?.id === userId) {
                    await this.fetchUserRoles(userId);
                }
            } catch (err) { this.error = err.response?.data?.message || err.message; throw err }
            finally { this.loading = false }
        },

        async removeRoleFromUser(userId, roleId) {
            this.loading = true
            this.error = null
            try {
                await UserApi.removeRoleFromUser(userId, roleId)
                if (this.currentUser?.id === userId) {
                    await this.fetchUserRoles(userId);
                }
            } catch (err) { this.error = err.response?.data?.message || err.message; throw err }
            finally { this.loading = false }
        },

        // ==================== CHEQUEOS DE ROL ====================

        async checkIsCarer(userId) {
            try { const { data } = await UserApi.isCarer(userId); return data.hasRole; }
            catch (err) { console.error("Error checkIsCarer:", err); return false; }
        },
        async checkIsOwner(userId) {
            try { const { data } = await UserApi.isOwner(userId); return data.hasRole; }
            catch (err) { console.error("Error checkIsOwner:", err); return false; }
        },
        async checkHasRole(userId, roleName) {
            try { const { data } = await UserApi.hasRole(userId, roleName); return data.hasRole; }
            catch (err) { console.error(`Error checkHasRole ${roleName}:`, err); return false; }
        },

        // ==================== LISTAS ESPECÍFICAS ====================

        async fetchAvailableCarers() {
            this.loading = true; this.error = null;
            try { 
                const { data } = await UserApi.getAvailableCarers(); 
                return data || []; // Devuelve UserResponseDTO[]
            }
            catch (err) { this.error = err.response?.data?.message || err.message; throw err }
            finally { this.loading = false }
        },

        // ==================== ROLES (Catálogo) ====================

        async fetchRoles() {
            if (this.roles.length > 0) return; 
            
            this.loading = true; this.error = null;
            try { 
                const { data } = await UserApi.getRoles(); 
                this.roles = data || []; 
            }
            catch (err) { this.error = err.response?.data?.message || err.message }
            finally { this.loading = false }
        },
        async createRole(roleData) {
            this.loading = true; this.error = null;
            try { 
                const { data } = await UserApi.createRole(roleData); 
                this.roles.push(data); // Actualiza el catálogo
                return data; 
            }
            catch (err) { this.error = err.response?.data?.message || err.message; throw err }
            finally { this.loading = false }
        },

        // ==================== USER-ROLES ====================

        async fetchAllUserRoles() {
            this.loading = true; this.error = null;
            try { 
                const { data } = await UserApi.getAllUserRoles(); 
                this.userRoles = data || []; 
            }
            catch (err) { this.error = err.response?.data?.message || err.message }
            finally { this.loading = false }
        },
        async deleteUserRoleRelationship(userRoleId) {
            this.loading = true; this.error = null;
            try { 
                await UserApi.deleteUserRole(userRoleId); 
                this.userRoles = this.userRoles.filter(ur => ur.id !== userRoleId); 
            }
            catch (err) { this.error = err.response?.data?.message || err.message; throw err }
            finally { this.loading = false }
        },

        // ==================== UTILIDADES ====================
        clearCurrentUser() { 
            this.currentUser = null; 
            this.currentUserRoles = []; 
        },
        clearError() { 
            this.error = null 
        }
    }
})
