<script setup> import {ref, computed, onMounted} from "vue";
import {useReservationsStore} from "../stores/reservationsStore";
import {useCarersStore} from "../stores/carersStore";

const reservationStore = useReservationsStore();
const carersStore = useCarersStore(); // ID del cuidador (simulado como logueado)
const carerId = 1; // Datos del cuidador
const caretaker = ref(null);
const showRejectModal = ref(false);
const rejectReason = ref("");
const currentReservation = ref(null);

onMounted(async () => {
  await carersStore.fetchAllCarers();
  caretaker.value = carersStore.getCarerById(carerId);
  await reservationStore.searchReservations({carerId, page: 0, size: 50, sortBy: "serviceDate", sortDir: "ASC",});
  await reservationStore.getAllReservationServices();
});

// 🧩 Filtramos reservas según estado
const receivedReservations = computed(() => reservationStore.reservations.filter((r) => reservationStore.states[r.reservationState] === "Pendiente"));
const activeReservations = computed(() => reservationStore.reservations.filter((r) => reservationStore.states[r.reservationState] === "Aceptada"));

// 🔁 Acciones sobre reservas
async function acceptReservation(reservation) {
  await reservationStore.updateReservationState(reservation.id, "ACEPTADA");
  await reloadReservations();
}

function openRejectModal(reservation) {
  currentReservation.value = reservation;
  rejectReason.value = "";
  showRejectModal.value = true;
}

async function confirmReject() {
  if (currentReservation.value) {
    await reservationStore.rejectReservation(currentReservation.value.id, rejectReason.value);
    showRejectModal.value = false;
    await reloadReservations();
  }
}

async function finishReservation(reservation) {
  await reservationStore.updateReservationState(reservation.id, "FINALIZADA");
  await reloadReservations();
}

async function reloadReservations() {
  await reservationStore.searchReservations({carerId, page: 0, size: 50});
  await reservationStore.getAllReservationServices();
}

// 💰 Calcular total de servicios
function totalPrice(services) {
  return services.reduce((sum, s) => sum + (s.price || 0), 0);
}

// 🎨 Obtener servicios para una reserva
function getServicesForReservation(reservationId) {
  return reservationStore.reservationServices.filter((rs) => rs.reservationId === reservationId).map((rs) => rs.service);
}
</script>

<template>
  <div class="container mt-5"><h2 class="mb-3">Panel del Cuidador</h2>
    <div v-if="caretaker" class="d-flex align-items-center mb-4">
      <img :src="caretaker.user.profilePhoto" class="rounded-circle me-3" width="100" height="100"/>
      <div>
        <h4>{{ caretaker.user.name }} {{ caretaker.user.lastName }}</h4>
        <p class="text-muted">Email: {{ caretaker.user.email }}</p>
        <p class="text-muted">Telefono: {{ caretaker.user.phoneNumber }}</p>
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
            <strong>Dueño:</strong> {{ res.owner.name }} {{ res.owner.lastName }}
            <p>
              <strong>Servicios:</strong>
              {{ getServicesForReservation(res.id).map(s => s.name).join(", ") }}
            </p>
            <p><strong>Total:</strong> ${{ totalPrice(getServicesForReservation(res.id)) }}</p>
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
            <strong>Dueño:</strong> {{ res.owner.name }} {{ res.owner.lastName }}
            <strong>Servicios:</strong>
            <p
                v-for="rel in reservationStore.reservationServices.filter(
                (rs) => rs.reservationId === reserva.id
              )"
                :key="rel.id"
                class="mb-1"
            >
              {{ rel.service.name }}
            </p>
            <p><strong>Total:</strong> ${{ totalPrice(getServicesForReservation(res.id)) }}</p>
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