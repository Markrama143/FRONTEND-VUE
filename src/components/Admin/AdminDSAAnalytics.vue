<script setup>
const props = defineProps({
    dsaData: Object
});
</script>

<template>
    <div class="view-dsa">
        <div class="dsa-card">
            <div class="card-header">
                <h3>🤖 AI Demand Prediction</h3>
            </div>
            <div class="card-body">
                <div class="prediction-box">
                    <span class="ai-icon">✨</span> {{ props.dsaData?.prediction || 'Loading analysis...' }}
                </div>

                <div class="chart-container" v-if="props.dsaData?.peakDays?.length > 0">
                    <h4>Projected Appointment Traffic (Next 7 Days)</h4>
                    <div class="bar-chart">
                        <div v-for="d in props.dsaData.peakDays" :key="d.day" class="bar-group">
                            <div class="bar" :style="{ height: d.value + '%' }"></div>
                            <span class="label">{{ d.day }}</span>
                        </div>
                    </div>
                </div>
                <div v-else style="text-align:center; color:#999; padding:20px;">
                    Not enough data for visualization.
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* CSS copied from original AdminDashboardView.vue */
.dsa-card {
    background: white;
    border-radius: 12px;
    padding: 10px;
    border: 1px solid #CFD8DC;
    margin-bottom: 20px;
}

.card-header {
    padding: 15px 15px 10px 15px;
    border-bottom: 1px solid #F0F0F0;
}

.card-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #1565C0;
}

.card-body {
    padding: 20px 15px;
}

.prediction-box {
    background: linear-gradient(135deg, #1565C0 0%, #42A5F5 100%);
    color: white;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 30px;
    font-size: 1rem;
    font-weight: 500;
    box-shadow: 0 4px 10px rgba(21, 101, 192, 0.3);
    border: 1px solid #0D47A1;
}

.chart-container {
    height: 250px;
    margin-top: 20px;
}

.chart-container h4 {
    color: #546E7A;
    margin-bottom: 20px;
    font-weight: 500;
    font-size: 1rem;
}

.bar-chart {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 100%;
    border-bottom: 2px solid #E3F2FD;
    padding-bottom: 5px;
}

.bar-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: flex-end;
    width: 40px;
}

.bar {
    width: 100%;
    background: #42A5F5;
    border-radius: 6px 6px 0 0;
    transition: height 0.5s;
    border: 1px solid #1E88E5;
}

.label {
    margin-top: 10px;
    font-size: 0.85rem;
    color: #78909C;
}
</style>












