<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUsers } from "../composables/useUsers.js";
import { useServices } from "../composables/useServices.js";
import { useReservations } from "../composables/useReservations.js";
import { useAuth } from "../composables/useAuth.js";
import { useOwners } from "../composables/useOwners.js";
import { getUserIdFromToken } from "../utils/jwtUtils.js";

const reservations = useReservations();

const props = defineProps({
  id: {
    type: [String, Number],
    required: true
  }
});

const router = useRouter();

const users = useUsers();
const services = useServices();
const auth = useAuth();
const owners = useOwners();

const loading = ref(false);
const error = ref(null);

// 4. Referencias a los datos de los composables
const carerProfile = computed(() => users.currentUser.value);
const carerServices = computed(() => services.services.value);

// 5. Cargar los datos reales del backend al montar
onMounted(async () => {
  loading.value = true;
  error.value = null;
  // Limpiar composables de datos anteriores
  users.clearCurrentUser();
  services.clearServices();
  
  const carerId = Number(props.id);
  
  try {
    // Cargar tipos de servicio (para los nombres) y los datos del cuidador/servicios en paralelo
    await Promise.all([
      services.fetchServiceTypes(), // Para saber el nombre de "Paseo", "Alojamiento"
      users.fetchUserById(carerId),
      services.fetchServices({ carerId: carerId, size: 100 })
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

// Función para obtener ownerId del usuario en sesión
async function getOwnerIdFromSession() {
  try {
    // Primero intentar obtener el ID del usuario desde el composable
    let userId = auth.user.value?.id;
    
    // Si no tenemos el usuario completo, intentar cargarlo
    if (!userId) {
      if (auth.username.value) {
        try {
          await users.fetchUserByEmail(auth.username.value);
          if (users.currentUser.value) {
            auth.user.value = users.currentUser.value;
            userId = auth.user.value?.id;
          }
        } catch (err) {
          // Si falla obtener el usuario (503, etc.), no loguear si es 503
          if (err.response?.status !== 503) {
            console.warn("No se pudo cargar usuario completo:", err);
          }
        }
      }
    }
    
    // Si aún no tenemos userId, intentar extraerlo del token JWT
    if (!userId && auth.token.value) {
      const tokenUserId = getUserIdFromToken(auth.token.value);
      if (tokenUserId) {
        userId = tokenUserId;
        // Guardar en el composable para futuras referencias
        if (!auth.user.value) {
          auth.user.value = { id: userId };
        } else {
          auth.user.value.id = userId;
        }
      }
    }
    
    if (!userId) {
      console.warn("No se pudo obtener el ID del usuario desde el composable ni del token");
      return null;
    }
    
    // En la mayoría de arquitecturas, ownerId = userId cuando el usuario tiene rol OWNER
    // Intentar obtener el owner solo si es necesario, pero no fallar si no existe
    try {
      await owners.getOwnerById(userId);
      const owner = owners.owners.value.find(o => o.id === userId || o.userId === userId);
      if (owner && owner.id) {
        return owner.id;
      }
    } catch (err) {
      // Si el endpoint no existe o falla, usar userId directamente
      // No loguear errores 404/503 ya que son esperados
    }
    
    // Fallback: usar userId como ownerId (común cuando ownerId = userId)
    return userId;
  } catch (err) {
    // Último fallback: intentar desde token o composable
    return auth.user.value?.id || (auth.token.value ? getUserIdFromToken(auth.token.value) : null);
  }
}

// 7. Función para confirmar reserva (simulada por ahora)
async function bookCaretaker() {
  // 1️⃣ Validaciones previas
  if (selectedServices.value.length === 0) {
    alert("Debes seleccionar al menos un servicio.");
    return;
  }
  if (!reservationDate.value) {
    alert("Debes seleccionar una fecha.");
    return;
  }

  try {
    // Obtener ownerId del usuario en sesión
    const ownerId = await getOwnerIdFromSession();
    if (!ownerId) {
      alert("No se pudo obtener el ID del propietario. Por favor, inicia sesión nuevamente.");
      return;
    }

    // 2️⃣ Convertir fecha a ISO (UTC)
    const date = new Date(reservationDate.value + "T10:00:00-03:00");
    const serviceDateUTC = date.toISOString();

    // 3️⃣ Datos de la reservación
    const reservationData = {
      carerId: Number(props.id),
      ownerId: ownerId, // ID del usuario logueado
      serviceDate: serviceDateUTC,
      note: note.value,
      totalPrice: totalPrice.value,
      reservationState: "PENDING"
    };

    // 4️⃣ Crear la reservación principal
    const reservation = await reservations.postReservation(reservationData)
    const reservationId = reservation.id   // ✅ ahora sí funciona

    if (!reservationId) throw new Error("No se pudo obtener el ID de la reservación.");

    // 5️⃣ Crear relaciones Reservation-Service para cada servicio
    for (const serviceId of selectedServices.value) {
      try {
        const res = await reservations.postReservationService({ reservationId, serviceId });
        console.log("Servicio agregado:", res);
      } catch (err) {
        console.error(`Error agregando serviceId ${serviceId}:`, err);
        alert(`No se pudo agregar el servicio con ID ${serviceId}.`);
      }
    }

    // 6️⃣ Confirmación
    //alert(`Reserva creada correctamente. Total: Gs. ${totalPrice.value.toLocaleString('es-PY')}`);
    router.push("/reservations"); // Ir a "Mis Reservas"

  } catch (err) {
    console.error("Error al crear la reservación:", err);
    // Mostrar mensaje específico del backend si existe
    alert(err.response?.data?.message || "Hubo un error al crear la reservación.");
  }
}


function goBack() {
  router.push("/caretakers");
}

// Función para obtener el nombre del tipo de servicio
function getServiceTypeName(typeId) {
  const type = services.serviceTypes.value.find(t => t.id === typeId);
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