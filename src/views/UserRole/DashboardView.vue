<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiService from '@/services/apiService';

// --- State & Data ---
const router = useRouter();
const currentTab = ref('appointments'); // Default tab
const appointments = ref([]);
const isLoading = ref(true);
const error = ref(null);

// --- CALENDAR STATE ---
const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const selectedDate = ref(today.getDate());

// Mock Data for Vaccine
const vaccineInfo = ref({
  name: 'Anti-Rabies (Verorab)',
  remaining: 42
});

// --- API Fetch Function ---
const fetchAppointments = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiService.getAllAppointments();
    appointments.value = response.data.data || response.data;
  } catch (err) {
    console.error("API Error:", err);
    if (err.response && err.response.status === 401) {
      handleLogout(); // Auto-logout on 401
    } else {
      error.value = "Failed to load appointments.";
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchAppointments();
});

// --- LOGOUT LOGIC ---
const handleLogout = () => {
  if (confirm("Are you sure you want to log out?")) {
    // 1. Clear Local Storage
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_role');

    // 2. Redirect to Login
    router.push('/');
  }
};

// --- CALENDAR LOGIC ---
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formattedMonthYear = computed(() => {
  return `${monthNames[currentMonth.value]} ${currentYear.value}`;
});

const calendarDays = computed(() => {
  const days = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay();
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    days.push({ day: '', type: 'padding' });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    let status = 'available';
    if (i % 7 === 0) status = 'full';
    else if (i % 5 === 0) status = 'half';

    days.push({
      day: i,
      type: 'current',
      status: status
    });
  }
  return days;
});

const changeMonth = (step) => {
  let newMonth = currentMonth.value + step;
  if (newMonth > 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else if (newMonth < 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value = newMonth;
  }
};

const selectDate = (day) => {
  if (day.type === 'current') {
    selectedDate.value = day.day;
  }
};

// --- Navigation ---
const navigateToBook = () => { router.push('/create'); };
const openDetails = (appt) => {
  router.push(`/appointment/${appt.id}`);
};
</script>

<template>
  <div class="layout-container">

    <aside class="sidebar">
      <div class="brand">
        <h2>BiteCare</h2>
      </div>
      <nav>
        <div class="nav-item" :class="{ active: currentTab === 'appointments' }" @click="currentTab = 'appointments'">
          <span class="icon">📋</span> Appointments
        </div>
        <div class="nav-item" :class="{ active: currentTab === 'calendar' }" @click="currentTab = 'calendar'">
          <span class="icon">📅</span> Calendar
        </div>
        <div class="nav-item" :class="{ active: currentTab === 'profile' }" @click="currentTab = 'profile'">
          <span class="icon">👤</span> Profile
        </div>
      </nav>
    </aside>

    <main class="main-content">
      <header class="page-header">
        <h1>
          {{
            currentTab === 'calendar' ? 'Availability Calendar' :
              currentTab === 'profile' ? 'My Profile' : 'My Appointments'
          }}
        </h1>
      </header>

      <div class="content-scrollable">

        <div v-if="currentTab === 'appointments'">
          <div class="status-card">
            <div class="status-left">
              <span class="label">Available Vaccine</span>
              <span class="value-text">{{ vaccineInfo.name }}</span>
            </div>
            <div class="status-right">
              <span class="label">Remaining</span>
              <span class="highlight-number">{{ vaccineInfo.remaining }} Doses</span>
            </div>
          </div>

          <div v-if="isLoading" class="loading-container">
            <div class="spinner"></div>
            <p>Loading appointments...</p>
          </div>
          <div v-else-if="error" class="error-container">
            <p>{{ error }}</p><button @click="fetchAppointments" class="retry-btn">Retry</button>
          </div>
          <div v-else-if="appointments.length === 0" class="empty-container">
            <p>No appointments found.</p>
          </div>
          <div v-else class="appointment-list">
            <div v-for="appt in appointments" :key="appt.id" class="appt-card" @click="openDetails(appt)">
              <div class="icon-circle"><span class="paw-icon">🐾</span></div>
              <div class="appt-info">
                <h3>{{ appt.name || 'Unknown' }}</h3>
                <p>{{ appt.animalType || appt.animal }} • {{ appt.date }} @ {{ appt.time }}</p>
              </div>
              <div class="arrow">›</div>
            </div>
          </div>

          <button class="btn-book" @click="navigateToBook">
            <span class="plus">+</span> Book New Appointment
          </button>
        </div>

        <div v-else-if="currentTab === 'calendar'" class="calendar-view">
          <div class="calendar-header">
            <button @click="changeMonth(-1)" class="nav-arrow">‹</button>
            <h2 class="month-title">{{ formattedMonthYear }}</h2>
            <button class="toggle-btn">2 weeks</button> <button @click="changeMonth(1)" class="nav-arrow">›</button>
          </div>

          <div class="week-header">
            <span v-for="day in weekDays" :key="day">{{ day }}</span>
          </div>

          <div class="calendar-grid">
            <div v-for="(dateObj, index) in calendarDays" :key="index" class="day-cell" :class="{
              'empty': dateObj.type === 'padding',
              'selected': dateObj.day === selectedDate,
              'available': dateObj.status === 'available' && dateObj.day !== selectedDate,
              'full': dateObj.status === 'full' && dateObj.day !== selectedDate,
              'half': dateObj.status === 'half' && dateObj.day !== selectedDate
            }" @click="selectDate(dateObj)">
              {{ dateObj.day }}
            </div>
          </div>

          <div class="calendar-legend">
            <div class="legend-item"><span class="dot green"></span> Available</div>
            <div class="legend-item"><span class="dot orange"></span> Half Full</div>
            <div class="legend-item"><span class="dot red"></span> Full</div>
          </div>
        </div>

        <div v-else-if="currentTab === 'profile'" class="profile-view">
          <div class="profile-card">
            <div class="profile-header">
              <div class="avatar-large">👤</div>
              <h3>My Account</h3>
              <p class="user-role">User Access</p>
            </div>

            <div class="profile-options">
              <button class="option-btn">My Details</button>
              <button class="option-btn">Change Password</button>
              <button class="option-btn">Notification Settings</button>
            </div>

            <button class="btn-logout" @click="handleLogout">
              Log Out
            </button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
