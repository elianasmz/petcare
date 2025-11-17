// src/api/axiosInstance.js
import axios from 'axios'

// Usar proxy en desarrollo para evitar CORS, URL directa en producción
const isDevelopment = import.meta.env.DEV
const API_BASE_URL = isDevelopment ? '/api' : 'http://localhost:8080'

// Cliente Axios reutilizable
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// ✅ Interceptor para agregar token automáticamente
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ⚠️ Interceptor para manejar errores globales
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('token')
      window.dispatchEvent(new CustomEvent('unauthorized'))
    }
    return Promise.reject(error)
  }
)
