<script setup>
import { ref, reactive, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();

// Simulación de reservas (en la práctica vendría de API)
const reservas = ref([
  {
    id: 1,
    cuidador: "Ana Gómez",
    servicios: [
      { nombre: "Paseo", precio: 15 },
      { nombre: "Alimentación", precio: 10 }
    ],
    fecha: "02/10/2025 - 18:00",
    total: 25,
    estado: "Finalizada",
  },
  {
    id: 2,
    cuidador: "Carlos López",
    servicios: [{ nombre: "Alojamiento", precio: 50 }],
    fecha: "05/10/2025 - 10:00",
    total: 50,
    estado: "Finalizada",
  },
]);

// Buscar la reserva según el ID de la ruta
const reserva = reservas.value.find(r => r.id === Number(route.params.id));

// Formulario de métodos de pago
const pagos = ref([
  { tipo: "", monto: 0 }
]);

// Función para agregar otro método de pago
function agregarPago() {
  pagos.value.push({ tipo: "", monto: 0 });
}

// Función para eliminar un método de pago
function eliminarPago(index) {
  pagos.value.splice(index, 1);
}

// Total de pagos ingresados
const totalPagos = computed(() =>
  pagos.value.reduce((sum, p) => sum + Number(p.monto), 0)
);

// Confirmar pago
function confirmarPago() {
  if (totalPagos.value !== reserva.total) {
    alert(`El total de los pagos debe ser ${reserva.total}`);
    return;
  }
  alert("Pago confirmado");
  router.push({ name: "Reservations" });
}

// Volver al listado
function goBack() {
  router.push({ name: "MisReservas" });
}
</script>

<template>
  <div class="container mt-4">
    <h2>Reserva de {{ reserva.cuidador }}</h2>
    <p><strong>Fecha:</strong> {{ reserva.fecha }}</p>

    <h5>Servicios:</h5>
    <ul class="list-group mb-3">
      <li
        v-for="s in reserva.servicios"
        :key="s.nombre"
        class="list-group-item d-flex justify-content-between"
      >
        {{ s.nombre }}
        <span>${{ s.precio }}</span>
      </li>
      <li class="list-group-item d-flex justify-content-between fw-bold">
        Total
        <span>${{ reserva.total }}</span>
      </li>
    </ul>

    <h5>Métodos de pago</h5>
    <div v-for="(pago, index) in pagos" :key="index" class="d-flex gap-2 mb-2">
      <select v-model="pago.tipo" class="form-select">
        <option disabled value="">Seleccionar tipo</option>
        <option>Efectivo</option>
        <option>Tarjeta</option>
        <option>Transferencia</option>
      </select>
      <input type="number" v-model.number="pago.monto" class="form-control" placeholder="Monto" />
      <button class="btn btn-danger" @click="eliminarPago(index)">✖</button>
    </div>
    <button class="btn btn-secondary mb-3" @click="agregarPago">Agregar método</button>

    <div class="d-flex justify-content-end gap-2 mt-3">
      <button class="btn btn-secondary" @click="goBack">← Volver</button>
      <button class="btn btn-success" @click="confirmarPago">Confirmar pago</button>
    </div>
  </div>
</template>
