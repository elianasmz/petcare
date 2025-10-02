<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const mode = ref("login"); // login | register

// Login
const loginForm = reactive({
  email: "",
  password: "",
});

// Registro
const registerForm = reactive({
  email: "",
  password: "",
  confirmPassword: "",
  userType: "", // "dueno" | "cuidador" | "ambos"
  name: "",
  phone: "",
  experience: "",
  pets: "",
});


function handleLogin() {
  // Lógica real iría aquí
  alert(`Bienvenido, ${loginForm.email}`);
  router.push("/");
}

function handleRegister() {
  // Validaciones extra aquí
  alert(`Registrado como: ${registerForm.userType.join(", ")}`);
  router.push("/");
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Tabs -->
      <div class="tabs">
        <button
          :class="{ active: mode === 'login' }"
          @click="mode = 'login'"
        >
          Iniciar Sesión
        </button>
        <button
          :class="{ active: mode === 'register' }"
          @click="mode = 'register'"
        >
          Registrarse
        </button>
      </div>

      <!-- LOGIN -->
      <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="form">
        <input type="email" v-model="loginForm.email" placeholder="Correo electrónico" required />
        <input type="password" v-model="loginForm.password" placeholder="Contraseña" required />
        <button type="submit" class="btn-primary">Ingresar</button>
      </form>

      <!-- REGISTRO -->
      <form v-else @submit.prevent="handleRegister" class="form">
        <input type="text" v-model="registerForm.name" placeholder="Nombre completo" required />
        <input type="email" v-model="registerForm.email" placeholder="Correo electrónico" required />
        <input type="text" v-model="registerForm.phone" placeholder="Teléfono" required />
        <input type="password" v-model="registerForm.password" placeholder="Contraseña" required />
        <input type="password" v-model="registerForm.confirmPassword" placeholder="Confirmar contraseña" required />

       <!-- Selección de tipo -->
        <div class="user-type">
        <p>Selecciona tu tipo de usuario:</p>
        <div class="user-type-options">
            <label
            v-for="option in ['dueno', 'cuidador', 'ambos']"
            :key="option"
            :class="['user-type-option', { active: registerForm.userType === option }]"
            >
            <input
                type="radio"
                :value="option"
                v-model="registerForm.userType"
                hidden
            />
            {{ option === 'dueno' ? 'Dueño' : option === 'cuidador' ? 'Cuidador' : 'Ambos' }}
            </label>
        </div>
        </div>

        <button type="submit" class="btn-primary">Registrarse</button>

      </form>
    </div>
  </div>
</template>

<style scoped>
    .auth-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #a8dadc, #eaf8fb);
    padding: 1rem;
    }

    .auth-card {
    background: white;
    padding: 2rem;
    border-radius: 16px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }

    .tabs {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    }

    .tabs button {
    flex: 1;
    padding: 0.7rem;
    border: none;
    background: transparent;
    font-weight: bold;
    cursor: pointer;
    transition: color 0.2s, border-bottom 0.2s;
    border-bottom: 2px solid transparent;
    }

    .tabs button.active {
    color: #2196f3;
    border-bottom: 2px solid #2196f3;
    }

    .form input,
    .form textarea {
    width: 100%;
    margin: 0.5rem 0;
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid #ccc;
    outline: none;
    transition: border 0.2s;
    }

    .form input:focus,
    .form textarea:focus {
    border: 1px solid #2196f3;
    }

    .checkboxes {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
    }

    .btn-primary {
    width: 100%;
    padding: 0.9rem;
    margin-top: 1rem;
    border: none;
    border-radius: 8px;
    background: #2196f3;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
    }

    .btn-primary:hover {
    background: #1976d2;
    }
    .user-type {
    margin: 1rem 0;
    text-align: center;
    }

    .user-type-options {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 0.5rem;
    }

    .user-type-option {
    padding: 0.6rem 1.2rem;
    border: 2px solid #0077b6;
    border-radius: 20px;
    cursor: pointer;
    font-weight: bold;
    background: white;
    color: #0077b6;
    transition: all 0.2s ease-in-out;
    }

    .user-type-option:hover {
    background: #caf0f8;
    }

    .user-type-option.active {
    background: #0077b6;
    color: white;
    border-color: #0077b6;
    }
</style>
