<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiService from '@/services/apiService';

const router = useRouter();
const currentTab = ref('appointments');
const appointments = ref([]);
const isLoading = ref(true);
const error = ref(null);
const isSidebarOpen = ref(false); // Added for mobile menu

const vaccineInfo = ref({ name: 'Anti-Rabies (Verorab)', remaining: 42 });

// --- Calendar State ---
const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const selectedDate = ref(today.getDate());

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const fetchAppointments = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiService.getAllAppointments();
    appointments.value = response.data.data || response.data;
  } catch (err) {
    console.error("API Error:", err);
    if (err.response && err.response.status === 401) {
      error.value = "Session expired. Redirecting...";
      localStorage.removeItem('user_token');
      router.push('/');
    } else {
      error.value = "Failed to load appointments.";
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => { fetchAppointments(); });

// --- SORTING FIX: Compute a new array sorted by ID ascending ---
const sortedAppointments = computed(() => {
  // Create a shallow copy of the array before sorting to avoid mutating the original data
  return [...appointments.value].sort((a, b) => a.id - b.id);
});
// -----------------------------------------------------------------

// --- Calendar Logic FIX ---
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formattedMonthYear = computed(() => `${monthNames[currentMonth.value]} ${currentYear.value}`);

const calendarDays = computed(() => {
  const days = [];
  const startOfMonth = new Date(currentYear.value, currentMonth.value, 1);
  const firstDayOfWeek = startOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate();

  // 1. Padding days (previous month dates, for visual completeness)
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ day: '', type: 'padding' });
  }

  // 2. Actual days in the current month
  for (let i = 1; i <= daysInMonth; i++) {
    // Mock status logic remains the same
    let status = 'available';
    if (i % 7 === 0) status = 'full';
    else if (i % 5 === 0) status = 'half';

    days.push({ day: i, type: 'current', status });
  }

  // 3. Fill the end of the last week with padding if necessary
  const remainingCells = 42 - days.length; // Max 6 weeks * 7 days = 42
  for (let i = 0; i < remainingCells && days.length < 42; i++) {
    days.push({ day: '', type: 'padding' });
  }

  return days;
});

const changeMonth = (step) => {
  let newMonth = currentMonth.value + step;
  if (newMonth > 11) { currentMonth.value = 0; currentYear.value++; }
  else if (newMonth < 0) { currentMonth.value = 11; currentYear.value--; }
  else { currentMonth.value = newMonth; }
};

const navigateToBook = () => { router.push('/create'); };
const openDetails = (appointment) => { router.push(`/appointment/${appointment.id}`); };

// --- NEW EDIT HANDLER ---
const navigateToEdit = (appointment, event) => {
  // Stop event propagation so the parent row's click (openDetails) doesn't fire
  event.stopPropagation();
  router.push(`/edit-appointment/${appointment.id}`);
};
// ------------------------

const handleLogout = () => {
  localStorage.removeItem('user_token');
  localStorage.removeItem('user_role');
  router.push('/');
};
</script>

