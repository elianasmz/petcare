<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useServicesStore } from "../stores/servicesStore.js"
import { useUsersStore } from "../stores/usersStore.js"

const router = useRouter()
const servicesStore = useServicesStore()
const usersStore = useUsersStore()

// --- Estado local para los filtros ---
const selectedServiceType = ref(null) 
const searchQuery = ref("")
const maxPrice = ref(null)
const loading = ref(false)
const error = ref(null)

// Cargar datos al montar
onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    await Promise.all([
      servicesStore.fetchServiceTypes(),
      usersStore.fetchUsers({ role: 'CARER', size: 100 }), 
      servicesStore.fetchServices({ size: 1000 }) 
    ])
  } catch (err) {
    error.value = "Error cargando datos. " + (err.message || usersStore.error || servicesStore.error)
    console.error(err)
  } finally {
    loading.value = false
  }
})

// --- Propiedades Computadas ---

function getServiceTypeName(typeId) {
  const type = servicesStore.serviceTypes.find(t => t.id === typeId)
  return type ? type.name : `Tipo ${typeId}`
}

const carersWithServices = computed(() => {
  // ===================================================================
  // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
  // Añadimos una comprobación para asegurarnos de que userStore.users
  // no sea 'undefined' o 'null' antes de intentar filtrarlo.
  // ===================================================================
  if (!usersStore.users || !Array.isArray(usersStore.users)) {
    return [] // Devolver un array vacío si los datos aún no están listos
  }
  
  // Ahora esta línea es segura:
  return usersStore.users
    .filter(user => user.active) 
    .map(carer => {
      const services = servicesStore.services
        .filter(s => s.carerId === carer.id && s.active)
        .map(s => ({
          ...s,
          name: getServiceTypeName(s.serviceTypeId) 
        }))

      return {
        id: carer.id,
        name: `${carer.name} ${carer.lastName}`,
        photo: carer.profilePhoto || `https://i.pravatar.cc/150?u=${carer.email}`,
        description: `Estado: ${translateAvailabilityState(carer.availabilityState)}`,
        email: carer.email,
        phoneNumber: carer.phoneNumber,
        availabilityState: carer.availabilityState,
        services: services 
      }
    })
    .filter(carer => carer.services.length > 0)
})

// Esta propiedad computada (`filteredCaretakers`) ahora también es segura
// porque `carersWithServices` siempre devolverá un array.
const filteredCaretakers = computed(() => {
  return carersWithServices.value.filter(carer => {
    const matchesService =
      !selectedServiceType.value ||
      carer.services.some(s => s.serviceTypeId === selectedServiceType.value)

    const matchesSearch =
      searchQuery.value === "" ||
      carer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      carer.description.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesPrice =
      !maxPrice.value ||
      carer.services.some(s => s.price <= maxPrice.value)

    return matchesService && matchesSearch && matchesPrice
  })
})

// --- Funciones ---

function translateAvailabilityState(state) {
  const translations = {
    'AVAILABLE': 'Disponible',
    'NOT_AVAILABLE': 'No disponible',
    'BUSY': 'Ocupado'
  }
  return translations[state] || state
}

function viewDetail(carer) {
  router.push({ name: "CarerDetail", params: { id: carer.id } })
}
</script>

<template>
  <div class="container mt-4">
    <h2 class="mb-4">Nuestros Cuidadores</h2>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border me-2"></div>
      <p>Cargando cuidadores...</p>
    </div>

    <template v-else>
      <div class="card shadow-sm mb-4 filters-card">
        <div class="card-body p-3">
          <h5 class="mb-3">Filtrar cuidadores</h5>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label fw-bold">Por tipo de servicio</label>
              <select v-model.number="selectedServiceType" class="form-select">
                <option :value="null">Todos los servicios</option>
                <option v-for="type in servicesStore.serviceTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Buscar</label>
              <input type="text" v-model="searchQuery" class="form-control" placeholder="Ej. María o Disponible" />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Precio máximo</label>
              <input type="number" v-model.number="maxPrice" class="form-control" placeholder="Ej. 70000" />
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div v-for="carer in filteredCaretakers" :key="carer.id" class="col-lg-6 col-xl-4 mb-4">
          <div class="card h-100 shadow-sm carer-card">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div class="d-flex align-items-center">
                  <img :src="carer.photo" alt="foto perfil" class="rounded-circle me-3" width="60" height="60" />
                  <div>
                    <h5 class="card-title mb-0">{{ carer.name }}</h5>
                    <small class="text-muted">
                      <i class="bi bi-envelope"></i> {{ carer.email }}
                    </small>
                  </div>
                </div>
                <button class="btn btn-primary btn-sm" @click="viewDetail(carer)">
                  Ver Detalle
                </button>
              </div>

              <p class="card-text mb-3">{{ carer.description }}</p>

              <h6 class="fw-bold mb-2">
                Servicios ({{ carer.services.length }}):
              </h6>
              <div class="services-list">
                <div v-for="service in carer.services" :key="service.id" class="service-item">
                  <div class="service-info">
                    <strong class="service-name">{{ service.name }}</strong>
                    <small class="service-desc">{{ service.description }}</small>
                  </div>
                  <span class="service-price">Gs. {{ service.price.toLocaleString('es-PY') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredCaretakers.length === 0" class="col-12 text-center text-muted mt-3">
          <p>No se encontraron cuidadores con los filtros aplicados.</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.filters-card { max-width: 100%; }
.filters-card .card-body { padding: 1rem 1.5rem !important; }
.filters-card h5 { font-size: 1.1rem; margin-bottom: 1rem !important; }
.carer-card { transition: transform 0.2s; min-height: 400px; }
.carer-card:hover { transform: translateY(-3px); }
.spinner-border { width: 2rem; height: 2rem; }
.services-list { display: flex; flex-direction: column; gap: 0.75rem; }
.service-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; gap: 1rem; min-height: 60px; }
.service-info { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; min-width: 0; }
.service-name { color: #2196f3; font-size: 0.95rem; display: block; }
.service-desc { color: #6c757d; font-size: 0.85rem; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.service-price { color: #28a745; font-weight: 600; font-size: 1rem; white-space: nowrap; flex-shrink: 0; min-width: 120px; text-align: right; }
@media (max-width: 768px) {
  .service-item { flex-direction: column; align-items: flex-start; }
  .service-price { width: 100%; text-align: left; margin-top: 0.5rem; }
}
</style>