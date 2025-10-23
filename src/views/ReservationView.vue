<!--<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {useReservationsStore} from "../stores/reservationsStore.js";
import {useCarersStore} from "../stores/carersStore.js";
import {useOwnerStore} from "../stores/ownerStore.js";

// Lógica del componente
const router = useRouter();
const reservationsStore = useReservationsStore();
const carersStore = useCarersStore();
const ownerStore = useOwnerStore();

// Cargar reservas al montar el componente
const estados = ["Todas", "Pendiente", "Confirmada", "Cancelada", "Finalizada"];
const filtroEstado = ref("Todas");



function badgeClass(estado) {
  switch (estado) {
    case "Pendiente":
      return "bg-warning text-dark";
    case "Confirmada":
      return "bg-success";
    case "Cancelada":
      return "bg-danger";
    case "Finalizada":
      return "bg-secondary";
    default:
      return "bg-light";
  }
}
</script>
-->
<template>
  <div class="container mt-4">
    <h2 class="mb-3">Mis Reservas</h2>

    <!-- Filtro de estados -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item" v-for="estado in estados" :key="estado">
        <a
            href="#"
            class="nav-link"
            :class="{ active: filtroEstado === estado }"
            @click.prevent="cambiarEstado(estado)"
        >
          {{ estado }}
        </a>
      </li>
    </ul>

    <!-- Lista de reservas -->
    <div class="row">
      <div
          class="col-md-6 mb-4"
          v-for="reserva in reservasPaginadas"
          :key="reserva.id"
      >
        <div class="card shadow-sm">
          <div class="card-body d-flex align-items-center">
            <!-- Foto cuidador -->
            <img
                :src="reserva.cuidadorFoto"
                class="rounded-circle me-3"
                width="60"
                height="60"
            />

            <div class="flex-grow-1">
              <h5 class="card-title mb-1">
                {{ reserva.cuidador }}
                <span class="badge ms-2" :class="badgeClass(reserva.estado)">
              {{ reserva.estado }}
            </span>
              </h5>
              <p class="mb-1">
                <strong>Servicios:</strong> {{ reserva.servicios.join(", ") }}
              </p>
              <p class="mb-0"><strong>Fecha:</strong> {{ reserva.fecha }}</p>
            </div>

            <!-- Botones de acción -->
            <div class="ms-3 d-flex flex-column gap-2">
              <button class="btn btn-sm btn-outline-primary">Detalles</button>
              <button class="btn btn-sm btn-outline-success">Contactar</button>
              <button
                  v-if="reserva.estado === 'Pendiente'"
                  class="btn btn-sm btn-outline-danger"
              >
                Cancelar
              </button>
              <button
                  v-if="reserva.estado === 'Finalizada'"
                  class="btn btn-sm btn-outline-primary"
                  @click="goToPayment(reserva.id)"
              >
                Pagar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje si no hay reservas -->
      <div v-if="reservasFiltradas.length === 0" class="text-center text-muted">
        No hay reservas en este estado.
      </div>
    </div>

    <!-- Paginación -->
    <nav v-if="totalPaginas > 1" class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: paginaActual === 1 }">
          <button class="page-link" @click="paginaAnterior">Anterior</button>
        </li>

        <li
            class="page-item"
            v-for="n in totalPaginas"
            :key="n"
            :class="{ active: n === paginaActual }"
        >
          <button class="page-link" @click="irAPagina(n)">{{ n }}</button>
        </li>

        <li class="page-item" :class="{ disabled: paginaActual === totalPaginas }">
          <button class="page-link" @click="paginaSiguiente">Siguiente</button>
        </li>
      </ul>
    </nav>
  </div>
</template>
<script setup>
import {ref, computed} from "vue";
import {useRouter} from "vue-router";

const router = useRouter(); // Datos simulados (luego se usarán desde el store)
const reservas = ref([
  {
    id: 1, cuidador: "Ana Gómez", cuidadorFoto: "https://randomuser.me/api/portraits/women/68.jpg",
    servicios: ["Paseo", "Alimentación"], fecha: "02/10/2025 - 18:00", estado: "Finalizada",
  },
  {
    id: 2, cuidador: "Carlos López", cuidadorFoto: "https://randomuser.me/api/portraits/men/32.jpg",
    servicios: ["Alojamiento"], fecha: "05/10/2025 - 10:00", estado: "Confirmada",
  },
  {
    id: 3, cuidador: "Lucía Méndez", cuidadorFoto: "https://randomuser.me/api/portraits/women/44.jpg",
    servicios: ["Paseo"], fecha: "07/10/2025 - 15:00", estado: "Pendiente",
  },
  {
    id: 4, cuidador: "Pedro Torres", cuidadorFoto: "https://randomuser.me/api/portraits/men/12.jpg",
    servicios: ["Baño", "Alojamiento"], fecha: "08/10/2025 - 09:00", estado: "Finalizada",
  },]);
// Filtros y paginación
const estados = ["Todas", "Pendiente", "Confirmada", "Finalizada"];
const filtroEstado = ref("Todas");
const paginaActual = ref(1);
const porPagina = ref(2); // cantidad de reservas por página
// Computed para filtrar por estado
const reservasFiltradas = computed(() => {
  if (filtroEstado.value === "Todas") return reservas.value;
  return reservas.value.filter((r) => r.estado === filtroEstado.value);
});
// Paginación dinámica basada en reservasFiltradas
const totalPaginas = computed(() => Math.ceil(reservasFiltradas.value.length / porPagina.value));
const reservasPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina.value;
  const fin = inicio + porPagina.value;
  return reservasFiltradas.value.slice(inicio, fin);
});

// Métodos de paginación
function irAPagina(n) {
  if (n >= 1 && n <= totalPaginas.value) {
    paginaActual.value = n;
  }
}

function paginaAnterior() {
  if (paginaActual.value > 1) paginaActual.value--;
}

function paginaSiguiente() {
  if (paginaActual.value < totalPaginas.value) paginaActual.value++;
}

// Cambiar estado reinicia la paginación
function cambiarEstado(estado) {
  filtroEstado.value = estado;
  paginaActual.value = 1;
}

function badgeClass(estado) {
  switch (estado) {
    case "Pendiente":
      return "bg-warning text-dark";
    case "Confirmada":
      return "bg-success";
    case "Rechazada":
      return "bg-danger";
    case "Finalizada":
      return "bg-secondary";
    default:
      return "bg-light";
  }
}

function goToPayment(reservaId) {
  router.push({name: "PayReservations", params: {id: reservaId}});
}
</script>
<style scoped>
.page-link {
  cursor: pointer;
}
</style>