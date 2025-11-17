<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
// 1. Importar los stores reales
import { useUsersStore } from "../stores/usersStore.js";
import { useServicesStore } from "../stores/servicesStore.js";
import { useReservationsStore } from "../stores/reservationsStore.js";

const reservationsStore = useReservationsStore();

// (No necesitas useRoute si usas props)

// 2. Definir 'props' para recibir el ID del router
// (Tu router/index.js ya tiene 'props: true' para esta ruta, lo cual es perfecto)
const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
});

const router = useRouter();

// 3. Obtener los stores
const userStore = useUsersStore();
const servicesStore = useServicesStore();

const loading = ref(false);
const error = ref(null);

// 4. Referencias a los datos de los stores
const carerProfile = computed(() => userStore.currentUser);
const carerServices = computed(() => servicesStore.services);

// 5. Cargar los datos reales del backend al montar
onMounted(async () => {
  loading.value = true;
  error.value = null;
  // Limpiar stores de datos anteriores
  userStore.clearCurrentUser();
  servicesStore.clearServices();
  
  const carerId = Number(props.id);
  
  try {
    // Cargar tipos de servicio (para los nombres) y los datos del cuidador/servicios en paralelo
    await Promise.all([
      servicesStore.fetchServiceTypes(), // Para saber el nombre de "Paseo", "Alojamiento"
      userStore.fetchUserById(carerId),
      servicesStore.fetchServices({ carerId: carerId, size: 100 })
    ]);
  } catch (err) {
    console.error("Error fetching data:", err);
    error.value = "No se pudo cargar la información del cuidador.";
  } finally {
    loading.value = false;
  }
});

// --- Lógica del Formulario de Reserva (se mantiene casi igual) ---
const selectedServices = ref([]); // Almacenará los IDs de servicio
const reservationDate = ref("");
const note = ref("");

// 6. Total calculado (ahora usa 'carerServices' del store)
const totalPrice = computed(() => {
  return selectedServices.value.reduce((sum, serviceId) => {
    // Busca el servicio en la lista del store
    const service = carerServices.value.find(s => s.id === serviceId);
    return sum + (service ? service.price : 0);
  }, 0);
});

// 7. Función para confirmar reserva (simulada por ahora)
async function bookCaretaker() {
  if (selectedServices.value.length === 0) {
    alert("Debes seleccionar al menos un servicio.");
    return;
  }
  if (!reservationDate.value) {
    alert("Debes seleccionar una fecha.");
    return;
  }
    
  const date = new Date(reservationDate.value + "T10:00:00-03:00");
  const serviceDateUTC = date.toISOString(); // Ej: "2025-11-13T13:00:00.000Z"


  // Datos de la reservación
  const reservationData = {
    carerId: Number(props.id),
    ownerId: 1, // Reemplaza con el ID del usuario logueado
    serviceDate: serviceDateUTC,
    note: note.value,
    totalPrice: totalPrice.value
  };

  try {
    // 1️⃣ Crear la reservación principal
    const res = await reservationsStore.postReservation(reservationData);
    const reservationId = res?.content?.id;
    if (!reservationId) throw new Error("No se pudo obtener el ID de la reservación.");

    // 2️⃣ Crear las relaciones ReservationService
    for (const serviceId of selectedServices.value) {
      await reservationsStore.postReservationService({
        reservationId,
        serviceId
      });
    }

    alert(`Reserva creada correctamente. Total: Gs. ${totalPrice.value.toLocaleString('es-PY')}`);
    router.push("/reservations"); // Ir a "Mis Reservas"
  } catch (err) {
    console.error("Error al crear la reserva:", err);
    alert("Hubo un error al crear la reserva. Revisa la consola.");
  }
}


function goBack() {
  router.push("/caretakers");
}

// Función para obtener el nombre del tipo de servicio
function getServiceTypeName(typeId) {
  const type = servicesStore.serviceTypes.find(t => t.id === typeId);
  return type ? type.name : 'Servicio';
}
</script>

<template>
  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border"></div>
    <p>Cargando datos del cuidador...</p>
  </div>

  <div v-else-if="error" class="alert alert-danger">
    {{ error }}
    <button class="btn btn-link" @click="goBack">Volver</button>
  </div>
  
  <div class="container mt-4" v-else-if="carerProfile">
    <h2>{{ carerProfile.name }} {{ carerProfile.lastName }}</h2>

    <div class="d-flex justify-content-start align-items-center mt-3 gap-3">
      <img :src="carerProfile.profilePhoto || 'https://i.pravatar.cc/150?u=' + carerProfile.email" alt="foto" class="rounded-circle mb-3" width="100" height="100" />
      <p>{{ carerProfile.description || 'Cuidador apasionado por las mascotas.' }}</p>
    </div>

    <h5>Selecciona los servicios:</h5>
    <form @submit.prevent="bookCaretaker">
      
      <div v-if="carerServices.length > 0">
        <div class="form-check mb-2" v-for="service in carerServices" :key="service.id">
          <input
            class="form-check-input"
            type="checkbox"
            :id="'service-' + service.id"
            :value="service.id" v-model="selectedServices"
          />
          <label class="form-check-label" :for="'service-' + service.id">
            <strong>{{ getServiceTypeName(service.serviceTypeId) }}</strong> - 
            <span>{{ service.description || 'Servicio estándar' }}</span> - 
            <span class="text-success fw-bold">Gs. {{ service.price.toLocaleString('es-PY') }}</span>
          </label>
        </div>
      </div>
      <div v-else class="alert alert-info">
        Este cuidador no tiene servicios activos en este momento.
      </div>
      
      <div class="mb-3 mt-3">
        <label class="form-label fw-bold">Fecha de reserva</label>
        <input type="date" v-model="reservationDate" class="form-control" />
      </div>

      <div class="mb-3">
        <label class="form-label fw-bold">Nota adicional</label>
        <textarea v-model="note" class="form-control" rows="3" placeholder="Ej. Mi perro es tímido con otros perros."></textarea>
      </div>

      <p class="fw-bold fs-5">Total: Gs. {{ totalPrice.toLocaleString('es-PY') }}</p>

      <div class="d-flex justify-content-end mt-3">
        <button type="button" class="btn btn-secondary me-2" @click="goBack">Atras</button>
        <button type_="submit" class="btn btn-success" :disabled="carerServices.length === 0">Confirmar Reserva</button>
      </div>
    </form>
  </div>

  <div v-else class="alert alert-warning">
    Cuidador no encontrado.
    <button class="btn btn-link" @click="goBack">Volver</button>
  </div>
</template>