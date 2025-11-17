<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore.js";

const router = useRouter();
const userStore = useUserStore();
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
  name: "",
  lastName: "",
  phoneNumber: "",
  userType: "", // "dueno" | "cuidador" | "ambos"
  state: "AVAILABLE", // Estado de disponibilidad por defecto
});

const loginError = ref("");
const registerError = ref("");

// Mapeo por defecto de tipos de usuario a IDs de roles
// Estos IDs son comunes, pero pueden necesitar ajuste según tu base de datos
// OWNER generalmente es 1, CARER generalmente es 2
// NOTA: No podemos cargar roles desde el backend durante el registro porque
// el endpoint /roles requiere rol de ADMIN. Por lo tanto, usamos IDs estáticos.
const DEFAULT_ROLE_IDS = {
  'dueno': [1],      // OWNER - Ajusta este ID si es diferente en tu BD
  'cuidador': [2],   // CARER - Ajusta este ID si es diferente en tu BD
  'ambos': [1, 2]    // OWNER y CARER
};

async function handleLogin() {
  loginError.value = "";
  
  if (!loginForm.email || !loginForm.password) {
    loginError.value = "Por favor completa todos los campos";
    return;
  }

  try {
    await userStore.login(loginForm.email, loginForm.password);
    
    // Redirigir según el rol del usuario
    if (userStore.isCarer) {
      router.push("/carer");
    } else if (userStore.isOwner) {
      router.push("/");
    } else {
      router.push("/");
    }
  } catch (err) {
    loginError.value = userStore.error || "Error al iniciar sesión. Verifica tus credenciales.";
  }
}

async function handleRegister() {
  registerError.value = "";
  
  // Validaciones
  if (!registerForm.email || !registerForm.password || !registerForm.name || !registerForm.phoneNumber) {
    registerError.value = "Por favor completa todos los campos obligatorios";
    return;
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    registerError.value = "Las contraseñas no coinciden";
    return;
  }

  if (registerForm.password.length < 6) {
    registerError.value = "La contraseña debe tener al menos 6 caracteres";
    return;
  }

  if (!registerForm.userType) {
    registerError.value = "Por favor selecciona un tipo de usuario";
    return;
  }

  // Mapear tipo de usuario a IDs de roles
  // Usar el mapeo por defecto ya que no podemos cargar roles sin autenticación ADMIN
  const roleIds = DEFAULT_ROLE_IDS[registerForm.userType];
  
  if (!roleIds || roleIds.length === 0) {
    registerError.value = "Tipo de usuario inválido. Por favor selecciona un tipo válido.";
    return;
  }

  const registerData = {
    email: registerForm.email,
    name: registerForm.name,
    lastName: registerForm.lastName || "",
    password: registerForm.password,
    phoneNumber: registerForm.phoneNumber,
    state: registerForm.state,
    roles: roleIds
  };

  try {
    await userStore.register(registerData);
    
    // Redirigir según el rol del usuario
    if (userStore.isCarer) {
      router.push("/carer");
    } else if (userStore.isOwner) {
      router.push("/");
    } else {
      router.push("/");
    }
  } catch (err) {
    registerError.value = userStore.error || "Error al registrar usuario. Intenta nuevamente.";
  }
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
        <div v-if="loginError" class="alert alert-danger">
          {{ loginError }}
        </div>
        <input type="email" v-model="loginForm.email" placeholder="Correo electrónico" required />
        <input type="password" v-model="loginForm.password" placeholder="Contraseña" required />
        <button type="submit" class="btn-primary" :disabled="userStore.loading">
          {{ userStore.loading ? 'Iniciando sesión...' : 'Ingresar' }}
        </button>
      </form>

      <!-- REGISTRO -->
      <form v-else @submit.prevent="handleRegister" class="form">
        <div v-if="registerError" class="alert alert-danger">
          {{ registerError }}
        </div>
        <input type="text" v-model="registerForm.name" placeholder="Nombre" required />
        <input type="text" v-model="registerForm.lastName" placeholder="Apellido" />
        <input type="email" v-model="registerForm.email" placeholder="Correo electrónico" required />
        <input type="text" v-model="registerForm.phoneNumber" placeholder="Teléfono" required />
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

        <button type="submit" class="btn-primary" :disabled="userStore.loading">
          {{ userStore.loading ? 'Registrando...' : 'Registrarse' }}
        </button>

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

    .alert {
    padding: 0.75rem;
    margin-bottom: 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    }

    .alert-danger {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    }

    button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
