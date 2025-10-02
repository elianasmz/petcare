<script setup>
import { ref } from "vue";

// Datos de ejemplo
const caretaker = ref({
  name: "María López",
  photo: "https://randomuser.me/api/portraits/women/44.jpg",
});

const receivedReservations = ref([
  { id: 1, owner: "Juan Pérez", services: [{ name: "Paseo", price: 15 }, { name: "Visita a domicilio", price: 10 }], status: "Pendiente" },
  { id: 2, owner: "Laura Gómez", services: [{ name: "Hospedaje", price: 50 }], status: "Pendiente" },
]);

const activeReservations = ref([
  { id: 3, owner: "María López", services: [{ name: "Paseo", price: 15 }], status: "Aceptada" },
]);

// Modal de rechazo
const showRejectModal = ref(false);
const rejectReason = ref("");
let currentReservation = ref(null);

// Funciones
function acceptReservation(reservation) {
  reservation.status = "Aceptada";
  activeReservations.value.push(reservation);
  receivedReservations.value = receivedReservations.value.filter(r => r.id !== reservation.id);
}

function openRejectModal(reservation) {
  currentReservation.value = reservation;
  rejectReason.value = "";
  showRejectModal.value = true;
}

function confirmReject() {
  if (currentReservation.value) {
    currentReservation.value.status = "Rechazada";
    currentReservation.value.reason = rejectReason.value;
    receivedReservations.value = receivedReservations.value.filter(r => r.id !== currentReservation.value.id);
    showRejectModal.value = false;
  }
}

function finishReservation(reservation) {
  reservation.status = "Finalizada";
  activeReservations.value = activeReservations.value.filter(r => r.id !== reservation.id);
}

function editProfilePhoto() {
  alert("Aquí puedes implementar la carga de foto de perfil");
}

function totalPrice(services) {
  return services.reduce((sum, s) => sum + s.price, 0);
}
</script>

<template>
  <div class="container mt-4">

    <!-- Reservas recibidas -->
    <h3>Reservas recibidas</h3>
    <div v-if="receivedReservations.length">
      <div v-for="res in receivedReservations" :key="res.id" class="card mb-3">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <strong>{{ res.owner }}</strong>
            <p>Servicios: {{ res.services.map(s => s.name + ' ($' + s.price + ')').join(", ") }}</p>
            <p><strong>Total:</strong> ${{ totalPrice(res.services) }}</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-success btn-sm" @click="acceptReservation(res)">Aceptar</button>
            <button class="btn btn-danger btn-sm" @click="openRejectModal(res)">Rechazar</button>
          </div>
        </div>
      </div>
    </div>
    <p v-else>No hay reservas recibidas.</p>

    <!-- Reservas activas -->
    <h3 class="mt-4">Reservas activas</h3>
    <div v-if="activeReservations.length">
      <div v-for="res in activeReservations" :key="res.id" class="card mb-3">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <strong>{{ res.owner }}</strong>
            <p>Servicios: {{ res.services.map(s => s.name + ' ($' + s.price + ')').join(", ") }}</p>
            <p><strong>Total:</strong> ${{ totalPrice(res.services) }}</p>
          </div>
          <button class="btn btn-primary btn-sm" @click="finishReservation(res)">Finalizar</button>
        </div>
      </div>
    </div>
    <p v-else>No hay reservas activas.</p>

    <!-- Modal de rechazo -->
    <div v-if="showRejectModal" class="modal-wrapper">
      <div class="modal-dialog shadow">
        <div class="modal-content p-3">
          <div class="modal-header d-flex justify-content-between align-items-center">
            <h5 class="modal-title">Motivo del rechazo</h5>
            <button class="btn-close" @click="showRejectModal = false"></button>
          </div>
          <div class="modal-body">
            <textarea v-model="rejectReason" class="form-control" rows="3" placeholder="Escriba el motivo..."></textarea>
          </div>
          <div class="modal-footer mt-2 d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" @click="showRejectModal = false">Cancelar</button>
            <button class="btn btn-danger" @click="confirmReject">Confirmar Rechazo</button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop"></div>
    </div>

  </div>
</template>

<style scoped>
.position-relative button {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
}

.modal-wrapper {
  position: fixed;
  top: 0; left: 0;
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
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0,0,0,0.5);
  z-index: 1000;
}
</style>