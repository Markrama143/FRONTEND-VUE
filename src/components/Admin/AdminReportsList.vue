<script setup>
const props = defineProps({
    reports: Array
});
</script>

<template>
    <div class="view-reports">
        <div class="report-list">
            <div v-for="rep in props.reports" :key="rep.id" class="report-item">
                <div class="rep-icon-box">📄</div>
                <div class="rep-details">
                    <h4>{{ rep.event }}</h4>
                    <p>{{ rep.details }}</p>
                </div>
                <div class="rep-date">{{ rep.date }}</div>
            </div>
            <div v-if="props.reports.length === 0" class="empty-report-message">
                No summary reports available.
            </div>
        </div>
    </div>
</template>

<style scoped>
/* CSS copied from original AdminDashboardView.vue */
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

.report-item:last-child {
    margin-bottom: 0;
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

.rep-details {
    flex-grow: 1;
}

.rep-details h4 {
    margin: 0 0 5px 0;
    color: #263238;
    font-size: 1rem;
}

.rep-details p {
    margin: 0;
    color: #78909C;
    font-size: 0.9rem;
}

.rep-date {
    color: #90A4AE;
    font-size: 0.85rem;
}

.empty-report-message {
    text-align: center;
    color: #999;
    padding: 10px;
}
</style>












