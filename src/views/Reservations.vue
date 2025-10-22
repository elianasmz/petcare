<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useReservationsStore } from "../stores/reservationsStore.js";
import { useCarersStore } from "../stores/carersStore.js";
import { useServicesStore } from "../stores/servicesStore.js";

const router = useRouter();
const reservationsStore = useReservationsStore();
const carersStore = useCarersStore();
const servicesStore = useServicesStore();

// Estado actual del filtro
const filtroEstado = ref("Todas");

// Cargar reservas al montar el componente
onMounted(async () => {
  try {
    await reservationsStore.getAllReservations();
    await servicesStore.fetchServices?.();
  } catch (error) {
    console.error("Error al cargar reservas:", error);
  }
});

// Computed con los datos del store
const reservas = computed(() => reservationsStore.reservations || []);

// Computed para filtrar por estado
const reservasFiltradas = computed(() => {
  if (filtroEstado.value === "Todas") return reservas.value;
  return reservas.value.filter(
      (r) => reservationsStore.getEstado(r.reservationState) === filtroEstado.value
  );
});

// Opciones de filtro
const estados = ["Todas", "Pendiente", "Aceptada", "Rechazada", "Finalizada"];

// Clases visuales según estado
const badgeClass = (estado) => {
  switch (estado) {
    case "PENDING":
      return "bg-warning text-dark";
    case "ACCEPTED":
      return "bg-success";
    case "REJECTED":
      return "bg-danger";
    case "FINISHED":
      return "bg-secondary";
    default:
      return "bg-light";
  }
};

// Simula obtener nombre del cuidador
function getCarerName(carerId) {
  const carer = carersStore.carer?.find((c) => c.id === carerId);
  return carer ? `${carer.name} ${carer.lastName}` : "Desconocido";
}

// Simula obtener servicios del cuidador (si tu store lo tiene)
function getServicesByCarer(carerId) {
  const services = servicesStore.services?.filter(
      (s) => s.carerId === carerId
  );
  return services?.map((s) => s.name) || [];
}

// Navegar al pago
function goToPayment(reservaId) {
  router.push({ name: "PayReservations", params: { id: reservaId } });
}
</script>

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

    <!-- Estado de carga -->
    <div v-if="reservationsStore.loading" class="text-secondary mb-3">
      Cargando reservaciones...
    </div>

    <!-- Lista de reservas -->
    <div class="row">
      <div
          class="col-md-6 mb-4"
          v-for="reserva in reservasFiltradas"
          :key="reserva.id"
      >
        <div class="card shadow-sm">
          <div class="card-body d-flex align-items-center">
            <!-- Imagen del cuidador -->
            <img
                src="https://via.placeholder.com/60"
                class="rounded-circle me-3"
                width="60"
                height="60"
                alt="Foto cuidador"
            />

            <!-- Información de la reserva -->
            <div class="flex-grow-1">
              <h5 class="card-title mb-1">
                {{ getCarerName(reserva.carerId) }}
                <span
                    class="badge ms-2"
                    :class="badgeClass(reserva.reservationState)"
                >
                  {{ reserva.reservationState }}
                </span>
              </h5>
              <p class="mb-1">
                <strong>Servicios:</strong>
                {{ getServicesByCarer(reserva.carerId).join(", ") }}
              </p>
              <p class="mb-0">
                <strong>Fecha:</strong> {{ reserva.serviceDate }}
              </p>
            </div>

            <!-- Botones -->
            <div class="ms-3 d-flex flex-column gap-2">
              <button class="btn btn-sm btn-outline-primary">Detalles</button>
              <button class="btn btn-sm btn-outline-success">Contactar</button>

              <button
                  v-if="reserva.reservationState === 'PENDING'"
                  class="btn btn-sm btn-outline-danger"
                  @click="reservationsStore.deleteReservation(reserva.id)"
              >
                Cancelar
              </button>

              <button
                  v-if="reserva.reservationState === 'FINISHED'"
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
      <div
          v-if="!reservationsStore.loading && reservasFiltradas.length === 0"
          class="text-center text-muted"
      >
        No hay reservas en este estado.
      </div>
    </div>
  </div>
</template>
