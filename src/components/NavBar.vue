<!-- src/components/NavBar.vue -->
<script setup>
import logo from "../assets/logo.png";
</script>

<template>
  <!-- Barra superior -->
  <header class="navbar">
    <div class="logo">
      <img :src="logo" alt="logo" width="50" height="35" />
      <span>Patitas Felices</span>
    </div>

    <nav class="links">
      <RouterLink class="nav-link d-inline px-2" to="/">Inicio</RouterLink>
      <RouterLink class="nav-link d-inline px-2" to="/caretakers">Cuidadores</RouterLink>
      <RouterLink class="nav-link d-inline px-2" to="/reservations">Mis Reservas</RouterLink>
      <RouterLink class="nav-link d-inline px-2" to="/carer-reservations">Reservas Recibidas</RouterLink>
      <RouterLink class="nav-link d-inline px-2" to="/carer">Perfil</RouterLink>
      <RouterLink class="nav-link d-inline px-2" to="/login">Iniciar sesión</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.links{display:flex;gap:1rem;color:ghostwhite}
a{color:#2a2b2c;text-decoration:none}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0.8rem 1.5rem;
  background: #a8dadc;

}

body {
  padding-top: 60px; /* altura del header para que el contenido no quede debajo */
}

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .profile .icon,
  .logo .icon {
    width: 28px;
    height: 28px;
  }

</style>
