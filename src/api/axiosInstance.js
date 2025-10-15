// src/api/axiosInstance.js
import axios from 'axios'

// 🔧 Mapa de URLs locales (puedes agregar o cambiar los puertos fácilmente)
const API_BASES = {
    reservation: 'http://localhost:8081/api/v1',
    payment: 'http://localhost:8082/api/v1',
    service: 'http://localhost:8083/api/v1'
}

// 🧠 Función para obtener un cliente Axios configurado
export const getAxiosInstance = (serviceName = 'reservation') => {
    const baseURL = API_BASES[serviceName]

    if (!baseURL) {
        console.warn(`No se encontró baseURL para el servicio "${serviceName}". Se usará /.`)
    }

    const instance = axios.create({
        baseURL: baseURL || '/',
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
    })

    // ✅ Interceptor para token
    /*instance.interceptors.request.use((config) => {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
    })*/

    // ⚠️ Interceptor para manejar errores globales
    /*instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                window.dispatchEvent(new CustomEvent('unauthorized'))
            }
            return Promise.reject(error)
        }
    )*/

    return instance
}
