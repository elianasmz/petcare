import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import {createPinia} from 'pinia'
import './assets/custom.css'


//createApp(App).use(router).mount('#app')
//App.use(createPinia())
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

app.use(router);

app.mount('#app')