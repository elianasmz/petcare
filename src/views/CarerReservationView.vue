<script setup> 
import {ref, computed, onMounted} from "vue";
import {useReservations} from "../composables/useReservations.js";
import {useCarers} from "../composables/useCarers.js";
import {useAuth} from "../composables/useAuth.js";
import {useUsers} from "../composables/useUsers.js";
import {getUserIdFromToken} from "../utils/jwtUtils.js";

const reservations = useReservations();
const carers = useCarers();
const auth = useAuth();
const users = useUsers();

const caretaker = ref(null);
const showRejectModal = ref(false);
const rejectReason = ref("");
const currentReservation = ref(null);
const carerId = ref(null);

// Obtener carerId del usuario en sesión
async function getCarerIdFromSession() {
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
    
    // Intentar obtener el carer desde el backend
    try {
      await carers.fetchAllCarers();
      const carer = carers.carers.value.find(c => 
        c.userId === userId || 
        c.id === userId || 
        c.user?.id === userId
      );
      if (carer && carer.id) {
        return carer.id;
      }
    } catch (err) {
      // Si falla, no loguear errores 503/404 ya que son esperados
    }
    
    // Fallback: usar userId como carerId (común cuando carerId = userId)
    return userId;
  } catch (err) {
    // Último fallback: intentar desde token o composable
    return auth.user.value?.id || (auth.token.value ? getUserIdFromToken(auth.token.value) : null);
  }
}

onMounted(async () => {
  // Obtener carerId del usuario en sesión
  const id = await getCarerIdFromSession();
  if (id) {
    carerId.value = id;
    await carers.fetchAllCarers();
    caretaker.value = await carers.getCarerById(id);
    await reservations.searchReservations({carerId: id, page: 0, size: 50, sortBy: "serviceDate", sortDir: "ASC",});
    await reservations.getAllReservationServices();
  } else {
    console.error("No se pudo obtener el carerId del usuario en sesión");
  }
});

// 🧩 Filtramos reservas según estado
const receivedReservations = computed(() =>
    reservations.reservations.value.filter((r) =>
        reservations.states[r.reservationState] === "Pendiente"
    ));
const activeReservations = computed(() =>
    reservations.reservations.value.filter((r) =>
        reservations.states[r.reservationState] === "Aceptada"
    ));

// 🔁 Acciones sobre reservas
async function acceptReservation(reservation) {
  try {
    await reservations.updateReservationState(reservation.id, "ACCEPTED");
    await reloadReservations();
  } catch (err) {
    alert("Error al aceptar la reservación: " + (err.message || "Error desconocido"));
  }
}

function openRejectModal(reservation) {
  currentReservation.value = reservation;
  rejectReason.value = "";
  showRejectModal.value = true;
}

async function confirmReject() {
  if (currentReservation.value) {
    await reservations.rejectReservation(currentReservation.value.id, rejectReason.value);
    showRejectModal.value = false;
    await reloadReservations();
  }
}

async function finishReservation(reservation) {
  try {
    await reservations.updateReservationState(reservation.id, "FINISHED");
    await reloadReservations();
  } catch (err) {
    alert("Error al finalizar la reservación: " + (err.message || "Error desconocido"));
  }
}

async function reloadReservations() {
  if (carerId.value) {
    await reservations.searchReservations({carerId: carerId.value, page: 0, size: 50});
    await reservations.getAllReservationServices();
  }
}

// 💰 Calcular total de servicios
function totalPrice(services) {
  return services.reduce((sum, s) => sum + (s.price || 0), 0);
}

// 🎨 Obtener servicios para una reserva
function getServicesForReservation(reservationId) {
  return reservations.reservationServices.value.filter((rs) => rs.reservationId === reservationId).map((rs) => rs.service);
}
</script>

