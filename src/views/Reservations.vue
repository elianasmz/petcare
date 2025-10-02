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
          @click.prevent="filtroEstado = estado"
        >
          {{ estado }}
        </a>
      </li>
    </ul>

    <!-- Lista de reservas -->
    <div class="row">
      <div
        class="col-md-6 mb-4"
        v-for="reserva in reservasFiltradas"
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
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router"; // ✅ importar
const router = useRouter();             // ✅ inicializar


const reservas = ref([
  {
    id: 1,
    cuidador: "Ana Gómez",
    cuidadorFoto: "https://randomuser.me/api/portraits/women/68.jpg",
    servicios: ["Paseo", "Alimentación"],
    fecha: "02/10/2025 - 18:00",
    estado: "Finalizada",
  },
  {
    id: 2,
    cuidador: "Carlos López",
    cuidadorFoto: "https://randomuser.me/api/portraits/men/32.jpg",
    servicios: ["Alojamiento"],
    fecha: "05/10/2025 - 10:00",
    estado: "Confirmada",
  },
]);

// Opciones de filtro
const estados = ["Todas", "Pendiente", "Confirmada", "Finalizada"];

// Estado actual del filtro
const filtroEstado = ref("Todas");

// Computed para filtrar
const reservasFiltradas = computed(() => {
  if (filtroEstado.value === "Todas") return reservas.value;
  return reservas.value.filter((r) => r.estado === filtroEstado.value);
});

const badgeClass = (estado) => {
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
};

function goToPayment(reservaId) {
  router.push({ name: "PayReservations", params: { id: reservaId } });
}
</script>
