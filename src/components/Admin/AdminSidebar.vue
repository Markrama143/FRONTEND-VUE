<script setup>
/* global defineProps defineEmits */ // FIX: Added this global directive for ESLint
import { useRouter } from 'vue-router';

// FIX 1: Use defineProps and defineEmits directly (compiler macros)
const props = defineProps({
    currentTab: String,
    isSidebarOpen: Boolean
});

const emit = defineEmits(['update:currentTab', 'closeSidebar']);

const router = useRouter();

const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_role');
    router.push('/');
};

const navigate = (tab) => {
    emit('update:currentTab', tab);
    emit('closeSidebar');
};
</script>

<template>
    <aside class="sidebar" :class="{ 'open': props.isSidebarOpen }">
        <div class="brand">
            <h2>BiteCare <span class="admin-badge">ADMIN</span></h2>
            <button class="close-btn-mobile" @click="emit('closeSidebar')">✕</button>
        </div>

        <nav class="nav-menu">
            <div class="nav-section-label">MENU</div>
            <div class="nav-item" :class="{ active: props.currentTab === 'dashboard' }" @click="navigate('dashboard')">
                <span class="icon">📊</span> Dashboard
            </div>
            <div class="nav-item" :class="{ active: props.currentTab === 'appointments' }"
                @click="navigate('appointments')">
                <span class="icon">📅</span> Appointments
            </div>
            <div class="nav-item" :class="{ active: props.currentTab === 'dsa' }" @click="navigate('dsa')">
                <span class="icon">🧠</span> DSA Analytics
            </div>
            <div class="nav-item" :class="{ active: props.currentTab === 'reports' }" @click="navigate('reports')">
                <span class="icon">📑</span> Summary Reports
            </div>
        </nav>

        <div class="logout-section">
            <button @click="handleLogout" class="btn-logout">
                <span class="icon">🚪</span> Logout
            </button>
        </div>
    </aside>
</template>

<style scoped>
/* Styles remain the same */
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

.close-btn-mobile {
    display: none;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #999;
}

@media (max-width: 768px) {
    .close-btn-mobile {
        display: block;
    }
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
    transition: all 0.2s;
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
</style>












