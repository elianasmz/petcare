<script setup>
import { ref, onMounted } from "vue";
import ReservationApi from "../api/ReservationApi.js";
import OwnerApi from "../api/OwnerApi.js";
import ServiceApi from "../api/ServiceApi.js";

const carerId = 8; // ID del cuidador logueado (luego lo sacas de auth)
const loading = ref(false);
const error = ref(null);

const receivedReservations = ref([]); // Pendientes
const activeReservations = ref([]);   // Aceptadas

// Datos para el modal
const showModal = ref(false);
const selectedReservation = ref(null);
const ownerDetails = ref(null);
const servicesDetails = ref([]);

async function loadReservations() {
  loading.value = true;
  error.value = null;

  try {
    const all = await ReservationApi.getReservationsByCarer(
      carerId,
      ["Pendiente", "Aceptada"]
    );

    receivedReservations.value = all.filter(r => r.reservationState === "Pendiente");
    activeReservations.value   = all.filter(r => r.reservationState === "Aceptada");

  } catch (e) {
    error.value = e.response?.data?.message || e.message;
  } finally {
    loading.value = false;
  }
}

async function openReservationDetails(reservation) {
  selectedReservation.value = reservation;
  showModal.value = true;

  try {
    // Dueño
    ownerDetails.value = await OwnerApi.getOwnerById(reservation.ownerId).then(r => r.data);

    // Servicios
    const rel = await ReservationApi.getReservationServicesByReservationId(reservation.id);
    servicesDetails.value = await Promise.all(
      rel.map(s => ServiceApi.getServiceById(s.serviceId).then(r => r.data))
    );

  } catch (e) {
    console.error("Error al cargar detalles:", e);
  }
}

// CAMBIAR ESTADO DE RESERVA
async function updateReservationState(reservationId, newState) {
  try {
    const response = await ReservationApi.putReservation(reservationId, {
      reservationState: newState
    });

    // Cerrar modal
    showModal.value = false;

    // Recargar listas
    await loadReservations();

    return response;

  } catch (e) {
    console.error("Error actualizando estado:", e);
  }
}

onMounted(loadReservations);
</script>

<template>
  <div class="p-5">
    <h2 class="text-2xl font-bold mb-4">Mis Reservas</h2>

    <!-- Loading -->
    <div v-if="loading" class="text-blue-500 font-semibold">Cargando reservas...</div>

    <!-- Error -->
    <div v-if="error" class="text-red-500">{{ error }}</div>

    <!-- RESERVAS PENDIENTES -->
    <h3 class="text-xl font-semibold mt-6 mb-2">📩 Reservas Nuevas</h3>

    <div v-if="receivedReservations.length === 0" class="text-gray-600">
      No tienes reservas nuevas.
    </div>

    <div
      v-for="r in receivedReservations"
      :key="r.id"
      class="border p-4 rounded mb-3 cursor-pointer hover:bg-gray-50"
      @click="openReservationDetails(r)"
    >
      <p><strong>ID:</strong> {{ r.id }}</p>
      <p><strong>Fecha:</strong> {{ r.serviceDate }}</p>
      <p><strong>Estado:</strong> {{ r.reservationState }}</p>
    </div>

    <!-- RESERVAS ACTIVAS -->
    <h3 class="text-xl font-semibold mt-6 mb-2">🟢 Reservas Activas</h3>

    <div v-if="activeReservations.length === 0" class="text-gray-600">
      No tienes reservas en curso.
    </div>

    <div
      v-for="r in activeReservations"
      :key="r.id"
      class="border p-4 rounded mb-3 cursor-pointer hover:bg-gray-50"
      @click="openReservationDetails(r)"
    >
      <p><strong>ID:</strong> {{ r.id }}</p>
      <p><strong>Fecha:</strong> {{ r.serviceDate }}</p>
      <p><strong>Estado:</strong> {{ r.reservationState }}</p>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3 class="text-xl font-bold mb-2">Detalles de la Reserva</h3>

        <p><strong>ID:</strong> {{ selectedReservation.id }}</p>
        <p><strong>Fecha:</strong> {{ selectedReservation.serviceDate }}</p>

        <hr class="my-3">

        <h4 class="font-semibold">👤 Dueño</h4>
        <p v-if="ownerDetails">
          {{ ownerDetails.name }} {{ ownerDetails.lastName }}<br>
          {{ ownerDetails.email }}
        </p>

        <hr class="my-3">

        <h4 class="font-semibold">🛁 Servicios</h4>
        <ul>
          <li v-for="s in servicesDetails" :key="s.id">
            {{ s.name }} — {{ s.price }} Gs.
          </li>
        </ul>

        <!-- BOTONES -->
        <div class="flex justify-end gap-2 mt-5">
          <button class="btn-secondary" @click="showModal = false">Cerrar</button>

          <!-- Mostrar botones según estado -->
          <button
            v-if="selectedReservation.reservationState === 'Pendiente'"
            class="btn-success"
            @click="updateReservationState(selectedReservation.id, 'Aceptada')"
          >
            Aceptar
          </button>

          <button
            v-if="selectedReservation.reservationState === 'Pendiente'"
            class="btn-danger"
            @click="updateReservationState(selectedReservation.id, 'Rechazada')"
          >
            Rechazar
          </button>

          <button
            v-if="selectedReservation.reservationState === 'Aceptada'"
            class="btn-primary"
            @click="updateReservationState(selectedReservation.id, 'Finalizada')"
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 450px;
  max-width: 90%;
}

.btn-primary {
  background: #2563eb;
  color: white;
  padding: 8px 14px;
  border-radius: 6px;
}
.btn-success {
  background: #16a34a;
  color: white;
  padding: 8px 14px;
  border-radius: 6px;
}
.btn-danger {
  background: #dc2626;
  color: white;
  padding: 8px 14px;
  border-radius: 6px;
}
.btn-secondary {
  background: #6b7280;
  color: white;
  padding: 8px 14px;
  border-radius: 6px;
}
</style>
