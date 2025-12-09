import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/UserRole/DashboardView.vue";
import CreateAppointmentView from "../views/UserRole/CreateAppointmentView.vue";
import AppointmentDetailView from "../views/UserRole/AppointmentDetailView.vue";
import EditAppointmentView from "../views/UserRole/EditAppointmentView.vue";
import AdminDashboardView from "../views/AdminRole/AdminDashboardView.vue";
import VaccineRestockView from "../views/AdminRole/VaccineRestockView.vue";
import AdminHolidaysView from "../views/AdminRole/AdminHolidaysView.vue"; // 💡 NEW IMPORT

const routes = [
  {
    path: "/", // Set root path back to Login
    name: "Login",
    component: LoginView,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/RegisterView.vue"),
  }, // --- USER APPOINTMENT ROUTES ---
  {
    path: "/create",
    name: "CreateAppointment",
    component: CreateAppointmentView,
  },
  {
    path: "/appointment/:id",
    name: "AppointmentDetails",
    component: AppointmentDetailView,
  },
  {
    path: "/edit-appointment/:id",
    name: "Edit",
    component: EditAppointmentView,
  }, // --- ADMIN ROUTES ---
  {
    path: "/admin",
    name: "Admin",
    component: AdminDashboardView,
  },
  {
    path: "/admin/vaccine-restock",
    name: "vaccine-restock",
    component: VaccineRestockView,
  },
  {
    path: "/admin/holidays", // 🗓️ NEW ROUTE
    name: "AdminHolidays",
    component: AdminHolidaysView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;





