import { ref } from 'vue'
import OwnerApi from '../api/OwnerApi.js'

const owners = ref([])
const loading = ref(false)
const error = ref(null)

export function useOwners() {
  async function fetchOwners() {
    loading.value = true
    error.value = null
    try {
      const { data } = await OwnerApi.getOwners()
      owners.value = data || []
      return owners.value
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getOwnerById(id) {
    // Primero buscar en cache
    const cached = owners.value.find(o => o.id === id || o.userId === id)
    if (cached) return cached

    // Si no está en cache, hacer petición
    try {
      const { data } = await OwnerApi.getOwnerById(id)
      if (data && !owners.value.find(o => o.id === data.id)) {
        owners.value.push(data)
      }
      return data
    } catch (err) {
      console.warn(`No se pudo obtener owner ${id}:`, err)
      return null
    }
  }

  return {
    owners,
    loading,
    error,
    fetchOwners,
    getOwnerById,
  }
}

