<script setup>
import {onMounted, ref} from "vue"
import {useReservations} from "../composables/useReservations.js"

const reservations = useReservations()

const resId = ref("");
const serId = ref("");

async function buscarReservation() {
  if (!resId.value) return;
  await reservations.getReservationById(resId.value);
}

async function buscarService() {
  if (!serId.value) return;
  await reservations.getServicesByReservation(serId.value);
}

onMounted(() => {
  reservations.getAllReservations()
  reservations.getAllReservationServices()
})
</script>

<template>
  <div>
    <h2 class="mt-5">Paginas de pruebas</h2>
    <div v-if="reservations.loading.value">Cargando...</div>
    <div v-else-if="reservations.error.value" class="text-danger">{{ reservations.error.value }}</div>
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
          <div v-if="reservations.selectedReservation.value" class="mt-1">
            <p>ID: {{ reservations.selectedReservation.value.id }}</p>
            <p>Owner: {{ reservations.selectedReservation.value.owner.name }}</p>
            <p>Carer: {{ reservations.selectedReservation.value.carer.name }}</p>
            <p>Estado: {{ reservations.states[reservations.selectedReservation.value.reservationState] }}</p>
          </div>
        </div>
        <!-- Columna 2: Buscador de servicios -->
        <div class="col-md-6">
          <div class="mt-1">
            <h5>Buscador de servicios</h5>
            <input v-model="serId" class="form-control" placeholder="Ingrese la reserva ID"/>
            <button @click="buscarService" class="btn btn-primary mt-2">Buscar</button>
          </div>
          <div v-if="reservations.selectedServices.value" v-for="r in reservations.selectedServices.value" :key="r.id"
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
      <tr v-for="r in reservations.reservations.value" :key="r.id">
        <td>{{ `${r.owner.name} ${r.owner.lastName}` }}</td>
        <td>{{ `${r.carer.name} ${r.carer.lastName}` }}</td>
        <td>{{ r.serviceDate }}</td>
        <td>{{ reservations.states[r.reservationState] }}</td>
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
      <tr v-for="r in reservations.reservationServices.value" :key="r.id">
        <td>{{ r.id }}</td>
        <td>{{ r.reservationId }}</td>
        <td>{{ r.service.id }}</td>
        <td>{{ r.service.name }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
