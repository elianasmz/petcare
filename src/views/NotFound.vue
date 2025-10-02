<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Página no encontrada</p>
    <router-link to="/">Volver al inicio</router-link>
  </div>
</template>

<script setup>
// No necesitas lógica por ahora
</script>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 50px;
}
h1 {
  font-size: 5rem;
  color: #ff6b6b;
}
p {
  font-size: 1.2rem;
  color: #333;
}
</style>
