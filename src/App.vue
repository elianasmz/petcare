<!--
<template>
  <router-view />
</template>

<script setup>
</script>
-->

<!-- src/App.vue -->
<template>
  <div id="app">
    <NavBar />
    <main class="container">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from './stores/userStore.js';
import NavBar from './components/NavBar.vue';

const router = useRouter();
const userStore = useUserStore();

// Manejar evento de no autorizado (401)
function handleUnauthorized() {
  userStore.logout();
  router.push('/login');
}

onMounted(() => {
  window.addEventListener('unauthorized', handleUnauthorized);
});

onUnmounted(() => {
  window.removeEventListener('unauthorized', handleUnauthorized);
});
</script>

<style>
body { margin: 0; font-family: Inter, system-ui, sans-serif; }
.container { padding: 1.5rem; min-height: calc(100vh - 140px); }
</style>
