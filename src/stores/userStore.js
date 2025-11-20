import { defineStore } from 'pinia'
import AuthApi from '../api/AuthApi.js'
import { useUsersStore } from './usersStore.js'
import { getUserIdFromToken } from '../utils/jwtUtils.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    username: null,
    roles: [], // Lista de roles del usuario
    user: null, // Datos completos del usuario
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    hasRole: (state) => (roleName) => {
      return state.roles.some(role => 
        role.toLowerCase() === roleName.toLowerCase() || 
        role.toLowerCase().includes(roleName.toLowerCase())
      )
    },
    isOwner: (state) => {
      return state.roles.some(role => 
        role.toLowerCase().includes('owner') || 
        role.toLowerCase().includes('dueno')
      )
    },
    isCarer: (state) => {
      return state.roles.some(role => 
        role.toLowerCase().includes('carer') || 
        role.toLowerCase().includes('cuidador')
      )
    },
    isAdmin: (state) => {
      return state.roles.some(role => 
        role.toLowerCase().includes('admin')
      )
    },
    // Getter que obtiene el ID del usuario desde el store o del token como fallback
    userId: (state) => {
      if (state.user?.id) {
        return state.user.id
      }
      if (state.token) {
        try {
          return getUserIdFromToken(state.token)
        } catch (err) {
          return null
        }
      }
      return null
    }
  },

  actions: {
    /**
     * Iniciar sesión
     */
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const response = await AuthApi.login({ email, password })
        const token = response.data.token
        
        if (!token) {
          throw new Error('No se recibió token del servidor')
        }

        // Guardar token
        this.token = token
        localStorage.setItem('token', token)

        // Validar token para obtener roles
        await this.validateToken()
        
        return { success: true }
      } catch (err) {
        // Manejar errores CORS específicamente
        if (err.isCorsError) {
          this.error = 'Error de conexión: Problema de CORS con el servidor. Verifica que el backend esté configurado correctamente.'
        } else {
          this.error = err.response?.data?.message || err.message || 'Error al iniciar sesión'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Registrar nuevo usuario
     */
    async register(registerData) {
      this.loading = true
      this.error = null
      try {
        const response = await AuthApi.register(registerData)
        const token = response.data.token
        
        if (!token) {
          throw new Error('No se recibió token del servidor')
        }

        // Guardar token
        this.token = token
        localStorage.setItem('token', token)

        // Validar token para obtener roles
        await this.validateToken()
        
        return { success: true }
      } catch (err) {
        // Manejar errores específicamente
        if (err.isCorsError) {
          this.error = 'Error de conexión: Problema de CORS con el servidor. Verifica que el backend esté configurado correctamente.'
        } else if (err.isTimeoutError || err.response?.status === 504) {
          this.error = 'El servidor está tardando demasiado en responder. Verifica que:\n' +
            '1. El microservicio de usuario esté corriendo\n' +
            '2. El microservicio esté registrado en Eureka\n' +
            '3. El gateway pueda comunicarse con el microservicio'
        } else if (err.isMethodError || err.response?.status === 405) {
          this.error = 'Error 405: Método HTTP no permitido.\n' +
            '1. Reinicia el servidor de desarrollo de Vite (Ctrl+C y luego npm run dev)\n' +
            '2. Verifica que el gateway esté corriendo en el puerto 8080\n' +
            '3. Verifica que la ruta /auth/login esté configurada para POST en el gateway'
        } else {
          this.error = err.response?.data?.message || err.message || 'Error al registrar usuario'
        }
        throw err
      } finally {
        this.loading = false
      }
    },

    /**
     * Validar token y obtener información del usuario
     */
    async validateToken() {
      if (!this.token) {
        this.isAuthenticated = false
        return false
      }

      try {
        const response = await AuthApi.validateToken(this.token)
        const data = response.data

        this.username = data.username
        this.roles = Array.isArray(data.roles) ? data.roles : []
        this.isAuthenticated = true

        // Cargar datos completos del usuario si tenemos el email
        if (this.username) {
          try {
            const usersStore = useUsersStore()
            const userData = await usersStore.fetchUserByEmail(this.username)
            // Asegurarse de que el usuario se asigne correctamente
            this.user = userData || usersStore.currentUser || null
            if (this.user && !this.user.id) {
              console.warn('Usuario cargado pero sin ID:', this.user)
            }
          } catch (err) {
            console.warn('No se pudo cargar datos completos del usuario:', err)
            // No lanzar error aquí, solo registrar
          }
        }

        return true
      } catch (err) {
        console.error('Error validando token:', err)
        // Token inválido o expirado
        this.logout()
        return false
      }
    },

    /**
     * Cerrar sesión
     */
    logout() {
      this.token = null
      this.username = null
      this.roles = []
      this.user = null
      this.isAuthenticated = false
      this.error = null
      localStorage.removeItem('token')
    },

    /**
     * Inicializar autenticación al cargar la app
     */
    async initAuth() {
      if (this.token) {
        await this.validateToken()
      }
    },

    /**
     * Limpiar error
     */
    clearError() {
      this.error = null
    }
  }
})
