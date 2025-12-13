<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import moment from 'moment';
import apiService from '@/services/apiService';
import AppointmentPredictionChart from '@/components/Admin/AppointmentPredictionChart.vue';
import AnimalAppointmentChart from '@/components/Admin/AnimalAppointmentChart.vue'; // <-- NEW CHART IMPORT

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
const auditLogs = ref([]);

// --- Monthly Report Data Model (Receives emitted data from chart component) ---
const monthlyReportData = ref({
  historical: [],
  forecast: []
});

// --- Function to handle the emitted data ---
const handleMonthlyDataLoad = (data) => {
  monthlyReportData.value = data;
};

// --- PAGINATION DATA MODELS (Unchanged) ---
const appointmentPaging = ref({
  currentPage: 1,
  lastPage: 1,
  total: 0,
  perPage: 20
});

const auditLogPaging = ref({
  currentPage: 1,
  lastPage: 1,
  total: 0,
  perPage: 20
});
// ----------------------------------------------------------------------


// --- APPOINTMENTS FILTER STATE (Unchanged) ---
const selectedStatus = ref('Pending');
const searchQuery = ref('');

const filteredAppointments = computed(() => {
  if (!appointments.value || appointments.value.length === 0) return [];
  const search = searchQuery.value.toLowerCase();
  const sorted = [...appointments.value].sort((a, b) => a.id - b.id);
  return sorted.filter(appt => {
    const matchesStatus = selectedStatus.value === 'All' || (appt.status || 'Pending') === selectedStatus.value;
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

// --- Function for counting tabs (Unchanged) ---
const filteredAppointmentsCount = (status) => {
  if (!appointments.value) return 0;
  if (status === 'All') {
    return appointments.value.length;
  }
  return appointments.value.filter(appt => (appt.status || 'Pending') === status).length;
};


// --- STATUS UPDATE FUNCTION (Unchanged) ---
const updateStatus = async (appointment, newStatus, event) => {
  if (appointment.status === newStatus) return;

  const confirmation = confirm(
    `Are you sure you want to change the status of appointment #${appointment.id} (${appointment.name}) to '${newStatus}'?`
  );

  if (!confirmation) {
    event.target.value = appointment.status;
    return;
  }

  const oldStatus = appointment.status;
  appointment.status = newStatus;

  try {
    await apiService.updateAppointmentStatus(appointment.id, newStatus);
  } catch (error) {
    console.error(`Failed to update status for #${appointment.id}:`, error);
    alert(`Failed to update status to ${newStatus}. Check API/network.`);
    appointment.status = oldStatus;
    if (event && event.target) {
      event.target.value = oldStatus;
    }
  }
};

// --- PAGINATION HANDLERS (Unchanged) ---
const paginateAppointments = (page) => {
  console.log(`Navigating to appointment page ${page}`);
  if (page > 0 && page <= appointmentPaging.value.lastPage) {
    appointmentPaging.value.currentPage = page;
  }
};

const paginateAuditLogs = (page) => {
  if (page > 0 && page <= auditLogPaging.value.lastPage) {
    auditLogPaging.value.currentPage = page;
    fetchAuditLogs(page);
  }
};

const filteredAuditLogs = computed(() => {
  if (!Array.isArray(auditLogs.value)) {
    return [];
  }
  return auditLogs.value.filter(log => log);
});

const fetchAuditLogs = async (page = 1) => {
  if (currentTab.value === 'auditlogs') {
    isLoading.value = true;
  }

  try {
    const response = await apiService.getAuditLogs({ page: page });

    if (response.data) {
      const data = response.data;

      if (data.data && data.total !== undefined) {
        auditLogs.value = data.data;
        auditLogPaging.value = {
          currentPage: data.current_page || page,
          lastPage: data.last_page || 1,
          total: data.total,
          perPage: data.per_page || 20,
        };
      } else {
        auditLogs.value = Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : []);
        auditLogPaging.value.total = auditLogs.value.length;
        auditLogPaging.value.currentPage = 1;
        auditLogPaging.value.lastPage = 1;
      }
    }
  } catch (error) {
    console.error("Failed to fetch Audit Logs:", error);
    auditLogs.value = [
      { id: 101, created_at: '2025-12-08 10:05', user: { name: 'Admin' }, action: 'Confirmed Appointment #10', details: 'Mock data fallback.', table_name: 'Appointments' },
    ];
  } finally {
    isLoading.value = false;
  }
};


// 🚀 --- DATA FETCHING (Initial load) --- 🚀
const loadAdminData = async () => {
  const [appointmentRes, statsRes, stockRes] = await Promise.allSettled([
    apiService.getAllAppointments(),
    apiService.getAdminStats(),
    apiService.getVaccineStock(),
  ]);

  if (appointmentRes.status === 'fulfilled' && appointmentRes.value.data) {
    const data = appointmentRes.value.data;
    appointments.value = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
    appointmentPaging.value.total = appointments.value.length;
  }

  let totalStock = 0;

  if (stockRes.status === 'fulfilled' && stockRes.value.data) {
    totalStock = stockRes.value.data.total_stock || 0;
  }

  if (statsRes.status === 'fulfilled' && statsRes.value.data) {
    stats.value = { ...statsRes.value.data, vaccineStock: totalStock };
  } else {
    stats.value.vaccineStock = totalStock;
  }

  await fetchAuditLogs(1);
};

// 💡 Watcher to refetch audit logs if the tab is selected (Unchanged)
watch(currentTab, (newTab) => {
  if (newTab === 'auditlogs') {
    fetchAuditLogs(1);
  }
});


onMounted(() => { loadAdminData(); });

const handleLogout = () => {
  localStorage.removeItem('user_token');
  localStorage.removeItem('user_role');
  router.push('/');
};

const navigateToRestock = () => {
  router.push('/admin/vaccine-restock');
};

// 💡 NEW NAVIGATION FUNCTION
const navigateToHolidays = () => {
  router.push('/admin/holidays');
};
</script>

<template>
    <div class="admin-layout">
        <div class="mobile-overlay" :class="{ 'show': isSidebarOpen }" @click="toggleSidebar"></div>

        <aside class="sidebar" :class="{ 'open': isSidebarOpen }">
            <div class="brand">
                <h2>Animal BiteCare <span class="admin-badge">ADMIN</span></h2>
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
      
                <div class="nav-item" :class="{ active: currentTab === 'auditlogs' }"          
          @click="currentTab = 'auditlogs'; isSidebarOpen = false">
                    <span class="icon">📝</span> Audit Logs
                  </div>
             
      </nav>
            <div class="logout-section">
                <button @click="handleLogout" class="btn-logout"><span class="icon">🚪</span>
                    Logout</button>
              </div>
          </aside>

        <main class="main-content">
            <header class="top-bar">
                <div class="header-left">
                    <button class="menu-toggle" @click="toggleSidebar">☰</button>
                    <div class="page-title">
                        <h1>{{
              $route.path.includes('/admin/holidays') ? 'Holiday Calendar' :
                currentTab === 'auditlogs' ? 'Audit Logs' :
                  currentTab.charAt(0).toUpperCase() + currentTab.slice(1)
              }}</h1>
                      </div>
                  </div>

                <div class="user-profile header-right">
          <button class="btn-holidays" @click="navigateToHolidays">
            <span class="icon">🗓️</span> Manage Holidays
          </button>
                    <button class="btn-restock" @click="navigateToRestock">
                        <span class="icon">➕</span> Restock Vaccine
                      </button>
               
                 
        </div>

              </header>

            <div class="content-scroll-area">
                <div v-if="isLoading && (currentTab === 'appointments' || currentTab === 'auditlogs')"
          class="loading-state">
                    Loading Data...</div>
                <div v-else>
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
                       
                        <div class="monthly-report-section table-card historical-only-card"              
              v-if="monthlyReportData.historical && monthlyReportData.historical.length > 0">
                            <h3 class="card-title-table">Historical Monthly Appointment Count</h3>
                            <div class="table-responsive">
                                <table class="data-table monthly-table">
                                    <thead>
                                        <tr>
                                            <th>Month</th>
                                            <th>Actual Appointments</th>
                                            <th>Exponential Smoothed Level</th>
                                          </tr>
                                      </thead>
                                    <tbody>
                                        <tr v-for="item in monthlyReportData.historical.slice(-12)" :key="item.date">
                                            <td>
                                                <span class="fw-bold">{{ moment(item.date).format('MMM YYYY') }}</span>
                                              </td>
                                            <td>{{ item.count }}</td>
                                            <td>{{ item.smoothed !== null ? item.smoothed : '-' }}</td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                            <small class="table-note">*Showing the last 12 months of actual appointments used for
                analysis.</small>
                          </div>
                       
                        <div class="monthly-report-section table-card forecast-only-card"              
              v-if="monthlyReportData.forecast && monthlyReportData.forecast.length > 0">
                            <h3 class="card-title-table">Future Appointment Forecast (Next {{
                monthlyReportData.forecast.length }}
                                Months)</h3>
                            <div class="table-responsive">
                                <table class="data-table monthly-table">
                                    <thead>
                                        <tr>
                                            <th>Month</th>
                                            <th>Straight Line Prediction</th>
                                            <th>Exponential Smoothing Prediction</th>
                                          </tr>
                                      </thead>
                                    <tbody>
                                        <tr v-for="item in monthlyReportData.forecast" :key="item.date"
                      class="forecast-row">
                                            <td>
                                                <span class="fw-bold">{{ moment(item.date).format('MMM YYYY') }}</span>
                                              </td>
                                            <td>{{ item.straight_line }}</td>
                                            <td>{{ item.exponential_smooth !== null ? item.exponential_smooth : '-' }}
                      </td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                            <small class="table-note">*Prediction uses the Straight Line and Exponential Smoothing
                models.</small>
                          </div>


                        <div class="dsa-dashboard-section">
                           
              <AppointmentPredictionChart @data-loaded="handleMonthlyDataLoad" />
                         
            </div>

                        <div class="dsa-dashboard-section chart-animal-stats">
                               
              <AnimalAppointmentChart />
                         
            </div>


                      </div>
                    <div v-else-if="currentTab === 'appointments'" class="view-appointments">
                        <div class="appointments-controls">
                            <div class="status-tabs status-tab-group">
                                <button :class="['tab-btn', { active: selectedStatus === 'All' }]"
                  @click="selectedStatus = 'All'">
                                    All ({{ appointmentPaging.total }}) </button>
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
                            <div class="search-bar-container search-input-group">
                                <input type="text" v-model="searchQuery"
                  placeholder="Search appointments by Name, Animal, or ID..."                   class="search-input" />
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
                                                <div class="fw-bold">{{ appointment.name }}
                                                  </div>
                                                <small style="color:#666;">{{ appointment.sex
                                                  }}, {{ appointment.age }}
                                                    yrs</small>
                                              </td>
                                            <td>
                                                <div class="fw-bold">{{ appointment.guardian }}
                                                  </div>
                                              </td>
                                            <td>
                                                <div>{{ appointment.email || 'N/A' }}</div>
                                                <small style="color:#666;">{{
                          appointment.phone_number || 'N/A'
                                                  }}</small>
                                              </td>
                                            <td><span class="animal-badge">{{
                                                  appointment.animal_type }}</span></td>
                                            <td>
                                                <div class="fw-bold">{{ appointment.date }}
                                                  </div>
                                                <small>{{ appointment.time }}</small>
                                              </td>

                                            <td>
                                                <div class="action-cell">
                                                    <select :value="appointment.status || 'Pending'"                    
                                    @change="updateStatus(appointment, $event.target.value, $event)"
                            class="status-select"                            
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

                            <div v-if="appointmentPaging.total > appointmentPaging.perPage" class="pagination-controls">
                                <span>Showing page {{ appointmentPaging.currentPage }} of {{ appointmentPaging.lastPage
                  }}
                                    (Total: {{
                                      appointmentPaging.total }} records).</span>
                                <button @click="paginateAppointments(appointmentPaging.currentPage - 1)"                
                    :disabled="appointmentPaging.currentPage === 1" class="btn-pagination">
                                    &laquo; Previous
                                  </button>
                                <button @click="paginateAppointments(appointmentPaging.currentPage + 1)"                
                    :disabled="appointmentPaging.currentPage === appointmentPaging.lastPage" class="btn-pagination">
                                    Next &raquo;
                                  </button>
                              </div>
                          </div>
                      </div>
                    <div v-else-if="currentTab === 'auditlogs'" class="view-audit-logs">
                        <h2>System and User Activity Logs</h2>
                        <p style="color: #718096; margin-bottom: 20px;">Track all critical actions performed by users
                            and the
                            system.</p>

                        <div v-if="isLoading" class="loading-state">Loading Audit Logs...</div>

                        <div v-else class="table-card">
                            <div class="table-responsive">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Timestamp</th>
                                            <th>User</th>
                                            <th>Action</th>
                                            <th>Table</th>
                                            <th>Details</th>
                                          </tr>
                                      </thead>
                                    <tbody>
                                        <tr v-for="(log, index) in filteredAuditLogs" :key="log?.id || index">
                                            <td>#{{ log.id || 'N/A' }}</td>
                                            <td>{{ log.created_at || 'N/A' }}</td>

                                            <td>
                                                <span class="fw-bold">
                                                    {{ log.user?.name || (log.user_id ? 'User ID: ' + log.user_id :
                                                      'System') }}
                                                  </span>
                                              </td>
                                            <td>
                                                <span class="fw-bold">{{ log.action }}</span>
                                              </td>
                                            <td><span class="animal-badge">{{ log.table_name || 'N/A' }}</span></td>
                                            <td><small style="color:#666;">{{ log.details }}</small></td>
                                          </tr>
                                        <tr v-if="auditLogs.length === 0 && !isLoading">
                                            <td colspan="6" style="text-align: center; padding: 20px;">No audit logs
                                                found.</td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>

                            <div v-if="auditLogPaging.total > auditLogPaging.perPage" class="pagination-controls">
                                <span>Showing page {{ auditLogPaging.currentPage }} of {{ auditLogPaging.lastPage }}
                                    (Total:
                                    {{
                                      auditLogPaging.total }} records).</span>
                                <button @click="paginateAuditLogs(auditLogPaging.currentPage - 1)"                  
                  :disabled="auditLogPaging.currentPage === 1" class="btn-pagination">
                                    &laquo; Previous
                                  </button>
                                <button @click="paginateAuditLogs(auditLogPaging.currentPage + 1)"                  
                  :disabled="auditLogPaging.currentPage === auditLogPaging.lastPage" class="btn-pagination">
                                    Next &raquo;
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>

              </div>

          </main>
      </div>
</template>

<style scoped>
/* =======================================================
    EXISTING STYLES (Retained)
    ======================================================= */
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

.header-left {
  display: flex;
  align-items: center;
}

.page-title h1 {
  font-size: 1.5rem;
  margin: 0;
  color: #333;
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

.menu-toggle {
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
  font-size: 1.5rem;
  cursor: pointer;
}

@media (max-width: 768px) {

  .menu-toggle {
    display: block;
  }

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


/* Header Right Actions */
.user-profile {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 💡 NEW HOLIDAYS BUTTON STYLE (similar to Restock button) */
.btn-holidays {
  background-color: #4CAF50;
  /* Green color for calendar action */
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

.btn-holidays:hover {
  background-color: #388E3C;
}

.btn-holidays .icon {
  margin-right: 5px;
  font-size: 1rem;
}

/* -------------------------------------------------------- */

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

/* Merged DSA Section (Now just a container for the chart) */
.dsa-dashboard-section {
  display: block;
  margin-bottom: 30px;
  height: 450px;
  /* Set height for chart visibility */
}

/* Appointments Table Tabs */
.appointments-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px 15px;
  background: white;
  border-radius: 12px;
  border: 1px solid #CFD8DC;
}

.search-bar-container {
  flex-grow: 1;
  min-width: 250px;
  max-width: 400px;
  order: 2;
  margin-left: auto;
}

.status-tabs {
  order: 1;
  display: flex;
  gap: 8px;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  flex-shrink: 0;
  overflow-x: auto;
  white-space: nowrap;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #CFD8DC;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: border-color 0.2s;
  height: 38px;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #1565C0;
}

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

.status-select {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid #CFD8DC;
  background-color: white;
  cursor: pointer;
  appearance: none;
}

/* Status Select colors (used by appointments & audit logs) */
.status-select.confirmed,
.status-badge.success {
  background: #E8F5E9;
  color: #2E7D32;
  border-color: #C8E6C9;
}

.status-select.pending,
.status-badge.pending {
  background: #FFF3E0;
  color: #EF6C00;
  border-color: #FFE0B2;
}

.status-select.completed,
.status-badge.completed {
  background: #E0F7FA;
  color: #00838F;
  border-color: #B2EBF2;
}

.status-select.cancelled,
.status-badge.cancelled {
  background: #FFEBEE;
  color: #C62828;
  border-color: #FFCDD2;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: inline-block;
}


/* 💡 Audit Logs specific styles */
.view-audit-logs h2 {
  font-size: 1.3rem;
  color: #1565C0;
  margin-top: 0;
}

.status-badge.success {
  background: #E8F2F9;
  color: #2E7D32;
  border-color: #C8E6C9;
}


.pagination-controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 15px 10px;
  background: white;
  border-radius: 12px;
  margin-top: 20px;
  border: 1px solid #CFD8DC;
  gap: 15px;
}

.pagination-controls span {
  font-size: 0.9rem;
  color: #546E7A;
}

.page-info {
  font-weight: 600;
}

.btn-pagination {
  background-color: #E3F2FD;
  color: #1565C0;
  border: 1px solid #BBDEFB;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.9rem;
}

.btn-pagination:hover:not(:disabled) {
  background-color: #BBDEFB;
}

.btn-pagination:disabled {
  background-color: #F5F7FA;
  color: #B0BEC5;
  cursor: not-allowed;
  border-color: #E0E0E0;
}

/* --- NEW STYLES FOR MONTHLY REPORT TABLE --- */
.monthly-report-section {
  margin-top: 30px;
  padding: 20px;
}

.card-title-table {
  font-size: 1.2rem;
  color: #1565C0;
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #E0E0E0;
  padding-bottom: 10px;
}

.monthly-table th {
  background: #42A5F5;
  color: white;
}

.monthly-table td {
  vertical-align: middle;
  padding: 12px 15px;
}

.forecast-only-card .monthly-table th {
  background: #FF9800;
  /* Orange header for Straight Line */
  color: white;
}

.forecast-only-card .monthly-table th:nth-child(3) {
  background: #673AB7;
  /* Deep Purple for Exponential Smoothing */
  color: white;
}

/* NOTE: Moving Average header styles removed */

.forecast-row {
  background-color: #FFFDE7;
  font-style: italic;
  font-weight: 500;
}

.forecast-badge {
  margin-left: 10px;
  background-color: #FFECB3;
  color: #FF9800;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
}

.table-note {
  display: block;
  margin-top: 15px;
  color: #78909C;
  font-size: 0.85rem;
}
</style>











