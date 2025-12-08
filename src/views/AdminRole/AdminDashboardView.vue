<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiService from '@/services/apiService';

const router = useRouter();
const currentTab = ref('dashboard');
const isLoading = ref(false);
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// --- Data Models ---
const stats = ref({ totalAppointments: 0, vaccineStock: 0, pendingRequests: 0 });
const appointments = ref([]);
const reports = ref([]);

const predictionData = ref({ peakDays: [], prediction: "Loading prediction..." });
const animalAnalytics = ref([]);

// --- APPOINTMENTS FILTER STATE ---
const selectedStatus = ref('Pending'); // Default filter
const searchQuery = ref(''); // NEW: Search query state

const filteredAppointments = computed(() => {
  if (!appointments.value || appointments.value.length === 0) return [];

  // Convert search query to lower case once for efficiency
  const search = searchQuery.value.toLowerCase();

  // Sort by ID ascending (for better readability)
  const sorted = [...appointments.value].sort((a, b) => a.id - b.id);

  return sorted.filter(appt => {
    const matchesStatus = selectedStatus.value === 'All' || (appt.status || 'Pending') === selectedStatus.value;

    // Combine filtering and searching
    if (search) {
      const matchesSearch =
        appt.name.toLowerCase().includes(search) ||
        appt.animal_type.toLowerCase().includes(search) ||
        appt.email.toLowerCase().includes(search) ||
        (appt.phone_number || '').includes(search) ||
        appt.id.toString().includes(search);

      return matchesStatus && matchesSearch;
    }

    return matchesStatus;
  });
});

// --- Function for counting tabs ---
const filteredAppointmentsCount = (status) => {
  if (!appointments.value) return 0;
  if (status === 'All') {
    return appointments.value.length;
  }
  // Note: We use .filter().length for accurate reactive counting
  return appointments.value.filter(appt => (appt.status || 'Pending') === status).length;
};


// --- PIE CHART LOGIC ---
const animalColors = {
  'Dog': '#42A5F5', 'Cat': '#EF6C00', 'Bird': '#26A69A', 'Rabbit': '#AB47BC', 'Hamster': '#EC407A', 'Guinea Pig': '#7E57C2',
};

const getColorForType = (type) => { return animalColors[type] || '#90CAF9'; };

const generatePieChart = computed(() => { // Defined as a computed property
  if (!animalAnalytics.value || animalAnalytics.value.length === 0) return '';
  const total = animalAnalytics.value.reduce((sum, item) => sum + item.total, 0);
  let cumulativePercentage = 0;
  let conic = '';
  animalAnalytics.value.forEach((item) => {
    const percentage = (item.total / total) * 100;
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
    const color = getColorForType(item.animal_type);
    if (conic) conic += ', ';
    conic += `${color} ${startAngle}deg ${endAngle}deg`;
    cumulativePercentage += percentage;
  });
  return `conic-gradient(${conic})`;
});
// --- END PIE CHART LOGIC ---


const updateStatus = async (appointment, newStatus) => {
  if (appointment.status === newStatus) return; // No change

  // --- NEW VERIFICATION STEP ---
  const confirmation = confirm(
    `Are you sure you want to change the status of appointment #${appointment.id} (${appointment.name}) to '${newStatus}'?`
  );

  if (!confirmation) {
    // If the admin cancels, reset the dropdown immediately
    event.target.value = appointment.status; // Reverts the UI selection
    return;
  }
  // --- END VERIFICATION ---


  // Optimistic UI Update (Update status immediately, revert on failure)
  const oldStatus = appointment.status;
  appointment.status = newStatus;

  try {
    // Send request to API to update ONLY the status
    await apiService.updateAppointmentStatus(appointment.id, newStatus);
  } catch (error) {
    console.error(`Failed to update status for #${appointment.id}:`, error);
    alert(`Failed to update status to ${newStatus}. Check API/network.`);
    appointment.status = oldStatus; // Revert if API fails
  }
};

