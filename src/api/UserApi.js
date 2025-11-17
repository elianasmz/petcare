import { axiosInstance } from './axiosInstance.js'

class UserApi {
    constructor() {
        this.userApi = axiosInstance

        this.userApi.interceptors.response.use(
            response => response,
            error => {
                console.error(`[UserApi] Error:`, error.response?.data || error.message)
                return Promise.reject(error)
            }
        )
    }

    // ==================== USERS ====================
    // Rutas a través del gateway: /users/** -> USER-MICROSERVICE (protegido)
    // El gateway maneja la autenticación y autorización

    /**
     * @param {object} params
     */
    getUsers(params = {}) {
        return this.userApi.get('/users', { params })
    }

    getUserById(id) {
        return this.userApi.get(`/users/${id}`)
    }

    getUserByEmail(email) {
        return this.userApi.get(`/users/email/${email}`)
    }

    createUser(data) {
        return this.userApi.post('/users', data)
    }

    updateUser(id, data) {
        return this.userApi.put(`/users/${id}`, data)
    }

    deleteUser(id) {
        return this.userApi.delete(`/users/${id}`)
    }

    countUsers() {
        return this.userApi.get('/users/count')
    }

    // ==================== USER ROLES ====================

    getUserRoles(userId) {
        return this.userApi.get(`/users/${userId}/roles`)
    }

    /**
     * @param {number} userId
     * @param {object} data
     */
    assignRoleToUser(userId, data) {
        return this.userApi.post(`/users/${userId}/roles`, data)
    }

    removeRoleFromUser(userId, roleId) {
        return this.userApi.delete(`/users/${userId}/roles/${roleId}`)
    }

    // ==================== CHEQUEOS DE ROL (Utilidades) ====================

    isCarer(userId) {
        return this.userApi.get(`/users/${userId}/is-carer`)
    }

    isOwner(userId) {
        return this.userApi.get(`/users/${userId}/is-owner`)
    }

    hasRole(userId, roleName) {
        return this.userApi.get(`/users/${userId}/has-role/${roleName}`)
    }

    // ==================== LISTAS ESPECÍFICAS ====================

    getAvailableCarers() {
        return this.userApi.get('/users/carers/available')
    }

    // ==================== ROLES (Catálogo) ====================
    // Rutas a través del gateway: /roles/** -> USER-MICROSERVICE (protegido - solo admin)

    getRoles() {
        return this.userApi.get('/roles')
    }

    getRoleById(id) {
        return this.userApi.get(`/roles/${id}`)
    }

    createRole(data) {
        return this.userApi.post('/roles', data)
    }

    updateRole(id, data) {
        return this.userApi.put(`/roles/${id}`, data)
    }

    deleteRole(id) {
        return this.userApi.delete(`/roles/${id}`)
    }
    
    searchRoles(name) {
        return this.userApi.get(`/roles/search/${name}`)
    }

    // ==================== USER-ROLES ====================
    // Rutas a través del gateway: /user-roles/** -> USER-MICROSERVICE (protegido)

    getAllUserRoles() {
        return this.userApi.get('/user-roles')
    }

    deleteUserRole(userRoleId) {
        return this.userApi.delete(`/user-roles/${userRoleId}`)
    }
}

export default new UserApi()
