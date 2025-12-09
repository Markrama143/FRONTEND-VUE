<script setup>
import { ref, onMounted, watch } from 'vue'; // Removed 'nextTick'
import Chart from 'chart.js/auto';
import apiService from '@/services/apiService';

const isLoading = ref(true);
const chartError = ref(null);
const chartContainer = ref(null);
const chartInstance = ref(null);
const rawData = ref(null); // Store fetched data here

// Fixed colors for consistency across different animal types (optional)
const CHART_COLORS = [
    '#42A5F5', '#FF9800', '#673AB7', '#00B894', '#FF5252', 
    '#607D8B', '#FF4081', '#7C4DFF', '#00BCD4', '#8BC34A'
];

const renderChart = (data) => {
    // This function assumes chartContainer.value is now valid
    if (chartInstance.value) {
        chartInstance.value.destroy();
    }
    
    if (!chartContainer.value) {
        // This block should ideally not be hit if the watcher works
        chartError.value = "Chart container not found (Render Check Failed).";
        return;
    }

    const labels = data.map(item => item.animal_type);
    const counts = data.map(item => item.total);

    const ctx = chartContainer.value.getContext('2d');
    chartInstance.value = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Appointments',
                data: counts,
                backgroundColor: CHART_COLORS.slice(0, labels.length),
                borderColor: CHART_COLORS.slice(0, labels.length).map(c => c.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Horizontal bar chart
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Appointments'
                    },
                    ticks: {
                        callback: function(value) {
                            return Number.isInteger(value) ? value : null;
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Animal Type'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Appointment Volume by Animal Type'
                }
            }
        }
    });
};

const fetchAnimalStats = async () => {
    isLoading.value = true;
    chartError.value = null;
    try {
        const response = await apiService.getAnimalTypeAnalytics(); 
        
        if (response.data && response.data.success && response.data.data.length > 0) {
            // Store raw data after successful fetch
            rawData.value = response.data.data.sort((a, b) => b.total - a.total);
        } else {
            chartError.value = "No animal appointment data found.";
        }
    } catch (error) {
        console.error("Animal Stats Fetch Error:", error);
        chartError.value = "Failed to load animal analytics data.";
    } finally {
        isLoading.value = false;
    }
};

// CRITICAL FIX: Watcher ensures chart renders only after the canvas element (ref) is available in the DOM
watch(chartContainer, (newValue) => {
    // Check if the reference is no longer null (meaning the canvas is mounted) AND we have data
    if (newValue && rawData.value) {
        // Run the rendering logic
        renderChart(rawData.value);
    }
}, { immediate: false }); // Do not run on initial render if chartContainer is null

onMounted(fetchAnimalStats);
</script>

<template>
    <div class="dsa-card animal-chart-container">
        <div v-if="isLoading" class="chart-state">
            Loading descriptive analysis...
        </div>
        <div v-else-if="chartError" class="chart-state error">
            <p>{{ chartError }}</p>
        </div>
        <div v-else class="chart-wrapper">
            <canvas ref="chartContainer"></canvas>
        </div>
    </div>
</template>

<style scoped>
.dsa-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #CFD8DC;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    height: 450px; /* Fixed height for consistency */
}

.animal-chart-container {
    min-height: 400px;
    display: flex;
    flex-direction: column;
}

.chart-wrapper {
    flex-grow: 1;
    min-height: 0;
}

.chart-state {
    text-align: center;
    padding: 50px 20px;
    font-size: 1.1rem;
    color: #546E7A;
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chart-state.error {
    color: #C62828;
}
</style>