<template>
  <div class="dashboard-layout">

    <!-- MOBILE OVERLAY -->
    <div class="mobile-overlay" :class="{ 'show': isSidebarOpen }" @click="toggleSidebar"></div>

    <!-- SIDEBAR -->
    <aside class="sidebar" :class="{ 'open': isSidebarOpen }">
      <div class="brand">
        <h2>BiteCare <span class="role-badge">USER</span></h2>
        <button class="close-btn-mobile" @click="toggleSidebar">✕</button>
      </div>

      <nav class="nav-menu">
        <div class="nav-section-label">MENU</div>
        <div class="nav-item" :class="{ active: currentTab === 'appointments' }"
          @click="currentTab = 'appointments'; isSidebarOpen = false">
          <span class="icon">📋</span> Appointments
        </div>
        <div class="nav-item" :class="{ active: currentTab === 'calendar' }"
          @click="currentTab = 'calendar'; isSidebarOpen = false">
          <span class="icon">📅</span> Calendar
        </div>
        <div class="nav-item" :class="{ active: currentTab === 'profile' }"
          @click="currentTab = 'profile'; isSidebarOpen = false">
          <span class="icon">👤</span> Profile
        </div>
      </nav>

      <div class="logout-section">
        <button @click="handleLogout" class="btn-logout">
          <span class="icon">🚪</span> Logout
        </button>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">

      <!-- HEADER (UPDATED) -->
      <header class="top-bar">
        <div class="header-left">
          <button class="menu-toggle" @click="toggleSidebar">☰</button>
          <div class="page-title">
            <h1>{{ currentTab === 'calendar' ? 'Availability Calendar' : (currentTab === 'profile' ? 'My Profile' : 'MyAppointments') }}</h1>
          </div>
        </div>

        <!-- NEW: HEADER RIGHT ACTIONS & PROFILE -->
        <div class="header-right-actions">
          <!-- MOVE BOOK BUTTON HERE (Only visible on Appointments Tab) -->
          <button v-if="currentTab === 'appointments'" class="btn-header-book" @click="navigateToBook">
            <span class="plus">+</span> Book New Appointment
          </button>

          <div class="user-profile">
            <div class="avatar-circle">U</div>
            <span class="username-text">User</span>
          </div>
        </div>
        <!-- END HEADER RIGHT ACTIONS -->
      </header>

      <!-- SCROLLABLE CONTENT AREA -->
      <div class="content-scroll-area">

        <!-- 1. APPOINTMENTS TAB (TABLE) -->
        <div v-if="currentTab === 'appointments'" class="view-container">

          <!-- Vaccine Status Card -->
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
            <p>Loading...</p>
          </div>
          <div v-else-if="error" class="error-container">
            <p>{{ error }}</p>
          </div>

          <!-- Appointments Table -->
          <div v-else class="table-card">
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Animal</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- FIX: Use sortedAppointments computed property -->
                  <!-- NOTE: Row click opens details -->
                  <tr v-for="appointment in sortedAppointments" :key="appointment.id" @click="openDetails(appointment)">

                    <td>
                      <div class="fw-bold">{{ appointment.name }}</div>
                    </td>
                    <!-- Animal Type -->
                    <td>
                      <div class="fw-bold">{{ appointment.animal_type }}</div>
                    </td>

                    <!-- Date/Time -->
                    <td>
                      <div class="fw-bold">{{ appointment.date }}</div>
                      <small style="color:#1565C0;">{{ appointment.time }}</small>
                    </td>

                    <!-- Status (Hidden on small mobile) -->
                    <td class="status-cell">
                      <span class="status-badge" :class="(appointment.status || 'pending').toLowerCase()">
                        {{ appointment.status || 'Pending' }}
                      </span>
                    </td>

                    <!-- Action: BUTTON CLICK IS SEPARATE FOR EDITING -->
                    <td>
                      <button class="btn-sm btn-edit-appt" @click="navigateToEdit(appointment, $event)">
                        Edit
                      </button>
                    </td>
                  </tr>
                  <tr v-if="appointments.length === 0">
                    <td colspan="4" style="text-align:center; padding: 20px;">No appointments found.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- End Appointments Table -->

        </div>

        <!-- 2. CALENDAR TAB (UPDATED STYLING) -->
        <div v-else-if="currentTab === 'calendar'" class="calendar-view">
          <div class="calendar-header-controls">
            <button @click="changeMonth(-1)" class="nav-arrow">‹</button>
            <h2 class="month-title">{{ formattedMonthYear }}</h2>
            <button @click="changeMonth(1)" class="nav-arrow">›</button>
          </div>

          <div class="week-header">
            <span v-for="day in weekDays" :key="day">{{ day }}</span>
          </div>

          <div class="calendar-grid">
            <div v-for="(dateObj, index) in calendarDays" :key="index" class="day-cell" :class="{
              'empty': dateObj.type === 'padding',
              'selected': dateObj.day === selectedDate && dateObj.type === 'current',
              'available': dateObj.status === 'available' && dateObj.type === 'current',
              'full': dateObj.status === 'full' && dateObj.type === 'current',
              'half': dateObj.status === 'half' && dateObj.type === 'current'
            }" @click="dateObj.type === 'current' ? selectedDate = dateObj.day : null">
              <span v-if="dateObj.day">{{ dateObj.day }}</span>
            </div>
          </div>

          <div class="calendar-legend">
            <div class="legend-item"><span class="dot green"></span> Available</div>
            <div class="legend-item"><span class="dot orange"></span> Half Full</div>
            <div class="legend-item"><span class="dot red"></span> Full</div>
          </div>
        </div>

        <!-- 3. PROFILE TAB -->
        <div v-else-if="currentTab === 'profile'" class="profile-view">
          <div class="empty-container">
            <p>Profile Settings Coming Soon...</p>
            <button class="btn-logout-profile" @click="handleLogout">Logout</button>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
