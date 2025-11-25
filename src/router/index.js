import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: LoginView,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/UserRole/DashboardView.vue"),
  },
  {
    path: "/register",
    name: "Register",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/RegisterView.vue"),
  },
  // --- HERE IS THE NEW ROUTE I ADDED ---
  {
    path: "/create",
    name: "CreateAppointment",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "../views/UserRole/CreateAppointmentView.vue" // <-- FIXED
      ),
  },
  {
    path: "/appointment/:id", // :id allows dynamic URLs like /appointment/5
    name: "AppointmentDetails",
    component: () => import("../views/UserRole/AppointmentDetailView.vue"),
  },
  {
    path: "/admin", // 
    name: "Admin",
    component: () => import("../views/AdminRole/AdminDashboardView.vue"),
  },

  // --- END OF NEW ROUTE ---
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
