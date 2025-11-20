import { ref } from 'vue'
import ServiceApi from '../api/ServiceApi.js'

const services = ref([])
const serviceTypes = ref([])
const loading = ref(false)
const error = ref(null)

export function useServices() {
  async function fetchServiceTypes() {
    loading.value = true
    error.value = null
    try {
      const { data } = await ServiceApi.getServiceTypes()
      serviceTypes.value = 
        Array.isArray(data) ? data :
        Array.isArray(data?.content) ? data.content :
        Array.isArray(data?.serviceTypes) ? data.serviceTypes :
        []
      return serviceTypes.value
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchServiceTypeById(id) {
    try {
      const { data } = await ServiceApi.getServiceTypeById(id)
      return data
    } catch (err) {
      console.warn(`No se pudo obtener service type ${id}:`, err)
      return null
    }
  }

  async function fetchServices(params = {}) {
    loading.value = true
    error.value = null
    try {
      const { data } = await ServiceApi.getServices(params)
      services.value = data?.content || data || []
      return services.value
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchServicesByCarer(carerId) {
    loading.value = true
    error.value = null
    try {
      const { data } = await ServiceApi.getServicesByCarer(carerId, 0, 100)
      return data?.content || data || []
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createService(data) {
    loading.value = true
    error.value = null
    try {
      const { data: newService } = await ServiceApi.createService(data)
      services.value.push(newService)
      return newService
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateService(id, data) {
    loading.value = true
    error.value = null
    try {
      const { data: updatedService } = await ServiceApi.updateService(id, data)
      const index = services.value.findIndex(s => s.id === id)
      if (index !== -1) {
        services.value[index] = updatedService
      }
      return updatedService
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteService(id) {
    loading.value = true
    error.value = null
    try {
      await ServiceApi.deleteService(id)
      services.value = services.value.filter(s => s.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearServices() {
    services.value = []
  }

  function clearError() {
    error.value = null
  }

  return {
    services,
    serviceTypes,
    loading,
    error,
    fetchServiceTypes,
    fetchServiceTypeById,
    fetchServices,
    fetchServicesByCarer,
    createService,
    updateService,
    deleteService,
    clearServices,
    clearError,
  }
}

