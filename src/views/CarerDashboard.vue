<script setup>
import { onMounted, ref, reactive } from "vue"
import { useServicesStore } from "../stores/servicesStore.js"

const servicesStore = useServicesStore()
const carerId = ref(1) // ID del cuidador (simula que esta logueado)

// Datos del cuidador
const caretaker = reactive({
  id: carerId.value,
  name: "María López",
  email: "maria@example.com",
  phone: "099123456",
  bio: "Amante de los animales con 5 años de experiencia.",
  photo: "https://randomuser.me/api/portraits/women/44.jpg",
})

// Campos para agregar un nuevo servicio
const newService = reactive({
  typeId: null,
  price: 0,
  description: "",
})

// Cargar datos al montar
onMounted(async () => {
  await servicesStore.fetchServiceTypes()
  await servicesStore.fetchServicesByCarerId(carerId.value)
})

// Agregar servicio
async function addService() {
  if (!newService.typeId) {
    alert("Debes seleccionar un tipo de servicio")
    return
  }
  if (newService.price <= 0) {
    alert("El precio debe ser mayor a 0")
    return
  }

  try {
    await servicesStore.createService({
      carerId: carerId.value,
      serviceTypeId: newService.typeId,
      description: newService.description || null,
      price: Number(newService.price)
    })

    // Reset formulario
    newService.typeId = null
    newService.price = 0
    newService.description = ""
    
    alert("Servicio creado exitosamente")
  } catch (err) {
    alert("Error: " + servicesStore.error)
  }
}

// Actualizar servicio
async function updateService(service) {
  const newPrice = prompt(`Nuevo precio para servicio #${service.id}:`, service.price)
  if (newPrice === null) return

  try {
    await servicesStore.updateService(service.id, {
      carerId: service.carerId,
      serviceTypeId: service.serviceTypeId,
      description: service.description,
      price: Number(newPrice)
    })
    
    alert("Servicio actualizado exitosamente")
  } catch (err) {
    alert("Error: " + servicesStore.error)
  }
}

// Eliminar servicio
async function deleteService(service) {
  if (!confirm(`¿Estás seguro de que deseas eliminar el servicio #${service.id}?`)) {
    return
  }

  try {
    await servicesStore.deleteService(service.id)
    alert("Servicio eliminado exitosamente")
  } catch (err) {
    alert("Error: " + servicesStore.error)
  }
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
    <h2>Panel de Cuidador (ID: {{ carerId }})</h2>

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
          <label class="form-label">Bio</label>
          <textarea v-model="caretaker.bio" class="form-control"></textarea>
        </div>
        <button class="btn btn-success" @click="saveProfile">Guardar Perfil</button>
      </div>
    </div>

    <!-- Servicios -->
    <div class="card mb-4 p-3 shadow-sm">
      <h5>Servicios (desde Service MS)</h5>

      <!-- Agregar servicio -->
      <div class="card p-3 mb-3 bg-light">
        <h6>Agregar nuevo servicio</h6>
        <div class="d-flex gap-2 mb-3 flex-wrap">
          <select v-model.number="newService.typeId" class="form-select" style="max-width: 250px;">
            <option :value="null" disabled>-- Selecciona tipo --</option>
            <option v-for="type in servicesStore.serviceTypes" :key="type.id" :value="type.id">
              {{ type.name }}
            </option>
          </select>
          
          <input 
            type="number" 
            v-model.number="newService.price" 
            class="form-control" 
            placeholder="Precio $"
            step="0.01"
            min="0"
            style="max-width: 150px;"
          />
          
          <input 
            type="text" 
            v-model="newService.description" 
            class="form-control" 
            placeholder="Descripción (opcional)"
            style="max-width: 250px;"
          />
          
          <button 
            class="btn btn-primary" 
            @click="addService"
            :disabled="servicesStore.loading"
          >
            {{ servicesStore.loading ? 'Guardando...' : 'Agregar' }}
          </button>
        </div>
      </div>

      <!-- Cargando -->
      <div v-if="servicesStore.loading" class="text-center text-muted">
        <p>Cargando servicios...</p>
      </div>

      <!-- Lista de servicios -->
      <div v-else-if="servicesStore.services.length > 0" class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="service in servicesStore.services" :key="service.id">
              <td>{{ service.id }}</td>
              <td>{{ service.serviceTypeId }}</td>
              <td>{{ service.description || '-' }}</td>
              <td>${{ service.price }}</td>
              <td>
                <span v-if="service.active" class="badge bg-success">Activo</span>
                <span v-else class="badge bg-secondary">Inactivo</span>
              </td>
              <td>
                <button class="btn btn-sm btn-warning me-2" @click="updateService(service)" :disabled="servicesStore.loading">
                  Editar
                </button>
                <button class="btn btn-sm btn-danger" @click="deleteService(service)" :disabled="servicesStore.loading">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sin servicios -->
      <div v-else class="alert alert-info">
        No tienes servicios creados aún. ¡Agrega uno arriba!
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
</style>