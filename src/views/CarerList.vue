<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useServicesStore } from "../stores/servicesStore.js"

const router = useRouter()
const servicesStore = useServicesStore()

const selectedServiceType = ref("Todos")
const searchQuery = ref("")
const maxPrice = ref(null)
const loading = ref(false)
const error = ref(null)

// Cargar datos al montar
onMounted(async () => {
  loading.value = true
  try {
    await servicesStore.fetchServiceTypes()
    await servicesStore.fetchServices({ page: 0, size: 100 })
  } catch (err) {
    error.value = "Error cargando datos"
    console.error(err)
  } finally {
    loading.value = false
  }
})

// Obtener nombre del tipo de servicio por ID
function getServiceTypeName(typeId) {
  const type = servicesStore.serviceTypes.find(t => t.id === typeId)
  return type ? type.name : `Tipo ${typeId}`
}

// Datos hardcodeados de cuidadores (temporal hasta Entrega #4)
const carerData = {
  1: {
    name: "Laura Gómez",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    description: "Amante de los animales con 5 años de experiencia"
  },
  2: {
    name: "Carlos Díaz",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    description: "Veterinario estudiante, especializado en mascotas pequeñas"
  }
}

// Obtener datos del cuidador
function getCarerData(carerId) {
  return carerData[carerId] || {
    name: `Cuidador #${carerId}`,
    photo: `https://randomuser.me/api/portraits/${carerId % 2 === 0 ? 'men' : 'women'}/${(carerId * 10) % 100}.jpg`,
    description: "Cuidador profesional de mascotas"
  }
}

// Agrupar servicios por cuidador
const caretakers = computed(() => {
  const grouped = {}

  servicesStore.services.forEach(service => {
    const carerId = service.carerId
    
    if (!grouped[carerId]) {
      const carerInfo = getCarerData(carerId)
      grouped[carerId] = {
        id: carerId,
        name: carerInfo.name,
        photo: carerInfo.photo,
        description: carerInfo.description,
        services: []
      }
    }

    grouped[carerId].services.push({
      id: service.id,
      name: getServiceTypeName(service.serviceTypeId),
      price: service.price,
      description: service.description || ''
    })
  })

  return Object.values(grouped)
})

// Obtener todos los tipos de servicio disponibles
const allServiceTypes = computed(() => {
  const types = ["Todos"]
  const uniqueTypes = new Set()
  
  servicesStore.services.forEach(service => {
    const typeName = getServiceTypeName(service.serviceTypeId)
    if (!uniqueTypes.has(typeName)) {
      uniqueTypes.add(typeName)
      types.push(typeName)
    }
  })
  
  return types
})

// Filtrar cuidadores
const filteredCaretakers = computed(() => {
  return caretakers.value.filter(caretaker => {
    const matchesService =
      selectedServiceType.value === "Todos" ||
      caretaker.services.some(s => s.name === selectedServiceType.value)

    const matchesSearch =
      searchQuery.value === "" ||
      caretaker.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      caretaker.description.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesPrice =
      !maxPrice.value ||
      caretaker.services.some(s => s.price <= maxPrice.value)

    return matchesService && matchesSearch && matchesPrice
  })
})

// Navegar al detalle
function viewDetail(caretaker) {
  router.push({ name: "CarerDetail", params: { id: caretaker.id } })
}
</script>

<template>
  <div class="container mt-4">
    <h2 class="mb-4">Nuestros Cuidadores</h2>

    <!-- Error -->
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Cargando -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border me-2"></div>
      <p>Cargando servicios...</p>
    </div>

    <template v-else>
      <!-- Filtros -->
      <div class="card shadow-sm mb-4 filters-card">
        <div class="card-body p-3">
          <h5 class="mb-3">Filtrar cuidadores</h5>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label fw-bold">Por tipo de servicio</label>
              <select v-model="selectedServiceType" class="form-select">
                <option v-for="type in allServiceTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Buscar</label>
              <input
                type="text"
                v-model="searchQuery"
                class="form-control"
                placeholder="Ej. María o Paseos"
              />
            </div>
            <div class="col-md-4">
              <label class="form-label fw-bold">Precio máximo</label>
              <input
                type="number"
                v-model.number="maxPrice"
                class="form-control"
                placeholder="Ej. 70000"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Cards de cuidadores -->
      <div class="row">
        <div v-for="caretaker in filteredCaretakers" :key="caretaker.id" class="col-lg-6 col-xl-4 mb-4">
          <div class="card h-100 shadow-sm carer-card">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div class="d-flex align-items-center">
                  <img
                    :src="caretaker.photo"
                    alt="foto perfil"
                    class="rounded-circle me-3"
                    width="60"
                    height="60"
                  />
                  <h5 class="card-title mb-0">{{ caretaker.name }}</h5>
                </div>
                <button class="btn btn-primary btn-sm" @click="viewDetail(caretaker)">
                  Ver Detalle
                </button>
              </div>

              <p class="card-text mb-3">{{ caretaker.description }}</p>

              <h6 class="fw-bold mb-2">Servicios:</h6>
              <div class="services-list">
                <div
                  v-for="service in caretaker.services"
                  :key="service.id"
                  class="service-item"
                >
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
/* Card de filtros compacto */
.filters-card {
  max-width: 100%;
}

.filters-card .card-body {
  padding: 1rem 1.5rem !important;
}

.filters-card h5 {
  font-size: 1.1rem;
  margin-bottom: 1rem !important;
}

/* Cards de cuidadores */
.carer-card {
  transition: transform 0.2s;
  min-height: 400px;
}

.carer-card:hover {
  transform: translateY(-3px);
}

.spinner-border {
  width: 2rem;
  height: 2rem;
}

/* Estilos para la lista de servicios */
.services-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.service-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  gap: 1rem;
  min-height: 60px;
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.service-name {
  color: #2196f3;
  font-size: 0.95rem;
  display: block;
}

.service-desc {
  color: #6c757d;
  font-size: 0.85rem;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.service-price {
  color: #28a745;
  font-weight: 600;
  font-size: 1rem;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 120px;
  text-align: right;
}

/* Responsive */
@media (max-width: 768px) {
  .service-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .service-price {
    width: 100%;
    text-align: left;
    margin-top: 0.5rem;
  }
}
</style>