<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useCarersStore } from "../stores/carersStore.js"
import { useServicesStore } from "../stores/servicesStore.js"

const router = useRouter()
const carersStore = useCarersStore()
const servicesStore = useServicesStore()

// --- Filtros ---
const selectedServiceType = ref(null)
const searchQuery = ref("")
const maxPrice = ref(null)
const loading = ref(false)
const error = ref(null)

// --- Cargar cuidadores + servicios reales ---
onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    // 1️⃣ Cargar cuidadores
    await carersStore.fetchCarers()

    // 2️⃣ Cargar servicios reales de cada cuidador
    await Promise.all(
      carersStore.carers.map(async (carer) => {
        const response = await servicesStore.fetchServicesByCarer(carer.id)
        carer.services = [...response] || []  // Guardamos los servicios dentro del cuidador
      })
    )

  } catch (err) {
    error.value = "Error cargando cuidadores. " + (err.message || carersStore.error)
  } finally {
    loading.value = false
  }
})

// --- Helpers ---
function translateAvailabilityState(state) {
  const map = {
    AVAILABLE: "Disponible",
    NOT_AVAILABLE: "No disponible",
    BUSY: "Ocupado"
  }
  return map[state] || state
}

// --- Juntar cuidadores + servicios ---
const carersWithServices = computed(() => {
  return carersStore.carers.map(c => ({
    id: c.id,
    name: `${c.name} ${c.lastName}`,
    photo: c.profilePhoto,
    description: `Estado: ${translateAvailabilityState(c.availabilityState)}`,
    email: c.email,
    phoneNumber: c.phoneNumber,
    availabilityState: c.availabilityState,
    services: c.services || []
  }))
})

// --- Filtrado ---
const filteredCaretakers = computed(() => {
  return carersWithServices.value
    .filter(carer => carer.services && carer.services.length > 0) // ✅ solo cuidadores con ≥1 servicio
    .filter(carer => {
      // Filtrar por tipo de servicio
      const matchesService =
        !selectedServiceType.value ||
        carer.services.some(s => s.serviceTypeId === selectedServiceType.value)

      // Filtrar por búsqueda
      const matchesSearch =
        searchQuery.value === "" ||
        carer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        carer.description.toLowerCase().includes(searchQuery.value.toLowerCase())

      // Filtrar por precio
      const matchesPrice =
        !maxPrice.value ||
        carer.services.some(s => s.price <= maxPrice.value)

      return matchesService && matchesSearch && matchesPrice
    })
})


// --- Navegación ---
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

              <!-- Datos del cuidador -->
              <div class="d-flex align-items-center justify-content-between mb-3">
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

              <!-- Lista de servicios -->
              <h6 class="fw-bold mb-2">
                Servicios ({{ carer.services.length }}):
              </h6>

              <div class="services-list">
                <div v-for="service in carer.services" :key="service.id" class="service-item">
                  <div>
                    <strong class="service-name">
                      {{ service.serviceType?.name || 'Tipo desconocido' }}
                    </strong>
                    <br>
                    <small class="service-desc">{{ service.description || ' ' }}</small>
                  </div>

                  <span class="service-price">
                    Gs. {{ service.price.toLocaleString('es-PY') }}
                  </span>
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
.carer-card { transition: transform 0.2s; min-height: 400px; }
.carer-card:hover { transform: translateY(-3px); }
.services-list { display: flex; flex-direction: column; gap: 0.75rem; }
.service-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef; gap: 1rem; }
.service-price { color: #28a745; font-weight: 600; }
</style>
