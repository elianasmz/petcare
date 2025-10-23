// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
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
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  { path: '/login', name: 'Login', component: Login },
  { path: '/caretakers', name:'CarerList',  component: CarerList },
  { path: '/carer', name: 'CarerDashboard', component: CarerDashboard },

    // Reservations routes
    { path: '/reservations', name: 'Reservations', component: OwnerReservationView },
  { path: "/caretakers/:id", name: "CarerDetail", component: CarerDetail, props: true },
  { path: "/carer-reservations", name:"CarerReservations", component: CarerReservations},
  { path: '/reservation/:id/pay', name: 'PayReservations', component: PayReservations, props: true },
    { path: "/prueba-reservations", name:"PruebaReservation", component: PruebaReservation},
    { path: "/reservationsview", name:"ReservationView", component: CarerReservationView}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
