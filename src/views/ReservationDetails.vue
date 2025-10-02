<template>
  <div class="reservation-details">
    <h1>Detalles de la Reserva</h1>
    <p>Aquí podrás ver la información completa de tu reserva seleccionada.</p>

    <div v-if="reservation">
      <h2>Reserva #{{ reservation.id }}</h2>
      <p><strong>Mascota:</strong> {{ reservation.pet }}</p>
      <p><strong>Cuidador:</strong> {{ reservation.caregiver }}</p>
      <p><strong>Fecha:</strong> {{ reservation.date }}</p>
      <p><strong>Estado:</strong> {{ reservation.status }}</p>
    </div>

    <div v-else>
      <p>No se encontró la reserva.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Ejemplo temporal: esto luego lo reemplazas con datos desde Pinia o backend
const reservation = ref({
  id: 101,
  pet: 'Firulais',
  caregiver: 'Juan Pérez',
  date: '2025-09-25',
  status: 'Confirmada'
})
</script>

<style scoped>
.reservation-details {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

h2 {
  margin-top: 0;
  color: #2980b9;
}

p {
  margin: 0.5rem 0;
}
</style>
