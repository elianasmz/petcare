import { axiosInstance } from './axiosInstance.js'
import axios from 'axios'

// Crear una instancia específica para AuthApi sin interceptores adicionales
// para evitar que otros interceptores capturen errores de CORS
// Usar proxy en desarrollo para evitar CORS
const isDevelopment = import.meta.env.DEV
const authAxiosInstance = axios.create({
  baseURL: isDevelopment ? '/api' : 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 30000, // 30 segundos de timeout para registro (puede tardar más)
})

// Interceptor para agregar token automáticamente
authAxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de respuesta para manejar errores específicamente
authAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si es un error de CORS, proporcionar un mensaje más claro
    if (!error.response && error.message === 'Network Error') {
      const corsError = new Error('Error de CORS: El servidor no permite solicitudes desde este origen. Verifica la configuración CORS del backend.')
      corsError.isCorsError = true
      return Promise.reject(corsError)
    }
    
    // Si es un 504 (Gateway Timeout), proporcionar un mensaje más claro
    if (error.response?.status === 504) {
      const timeoutError = new Error('El servidor está tardando demasiado en responder. Verifica que el microservicio de usuario esté corriendo y registrado en Eureka.')
      timeoutError.isTimeoutError = true
      timeoutError.status = 504
      return Promise.reject(timeoutError)
    }
    
    // Si es un 405 (Method Not Allowed), puede ser un problema del proxy
    if (error.response?.status === 405) {
      const methodError = new Error('Método HTTP no permitido. Esto puede ser un problema del proxy. Intenta reiniciar el servidor de desarrollo de Vite.')
      methodError.isMethodError = true
      methodError.status = 405
      return Promise.reject(methodError)
    }
    
    return Promise.reject(error)
  }
)

class AuthApi {
    /**
     * Iniciar sesión
     * @param {object} loginData - { email, password }
     * @returns {Promise} Response con token
     */
    async login(loginData) {
        return authAxiosInstance.post('/auth/login', loginData)
    }

    /**
     * Registrar nuevo usuario
     * @param {object} registerData - { email, name, lastName, password, phoneNumber, state, roles }
     * @returns {Promise} Response con token
     */
    async register(registerData) {
        return authAxiosInstance.post('/auth/register', registerData)
    }

    /**
     * Validar token JWT
     * @param {string} token - Token JWT
     * @returns {Promise} Response con username y roles
     */
    async validateToken(token) {
        return authAxiosInstance.get('/auth/validate', {
            headers: {
                'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
            }
        })
    }
}

export default new AuthApi()

