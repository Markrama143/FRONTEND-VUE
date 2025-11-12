<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <i class="fas fa-paw"></i>
        <span>Animal BiteCare</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      <router-link to="/admin" class="nav-item" active-class="active">
        <i class="fas fa-chart-line"></i>
        <span>Dashboard</span>
      </router-link>
      <router-link to="/admin/appointments" class="nav-item" active-class="active">
        <i class="fas fa-calendar-check"></i>
        <span>Appointments</span>
      </router-link>
      <router-link to="/admin/analytics" class="nav-item" active-class="active">
        <i class="fas fa-chart-bar"></i>
        <span>Analytics</span>
      </router-link>
    </nav>
    <div class="sidebar-footer">
      <button class="logout-btn" @click="logout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
const logout = () => {
  alert('Logout functionality to be implemented');
};
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.logo i {
  font-size: 1.75rem;
}

.sidebar-nav {
  flex: 1;
  padding: 2rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  font-weight: 500;
}

.nav-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border-left-color: white;
}

.nav-item.active {
  color: white;
  background: rgba(255, 255, 255, 0.15);
  border-left-color: white;
}

.nav-item i {
  font-size: 1.25rem;
  min-width: 24px;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
</style>
