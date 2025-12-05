<script setup>
// FIX 1 & 2: Define props using the compiler macro syntax.
// We keep the `props` variable if we need it in the script logic,
// but since this component only uses props in the template, we can define it simply.
const props = defineProps({
    appointments: Array
});

// FIX 3: Access props via 'props.appointments' if needed in <script>
// However, Vue allows direct access in the <template> when using <script setup>.
</script>

<template>
    <div class="view-appointments">
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
                        <!-- FIX 4: Use props.appointments directly -->
                        <tr v-for="appointment in props.appointments" :key="appointment.id">
                            <td>#{{ appointment.id }}</td>
                            <td>
                                <div class="fw-bold">{{ appointment.name }}</div>
                                <small style="color:#666;">{{ appointment.sex }}, {{ appointment.age }} yrs</small>
                            </td>
                            <td>
                                <div>{{ appointment.email || 'N/A' }}</div>
                                <small style="color:#666;">{{ appointment.phone_number || 'N/A' }}</small>
                            </td>
                            <td><span class="animal-badge">{{ appointment.animal_type }}</span></td>
                            <td>
                                <div class="fw-bold">{{ appointment.date }}</div>
                                <small>{{ appointment.time }}</small>
                            </td>
                            <td>
                                <span class="status-badge" :class="(appointment.status || 'pending').toLowerCase()">
                                    {{ appointment.status || 'Pending' }}
                                </span>
                            </td>
                        </tr>
                        <tr v-if="props.appointments.length === 0">
                            <td colspan="6" style="text-align:center; padding: 20px;">No appointments found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* CSS copied from original AdminDashboardView.vue */
.table-card {
    background: white;
    border-radius: 12px;
    padding: 10px;
    overflow: hidden;
    border: 1px solid #CFD8DC;
    margin-bottom: 20px;
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

.completed {
    background: #E3F2FD;
    color: #1565C0;
    border-color: #BBDEFB;
}
</style>












