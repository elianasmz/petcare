import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import {createPinia} from 'pinia'
import './assets/custom.css'
import { useUserStore } from './stores/userStore.js'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

app.use(router);

// Inicializar autenticación al cargar la app
const userStore = useUserStore();
userStore.initAuth();

app.mount('#app')