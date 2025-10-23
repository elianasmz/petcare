<script setup>
import {ref, computed, onMounted} from "vue";
import {useRouter} from "vue-router";
import {useReservationsStore} from "../stores/reservationsStore.js";

const router = useRouter();
const reservationStore = useReservationsStore();

// Estados legibles
const estados = ["Todas", "Pendiente", "Aceptada", "Rechazada", "Finalizada"];

// Estado local para UI
const filtroEstado = ref("Todas");
const paginaActual = ref(1);
const porPagina = ref(2);

onMounted(async () => {
  reservationStore.filter.ownerId = 1; // simula usuario logueado
  await cargarReservas();
  await reservationStore.getAllReservationServices();
});

async function cargarReservas() {
  await reservationStore.searchReservations({
    page: paginaActual.value - 1,
    size: porPagina.value,
  });
}

// 🔁 Cambiar página
async function irAPagina(n) {
  if (n >= 1 && n <= reservationStore.pageable.totalPages) {
    paginaActual.value = n;
    await cargarReservas();
  }
}

async function paginaAnterior() {
  if (paginaActual.value > 1) {
    paginaActual.value--;
    await cargarReservas();
  }
}

async function paginaSiguiente() {
  if (paginaActual.value < reservationStore.pageable.totalPages) {
    paginaActual.value++;
    await cargarReservas();
  }
}

async function cambiarEstado(estado) {
  filtroEstado.value = estado;
  reservationStore.filter.state = estado;
  paginaActual.value = 1;
  await cargarReservas();
}

// 🧩 Filtrar reservas en memoria según estado
const reservasFiltradas = computed(() => {
  if (filtroEstado.value === "Todas") return reservationStore.reservations;
  return reservationStore.reservations.filter(
      (r) => reservationStore.states[r.reservationState] === filtroEstado.value
  );
});

// 🎨 Clases visuales
function badgeClass(estado) {
  const e = reservationStore.states[estado];
  switch (e) {
    case "Pendiente": return "bg-warning text-dark";
    case "Aceptada": return "bg-success";
    case "Rechazada": return "bg-danger";
    case "Finalizada": return "bg-secondary";
    default: return "bg-light";
  }
}

// 🕒 Formato de fecha
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function goToPayment(reservaId) {
  router.push({name: "PayReservations", params: {id: reservaId}});
}
</script>

<template>
  <div class="container mt-4">
    <h2 class="mb-3">Mis Reservas</h2>

    <!-- 🔹 Filtro de estados -->
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

    <!-- 🔹 Cartas -->
    <div class="row">
      <div
          class="col-md-6 mb-4"
          v-for="reserva in reservasFiltradas"
          :key="reserva.id"
      >
        <div class="card shadow-sm">
          <div class="card-body d-flex align-items-center justify-content-between">
            <!-- 🖼️ Foto y datos -->
            <div class="d-flex align-items-center flex-grow-1">
              <img
                  :src="reserva.carer.profilePhoto"
                  class="rounded-circle me-3"
                  width="60"
                  height="60"
              />
              <div>
                <h5 class="card-title mb-1">
                  {{ reserva.carer.name }} {{ reserva.carer.lastName }}
                  <span
                      class="badge ms-2"
                      :class="badgeClass(reserva.reservationState)"
                  >
                {{ reservationStore.states[reserva.reservationState] }}
              </span>
                </h5>
                <strong>Servicios:</strong>
                <p
                    v-for="rel in reservationStore.reservationServices.filter(
                (rs) => rs.reservationId === reserva.id
              )"
                    :key="rel.id"
                    class="mb-1"
                >
                  {{ rel.service.name }}
                </p>
                <p>
                  <strong>Fecha:</strong> {{ formatDate(reserva.serviceDate) }}
                </p>
              </div>
            </div>

            <!-- ⚙️ Botones -->
            <div class="ms-3 d-flex flex-column gap-2">
              <button class="btn btn-sm btn-outline-primary">Detalles</button>
              <button class="btn btn-sm btn-outline-success">Contactar</button>

              <button
                  v-if="reservationStore.states[reserva.reservationState] === 'Pendiente'"
                  class="btn btn-sm btn-outline-danger"
              >
                Cancelar
              </button>

              <button
                  v-if="reservationStore.states[reserva.reservationState] === 'Finalizada'"
                  class="btn btn-sm btn-outline-primary"
                  @click="goToPayment(reserva.id)"
              >
                Pagar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 🔹 Mensajes de estado -->
      <div>
        <!-- 🔸 Sin reservas -->
        <div
            v-if="reservasFiltradas.length === 0 && !reservationStore.loading"
            class="text-center text-muted"
        >
          <h3>No hay reservas en este estado.</h3>
        </div>

        <!-- 🔸 Cargando -->
        <div v-if="reservationStore.loading" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔹 Paginación -->
    <nav v-if="reservationStore.pageable.totalPages > 1" class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: paginaActual === 1 }">
          <button class="page-link" @click="paginaAnterior">Anterior</button>
        </li>
        <li class="page-item" v-for="n in reservationStore.pageable.totalPages"
            :key="n" :class="{ active: n === paginaActual }">
          <button class="page-link" @click="irAPagina(n)">{{ n }}</button>
        </li>
        <li class="page-item" :class="{ disabled: paginaActual === reservationStore.pageable.totalPages }">
          <button class="page-link" @click="paginaSiguiente">Siguiente</button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped>
.page-link {
  cursor: pointer;
}
</style>
