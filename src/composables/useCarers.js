import { ref } from 'vue'
import CarerApi from '../api/CarerApi.js'

const carers = ref([])
const loading = ref(false)
const error = ref(null)

export function useCarers() {
  async function fetchAllCarers() {
    loading.value = true
    error.value = null
    try {
      const { data } = await CarerApi.getAllCarers()
      carers.value = data || []
      return carers.value
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getCarerById(id) {
    // Primero buscar en cache
    const cached = carers.value.find(c => c.id === id || c.userId === id)
    if (cached) return cached

    // Si no está en cache, hacer petición
    try {
      const { data } = await CarerApi.getCarerById(id)
      if (data && !carers.value.find(c => c.id === data.id)) {
        carers.value.push(data)
      }
      return data
    } catch (err) {
      console.warn(`No se pudo obtener carer ${id}:`, err)
      return null
    }
  }

  return {
    carers,
    loading,
    error,
    fetchAllCarers,
    getCarerById,
  }
}

