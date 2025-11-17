// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/userStore.js';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import CarerDashboard from '../views/CarerDashboard.vue';
import Reservations from '../views/Reservations.vue';
import ReservationDetails from '../views/ReservationDetails.vue';
import NotFound from '../views/NotFound.vue';
import CarerList from '../views/CarerList.vue'
import CarerDetail from '../views/CarerDetail.vue';
import CarerReservations from '../views/CarerReservations.vue';
import PayReservations from '../views/PayReservations.vue';

import PruebaReservation from '../views/PruebaReservation.vue';
import OwnerReservationView from '../views/OwnerReservationView.vue';
import CarerReservationView from '../views/CarerReservationView.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login, meta: { requiresAuth: false } },
  { path: '/caretakers', name: 'CarerList', component: CarerList },
  
  // Rutas protegidas - Requieren autenticación
  { 
    path: '/carer', 
    name: 'CarerDashboard', 
    component: CarerDashboard,
    meta: { requiresAuth: true, allowedRoles: ['CARER', 'carer', 'cuidador'] }
  },
  { 
    path: '/reservations', 
    name: 'Reservations', 
    component: OwnerReservationView,
    meta: { requiresAuth: true, allowedRoles: ['OWNER', 'owner', 'dueno'] }
  },
  { 
    path: "/carer-reservations", 
    name: "CarerReservations", 
    component: CarerReservationView,
    meta: { requiresAuth: true, allowedRoles: ['CARER', 'carer', 'cuidador'] }
  },
  { 
    path: '/reservation/:id/pay', 
    name: 'PayReservations', 
    component: PayReservations, 
    props: true,
    meta: { requiresAuth: true }
  },
  { path: "/caretakers/:id", name: "CarerDetail", component: CarerDetail, props: true },
  { path: "/prueba-reservations", name: "PruebaReservation", component: PruebaReservation },
  { path: "/reservationsview", name: "ReservationView", component: CarerReservationView },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard de navegación
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  
  // Si hay token pero no está validado, validarlo primero
  if (userStore.token && !userStore.isAuthenticated) {
    await userStore.validateToken();
  }

  // Si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    if (!userStore.isAuthenticated) {
      // Redirigir al login si no está autenticado
      next({ name: 'Login', query: { redirect: to.fullPath } });
      return;
    }

    // Si la ruta tiene roles permitidos, verificar
    if (to.meta.allowedRoles && to.meta.allowedRoles.length > 0) {
      const hasAllowedRole = to.meta.allowedRoles.some(role => 
        userStore.roles.some(userRole => 
          userRole.toLowerCase() === role.toLowerCase() ||
          userRole.toLowerCase().includes(role.toLowerCase())
        )
      );

      if (!hasAllowedRole) {
        // No tiene el rol necesario, redirigir al home
        next({ name: 'Home' });
        return;
      }
    }
  }

  // Si está autenticado y trata de ir al login, redirigir al home
  if (to.name === 'Login' && userStore.isAuthenticated) {
    next({ name: 'Home' });
    return;
  }

  next();
});

export default router;
