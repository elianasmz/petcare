<script setup>
import {ref, computed, onMounted} from "vue";
import {useRouter} from "vue-router";
import {useReservations} from "../composables/useReservations.js";
import {useAuth} from "../composables/useAuth.js";
import {useUsers} from "../composables/useUsers.js";
import {useOwners} from "../composables/useOwners.js";
import {getUserIdFromToken} from "../utils/jwtUtils.js";

const router = useRouter();
const reservations = useReservations();
const auth = useAuth();
const users = useUsers();
const owners = useOwners();

// Estados legibles
const estados = ["Todas", "Pendiente", "Aceptada", "Rechazada", "Finalizada"];

// Estado local para UI
const filtroEstado = ref("Todas");
const paginaActual = ref(1);
const porPagina = ref(2);

// Obtener ownerId del usuario en sesión
async function getOwnerIdFromSession() {
  try {
    // Primero intentar obtener el ID del usuario desde el composable
    let userId = auth.user.value?.id;
    
    // Si no tenemos el usuario completo, intentar cargarlo
    if (!userId) {
      if (auth.username.value) {
        try {
          await users.fetchUserByEmail(auth.username.value);
          if (users.currentUser.value) {
            auth.user.value = users.currentUser.value;
            userId = auth.user.value?.id;
          }
        } catch (err) {
          // Si falla obtener el usuario (503, etc.), no loguear si es 503
          if (err.response?.status !== 503) {
            console.warn("No se pudo cargar usuario completo:", err);
          }
        }
      }
    }
    
    // Si aún no tenemos userId, intentar extraerlo del token JWT
    if (!userId && auth.token.value) {
      const tokenUserId = getUserIdFromToken(auth.token.value);
      if (tokenUserId) {
        userId = tokenUserId;
        // Guardar en el composable para futuras referencias
        if (!auth.user.value) {
          auth.user.value = { id: userId };
        } else {
          auth.user.value.id = userId;
        }
      }
    }
    
    if (!userId) {
      console.warn("No se pudo obtener el ID del usuario desde el composable ni del token");
      return null;
    }
    
    // En la mayoría de arquitecturas, ownerId = userId cuando el usuario tiene rol OWNER
    // Intentar obtener el owner solo si es necesario, pero no fallar si no existe
    try {
      await owners.getOwnerById(userId);
      const owner = owners.owners.value.find(o => o.id === userId || o.userId === userId);
      if (owner && owner.id) {
        return owner.id;
      }
    } catch (err) {
      // Si el endpoint no existe o falla, usar userId directamente
      // No loguear errores 404/503 ya que son esperados
    }
    
    // Fallback: usar userId como ownerId (común cuando ownerId = userId)
    return userId;
  } catch (err) {
    // Último fallback: intentar desde token o composable
    return auth.user.value?.id || (auth.token.value ? getUserIdFromToken(auth.token.value) : null);
  }
}

onMounted(async () => {
  // Obtener ownerId del usuario en sesión
  const ownerId = await getOwnerIdFromSession();
  if (ownerId) {
    reservations.filter.value.ownerId = ownerId;
    await cargarReservas();
    
    // 🔥 Cargar los servicios de cada reserva
    for (const r of reservations.reservations.value) {
      await reservations.getServicesByReservation(r.id);
    }
  } else {
    console.error("No se pudo obtener el ownerId del usuario en sesión");
  }
});


async function cargarReservas() {
  await reservations.searchReservations({
    page: paginaActual.value - 1,
    size: porPagina.value,
  });
}

// 🔁 Cambiar página
async function irAPagina(n) {
  if (n >= 1 && n <= reservations.pageable.value.totalPages) {
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
  if (paginaActual.value < reservations.pageable.value.totalPages) {
    paginaActual.value++;
    await cargarReservas();
  }
}

async function cambiarEstado(estado) {
  filtroEstado.value = estado;
  reservations.filter.value.state = estado;
  paginaActual.value = 1;
  await cargarReservas();
}

// 🧩 Filtrar reservas en memoria según estado
const reservasFiltradas = computed(() => {
  if (filtroEstado.value === "Todas") return reservations.reservations.value;
  return reservations.reservations.value.filter(
      (r) => reservations.states[r.reservationState] === filtroEstado.value
  );
});

// 🎨 Clases visuales
function badgeClass(estado) {
  const e = reservations.states[estado];
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
                  :src="reserva.carer?.user?.profilePhoto || reserva.carer?.profilePhoto || 'https://i.pravatar.cc/150?u=' + reserva.carerId"
                  class="rounded-circle me-3"
                  width="60"
                  height="60"
                  alt="Foto del cuidador"
              />
              <div>
                <h5 class="card-title mb-1">
                  {{ reserva.carer?.user?.name || reserva.carer?.name || 'Desconocido' }} 
                  {{ reserva.carer?.user?.lastName || reserva.carer?.lastName || '' }}
                  <span
                      class="badge ms-2"
                      :class="badgeClass(reserva.reservationState)"
                  >
                {{ reservations.states[reserva.reservationState] }}
              </span>
                </h5>
                <strong>Servicios:</strong>
                <div v-if="reservations.reservationServices.value.filter((rs) => rs.reservationId === reserva.id).length > 0">
                  <p
                      v-for="rel in reservations.reservationServices.value.filter(
                  (rs) => rs.reservationId === reserva.id
                )"
                      :key="rel.id"
                      class="mb-1"
                  >
                    {{ rel.service?.name || 'Servicio desconocido' }}
                  </p>
                </div>
                <p v-else class="text-muted mb-1">Cargando servicios...</p>
                <p>
                  <strong>Fecha:</strong> {{ formatDate(reserva.serviceDate) }}
                </p>
              </div>
            </div>

            <!-- ⚙️ Botones -->
            <div class="ms-3 d-flex flex-column gap-2">
              <button
                  v-if="reservations.states[reserva.reservationState] === 'Pendiente'"
                  class="btn btn-sm btn-outline-danger"
              >
                Cancelar
              </button>

              <button
                  v-if="reservations.states[reserva.reservationState] === 'Finalizada'"
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
            v-if="reservasFiltradas.length === 0 && !reservations.loading.value"
            class="text-center text-muted"
        >
          <h3>No hay reservas en este estado.</h3>
        </div>

        <!-- 🔸 Cargando -->
        <div v-if="reservations.loading.value" class="text-center my-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔹 Paginación -->
    <nav v-if="reservations.pageable.value.totalPages > 1" class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: paginaActual === 1 }">
          <button class="page-link" @click="paginaAnterior">Anterior</button>
        </li>
        <li class="page-item" v-for="n in reservations.pageable.value.totalPages"
            :key="n" :class="{ active: n === paginaActual }">
          <button class="page-link" @click="irAPagina(n)">{{ n }}</button>
        </li>
        <li class="page-item" :class="{ disabled: paginaActual === reservations.pageable.value.totalPages }">
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
