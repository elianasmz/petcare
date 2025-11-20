import { ref } from 'vue'
import UserApi from '../api/UserApi.js'

const currentUser = ref(null)
const users = ref([])
const loading = ref(false)
const error = ref(null)

export function useUsers() {
  async function fetchUserById(id) {
    loading.value = true
    error.value = null
    try {
      const { data } = await UserApi.getUserById(id)
      currentUser.value = data
      return data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUserByEmail(email) {
    loading.value = true
    error.value = null
    try {
      const { data } = await UserApi.getUserByEmail(email)
      currentUser.value = data
      if (data && data.id) {
        try {
          await fetchUserRoles(data.id)
        } catch (roleErr) {
          console.warn('No se pudieron cargar los roles del usuario:', roleErr)
        }
      }
      return data
    } catch (err) {
      error.value = err.response?.data?.message || err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUserRoles(userId) {
    try {
      const { data } = await UserApi.getUserRoles(userId)
      if (currentUser.value) {
        currentUser.value.roles = data || []
      }
      return data
    } catch (err) {
      console.warn('Error al cargar roles:', err)
      throw err
    }
  }

  function clearCurrentUser() {
    currentUser.value = null
  }

  return {
    currentUser,
    users,
    loading,
    error,
    fetchUserById,
    fetchUserByEmail,
    fetchUserRoles,
    clearCurrentUser,
  }
}

