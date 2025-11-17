<!-- src/components/NavBar.vue -->
<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore.js";
import logo from "../assets/logo.png";

const router = useRouter();
const userStore = useUserStore();

const isAuthenticated = computed(() => userStore.isAuthenticated);
const username = computed(() => userStore.username || userStore.user?.name || "Usuario");
const isCarer = computed(() => userStore.isCarer);
const isOwner = computed(() => userStore.isOwner);

function handleLogout() {
  userStore.logout();
  router.push("/");
}

function goToProfile() {
  if (userStore.isCarer) {
    router.push("/carer");
  } else {
    router.push("/");
  }
}
</script>

<template>
  <!-- Barra superior -->
  <header class="navbar">
    <div class="logo">
      <RouterLink to="/" class="logo-link">
        <img :src="logo" alt="logo" width="50" height="35" />
        <span>Patitas Felices</span>
      </RouterLink>
    </div>

    <nav class="links">
      <RouterLink class="nav-link d-inline px-2" to="/">Inicio</RouterLink>
      <RouterLink class="nav-link d-inline px-2" to="/caretakers">Cuidadores</RouterLink>
      
      <!-- Enlaces solo para usuarios autenticados -->
      <template v-if="isAuthenticated">
        <RouterLink 
          v-if="isOwner" 
          class="nav-link d-inline px-2" 
          to="/reservations"
        >
          Mis Reservas
        </RouterLink>
        <RouterLink 
          v-if="isCarer" 
          class="nav-link d-inline px-2" 
          to="/carer-reservations"
        >
          Reservas Recibidas
        </RouterLink>
        <RouterLink 
          v-if="isCarer" 
          class="nav-link d-inline px-2" 
          to="/carer"
        >
          Mi Perfil
        </RouterLink>
        
        <!-- Menú de usuario -->
        <div class="user-menu">
          <span class="username">{{ username }}</span>
          <button class="btn-logout" @click="handleLogout">Cerrar sesión</button>
        </div>
      </template>
      
      <!-- Enlace de login solo si no está autenticado -->
      <RouterLink 
        v-if="!isAuthenticated" 
        class="nav-link d-inline px-2" 
        to="/login"
      >
        Iniciar sesión
      </RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.links {
  display: flex;
  gap: 1rem;
  align-items: center;
  color: ghostwhite;
}

a {
  color: #2a2b2c;
  text-decoration: none;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0.8rem 1.5rem;
  background: #a8dadc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

body {
  padding-top: 60px; /* altura del header para que el contenido no quede debajo */
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
}

.profile .icon,
.logo .icon {
  width: 28px;
  height: 28px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
}

.username {
  font-weight: 500;
  color: #2a2b2c;
}

.btn-logout {
  padding: 0.4rem 0.8rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: #c82333;
}

.nav-link {
  transition: color 0.2s;
}

.nav-link:hover {
  color: #0077b6;
}

</style>
