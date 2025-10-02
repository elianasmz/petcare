<script setup>
import { useRouter } from 'vue-router';
import inicio from "../assets/inicio.jpg";
import { useContadorStore } from '../stores/contador'; 

const contador = useContadorStore(); 
const router = useRouter();

function goToLogin() {
  router.push('/login'); // Redirige a la página de login
}
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-image">
           <img :src="inicio" alt="inicio" width="500" height="250" />
        </div>
        <div class="hero-text">
          <h1>Conecta con cuidadores de confianza para tu mascota</h1>
          <p>
            Encuentra paseadores, cuidadores y profesionales cerca de ti en un solo lugar.
          </p>
          <!-- Redirige al login -->
          <button class="btn" @click="goToLogin">Registrarme →</button>
        </div>
      </div>
    </section>
     <!-- Contador de prueba -->
   <!-- <section class="counter">
      <h2>Contador de prueba</h2>
      <p>Valor: {{ contador.count }}</p>
      <button class="btn" @click="contador.increment()">+</button>
      <button class="btn" @click="contador.decrement()">-</button>
      <button class="btn" @click="contador.reset()">Reset</button>
    </section>-->

    <!-- Listado de servicios -->
    <section class="services">
      <div class="services-container">
        <h2>Servicios que ofrecemos</h2>
        <div class="service-list">
          <div class="service-item">Paseos para mascotas</div>
          <div class="service-item">Hospedaje</div>
          <div class="service-item">Alimentación</div>
          <div class="service-item">Transporte</div>
          <div class="service-item">Baño basico</div>
          <div class="service-item">Alojamiento temporal</div>
        </div>
      </div>
    </section>
  </div>
</template>


<style scoped>

  
  /* Hero section */
  .hero {
    display: flex;
    justify-content: center;
    padding: 2rem;
  }

  .hero-content, services {
    display: flex;
    gap: 2rem;
    background: #eaf8fb;
    padding: 2rem;
    border-radius: 12px;
    max-width: 2000px;
    align-items: center;
  }

  .hero-image img {
    height: auto;
    border-radius: 10px;
    object-fit: cover;
  }

  .hero-text h1 {
    font-size: 1.8rem;
    color: #2196f3;
  }

  .hero-text p {
    margin: 1rem 0;
    color: #333;
  }

  .btn {
    background: transparent;
    border: 1px solid #2196f3;
    color: #2196f3;
    padding: 0.6rem 1rem;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .btn:hover {
    background: #2196f3;
    color: white;
  }
  .services {
    background: #eaf8fb; 
    padding: 2rem 1rem;
  }

  /* Contenedor centrado con mismo ancho que hero */
  .services-container {
    max-width: 900px;  
    margin: 0 auto;
    text-align: center;
  }

  .services h2 {
    color: #2196f3;
    margin-bottom: 2rem;
    font-size: 1.6rem;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  /* Contenedor horizontal de servicios */
  .service-list {
    display: flex;
    flex-wrap: wrap;               
    justify-content: center;
    gap: 1rem;                     
  }

  .service-item {
    flex: 1 1 calc(33.33% - 1rem); 
    max-width: 250px;
    background: #fff;              
    padding: 1rem;
    border-radius: 8px;
    font-size: 1rem;
    color: #333;
    transition: transform 0.2s;
    text-align: center;
  }

  .service-item:hover {
    transform: translateY(-3px); 
  }
</style>
