<script setup>
import { onMounted, ref, reactive, computed } from "vue"
import { useRouter } from "vue-router"
import { useServicesStore } from "../stores/servicesStore.js"
import { useUsersStore } from "../stores/usersStore.js"
import { useUserStore } from "../stores/userStore.js"

const router = useRouter()
const servicesStore = useServicesStore()
const usersStore = useUsersStore()
const userStore = useUserStore()

// Obtener ID del usuario autenticado (computado para reactividad)
const loggedInUserId = computed(() => {
  return userStore.user?.id || null
}) 

// Referencia al formulario de servicio
const serviceFormRef = ref(null)

// 4. Usar 'currentUser' del userStore como base para el perfil
const carerProfile = computed(() => usersStore.currentUser)
const loading = ref(false)

// Formulario de servicio (crear/editar)
const serviceForm = reactive({
  id: null,
  typeId: null,
  price: 0,
  description: "",
})
const isEditing = ref(false)

// Cargar datos al montar
onMounted(async () => {
  // Verificar autenticación
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }

  // Verificar que sea cuidador
  if (!userStore.isCarer) {
    router.push('/')
    return
  }

  loading.value = true
  try {
    // Si no tenemos el usuario completo, cargarlo
    if (!userStore.user || !userStore.user.id) {
      if (userStore.username) {
        await usersStore.fetchUserByEmail(userStore.username)
        // Actualizar el userStore con los datos completos
        if (usersStore.currentUser) {
          userStore.user = usersStore.currentUser
        }
      } else {
        throw new Error('No se pudo obtener el email del usuario autenticado')
      }
    }

    // Obtener el ID del usuario
    const userId = userStore.user?.id
    
    if (!userId) {
      console.error('Usuario cargado pero sin ID:', userStore.user)
      throw new Error('No se pudo obtener el ID del usuario. El usuario no tiene ID asignado.')
    }

    // Cargar datos del perfil del usuario (cuidador)
    await usersStore.fetchUserById(userId)
    
    // Actualizar userStore con los datos completos del usuario
    if (usersStore.currentUser) {
      userStore.user = usersStore.currentUser
    }
    
    // Cargar los tipos de servicio (para el dropdown)
    await servicesStore.fetchServiceTypes()
    
    // Cargar los servicios de ESTE cuidador
    await servicesStore.fetchServices({ carerId: userId, size: 100 })
    
  } catch (err) {
    console.error('Error cargando datos del dashboard:', err)
    servicesStore.error = "Error al cargar los datos del panel."
  } finally {
    loading.value = false
  }
})

// --- Funciones de UI (Computadas) ---

function getServiceTypeName(typeId) {
  const type = servicesStore.serviceTypes.find(t => t.id === typeId)
  return type ? type.name : `Tipo ${typeId}`
}

function getAvailabilityLabel(state) {
  const translations = {
    'AVAILABLE': 'Disponible',
    'NOT_AVAILABLE': 'No disponible',
    'BUSY': 'Ocupado'
  }
  return translations[state] || 'Desconocido'
}

// --- Acciones de Formulario de Servicios ---

async function handleSubmit() {
  if (isEditing.value) {
    await updateService()
  } else {
    await addService()
  }
}

async function addService() {
  if (!validateForm()) return
  const userId = userStore.user?.id
  if (!userId) {
    alert("Error: No se pudo obtener el ID del usuario. Por favor, recarga la página.")
    return
  }
  try {
    await servicesStore.createService({
      carerId: userId,
      serviceTypeId: serviceForm.typeId,
      description: serviceForm.description || null,
      price: Number(serviceForm.price)
    })
    resetForm()
    alert("Servicio creado exitosamente")
  } catch (err) {
    alert("Error: " + (servicesStore.error || err.message))
  }
}

async function updateService() {
  if (!validateForm()) return
  const userId = userStore.user?.id
  if (!userId) {
    alert("Error: No se pudo obtener el ID del usuario. Por favor, recarga la página.")
    return
  }
  try {
    await servicesStore.updateService(serviceForm.id, {
      carerId: userId,
      serviceTypeId: serviceForm.typeId,
      description: serviceForm.description || null,
      price: Number(serviceForm.price)
    })
    resetForm()
    alert("Servicio actualizado exitosamente")
  } catch (err) {
    alert("Error: " + (servicesStore.error || err.message))
  }
}

