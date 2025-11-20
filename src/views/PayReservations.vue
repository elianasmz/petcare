<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useReservations } from "../composables/useReservations.js";
import { useCarers } from "../composables/useCarers.js";
import { useAuth } from "../composables/useAuth.js";
import { useUsers } from "../composables/useUsers.js";
import { getUserIdFromToken } from "../utils/jwtUtils.js";
import { usePayments } from "../composables/usePayments.js";

const router = useRouter();
const reservations = useReservations();
const carers = useCarers();
const auth = useAuth();
const users = useUsers();
const payments = usePayments();

const caretaker = ref(null);
const carerId = ref(null);

// Estado local de pagos
const pagos = ref([{ tipo: "", monto: 0 }]);
const currentReservation = ref(null);

// Computed seguro para listar métodos de pago
const paymentMethodsList = computed(() => payments.paymentMethods.value);

// 🔑 Obtener carerId del usuario en sesión
async function getCarerIdFromSession() {
  try {
    let userId = auth.user.value?.id;

    if (!userId && auth.username.value) {
      await users.fetchUserByEmail(auth.username.value);
      if (users.currentUser.value) {
        auth.user.value = users.currentUser.value;
        userId = auth.user.value?.id;
      }
    }

    if (!userId && auth.token.value) {
      const tokenUserId = getUserIdFromToken(auth.token.value);
      if (tokenUserId) {
        userId = tokenUserId;
        auth.user.value = { id: userId };
      }
    }

    if (!userId) return null;

    await carers.fetchAllCarers();
    const carer = carers.carers.value.find(
      (c) => c.userId === userId || c.id === userId || c.user?.id === userId
    );
    return carer?.id || userId;
  } catch {
    return auth.user.value?.id || (auth.token.value ? getUserIdFromToken(auth.token.value) : null);
  }
}

// Inicializar datos
onMounted(async () => {
  // 1️⃣ Cargar métodos de pago
  await payments.fetchPaymentMethods();
  console.log("Métodos de pago:", payments.paymentMethods.value);

  // 2️⃣ Cargar carer y reservas
  const id = await getCarerIdFromSession();
  if (id) {
    carerId.value = id;
    caretaker.value = await carers.getCarerById(id);

    await reservations.searchReservations({
      carerId: id,
      page: 0,
      size: 50,
      sortBy: "serviceDate",
      sortDir: "ASC",
    });
    await reservations.getAllReservationServices();

    currentReservation.value = reservations.reservations.value[0] || null;
  }
});

// 💰 Calcular total de servicios
function totalPrice(services) {
  return services.reduce((sum, s) => sum + (s.price || 0), 0);
}

// 🎨 Obtener servicios para una reserva
function getServicesForReservation(reservationId) {
  return reservations.reservationServices.value
    .filter((rs) => rs.reservationId === reservationId)
    .map((rs) => rs.service);
}

// 📊 Totales
const totalReal = computed(() =>
  currentReservation.value
    ? totalPrice(getServicesForReservation(currentReservation.value.id))
    : 0
);

const totalPagos = computed(() =>
  pagos.value.reduce((sum, p) => sum + Number(p.monto), 0)
);

// 🛠 Métodos de pago
function agregarPago() {
  pagos.value.push({ tipo: "", monto: 0 });
}

function eliminarPago(i) {
  pagos.value.splice(i, 1);
}

// 💳 Confirmar pago: crear factura + detalles
async function confirmarPago() {
  if (totalPagos.value !== totalReal.value) {
    alert(`El total debe ser Gs. ${totalReal.value.toLocaleString()}`);
    return;
  }

  try {
    // Crear factura
    const invoice = await payments.createInvoice({
      reservationId: currentReservation.value.id,
      totalAmount: totalReal.value,
    });

    if (!invoice) throw new Error("Error al crear la factura");

    // Crear detalles de pago
    for (const pago of pagos.value) {
      await payments.createPaymentDetail({
        invoiceId: invoice.id,
        paymentMethodId: pago.tipo,
        amount: pago.monto
      });
    }

    alert("Pago confirmado ✔️");
    router.push({ name: "Reservations" });

  } catch (e) {
    console.error(e);
    alert("Ocurrió un error al procesar el pago");
  }
}

function goBack() {
  router.push({ name: "MisReservas" });
}
</script>

<template>
  <div class="container mt-4">
    <h2>Pago de Reserva</h2>

    <div v-if="currentReservation">
      <p><strong>Fecha:</strong> {{ new Date(currentReservation.serviceDate).toLocaleString('es-PY') }}</p>

      <!-- Servicios -->
      <h5>Servicios</h5>
      <ul>
        <li v-for="s in getServicesForReservation(currentReservation.id)" :key="s?.id">
          {{ s?.description || 'Servicio' }} - Gs. {{ (s?.price || 0).toLocaleString('es-PY') }}
        </li>
      </ul>

      <p><strong>Total:</strong> Gs. {{ totalReal.toLocaleString('es-PY') }}</p>

      <!-- Métodos de pago -->
      <h5>Métodos de pago</h5>
      <div v-for="(pago, i) in pagos" :key="i" class="d-flex gap-2 mb-2">
        <!-- Mostrar select solo si hay métodos -->
        <select v-if="paymentMethodsList.length" v-model.number="pago.tipo" class="form-select">
          <option disabled value="">Tipo</option>
          <option v-for="method in paymentMethodsList" :key="method.id" :value="method.id">
            {{ method.label }}
          </option>
        </select>

        <p v-else>Cargando métodos de pago...</p>

        <input type="number" v-model.number="pago.monto" class="form-control" placeholder="Monto" />
        <button class="btn btn-danger" @click="eliminarPago(i)">X</button>
      </div>

      <button class="btn btn-secondary mb-3" @click="agregarPago">+ Agregar método</button>

      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-secondary" @click="goBack">← Volver</button>
        <button class="btn btn-success" @click="confirmarPago">Confirmar pago</button>
      </div>
    </div>

    <p v-else>No hay reservas disponibles.</p>
  </div>
</template>
