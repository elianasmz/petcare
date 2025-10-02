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
import NavBar from './components/NavBar.vue';
</script>

<style>
body { margin: 0; font-family: Inter, system-ui, sans-serif; }
.container { padding: 1.5rem; min-height: calc(100vh - 140px); }
</style>
