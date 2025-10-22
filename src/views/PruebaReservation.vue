<script setup>
import { onMounted, ref } from "vue"
import { useReservationsStore } from "../stores/reservationsStore.js"
import { useOwnerStore } from "../stores/ownerStore.js"
import { useCarersStore } from "../stores/carersStore.js"

const reservationsStore = useReservationsStore()
const ownerStore = useOwnerStore()
const carerStore = useCarersStore()

const searchId = ref("");

async function buscar() {
  if (!searchId.value) return;
  await reservationsStore.getReservationById(searchId.value);
}

onMounted(() => {
  reservationsStore.getAllReservations()
})
</script>

<template>
  <div>
    <h2>Reservaciones</h2>
    <input
        v-model="searchId"
        class="form-control"
        placeholder="Buscar..."
    />

    <button @click="buscar" class="btn btn-primary mt-2">Buscar</button>

    <!-- Mostrar resultado -->
    <div v-if="reservationsStore.selectedReservation" class="mt-3">
      <h5>Resultado:</h5>
      <p>ID: {{ reservationsStore.selectedReservation.id }}</p>
      <p>Owner ID: {{ reservationsStore.selectedReservation.ownerId }}</p>
      <p>Carer ID: {{ reservationsStore.selectedReservation.carerId }}</p>
      <p>Estado: {{ reservationsStore.selectedReservation.reservationState }}</p>
    </div>

    <div v-if="reservationsStore.loading">Cargando...</div>

    <div v-else-if="reservationsStore.error" class="text-danger">{{ reservationsStore.error }}</div>

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
      <tr v-for="r in reservationsStore.filteredReservations" :key="r.id">
        <td>{{`${ownerStore.getOwnerName(r.ownerId)} ${ownerStore.getOwnerLastName(r.ownerId)}`}}</td>
        <td>{{`${carerStore.getCarerName(r.carerId)} ${carerStore.getCarerLastName(r.carerId)}`}}</td>
        <td>{{ r.serviceDate }}</td>
        <td>{{ r.reservationState }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
