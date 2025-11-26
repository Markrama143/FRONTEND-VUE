<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiService from '@/services/apiService';

const router = useRouter();
const currentTab = ref('dashboard');
const isLoading = ref(false);
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
};

const stats = ref({ totalAppointments: 0, vaccineStock: 0, pendingRequests: 0 });
const appointments = ref([]);
const reports = ref([]);
const dsaData = ref({ peakDays: [], prediction: "Loading..." });

const loadAdminData = async () => {
    isLoading.value = true;
    try {
        const [appointmentRes, statsRes, dsaRes, reportsRes] = await Promise.allSettled([
            apiService.getAllAppointments(),
            apiService.getAdminStats(),
            apiService.getDSAData(),
            apiService.getSummaryReports()
        ]);

        if (appointmentRes.status === 'fulfilled') {
            // Handle nested data structure from Laravel resources if present
            appointments.value = appointmentRes.value.data.data || appointmentRes.value.data;
        }

        if (statsRes.status === 'fulfilled') {
            stats.value = statsRes.value.data;
        } else {
            // Fallback stats calculation
            stats.value.totalAppointments = appointments.value.length;
            stats.value.pendingRequests = appointments.value.filter(a => a.status === 'Pending').length;
        }

        if (dsaRes.status === 'fulfilled') {
            dsaData.value = dsaRes.value.data;
        } else {
            dsaData.value = { peakDays: [], prediction: "Not enough data." };
        }

        if (reportsRes.status === 'fulfilled') {
            reports.value = reportsRes.value.data;
        }
    } catch (error) {
        console.error("Error:", error);
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
</script>

<template>
    <div class="admin-layout">
        <div class="mobile-overlay" :class="{ 'show': isSidebarOpen }" @click="toggleSidebar"></div>

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
                <div class="nav-item" :class="{ active: currentTab === 'dsa' }"
                    @click="currentTab = 'dsa'; isSidebarOpen = false">
                    <span class="icon">🧠</span> DSA Analytics
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
            <header class="top-bar">
                <div class="header-left">
                    <button class="menu-toggle" @click="toggleSidebar">☰</button>
                    <div class="page-title">
                        <h1>{{ currentTab === 'dsa' ? 'DSA Analytics' : currentTab.charAt(0).toUpperCase() +
                            currentTab.slice(1) }}</h1>
                    </div>
                </div>
                <div class="user-profile">
                    <div class="avatar-circle">A</div>
                    <span class="username-text">Administrator</span>
                </div>
            </header>

            <div class="content-scroll-area">
                <div v-if="isLoading" class="loading-state">Loading Data...</div>
                <div v-else>
                    <!-- DASHBOARD -->
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
                                    <h3>Vaccines</h3>
                                    <p>{{ stats?.vaccineStock || 0 }}</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon-box orange-bg">⏳</div>
                                <div class="stat-info">
                                    <h3>Pending</h3>
                                    <p>{{ stats?.pendingRequests || 0 }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- APPOINTMENTS TABLE -->
                    <div v-else-if="currentTab === 'appointments'" class="view-appointments">
                        <div class="table-card">
                            <div class="table-responsive">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Patient Info</th>
                                            <th>Contact Details</th>
                                            <th>Animal</th>
                                            <th>Date & Time</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="appointment in appointments" :key="appointment.id">
                                            <td>#{{ appointment.id }}</td>
                                            <td>
                                                <div class="fw-bold">{{ appointment.name }}</div>
                                                <small style="color:#666;">{{ appointment.sex }}, {{ appointment.age }} yrs</small>
                                            </td>
                                            <td>
                                                <div>{{ appointment.email || 'N/A' }}</div>
                                                <small style="color:#666;">{{ appointment.phone_number || sd }}</small>
                                            </td>
                                            <td><span class="animal-badge">{{ appointment.animal_type }}</span></td>
                                            <td>
                                                <div class="fw-bold">{{ appointment.date }}</div>
                                                <small>{{ appointment.time }}</small>
                                            </td>
                                            <td>
                                                <span class="status-badge"
                                                    :class="(appointment.status || 'pending').toLowerCase()">
                                                    {{ appointment.status || 'Pending' }}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr v-if="appointments.length === 0">
                                            <td colspan="6" style="text-align:center; padding: 20px;">No appointments
                                                found.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- DSA & REPORTS -->
                    <div v-else-if="currentTab === 'dsa'" class="view-dsa">
                        <div class="dsa-card">
                            <div class="card-header">
                                <h3>AI Demand Prediction</h3>
                            </div>
                            <div class="card-body">
                                <div class="prediction-box"><span class="ai-icon">✨</span> {{ dsaData?.prediction }}
                                </div>
                                <div class="chart-container" v-if="dsaData?.peakDays?.length > 0">
                                    <div class="bar-chart">
                                        <div v-for="d in dsaData.peakDays" :key="d.day" class="bar-group">
                                            <div class="bar" :style="{ height: d.value + '%' }"></div>
                                            <span class="label">{{ d.day }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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

.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
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

.table-card {
    background: white;
    border-radius: 12px;
    padding: 10px;
    overflow: hidden;
    border: 1px solid #CFD8DC;
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
    background: #E0F2F1;
    color: #00695C;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    border: 1px solid #B2DFDB;
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

.dsa-card,
.report-list {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #CFD8DC;
}

.prediction-box {
    background: linear-gradient(135deg, #1565C0, #42A5F5);
    color: white;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #0D47A1;
}

.bar-chart {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 200px;
    border-bottom: 2px solid #EEE;
}

.bar-group {
    width: 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.bar {
    width: 100%;
    background: #42A5F5;
    border-radius: 5px 5px 0 0;
    border: 1px solid #1E88E5;
}

.label {
    font-size: 0.8rem;
    color: #888;
    margin-top: 5px;
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
</style>