/* =========================================
   1. LAYOUT STRUCTURE (Fixed Sidebar)
   ========================================= */
.dashboard-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #F5F7FA;
  font-family: 'Segoe UI', sans-serif;
}

/* =========================================
   2. SIDEBAR STYLING (Blue/White Theme)
   ========================================= */
.sidebar {
  width: 260px;
  height: 100%;
  background-color: white;
  border-right: 1px solid #CFD8DC;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  z-index: 1000;
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    transform: translateX(-100%);
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
  }

  .sidebar.open {
    transform: translateX(0);
  }
}

.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 900;
  transition: opacity 0.3s;
  pointer-events: none;
  opacity: 0;
}

.mobile-overlay.show {
  display: block;
  opacity: 1;
  pointer-events: auto;
}

/* Sidebar Items */
.brand {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #E0E0E0;
}

.brand h2 {
  color: #1565C0;
  margin: 0;
  font-size: 1.3rem;
}

.role-badge {
  background: #E3F2FD;
  color: #1565C0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  margin-left: 5px;
  border: 1px solid #BBDEFB;
}

.nav-menu {
  padding: 20px 15px;
  flex: 1;
  overflow-y: auto;
}

.nav-section-label {
  font-size: 0.75rem;
  color: #999;
  font-weight: 600;
  margin-bottom: 10px;
  padding-left: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 5px;
  border-radius: 8px;
  cursor: pointer;
  color: #546E7A;
  font-weight: 500;
  border: 1px solid transparent;
}

.nav-item:hover {
  background-color: #F5F7FA;
  color: #1565C0;
  border-color: #E3F2FD;
}

.nav-item.active {
  background-color: #E3F2FD;
  color: #1565C0;
  border-color: #BBDEFB;
}

.icon {
  margin-right: 12px;
}

.logout-section {
  padding: 20px;
  border-top: 1px solid #E0E0E0;
  margin-top: auto;
}

.btn-logout {
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid #FFCDD2;
  color: #C62828;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.btn-logout:hover {
  background: #FFEBEE;
  border-color: #EF9A9A;
}

/* =========================================
   3. MAIN CONTENT (Scrollable)
   ========================================= */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.top-bar {
  height: 70px;
  background: white;
  border-bottom: 1px solid #CFD8DC;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
}

/* FIX: Ensure content area can scroll, not just body */
.content-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

/* Header Elements (Combined for right side) */
.header-right-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  /* Space between button and profile */
}

.user-profile {
  display: flex;
  align-items: center;
}

.avatar-circle {
  width: 35px;
  height: 35px;
  background-color: #1565C0;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-weight: bold;
}

.username-text {
  font-weight: 500;
  color: #37474F;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  margin-right: 15px;
}

.close-btn-mobile {
  display: none;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #999;
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .close-btn-mobile {
    display: block;
  }

  .username-text {
    display: none;
  }

  /* Hide header button on small mobile so it doesn't crowd the top bar */
  .btn-header-book {
    display: none;
  }
}

/* --- NEW HEADER BUTTON STYLE --- */
.btn-header-book {
  background-color: #1565C0;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(21, 101, 192, 0.2);
  transition: background 0.2s;
}

