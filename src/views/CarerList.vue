<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Lista de cuidadores con precios por servicio
const caretakers = ref([
  {
    id: 1,
    name: "María López",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    description: "Amante de los animales con 5 años de experiencia cuidando perros y gatos.",
    services: [
      { name: "Paseos", price: 15 },
      { name: "Hospedaje", price: 30 },
      { name: "Visitas a domicilio", price: 10 }
    ]
  },
  {
    id: 2,
    name: "Carlos Pérez",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    description: "Veterinario estudiante, especializado en mascotas pequeñas.",
    services: [
      { name: "Atención básica", price: 20 },
      { name: "Paseos", price: 15 },
      { name: "Baños", price: 25 }
    ]
  },
  {
    id: 3,
    name: "Ana Gómez",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    description: "Ofrezco cuidado responsable y amoroso para perros grandes.",
    services: [
      { name: "Entrenamiento básico", price: 20 },
      { name: "Hospedaje", price: 35 },
      { name: "Paseos largos", price: 20 }
    ]
  }
]);

const selectedService = ref("Todos");
const searchQuery = ref("");
const maxPrice = ref(null); // filtro por precio máximo

// Obtener todos los servicios disponibles
const allServices = computed(() => {
  const services = caretakers.value.flatMap(c => c.services.map(s => s.name));
  return ["Todos", ...new Set(services)];
});

// Filtrado de cuidadores por servicio, búsqueda y precio
const filteredCaretakers = computed(() => {
  return caretakers.value.filter(caretaker => {
    const matchesService =
      selectedService.value === "Todos" ||
      caretaker.services.some(s => s.name === selectedService.value);

    const matchesSearch =
      caretaker.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      caretaker.description.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchesPrice =
      !maxPrice.value ||
      caretaker.services.some(s => s.price <= maxPrice.value);

    return matchesService && matchesSearch && matchesPrice;
  });
});

// Función para ir al detalle de un cuidador
function viewDetail(caretaker) {
  router.push({ name: "CarerDetail", params: { id: caretaker.id } });
}
</script>

<template>
  <div class="container mt-4">
    <h2 class="mb-4">Nuestros Cuidadores</h2>

    <!-- 🔍 Filtros -->
    <div class="card shadow-sm p-3 mb-4">
      <h5 class="mb-3">Filtrar cuidadores</h5>
      <div class="row">
        <div class="col-md-3 mb-3">
          <label class="form-label fw-bold">Por servicio</label>
          <select v-model="selectedService" class="form-select">
            <option v-for="service in allServices" :key="service" :value="service">
              {{ service }}
            </option>
          </select>
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label fw-bold">Buscar</label>
          <input
            type="text"
            v-model="searchQuery"
            class="form-control"
            placeholder="Ej. María o Paseos"
          />
        </div>
        <div class="col-md-3 mb-3">
          <label class="form-label fw-bold">Precio máximo</label>
          <input
            type="number"
            v-model.number="maxPrice"
            class="form-control"
            placeholder="Ej. 25"
          />
        </div>
      </div>
    </div>

    <!-- Cards de cuidadores -->
    <div class="row">
      <div v-for="caretaker in filteredCaretakers" :key="caretaker.id" class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <div class="d-flex align-items-center">
                <img :src="caretaker.photo" alt="foto perfil" class="rounded-circle me-3" width="50" height="50" />
                <h5 class="card-title mb-0">{{ caretaker.name }}</h5>
              </div>
              <button class="btn btn-primary btn-sm" @click="viewDetail(caretaker)">
                Ver Detalle
              </button>
            </div>

            <p class="card-text">{{ caretaker.description }}</p>

            <h6 class="fw-bold">Servicios:</h6>
            <ul class="list-group list-group-flush">
              <li
                v-for="service in caretaker.services"
                :key="service.name"
                class="list-group-item d-flex justify-content-between"
              >
                <span>{{ service.name }}</span>
                <span>${{ service.price }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div v-if="filteredCaretakers.length === 0" class="col-12 text-center text-muted mt-3">
        <p>No se encontraron cuidadores con los filtros aplicados.</p>
      </div>
    </div>
  </div>
</template>
