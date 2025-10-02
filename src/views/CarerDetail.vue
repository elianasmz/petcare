<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

// Lista de cuidadores con precios por servicio
const caretakers = [
  {
    id: 1,
    name: "María López",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    description: "Amante de los animales con 5 años de experiencia cuidando perros y gatos.",
    services: [
      { name: "Paseos", price: 15 },
      { name: "Hospedaje", price: 30 },
      { name: "Visitas a domicilio", price: 20 }
    ]
  },
  {
    id: 2,
    name: "Carlos Pérez",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    description: "Veterinario estudiante, especializado en mascotas pequeñas.",
    services: [
      { name: "Atención básica", price: 10 },
      { name: "Paseos", price: 15 },
      { name: "Baños", price: 25 }
    ]
  },
  {
    id: 3,
    name: "Ana Gómez",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    description: "Ofrezco cuidado responsable y amoroso para perros grandes.",
    services: [
      { name: "Entrenamiento básico", price: 20 },
      { name: "Hospedaje", price: 35 },
      { name: "Paseos largos", price: 25 }
    ]
  }
];

const route = useRoute();
const router = useRouter();

const caretaker = caretakers.find(c => c.id === Number(route.params.id));

// Selecciones de reserva
const selectedServices = ref([]);
const reservationDate = ref("");
const note = ref("");

// Total calculado
const totalPrice = computed(() => {
  return selectedServices.value.reduce((sum, serviceName) => {
    const service = caretaker.services.find(s => s.name === serviceName);
    return sum + (service ? service.price : 0);
  }, 0);
});

// Función para confirmar reserva
function bookCaretaker() {
  if (selectedServices.value.length === 0) {
    alert("Debes seleccionar al menos un servicio.");
    return;
  }
  if (!reservationDate.value) {
    alert("Debes seleccionar una fecha.");
    return;
  }

  alert(
    `Reserva creada para ${caretaker.name}\nServicios: ${selectedServices.value.join(", ")}\nFecha: ${reservationDate.value}\nNota: ${note.value}\nTotal: $${totalPrice.value}`
  );

  // Reset campos
  selectedServices.value = [];
  reservationDate.value = "";
  note.value = "";
  router.push("/caretakers"); // Volver al listado
}

// Función de botón de atrás
function goBack() {
  router.push("/caretakers");
}
</script>

<template>
  <div class="container mt-4" v-if="caretaker">
    <h2>{{ caretaker.name }}</h2>

        <div class="d-flex justify-content-start mt-3">
    <img :src="caretaker.photo" alt="foto" class="rounded-circle mb-3" width="100" height="100" />
    <p>{{ caretaker.description }}</p>
    </div>

    <h5>Selecciona los servicios:</h5>
    <form @submit.prevent="bookCaretaker">
      <div class="form-check mb-2" v-for="service in caretaker.services" :key="service.name">
        <input
          class="form-check-input"
          type="checkbox"
          :id="service.name"
          :value="service.name"
          v-model="selectedServices"
        />
        <label class="form-check-label" :for="service.name">
          {{ service.name }} - ${{ service.price }}
        </label>
      </div>

      <div class="mb-3 mt-3">
        <label class="form-label fw-bold">Fecha de reserva</label>
        <input type="date" v-model="reservationDate" class="form-control" />
      </div>

      <div class="mb-3">
        <label class="form-label fw-bold">Nota adicional</label>
        <textarea v-model="note" class="form-control" rows="3" placeholder="Ej. Preferencias del cuidado"></textarea>
      </div>

      <p class="fw-bold">Total: ${{ totalPrice }}</p>
    <div class="d-flex justify-content-end mt-3">
        <button class="btn btn-secondary me-2" @click="goBack">Atras</button>
        <button type="submit" class="btn btn-success">Confirmar Reserva</button>
    </div>

    </form>
  </div>

  <div v-else>
    <p>Cuidador no encontrado.</p>
  </div>
</template>