function editService(service) {
  isEditing.value = true
  serviceForm.id = service.id
  serviceForm.typeId = service.serviceTypeId
  serviceForm.price = service.price
  serviceForm.description = service.description || ""
  
  // Scroll al formulario
  serviceFormRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function deleteService(service) {
  if (!confirm(`¿Estás seguro de que deseas eliminar el servicio "${getServiceTypeName(service.serviceTypeId)}"?`)) {
    return
  }
  try {
    await servicesStore.deleteService(service.id)
    alert("Servicio eliminado exitosamente")
  } catch (err) {
    alert("Error: " + (servicesStore.error || err.message))
  }
}

function validateForm() {
  if (!serviceForm.typeId) {
    alert("Debes seleccionar un tipo de servicio")
    return false
  }
  if (serviceForm.price <= 0) {
    alert("El precio debe ser mayor a 0")
    return false
  }
  return true
}

function resetForm() {
  isEditing.value = false
  serviceForm.id = null
  serviceForm.typeId = null
  serviceForm.price = 0
  serviceForm.description = ""
}

// --- Acciones de Perfil (Simulado) ---

const fileInput = ref(null)
function triggerFileInput() { fileInput.value.click() }
function handleFileChange(event) {
  const file = event.target.files[0]
  if (file && usersStore.currentUser) {
    usersStore.currentUser.profilePhoto = URL.createObjectURL(file)
    // Aquí llamarías a userStore.updateUser(...) para subir la foto
  }
}

function saveProfile() {
  // Aquí llamarías a:
  // userStore.updateUser(loggedInUserId.value, { ...datos_del_perfil })
  alert("Perfil actualizado (simulado)")
}
</script>

<template>
  <div class="container mt-4">
    <h2>Panel de Cuidador</h2>

    <div v-if="servicesStore.error" class="alert alert-danger alert-dismissible fade show">
      {{ servicesStore.error }}
      <button type="button" class="btn-close" @click="servicesStore.clearError()"></button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border me-2"></div>
      <p>Cargando panel...</p>
    </div>

    <template v-if="carerProfile">
      <div class="card mb-4 p-3 shadow-sm d-flex flex-row align-items-start gap-4">
        <div class="position-relative">
          <img :src="carerProfile.profilePhoto || 'https://i.pravatar.cc/150?u=' + carerProfile.email" alt="Foto" class="rounded-circle" width="120" height="120" />
          <button type="button" class="btn btn-sm btn-light position-absolute bottom-0 end-0" style="border-radius:50%; padding:0.25rem;" @click="triggerFileInput">
            ✏️
          </button>
          <input type="file" ref="fileInput" class="d-none" @change="handleFileChange" />
        </div>

        <div class="flex-grow-1">
          <div class="mb-3">
            <label class="form-label">Nombre</label>
            <input :value="`${carerProfile.name} ${carerProfile.lastName}`.trim()" class="form-control" readonly />
          </div>
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input v-model="carerProfile.email" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Teléfono</label>
            <input v-model="carerProfile.phoneNumber" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Estado de Disponibilidad</label>
            <select v-model="carerProfile.availabilityState" class="form-select">
                <option value="AVAILABLE">Disponible</option>
                <option value="NOT_AVAILABLE">No Disponible</option>
                <option value="BUSY">Ocupado</option>
            </select>
          </div>
          <button class="btn btn-success" @click="saveProfile">Guardar Perfil</button>
        </div>
      </div>

      <div class="card mb-4 p-3 shadow-sm">
        <h5>Mis Servicios</h5>

        <form ref="serviceFormRef" @submit.prevent="handleSubmit" class="card p-3 mb-3" :class="isEditing ? 'border-warning' : 'bg-light'">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6>{{ isEditing ? 'Editar Servicio' : 'Agregar Nuevo Servicio' }}</h6>
            <button v-if="isEditing" type="button" class="btn btn-sm btn-secondary" @click="resetForm">
              Cancelar
            </button>
          </div>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">Tipo de servicio</label>
              <select v-model.number="serviceForm.typeId" class="form-select" required>
                <option :value="null" disabled>Selecciona tipo</option>
                <option v-for="type in servicesStore.serviceTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Precio (Gs.)</label>
              <input type="number" v-model.number="serviceForm.price" class="form-control" placeholder="0" min="1" required />
            </div>
            <div class="col-md-5">
              <label class="form-label">Descripción (opcional)</label>
              <input type="text" v-model="serviceForm.description" class="form-control" placeholder="Ej. Incluye paseo de 30 minutos" />
            </div>
            <div class="col-12">
              <button v-if="!isEditing" type="submit" class="btn btn-primary" :disabled="servicesStore.loading">
                {{ servicesStore.loading ? 'Guardando...' : 'Agregar Servicio' }}
              </button>
              <button v-else type="submit" class="btn btn-warning" :disabled="servicesStore.loading">
                {{ servicesStore.loading ? 'Actualizando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </div>
        </form>

        <div v-if="servicesStore.loading" class="text-center text-muted py-3">
          <div class="spinner-border spinner-border-sm me-2"></div>
          Cargando servicios...
        </div>
        <div v-else-if="servicesStore.services.length > 0" class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Tipo de Servicio</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in servicesStore.services" :key="service.id">
                <td>{{ getServiceTypeName(service.serviceTypeId) }}</td>
                <td>{{ service.description || '-' }}</td>
                <td class="text-success fw-bold">Gs. {{ service.price.toLocaleString('es-PY') }}</td>
                <td>
                  <span v-if="service.active" class="badge bg-success">Activo</span>
                  <span v-else class="badge bg-secondary">Inactivo</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-2" @click="editService(service)" :disabled="servicesStore.loading">
                    Editar
                  </button>
                  <button class="btn btn-sm btn-outline-secondary" @click="deleteService(service)" :disabled="servicesStore.loading">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="alert alert-info">
          No tienes servicios creados aún. ¡Agrega uno usando el formulario de arriba!
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.position-relative button { font-size: 0.7rem; padding: 0.2rem 0.4rem; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
.border-warning { border: 2px solid #ffc107 !important; background: #fff9e6; }
.table th { font-weight: 600; }
.spinner-border-sm { width: 1rem; height: 1rem; }
input:read-only, select:disabled { background-color: #e9ecef; cursor: not-allowed; }
</style>