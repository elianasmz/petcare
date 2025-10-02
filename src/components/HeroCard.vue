<!-- src/components/HeroCard.vue -->
<template>
  <section class="hero">
    <div class="hero-left">
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
      <RouterLink to="/services" class="btn">Explorar servicios →</RouterLink>
    </div>
    <div class="hero-right">
      <img :src="image" alt="hero" />
    </div>
  </section>
</template>

<script setup>
defineProps({ title: String, subtitle: String, image: { type: String, default: '/hero.jpg' } })
</script>

<style scoped>
.hero{display:flex;gap:2rem;align-items:center;background:#eaf8fb;padding:2rem;border-radius:12px}
.hero-left h1{color:#0b5cff}
.hero-right img{width:320px;border-radius:10px;object-fit:cover}
.btn{display:inline-block;margin-top:1rem;padding:.6rem 1rem;border-radius:999px;border:1px solid #0b5cff;text-decoration:none;color:#0b5cff}
</style>
