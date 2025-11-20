import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import './assets/custom.css'
import { useAuth } from './composables/useAuth.js'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

const app = createApp(App);

app.use(router);

// Inicializar autenticación al cargar la app
const auth = useAuth();
auth.initAuth();

app.mount('#app')