<script setup>
import { onMounted, ref, reactive, computed } from "vue"
import { useServicesStore } from "../stores/servicesStore.js"

const servicesStore = useServicesStore()
const carerId = ref(1) // Simula cuidador logueado

// Referencia al formulario de servicio
const serviceFormRef = ref(null)

// Datos del cuidador
const caretaker = reactive({
  id: carerId.value,
  name: "María López",
  email: "maria@example.com",
  phone: "099123456",
  bio: "Amante de los animales con 5 años de experiencia.",
  photo: "https://randomuser.me/api/portraits/women/44.jpg",
})

// Formulario de servicio (crear/editar)
const serviceForm = reactive({
  id: null,
  typeId: null,
  price: 0,
  description: "",
})

const isEditing = ref(false) // Modo edición

// Cargar datos al montar
onMounted(async () => {
  await servicesStore.fetchServiceTypes()
  await servicesStore.fetchServicesByCarerId(carerId.value)
})

// Obtener nombre del tipo de servicio por ID
function getServiceTypeName(typeId) {
  const type = servicesStore.serviceTypes.find(t => t.id === typeId)
  return type ? type.name : `Tipo ${typeId}`
}

// Agregar servicio
async function addService() {
  if (!serviceForm.typeId) {
    alert("Debes seleccionar un tipo de servicio")
    return
  }
  if (serviceForm.price <= 0) {
    alert("El precio debe ser mayor a 0")
    return
  }

  try {
    await servicesStore.createService({
      carerId: carerId.value,
      serviceTypeId: serviceForm.typeId,
      description: serviceForm.description || null,
      price: Number(serviceForm.price)
    })

    resetForm()
    alert("Servicio creado exitosamente")
  } catch (err) {
    alert("Error: " + servicesStore.error)
  }
}

// Abrir formulario de edición
function editService(service) {
  isEditing.value = true
  serviceForm.id = service.id
  serviceForm.typeId = service.serviceTypeId
  serviceForm.price = service.price
  serviceForm.description = service.description || ""
  
  // Scroll al formulario usando la referencia
  setTimeout(() => {
    if (serviceFormRef.value) {
      serviceFormRef.value.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }
  }, 100)
}

// Actualizar servicio
async function updateService() {
  if (!serviceForm.typeId) {
    alert("Debes seleccionar un tipo de servicio")
    return
  }
  if (serviceForm.price <= 0) {
    alert("El precio debe ser mayor a 0")
    return
  }

  try {
    await servicesStore.updateService(serviceForm.id, {
      carerId: carerId.value,
      serviceTypeId: serviceForm.typeId,
      description: serviceForm.description || null,
      price: Number(serviceForm.price)
    })
    
    resetForm()
    alert("Servicio actualizado exitosamente")
  } catch (err) {
    alert("Error: " + servicesStore.error)
  }
}

// Eliminar servicio
async function deleteService(service) {
  if (!confirm(`¿Estás seguro de que deseas eliminar el servicio "${getServiceTypeName(service.serviceTypeId)}"?`)) {
    return
  }

  try {
    await servicesStore.deleteService(service.id)
    alert("Servicio eliminado exitosamente")
  } catch (err) {
    alert("Error: " + servicesStore.error)
  }
}

// Resetear formulario
function resetForm() {
  isEditing.value = false
  serviceForm.id = null
  serviceForm.typeId = null
  serviceForm.price = 0
  serviceForm.description = ""
}

// Guardar perfil (simulado)
function saveProfile() {
  alert("Perfil actualizado correctamente")
}

// Cambiar foto
const fileInput = ref(null)
function triggerFileInput() {
  fileInput.value.click()
}
function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    caretaker.photo = URL.createObjectURL(file)
  }
}
</script>