// --- DATA FETCHING (Same as before) ---
const loadAdminData = async () => {
  isLoading.value = true;
  try {
    const [appointmentRes, statsRes, animalRes, reportsRes, stockRes] = await Promise.allSettled([
      apiService.getAllAppointments(), // <--- FETCHES ALL APPOINTMENTS HERE
      apiService.getAdminStats(),
      apiService.getAnimalTypeAnalytics(),
      apiService.getSummaryReports(),
      apiService.getVaccineStock()
    ]);

    if (appointmentRes.status === 'fulfilled') {
      appointments.value = appointmentRes.value.data.data || appointmentRes.value.data;
    }

    let totalStock = 0;

    if (stockRes.status === 'fulfilled') {
      totalStock = stockRes.value.data.total_stock || 0;
      stats.value.vaccineStock = totalStock;
    } else {
      stats.value.vaccineStock = 0;
    }

    if (statsRes.status === 'fulfilled') {
      stats.value = { ...statsRes.value.data, vaccineStock: totalStock };
    } else {
      stats.value.totalAppointments = appointments.value.length;
      stats.value.pendingRequests = appointments.value.filter(a => (a.status || 'Pending') === 'Pending').length;
    }

    if (animalRes.status === 'fulfilled') {
      animalAnalytics.value = animalRes.value.data.data || animalRes.value.data;
    } else {
      animalAnalytics.value = [
        { animal_type: 'Dog', total: 45 }, { animal_type: 'Cat', total: 28 }, { animal_type: 'Bird', total: 10 },
      ];
    }

    predictionData.value = {
      peakDays: [
        { day: 'M', value: 30 }, { day: 'T', value: 45 }, { day: 'W', value: 20 }, { day: 'T', value: 60 }, { day: 'F', value: 50 }
      ],
      prediction: "Data derived from animal counts."
    };

    if (reportsRes.status === 'fulfilled') {
      reports.value = reportsRes.value.data;
    } else {
      reports.value = [{ id: 1, event: 'System Alert', details: 'Traffic Mock Data', date: '2025-11-15' }];
    }
  } catch (error) {
    console.error("Critical Load Error:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => { loadAdminData(); });

const handleLogout = () => {
  localStorage.removeItem('user_token');
  localStorage.removeItem('user_role');
  router.push('/');
};

const navigateToRestock = () => {
  router.push('/admin/vaccine-restock');
};
</script>

<template>
      <div class="admin-layout">
            <div class="mobile-overlay" :class="{ 'show': isSidebarOpen }" @click="toggleSidebar"></div>

            <!-- SIDEBAR -->
            <aside class="sidebar" :class="{ 'open': isSidebarOpen }">
                  <div class="brand">
                        <h2>BiteCare <span class="admin-badge">ADMIN</span></h2>
                        <button class="close-btn-mobile" @click="toggleSidebar">✕</button>
                    </div>
                  <nav class="nav-menu">
                        <div class="nav-section-label">MENU</div>
                        <div class="nav-item" :class="{ active: currentTab === 'dashboard' }"                    
          @click="currentTab = 'dashboard'; isSidebarOpen = false">
                              <span class="icon">📊</span> Dashboard
                          </div>
                        <div class="nav-item" :class="{ active: currentTab === 'appointments' }"                    
          @click="currentTab = 'appointments'; isSidebarOpen = false">
                              <span class="icon">📅</span> Appointments
                          </div>
                        <div class="nav-item" :class="{ active: currentTab === 'reports' }"                    
          @click="currentTab = 'reports'; isSidebarOpen = false">
                              <span class="icon">📑</span> Summary Reports
                          </div>
                    </nav>
                  <div class="logout-section">
                        <button @click="handleLogout" class="btn-logout"><span class="icon">🚪</span> Logout</button>
                    </div>
              </aside>

            <main class="main-content">
      <!-- HEADER -->
                  <header class="top-bar">
                        <div class="header-left">
                              <button class="menu-toggle" @click="toggleSidebar">☰</button>
                              <div class="page-title">
                                    <h1>{{ currentTab === 'dsa' ? 'DSA Analytics' : currentTab.charAt(0).toUpperCase() +
              currentTab.slice(1) }}</h1>
                                </div>
                          </div>

        <!-- HEADER RIGHT ACTIONS (Restock Button added here) -->
        <div class="user-profile header-right">
          <button class="btn-restock" @click="navigateToRestock">
            <span class="icon">➕</span> Restock Vaccine
          </button>
                              <div class="avatar-circle">A</div>
                              <span class="username-text">Administrator</span>
                         
        </div>
                   
      </header>

                  <div class="content-scroll-area">
                        <div v-if="isLoading" class="loading-state">Loading Data...</div>
                        <div v-else>
                              <!-- DASHBOARD CONTENT (Now includes Analytics) -->
                              <div v-if="currentTab === 'dashboard'" class="view-dashboard">
                                    <div class="stats-grid">
                                          <div class="stat-card">
                                                <div class="stat-icon-box blue-bg">📅</div>
                                                <div class="stat-info">
                                                      <h3>Total appointments</h3>
                                                      <p>{{ stats?.totalAppointments || 0 }}</p>
                                                  </div>
                                            </div>
                                          <div class="stat-card">
                                                <div class="stat-icon-box blue-bg">💉</div>
                                                <div class="stat-info">
                                                      <h3>Available Vaccines</h3>
                  <!-- Display fetched vaccineStock value -->
                                                      <p>{{ stats?.vaccineStock || 0 }}</p>
                                                  </div>
                                            </div>
                                          <div class="stat-card">
                                                <div class="stat-icon-box orange-bg">⏳</div>
                                                <div class="stat-info">
                                                      <h3>Pending Appointments</h3>
                                                      <p>{{ stats?.pendingRequests || 0 }}</p>
                                                  </div>
                                            </div>
                                      </div>

            <!-- DSA ANALYTICS (Merged Content) -->
            <div class="dsa-dashboard-section">
              <div class="dsa-card prediction-box-container">
                <div class="card-header">
                  <h3>🤖 AI Demand Prediction</h3>
                </div>
                <div class="card-body">
                  <div class="prediction-box">
                    <span class="ai-icon">✨</span> {{ predictionData?.prediction }}
                  </div>
                </div>
              </div>

              <div class="dsa-card chart-card">
                <div class="card-header">
                  <h3>Appointments by Animal Type</h3>
                </div>
                <div class="card-body">
                  <div class="pie-chart-wrapper" v-if="animalAnalytics?.length > 0">
                    <div class="pie-chart" :style="{ backgroundImage: generatePieChart }"></div>
                    <div class="pie-legend">
                      <div v-for="data in animalAnalytics" :key="data.animal_type" class="legend-item">
                        <span class="legend-color"
                          :style="{ backgroundColor: getColorForType(data.animal_type) }"></span>
                        <span class="legend-label">{{ data.animal_type }}: {{ data.total }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-chart">No animal data available to display.</div>
                </div>
              </div>
            </div>
            <!-- END DSA ANALYTICS -->
                     
          </div>

                    <!-- APPOINTMENTS TABLE -->
                    <div v-else-if="currentTab === 'appointments'" class="view-appointments">
            <!-- Search and Tabs Container (Combined Row) -->
            <div class="appointments-controls">
              <!-- Status Tab Navigation (Left Side) -->
              <div class="status-tabs status-tab-group">
                <button :class="['tab-btn', { active: selectedStatus === 'All' }]" @click="selectedStatus = 'All'">
                  All ({{ appointments.length }})
                </button>
                <button :class="['tab-btn', { active: selectedStatus === 'Pending' }]"
                  @click="selectedStatus = 'Pending'">
                  Pending ({{ filteredAppointmentsCount('Pending') }})
                </button>
                <button :class="['tab-btn', { active: selectedStatus === 'Confirmed' }]"
                  @click="selectedStatus = 'Confirmed'">
                  Confirmed ({{ filteredAppointmentsCount('Confirmed') }})
                </button>
                <button :class="['tab-btn', { active: selectedStatus === 'Completed' }]"
                  @click="selectedStatus = 'Completed'">
                  Completed ({{ filteredAppointmentsCount('Completed') }})
                </button>
              </div>
              <!-- Search Bar (Right Side - Takes available space) -->
              <div class="search-bar-container search-input-group">
                <input type="text" v-model="searchQuery" placeholder="Search appointments by Name, Animal, or ID..."
                  class="search-input" />
              </div>
            </div>

                        <div class="table-card">
                            <div class="table-responsive">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Patient Info</th>
                                            <th>Guardian</th>
                                            <th>Contact Details</th>
                                            <th>Animal</th>
                                            <th>Date & Time</th>
                                            <th>Action</th>
                                          </tr>
                                      </thead>
                                    <tbody>
                                        <tr v-for="appointment in filteredAppointments" :key="appointment.id">
                                            <td>#{{ appointment.id }}</td>
                                            <td>
                                                <div class="fw-bold">{{ appointment.name }}</div>
                                                <small style="color:#666;">{{ appointment.sex }}, {{ appointment.age }}
                          yrs</small>
                                              </td>
                                              <td>
                                                <div class="fw-bold">{{ appointment.guardian }}</div>
                                              </td>
                                            <td>
                                                <div>{{ appointment.email || 'N/A' }}</div>
                                                <small style="color:#666;">{{ appointment.phone_number || 'N/A'
                          }}</small>
                                              </td>
                                            <td><span class="animal-badge">{{ appointment.animal_type }}</span></td>
                                            <td>
                                                <div class="fw-bold">{{ appointment.date }}</div>
                                                <small>{{ appointment.time }}</small>
                                              </td>

                      <!-- ACTION COLUMN -->
                                            <td>
                        <div class="action-cell">
                          <!-- Status Dropdown -->
                          <select :value="appointment.status || 'Pending'"
                            @change="updateStatus(appointment, $event.target.value)" class="status-select"
                            :class="appointment.status ? appointment.status.toLowerCase() : 'pending'">
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                      
                        </div>
                                             
                      </td>
                                          </tr>
                                        <tr v-if="appointments.length === 0">
                                            <td colspan="7" style="text-align: center; padding: 20px;">No appointments
                        found.</td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                            </div>
                       
          </div>

                    <!-- REPORTS -->
                    <div v-else-if="currentTab === 'reports'" class="view-reports">
                        <div class="report-list">
                            <div v-for="rep in reports" :key="rep.id" class="report-item">
                                <div class="rep-icon-box">📄</div>
                                <div class="rep-details">
                                    <h4>{{ rep.event }}</h4>
                                    <p>{{ rep.details }}</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
         
    </main>
      </div>
</template>

<style scoped>
/* =========================================
   1. LAYOUT STRUCTURE
   ========================================= */
.admin-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #F5F7FA;
  font-family: 'Segoe UI', sans-serif;
}

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

.content-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

.loading-state {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #1565C0;
  font-weight: 500;
}

/* =========================================
   2. SIDEBAR STYLING
   ========================================= */
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

.admin-badge {
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

.menu-toggle,
.close-btn-mobile {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

@media (max-width: 768px) {

  .menu-toggle,
  .close-btn-mobile {
    display: block;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .username-text {
    display: none;
  }
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
  font-weight: bold;
  cursor: pointer;
}

.btn-logout:hover {
  background: #FFEBEE;
  border-color: #EF9A9A;
}

/* =========================================
   3. CONTENT STYLES (Merged Components)
   ========================================= */

/* Header Right Actions */
.user-profile {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-restock {
  background-color: #42A5F5;
  /* Light Blue */
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
}

.btn-restock:hover {
  background-color: #1565C0;
}

.btn-restock .icon {
  margin-right: 5px;
  font-size: 1rem;
}


/* Dashboard Content */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  border: 1px solid #CFD8DC;
}

.stat-icon-box {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 15px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.blue-bg {
  background: #E3F2FD;
  color: #1565C0;
}

.orange-bg {
  background: #FFF3E0;
  color: #EF6C00;
}

.stat-info p {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.stat-info h3 {
  margin: 0 0 5px 0;
  font-size: 0.9rem;
  color: #718096;
}

/* Merged DSA Section */
.dsa-dashboard-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 30px;
}

.dsa-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #CFD8DC;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.dsa-card .card-header {
  padding: 0 0 10px 0;
  border-bottom: 1px solid #F0F0F0;
  margin-bottom: 15px;
}

.dsa-card .card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #1565C0;
}

.dsa-card .card-body {
  padding: 0;
}

.prediction-box {
  background: linear-gradient(135deg, #1565C0, #42A5F5);
  color: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #0D47A1;
}

/* Pie Chart Specific Styles */
.pie-chart-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  padding: 20px 0;
}

.pie-chart {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 3px solid #CFD8DC;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.legend-color {
  width: 15px;
  height: 15px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.empty-chart {
  text-align: center;
  color: #999;
  padding: 30px 10px;
}

@media (max-width: 992px) {
  .dsa-dashboard-section {
    grid-template-columns: 1fr;
  }
}


/* Appointments Table Tabs */
.appointments-controls {
  /* FIX: Set container to display search and tabs side-by-side */
  display: flex;
  flex-wrap: wrap;
  /* Allows wrapping on smaller screens */
  gap: 15px;
  justify-content: space-between;
  /* Space out search and tabs */
  align-items: center;
  /* Vertically align tabs and search input center */
  margin-bottom: 20px;
  padding: 10px 15px;
  /* Added padding to the control container */
  background: white;
  border-radius: 12px;
  border: 1px solid #CFD8DC;
}

.search-bar-container {
  /* Set search bar to occupy space, but group tabs */
  flex-grow: 1;
  min-width: 250px;
  /* FIX: Order 2 means it sits on the right */
  order: 2;
  margin-left: auto;
  /* Push search bar to the right */
}

.status-tabs {
  /* Tabs take minimal space, remaining grouped on the left */
  order: 1;
  display: flex;
  gap: 8px;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  flex-shrink: 0;
  /* Enable horizontal scrolling on mobile if tabs overflow */
  overflow-x: auto;
  white-space: nowrap;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  /* Made search input smaller */
  border: 1px solid #CFD8DC;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s;
  height: 38px;
  /* Standardize height */
  font-size: 0.9rem;
  /* Smaller text */
}

.search-input:focus {
  outline: none;
  border-color: #1565C0;
}

/* Adjust button styling slightly since parent padding changed */
.status-tabs .tab-btn {
  padding: 8px 12px;
  border: 1px solid transparent;
}


.tab-btn {
  background: none;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #78909C;
  cursor: pointer;
  transition: background 0.2s;
}

.tab-btn:hover {
  background-color: #F5F7FA;
}

.tab-btn.active {
  background-color: #1565C0;
  color: white;
  box-shadow: 0 2px 5px rgba(21, 101, 192, 0.3);
}

/* Appointments Table */
.table-card {
  background: white;
  border-radius: 12px;
  padding: 10px;
  border: 1px solid #CFD8DC;
  margin-bottom: 20px;
  align-content: center;
}

.table-responsive {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.data-table th {
  text-align: left;
  padding: 15px;
  background: #1565C0;
  color: white;
  border-bottom: 1px solid #0D47A1;
  white-space: nowrap;
}

.data-table td {
  padding: 15px;
  border-bottom: 1px solid #EEEEEE;
  vertical-align: middle;
}

.fw-bold {
  font-weight: 600;
  color: #333;
}

.animal-badge {
  background: #E3F2FD;
  color: #1565C0;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #BBDEFB;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.confirmed {
  background: #E8F5E9;
  color: #2E7D32;
  border-color: #C8E6C9;
}

.pending {
  background: #FFF3E0;
  color: #EF6C00;
  border-color: #FFE0B2;
}

/* Reports List */
.report-list {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #CFD8DC;
}

.report-item {
  display: flex;
  align-items: center;
  padding: 15px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: #FAFAFA;
  border: 1px solid #E0E0E0;
}

.rep-icon-box {
  width: 40px;
  height: 40px;
  background: #E3F2FD;
  color: #1565C0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  border: 1px solid #BBDEFB;
}

.rep-details h4 {
  margin: 0;
  font-size: 1rem;
}

.rep-details p {
  margin: 0;
  font-size: 0.9rem;
  color: #777;
}

.rep-date {
  margin-left: auto;
  color: #90A4AE;
  font-size: 0.85rem;
}
</style>