.btn-header-book:hover {
  background-color: #0D47A1;
}

.btn-header-book .plus {
  font-size: 1.1rem;
  margin-right: 5px;
  line-height: 1;
}


/* =========================================
   4. USER CONTENT STYLES
   ========================================= */
.view-container {
  margin: 0;
  width: 100%;
}

/* Status Card (Vaccine Info) */
.status-card {
  background-color: #E3F2FD;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
  border: 1px solid #BBDEFB;
  /* Stroke */
}

.label {
  display: block;
  font-weight: bold;
  font-size: 0.9rem;
  color: #1565C0;
}

.value-text {
  color: #546E7A;
  font-size: 0.9rem;
}

.highlight-number {
  color: #1565C0;
  font-size: 1.2rem;
  font-weight: bold;
}

/* TABLE STYLES */
.table-card {
  background: white;
  border-radius: 12px;
  padding: 10px;
  overflow: hidden;
  border: 1px solid #CFD8DC;
  /* Stroke */
  margin-bottom: 20px;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}

.data-table th {
  /* FIX: Center align header text */
  text-align: center;
  padding: 15px;
  background: #1565C0;
  color: white;
  border-bottom: 1px solid #0D47A1;
  white-space: nowrap;
  font-size: 0.9rem;
}

.data-table td {
  padding: 15px;
  border-bottom: 1px solid #EEEEEE;
  vertical-align: middle;
  cursor: pointer;
  transition: background 0.1s;
}

.data-table tr:hover td {
  background-color: #F5F7FA;
}

.fw-bold {
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.badge.pending {
  background: #FFF3E0;
  color: #EF6C00;
  border-color: #FFE0B2;
}

.badge.confirmed {
  background: #E8F5E9;
  color: #2E7D32;
  border-color: #C8E6C9;
}

.btn-sm {
  padding: 6px 14px;
  border: 1px solid #CFD8DC;
  background: white;
  color: #546E7A;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}

.btn-sm.btn-edit-appt {
  color: #1565C0;
  border-color: #BBDEFB;
}

.btn-sm.btn-edit-appt:hover {
  background-color: #E3F2FD;
}

/* Book Button (Original, now unused) */
.btn-book {
  display: none;
  /* Hide the large button */
}

/* Calendar View Styles */
.calendar-view {
  background: white;
  padding: 30px;
  /* Increased padding */
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  border: 1px solid #CFD8DC;
  width: 100%;
}

.calendar-header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 0 5px;
}

.month-title {
  font-size: 1.4rem;
  color: #333;
  margin: 0 auto;
  font-weight: 600;
  text-align: center;
  flex-grow: 1;
}

.nav-arrow {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #333;
  padding: 0 10px;
}

.nav-arrow:hover {
  color: #1565C0;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: #78909C;
  font-size: 1rem;
  margin-bottom: 15px;
  font-weight: 500;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 10px;
  column-gap: 5px;
}

.day-cell {
  width: 100%;
  padding-top: 100%;
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #444;
}

.day-cell>span {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 500;
}

/* Color Styles for Status */
.day-cell.empty {
  cursor: default;
  background: transparent;
}

.day-cell.selected>span {
  background-color: #1565C0;
  color: white;
  font-weight: bold;
  transform: scale(1.05);
}

.day-cell.available>span {
  background-color: #81C784;
  color: white;
}

.day-cell.half>span {
  background-color: #FFB74D;
  color: white;
}

.day-cell.full>span {
  background-color: #E57373;
  color: white;
}

/* Legend Styles */
.calendar-legend {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 40px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #333;
}

.dot {
  width: 12px;
  height: 12px;
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

/* Profile / Empty States */
.loading-container,
.error-container,
.empty-container {
  text-align: center;
  padding: 40px;
  color: #757575;
}

.btn-logout-profile {
  margin-top: 20px;
  padding: 10px 20px;
  background: #FFCDD2;
  color: #C62828;
  border: 1px solid #EF9A9A;
  border-radius: 8px;
  font-weight: bold;
}
</style>