<template>
  <div class="container mt-4">
    <h2>Panel de Cuidador</h2>

    <!-- Alertas de error -->
    <div v-if="servicesStore.error" class="alert alert-danger alert-dismissible fade show">
      {{ servicesStore.error }}
      <button type="button" class="btn-close" @click="servicesStore.error = null"></button>
    </div>

    <!-- Perfil -->
    <div class="card mb-4 p-3 shadow-sm d-flex flex-row align-items-start gap-4">
      <div class="position-relative">
        <img :src="caretaker.photo" alt="Foto" class="rounded-circle" width="120" height="120" />
        <button type="button"
          class="btn btn-sm btn-light position-absolute bottom-0 end-0"
          style="border-radius:50%; padding:0.25rem;"
          @click="triggerFileInput">
          ✏️
        </button>
        <input type="file" ref="fileInput" class="d-none" @change="handleFileChange" />
      </div>

      <div class="flex-grow-1">
        <div class="mb-3">
          <label class="form-label">Nombre</label>
          <input v-model="caretaker.name" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="caretaker.email" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Teléfono</label>
          <input v-model="caretaker.phone" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Biografía</label>
          <textarea v-model="caretaker.bio" class="form-control"></textarea>
        </div>
        <button class="btn btn-success" @click="saveProfile">Guardar Perfil</button>
      </div>
    </div>

    <!-- Servicios -->
    <div class="card mb-4 p-3 shadow-sm">
      <h5>Mis Servicios</h5>

      <!-- Formulario: Agregar/Editar servicio -->
      <div 
        ref="serviceFormRef"
        class="card p-3 mb-3" 
        :class="isEditing ? 'border-warning' : 'bg-light'"
      >
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6>{{ isEditing ? 'Editar Servicio' : 'Agregar Nuevo Servicio' }}</h6>
          <button v-if="isEditing" class="btn btn-sm btn-secondary" @click="resetForm">
            Cancelar
          </button>
        </div>

        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Tipo de servicio</label>
            <select v-model.number="serviceForm.typeId" class="form-select">
              <option :value="null" disabled>Selecciona tipo</option>
              <option v-for="type in servicesStore.serviceTypes" :key="type.id" :value="type.id">
                {{ type.name }}
              </option>
            </select>
          </div>
          
          <div class="col-md-3">
            <label class="form-label">Precio</label>
            <input 
              type="number" 
              v-model.number="serviceForm.price" 
              class="form-control"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          
          <div class="col-md-5">
            <label class="form-label">Descripción (opcional)</label>
            <input 
              type="text" 
              v-model="serviceForm.description" 
              class="form-control" 
              placeholder="Ej. Incluye paseo de 30 minutos"
            />
          </div>

          <div class="col-12">
            <button 
              v-if="!isEditing"
              class="btn btn-primary" 
              @click="addService"
              :disabled="servicesStore.loading"
            >
              {{ servicesStore.loading ? 'Guardando...' : 'Agregar Servicio' }}
            </button>
            <button 
              v-else
              class="btn btn-warning" 
              @click="updateService"
              :disabled="servicesStore.loading"
            >
              {{ servicesStore.loading ? 'Actualizando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Cargando -->
      <div v-if="servicesStore.loading" class="text-center text-muted py-3">
        <div class="spinner-border spinner-border-sm me-2"></div>
        Cargando servicios...
      </div>

      <!-- Lista de servicios -->
      <div v-else-if="servicesStore.services.length > 0" class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>ID</th>
              <th>Tipo de Servicio</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in servicesStore.services" :key="service.id">
              <td>{{ service.id }}</td>
              <td>{{ getServiceTypeName(service.serviceTypeId) }}</td>
              <td>{{ service.description || '-' }}</td>
              <td class="text-success fw-bold">Gs. {{ service.price }}</td>
              <td>
                <span v-if="service.active" class="badge bg-success">Activo</span>
                <span v-else class="badge bg-secondary">Inactivo</span>
              </td>
              <td>
                <button 
                  class="btn btn-sm btn-warning me-2" 
                  @click="editService(service)" 
                  :disabled="servicesStore.loading"
                >
                  <i class="bi bi-pencil"></i> Editar
                </button>
                <button 
                  class="btn btn-sm btn-danger" 
                  @click="deleteService(service)" 
                  :disabled="servicesStore.loading"
                >
                  <i class="bi bi-trash"></i> Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sin servicios -->
      <div v-else class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        No tienes servicios creados aún. ¡Agrega uno usando el formulario de arriba!
      </div>
    </div>
  </div>
</template>

<style scoped>
.position-relative button {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.border-warning {
  border: 2px solid #ffc107 !important;
  background: #fff9e6;
}

.table th {
  font-weight: 600;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>