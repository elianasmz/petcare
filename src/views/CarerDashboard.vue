<script setup>
import { onMounted, ref, reactive, computed } from "vue";
import { useServicesStore } from "../stores/servicesStore.js";

const servicesStore = useServicesStore();

onMounted(async () => {
  await servicesStore.fetchServiceTypes();
});

// Datos del cuidador (simulación)
const caretaker = reactive({
  id: 1,
  name: "María López",
  email: "maria@example.com",
  phone: "099123456",
  bio: "Amante de los animales con 5 años de experiencia.",
  photo: "https://randomuser.me/api/portraits/women/44.jpg", // foto inicial
});

// Servicios disponibles en el sistema
const systemServices = computed(() => servicesStore.serviceTypes.map(st => st.name));

// Servicios que ofrece este cuidador
const caretakerServices = ref([
  { type: "Paseos", price: 15 },
  { type: "Hospedaje", price: 25 },
]);

// Campos para añadir un servicio
const newService = reactive({
  type: systemServices[0],
  price: 0,
});

// Función para agregar servicio
function addService() {
  if (!caretakerServices.value.find(s => s.type === newService.type)) {
    caretakerServices.value.push({ type: newService.type, price: Number(newService.price) });
    newService.price = 0;
  } else {
    alert("El servicio ya está agregado.");
  }
}

// Función para eliminar servicio
function removeService(service) {
  caretakerServices.value = caretakerServices.value.filter(s => s !== service);
}

// Guardar perfil (simulado)
function saveProfile() {
  alert("Perfil actualizado correctamente.");
}

// Cambiar foto
const fileInput = ref(null);
function triggerFileInput() {
  fileInput.value.click();
}
function handleFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    caretaker.photo = URL.createObjectURL(file);
  }
}
</script>

<template>
  <div class="container mt-4">
    <h2>Panel de Cuidador</h2>

    <!-- Perfil -->
    <div class="card mb-4 p-3 shadow-sm d-flex flex-row align-items-start gap-4">
      <!-- Foto de perfil -->
      <div class="position-relative">
        <img :src="caretaker.photo" alt="Foto" class="rounded-circle" width="120" height="120" />
        <button type="button"
          class="btn btn-sm btn-light position-absolute bottom-0 end-0"
          style="border-radius:50%; padding:0.25rem;"
          @click="triggerFileInput">
          ✏️
        </button>
        <input type="file" ref="fileInput" class="d-none" @change="handleFileChange" />
      </div>

      <!-- Formulario de perfil -->
      <div class="flex-grow-1">
        <div class="mb-3">
          <label class="form-label">Nombre</label>
          <input v-model="caretaker.name" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="caretaker.email" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Teléfono</label>
          <input v-model="caretaker.phone" class="form-control" />
        </div>
        <div class="mb-3">
          <label class="form-label">Bio</label>
          <textarea v-model="caretaker.bio" class="form-control"></textarea>
        </div>
        <button class="btn btn-success" @click="saveProfile">Guardar Perfil</button>
      </div>
    </div>

    <!-- Servicios -->
    <div class="card mb-4 p-3 shadow-sm">
      <h5>Servicios</h5>

      <!-- Agregar servicio -->
      <div class="d-flex gap-2 mb-3">
        <select v-model="newService.type" class="form-select">
          <option v-for="s in systemServices" :key="s">{{ s }}</option>
        </select>
        <input type="number" v-model="newService.price" class="form-control" placeholder="Precio $" />
        <button class="btn btn-primary" @click="addService">Agregar</button>
      </div>

      <!-- Lista de servicios actuales -->
      <ul class="list-group">
        <li class="list-group-item d-flex justify-content-between align-items-center" v-for="s in caretakerServices" :key="s.type">
          {{ s.type }} - ${{ s.price }}
          <button class="btn btn-sm btn-danger" @click="removeService(s)">Eliminar</button>
        </li>
      </ul>
    </div>
  </div>
</template>

