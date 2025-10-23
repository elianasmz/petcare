<script setup>
import { onMounted, ref } from "vue"
import { useReservationsStore } from "../stores/reservationsStore.js"

const reservationsStore = useReservationsStore()

const searchId = ref("");

async function buscarReservation() {
  if (!searchId.value) return;
  await reservationsStore.getReservationById(searchId.value);
}

async function buscarService() {
  if (!searchId.value) return;
  await reservationsStore.getServicesByReservation(searchId.value);
}

function obtenerEstado(reservation) {
  return reservationsStore.states[reservation];
}

onMounted(() => {
  reservationsStore.getAllReservations()
  reservationsStore.getAllReservationServices()
})
</script>

<template>
  <div>
    <h2>Reservaciones</h2>
    <div v-if="reservationsStore.loading">Cargando...</div>
    <div v-else-if="reservationsStore.error" class="text-danger">{{ reservationsStore.error }}</div>


    <!-- Mostrar resultado de reserva -->
    <div  class="mt-3">
      <div class="mt-3">
        <h5>Buscador de reservas</h5>
        <input
            v-model="searchId"
            class="form-control"
            placeholder="Buscar..."
        />
        <button @click="buscarReservation" class="btn btn-primary mt-2">Buscar</button>
      </div>
      <div v-if="reservationsStore.selectedReservation" class="mt-3">
        <p>ID: {{ reservationsStore.selectedReservation.id }}</p>
        <p>Owner: {{ reservationsStore.selectedReservation.owner.name }}</p>
        <p>Carer: {{ reservationsStore.selectedReservation.carer.name }}</p>
        <p>Estado: {{ reservationsStore.states[reservationsStore.selectedReservation.reservationState] }}</p>
      </div>
    </div>

    <!-- Mostrar resultado de servicio -->
    <div  class="mt-3">
      <div class="mt-3">
        <h5>Buscador de servicios</h5>
        <input
            v-model="searchId"
            class="form-control"
            placeholder="Ingrese la reserva ID"
        />
        <button @click="buscarService" class="btn btn-primary mt-2">Buscar</button>
      </div>
      <div v-if="reservationsStore.reservationServices" v-for="r in reservationsStore.reservationServices" :key="r.id" class="mt-3">
        <p>ID: {{ r.id }}</p>
        <p>Servicio: {{ r.service.name }}</p>
      </div>
    </div>
    <!-- Todas las reservas -->
    <table class="table table-striped mt-3">
      <thead>
      <tr>
        <th>Propietario</th>
        <th>Cuidadores</th>
        <th>Fecha</th>
        <th>Estado</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="r in reservationsStore.reservations" :key="r.id">
        <td>{{`${r.owner.name} ${r.owner.lastName}`}}</td>
        <td>{{`${r.carer.name} ${r.carer.lastName}`}}</td>
        <td>{{ r.serviceDate }}</td>
        <td>{{ reservationsStore.states[r.reservationState] }}</td>
      </tr>
      </tbody>
    </table>
    <!-- Todas las reservas -->
    <table class="table table-striped mt-3">
      <thead>
      <tr>
        <th>Propietario</th>
        <th>Cuidadores</th>
        <th>Fecha</th>
        <th>Estado</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="r in reservationsStore.reservations" :key="r.id">
        <td>{{`${r.owner.name} ${r.owner.lastName}`}}</td>
        <td>{{`${r.carer.name} ${r.carer.lastName}`}}</td>
        <td>{{ r.serviceDate }}</td>
        <td>{{ reservationsStore.states[r.reservationState] }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
