<script setup>
import { onMounted } from "vue"
import { useReservationsStore } from "../stores/reservationsStore.js"
import { useOwnerStore } from "../stores/ownerStore.js"
import { useCarerStore } from "../stores/carerStore.js"

const reservationsStore = useReservationsStore()
const ownerStore = useOwnerStore()
const carerStore = useCarerStore()

onMounted(() => {
  reservationsStore.fetchReservations()
})
</script>

<template>
  <div>
    <h2>Reservaciones</h2>
    <input v-model="reservationsStore.searchQuery" class="form-control" placeholder="Buscar..." />

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