<template>
  <div class="container mt-5"><h2 class="mb-3">Panel del Cuidador</h2>
    <div v-if="caretaker" class="d-flex align-items-center mb-4">
      <img :src="caretaker.user?.profilePhoto || caretaker.profilePhoto || 'https://i.pravatar.cc/150?u=' + caretaker.id" class="rounded-circle me-3" width="100" height="100"/>
      <div>
        <h4>{{ caretaker.user?.name || caretaker.name || 'Desconocido' }} {{ caretaker.user?.lastName || caretaker.lastName || '' }}</h4>
        <p class="text-muted">Email: {{ caretaker.user?.email || caretaker.email || 'N/A' }}</p>
        <p class="text-muted">Telefono: {{ caretaker.user?.phoneNumber || caretaker.phoneNumber || 'N/A' }}</p>
      </div>
    </div>

    <!-- Reservas activas -->
    <h3 class="mt-4">Reservas activas</h3>
    <div v-if="activeReservations.length">
      <div
          v-for="res in activeReservations"
          :key="res.id"
          class="card mb-3 shadow-sm"
      >
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <strong>Dueño:</strong> 
            {{ res.owner?.user?.name || res.owner?.name || 'Desconocido' }} 
            {{ res.owner?.user?.lastName || res.owner?.lastName || '' }}
            <p>
              <strong>Servicios:</strong>
              {{ getServicesForReservation(res.id).map(s => s?.name || 'Servicio').join(", ") || 'Cargando...' }}
            </p>
            <p><strong>Fecha:</strong> {{ new Date(res.serviceDate).toLocaleString('es-PY') }}</p>
            <p><strong>Total:</strong> Gs. {{ totalPrice(getServicesForReservation(res.id)).toLocaleString('es-PY') }}</p>
          </div>
          <button class="btn btn-primary btn-sm" @click="finishReservation(res)">
            Finalizar
          </button>
        </div>
      </div>
    </div>
    <p v-else>No hay reservas activas.</p>

    <!-- Reservas recibidas -->
    <h3 class="mt-5">Reservas recibidas</h3>
    <div v-if="receivedReservations.length">
      <div
          v-for="res in receivedReservations"
          :key="res.id"
          class="card mb-3 shadow-sm"
      >
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <strong>Dueño:</strong> 
            {{ res.owner?.user?.name || res.owner?.name || 'Desconocido' }} 
            {{ res.owner?.user?.lastName || res.owner?.lastName || '' }}
            <p><strong>Servicios:</strong></p>
            <div v-if="reservations.reservationServices.value.filter((rs) => rs.reservationId === res.id).length > 0">
              <p
                  v-for="rel in reservations.reservationServices.value.filter(
                  (rs) => rs.reservationId === res.id
                )"
                  :key="rel.id"
                  class="mb-1"
              >
                {{ rel.service?.name || 'Servicio desconocido' }}
              </p>
            </div>
            <p v-else class="text-muted mb-1">Cargando servicios...</p>
            <p><strong>Fecha:</strong> {{ new Date(res.serviceDate).toLocaleString('es-PY') }}</p>
            <p><strong>Total:</strong> Gs. {{ totalPrice(getServicesForReservation(res.id)).toLocaleString('es-PY') }}</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-success btn-sm" @click="acceptReservation(res)">
              Aceptar
            </button>
            <button class="btn btn-danger btn-sm" @click="openRejectModal(res)">
              Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>
    <p v-else>No hay reservas recibidas.</p>

    <!-- Modal de rechazo -->
    <div v-if="showRejectModal" class="modal-wrapper">
      <div class="modal-dialog shadow">
        <div class="modal-content p-3">
          <div
              class="modal-header d-flex justify-content-between align-items-center"
          >
            <h5 class="modal-title">Motivo del rechazo</h5>
            <button class="btn-close" @click="showRejectModal = false"></button>
          </div>
          <div class="modal-body">
        <textarea
            v-model="rejectReason"
            class="form-control"
            rows="3"
            placeholder="Escriba el motivo..."
        ></textarea>
          </div>
          <div
              class="modal-footer mt-2 d-flex justify-content-end gap-2"
          >
            <button class="btn btn-secondary" @click="showRejectModal = false">
              Cancelar
            </button>
            <button class="btn btn-danger" @click="confirmReject">
              Confirmar Rechazo
            </button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop"></div>
    </div>
  </div>
</template>
<style scoped> .modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-dialog {
  background: white;
  border-radius: 5px;
  z-index: 1100;
  max-width: 400px;
  width: 90%;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
} </style>