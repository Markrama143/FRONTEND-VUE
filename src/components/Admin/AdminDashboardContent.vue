<script setup>
const props = defineProps({
    stats: Object
});
</script>

<template>
    <div class="view-dashboard">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon-box blue-bg">📅</div>
                <div class="stat-info">
                    <h3>Total appointments</h3>
                    <p>{{ props.stats?.totalAppointments || 0 }}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-box blue-bg">💉</div>
                <div class="stat-info">
                    <h3>Vaccines</h3>
                    <p>{{ props.stats?.vaccineStock || 0 }}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon-box orange-bg">⏳</div>
                <div class="stat-info">
                    <h3>Pending</h3>
                    <p>{{ props.stats?.pendingRequests || 0 }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* CSS copied from original AdminDashboardView.vue */
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

.stat-info h3 {
    margin: 0 0 5px 0;
    font-size: 0.9rem;
    color: #718096;
}

@media (max-width: 768px) {
    .stats-grid {
        grid-template-columns: 1fr;
    }
}
</style>