/* --- EXISTING STYLES --- */
.layout-container {
  display: flex;
  height: 100vh;
  background-color: #f8f9fa;
  font-family: 'Segoe UI', sans-serif;
}

.sidebar {
  width: 240px;
  background-color: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.brand h2 {
  color: #009688;
  margin: 0 0 40px 0;
}

.nav-item {
  padding: 12px 16px;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 8px;
  color: #555;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.nav-item:hover {
  background-color: #f0f0f0;
}

.nav-item.active {
  background-color: #e0f2f1;
  color: #009688;
}

.nav-item .icon {
  margin-right: 12px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #eee;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.content-scrollable {
  flex: 1;
  overflow-y: auto;
  padding: 20px 30px;
  max-width: 800px;
}

.status-card {
  background-color: #e0f2f1;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.label {
  display: block;
  font-weight: bold;
  font-size: 0.9rem;
  color: #333;
}

.value-text {
  color: #616161;
  font-size: 0.9rem;
}

.highlight-number {
  color: #00796b;
  font-size: 1.2rem;
  font-weight: bold;
}

.loading-container,
.empty-container,
.error-container {
  text-align: center;
  padding: 40px;
  color: #757575;
}

.appt-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.1s;
}

.appt-card:hover {
  transform: translateY(-2px);
}

.icon-circle {
  background-color: #009688;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.paw-icon {
  color: white;
  font-size: 1.2rem;
}

.appt-info {
  flex: 1;
}

.appt-info h3 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: #333;
}

.appt-info p {
  margin: 0;
  font-size: 0.85rem;
  color: #757575;
}

.arrow {
  color: #bdbdbd;
  font-weight: bold;
  font-size: 1.2rem;
}

.btn-book {
  width: 100%;
  background-color: #009688;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  box-shadow: 0 4px 6px rgba(0, 150, 136, 0.3);
}

.plus {
  font-size: 1.4rem;
  margin-right: 8px;
  line-height: 1;
}

/* --- CALENDAR STYLES --- */
.calendar-view {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.month-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0;
}

.nav-arrow {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
}

.toggle-btn {
  padding: 5px 12px;
  border: 1px solid #333;
  border-radius: 20px;
  background: white;
  font-size: 0.8rem;
  cursor: default;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 10px;
  column-gap: 5px;
}

.day-cell {
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border-radius: 50%;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.day-cell.empty {
  cursor: default;
}

.day-cell.available {
  background-color: #81C784;
}

.day-cell.half {
  background-color: #FFB74D;
}

.day-cell.full {
  background-color: #E57373;
}

.day-cell.selected {
  background-color: #009688;
  font-weight: bold;
  transform: scale(1.1);
}

.calendar-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #333;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.dot.green {
  background-color: #81C784;
}

.dot.orange {
  background-color: #FFB74D;
}

.dot.red {
  background-color: #E57373;
}

/* --- NEW PROFILE STYLES --- */
.profile-view {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
}

.profile-card {
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.avatar-large {
  font-size: 3rem;
  background: #e0f2f1;
  width: 80px;
  height: 80px;
  line-height: 80px;
  border-radius: 50%;
  margin: 0 auto 15px;
  color: #009688;
}

.profile-header h3 {
  margin: 0;
  color: #333;
}

.user-role {
  color: #777;
  font-size: 0.9rem;
  margin-top: 5px;
}

.profile-options {
  margin: 30px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-btn {
  background: #f9f9f9;
  border: 1px solid #eee;
  padding: 12px;
  border-radius: 8px;
  text-align: left;
  cursor: not-allowed;
  /* Placeholder items */
  color: #555;
}

.btn-logout {
  width: 100%;
  background-color: #ff5252;
  /* Red for warning */
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(255, 82, 82, 0.2);
  transition: background-color 0.2s;
}

.btn-logout:hover {
  background-color: #e53935;
}
</style>