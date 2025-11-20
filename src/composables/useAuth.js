import { ref, computed } from 'vue'
import AuthApi from '../api/AuthApi.js'
import UserApi from '../api/UserApi.js'
import { getUserIdFromToken } from '../utils/jwtUtils.js'

// Estado global de autenticación (singleton)
const token = ref(localStorage.getItem('token') || null)
const username = ref(null)
const roles = ref([])
const user = ref(null)
const loading = ref(false)
const error = ref(null)
const isAuthenticated = ref(false)

export function useAuth() {
  // Getters computados
  const hasRole = computed(() => (roleName) => {
    return roles.value.some(role => 
      role.toLowerCase() === roleName.toLowerCase() || 
      role.toLowerCase().includes(roleName.toLowerCase())
    )
  })

  const isOwner = computed(() => {
    return roles.value.some(role => 
      role.toLowerCase().includes('owner') || 
      role.toLowerCase().includes('dueno')
    )
  })

  const isCarer = computed(() => {
    return roles.value.some(role => 
      role.toLowerCase().includes('carer') || 
      role.toLowerCase().includes('cuidador')
    )
  })

  const isAdmin = computed(() => {
    return roles.value.some(role => 
      role.toLowerCase().includes('admin')
    )
  })

  const userId = computed(() => {
    if (user.value?.id) {
      return user.value.id
    }
    if (token.value) {
      try {
        return getUserIdFromToken(token.value)
      } catch (err) {
        return null
      }
    }
    return null
  })

  // Acciones
  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      const response = await AuthApi.login({ email, password })
      const newToken = response.data.token
      
      if (!newToken) {
        throw new Error('No se recibió token del servidor')
      }

      token.value = newToken
      localStorage.setItem('token', newToken)

      await validateToken()
      
      return { success: true }
    } catch (err) {
      if (err.isCorsError) {
        error.value = 'Error de conexión: Problema de CORS con el servidor. Verifica que el backend esté configurado correctamente.'
      } else {
        error.value = err.response?.data?.message || err.message || 'Error al iniciar sesión'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(registerData) {
    loading.value = true
    error.value = null
    try {
      const response = await AuthApi.register(registerData)
      const newToken = response.data.token
      
      if (!newToken) {
        throw new Error('No se recibió token del servidor')
      }

      token.value = newToken
      localStorage.setItem('token', newToken)

      await validateToken()
      
      return { success: true }
    } catch (err) {
      if (err.isCorsError) {
        error.value = 'Error de conexión: Problema de CORS con el servidor. Verifica que el backend esté configurado correctamente.'
      } else if (err.isTimeoutError || err.response?.status === 504) {
        error.value = 'El servidor está tardando demasiado en responder. Verifica que:\n' +
          '1. El microservicio de usuario esté corriendo\n' +
          '2. El microservicio esté registrado en Eureka\n' +
          '3. El gateway pueda comunicarse con el microservicio'
      } else if (err.isMethodError || err.response?.status === 405) {
        error.value = 'Error 405: Método HTTP no permitido.\n' +
          '1. Reinicia el servidor de desarrollo de Vite (Ctrl+C y luego npm run dev)\n' +
          '2. Verifica que el gateway esté corriendo en el puerto 8080\n' +
          '3. Verifica que la ruta /auth/login esté configurada para POST en el gateway'
      } else {
        error.value = err.response?.data?.message || err.message || 'Error al registrar usuario'
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  async function validateToken() {
    if (!token.value) {
      isAuthenticated.value = false
      return false
    }

    try {
      const response = await AuthApi.validateToken(token.value)
      const data = response.data

      username.value = data.username
      roles.value = Array.isArray(data.roles) ? data.roles : []
      isAuthenticated.value = true

      // Cargar datos completos del usuario si tenemos el email
      if (username.value) {
        try {
          const userResponse = await UserApi.getUserByEmail(username.value)
          user.value = userResponse.data || null
          if (user.value && !user.value.id) {
            console.warn('Usuario cargado pero sin ID:', user.value)
          }
        } catch (err) {
          console.warn('No se pudo cargar datos completos del usuario:', err)
        }
      }

      return true
    } catch (err) {
      console.error('Error validando token:', err)
      logout()
      return false
    }
  }

  function logout() {
    token.value = null
    username.value = null
    roles.value = []
    user.value = null
    isAuthenticated.value = false
    error.value = null
    localStorage.removeItem('token')
  }

  async function initAuth() {
    if (token.value) {
      await validateToken()
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // Estado
    token,
    username,
    roles,
    user,
    loading,
    error,
    isAuthenticated,
    // Getters
    hasRole,
    isOwner,
    isCarer,
    isAdmin,
    userId,
    // Acciones
    login,
    register,
    validateToken,
    logout,
    initAuth,
    clearError
  }
}

