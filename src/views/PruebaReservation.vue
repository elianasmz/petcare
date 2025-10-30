<script setup>
import {onMounted, ref} from "vue"
import {useReservationsStore} from "../stores/reservationsStore.js"

const reservationsStore = useReservationsStore()

const resId = ref("");
const serId = ref("");

async function buscarReservation() {
  if (!resId.value) return;
  await reservationsStore.getReservationById(resId.value);
}

async function buscarService() {
  if (!serId.value) return;
  await reservationsStore.getServicesByReservation(serId.value);
}

onMounted(() => {
  reservationsStore.getAllReservations()
  reservationsStore.getAllReservationServices()
})
</script>

<template>
  <div>
    <h2 class="mt-5">Paginas de pruebas</h2>
    <div v-if="reservationsStore.loading">Cargando...</div>
    <div v-else-if="reservationsStore.error" class="text-danger">{{ reservationsStore.error }}</div>
    <!-- Buscadores-->
    <div class="container mt-1">
      <div class="row">
        <!-- Columna 1: Buscador de reservas -->
        <div class="col-md-6">
          <div class="mt-1">
            <h5>Buscador de reservas</h5>
            <input v-model="resId" class="form-control" placeholder="Buscar..."/>
            <button @click="buscarReservation" class="btn btn-primary mt-2">Buscar</button>
          </div>
          <div v-if="reservationsStore.selectedReservation" class="mt-1">
            <p>ID: {{ reservationsStore.selectedReservation.id }}</p>
            <p>Owner: {{ reservationsStore.selectedReservation.owner.name }}</p>
            <p>Carer: {{ reservationsStore.selectedReservation.carer.name }}</p>
            <p>Estado: {{ reservationsStore.states[reservationsStore.selectedReservation.reservationState] }}</p>
          </div>
        </div>
        <!-- Columna 2: Buscador de servicios -->
        <div class="col-md-6">
          <div class="mt-1">
            <h5>Buscador de servicios</h5>
            <input v-model="serId" class="form-control" placeholder="Ingrese la reserva ID"/>
            <button @click="buscarService" class="btn btn-primary mt-2">Buscar</button>
          </div>
          <div v-if="reservationsStore.selectedService" v-for="r in reservationsStore.selectedService" :key="r.id"
               class="mt-1">
            <p>ID: {{ r.id }}</p>
            <p>Servicio: {{ r.service.name }}</p>
          </div>
        </div>
      </div>
    </div>
    <!-- Todas las reservas -->
    <table class="table table-striped mt-1">
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
        <td>{{ `${r.owner.name} ${r.owner.lastName}` }}</td>
        <td>{{ `${r.carer.name} ${r.carer.lastName}` }}</td>
        <td>{{ r.serviceDate }}</td>
        <td>{{ reservationsStore.states[r.reservationState] }}</td>
      </tr>
      </tbody>
    </table>
    <!-- Todas los servicios -->
    <table class="table table-striped mt-1">
      <thead>
      <tr>
        <th>Id Detalle</th>
        <th>Id reservation</th>
        <th>Id type service</th>
        <th>Type service</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="r in reservationsStore.reservationServices" :key="r.id">
        <td>{{ r.id }}</td>
        <td>{{ r.reservationId }}</td>
        <td>{{ r.service.id }}</td>
        <td>{{ r.service.name }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
