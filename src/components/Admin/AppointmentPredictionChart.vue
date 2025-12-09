    <script setup>
    import { ref, onMounted, defineEmits, nextTick } from 'vue'; 
    import Chart from 'chart.js/auto';
    import moment from 'moment';
    import apiService from '@/services/apiService';

    const emits = defineEmits(['data-loaded']);

    const chartContainer = ref(null);
    const chartInstance = ref(null);
    const isLoadingChart = ref(false);
    const chartError = ref(null);

    const FORECAST_MONTHS = 3; 
    const ALPHA = 0.40; // Smoothing constant (alpha) for Exponential Smoothing
    // NOTE: MOVING_AVERAGE_PERIOD constant removed.

    // --- Data Aggregation Function (Unchanged) ---
    const aggregateData = (rawData) => {
    if (!rawData || rawData.length === 0) return [];
    
    const monthlyCounts = {};

    rawData.forEach(item => {
        // Uses the correct 'date' column name from the Laravel backend
        const monthKey = moment(item.date).startOf('month').format('YYYY-MM-DD'); 
        monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
    });
    
    const aggregated = Object.keys(monthlyCounts)
        .sort()
        .map(date => ({
        date: date,
        count: monthlyCounts[date],
        }));
        
    return aggregated;
    };

    // --- Method 1: Exponential Smoothing (SES, Alpha=0.40) ---
    const runExponentialSmoothing = (historicalData) => {
        if (historicalData.length === 0) return { data: [], lastLevel: 0 };

        let smoothedData = [];
        
        // S0 or L0 is set to the first actual value (A1)
        let previousSmoothedValue = historicalData[0].count;

        for (let i = 0; i < historicalData.length; i++) {
            const actualValue = historicalData[i].count;
            let currentSmoothedValue; // Correct declaration

            if (i === 0) {
                currentSmoothedValue = actualValue; 
            } else {
                // FIX: Corrected variable name from currentSmoSmoothedValue to currentSmoothedValue
                currentSmoothedValue = (ALPHA * actualValue) + ((1 - ALPHA) * previousSmoothedValue);
            }

            smoothedData.push({
                date: historicalData[i].date,
                count: actualValue,
                smoothed: Math.round(currentSmoothedValue * 100) / 100 
            });
            
            previousSmoothedValue = currentSmoothedValue;
        }

        return {
            data: smoothedData,
            lastLevel: previousSmoothedValue
        };
    };

    // --- Method 2: Straight Line (Compound Growth Rate) ---
    const runStraightLinePrediction = (historicalData) => {
        if (historicalData.length < 2) {
            return []; 
        }

        const lastMonth = historicalData[historicalData.length - 1].count; 
        const secondLastMonth = historicalData[historicalData.length - 2].count; 

        let constantGrowthRate = 0;

        if (secondLastMonth > 0) {
            // Calculate the MoM growth rate (Constant)
            constantGrowthRate = (lastMonth - secondLastMonth) / secondLastMonth;
        } 

        let forecasts = [];
        let lastPredictedCount = lastMonth;
        let lastDate = moment(historicalData[historicalData.length - 1].date); 

        for (let i = 1; i <= FORECAST_MONTHS; i++) {
            
            // Formula: Next Value = Part * (1 + Constant)
            let nextPredictedCount = lastPredictedCount * (1 + constantGrowthRate);
            
            lastPredictedCount = nextPredictedCount; 
            
            forecasts.push({
                date: lastDate.clone().add(i, 'months').format('YYYY-MM-DD'),
                count: Math.max(0, Math.round(nextPredictedCount))
            });
        }

        return forecasts;
    };


    // --- Main Data Flow ---
    const loadAnalyticsData = async () => {
        isLoadingChart.value = true;
        chartError.value = null;

        try {
            const rawData = (await apiService.getAllAppointmentsRaw()).data.data; 
            
            if (!rawData || rawData.length === 0) {
                chartError.value = "No historical appointment data to analyze.";
                emits('data-loaded', { historical: [], forecast: [] }); 
                isLoadingChart.value = false;
                return;
            }

            const historicalData = aggregateData(rawData);
            
            // 1. Run prediction models
            const smoothedResults = runExponentialSmoothing(historicalData);
            const straightLineForecast = runStraightLinePrediction(historicalData); 

            // 2. Generate Exponential Forecast (Chained smoothing using SL forecast as hypothetical actuals)
            const exponentialForecast = [];
            if (straightLineForecast.length > 0) {
                let previousSmoothedForecast = smoothedResults.lastLevel; 
                const lastHistoricalDate = moment(historicalData[historicalData.length - 1].date);

                for (let i = 0; i < straightLineForecast.length; i++) {
                    const hypotheticalActual = straightLineForecast[i].count; 
                    const currentSmoothedForecast = (ALPHA * hypotheticalActual) + ((1 - ALPHA) * previousSmoothedForecast);
                    
                    exponentialForecast.push({
                        date: lastHistoricalDate.clone().add(i + 1, 'months').format('YYYY-MM-DD'),
                        smoothed: Math.max(0, Math.round(currentSmoothedForecast * 100) / 100) 
                    });
                    
                    previousSmoothedForecast = currentSmoothedForecast; 
                }
            }
            
            // 3. Merge results for historical table (Actual + Smoothed)
            const enrichedHistoricalData = smoothedResults.data;
            
            // 4. Merge results for forecast table (SL + Exp)
            const combinedForecastData = straightLineForecast.map((slItem, index) => {
                const expItem = exponentialForecast[index];
                
                return {
                    date: slItem.date,
                    straight_line: slItem.count,
                    exponential_smooth: expItem ? expItem.smoothed : null,
                };
            });

            // 5. Render Chart (Visualizing Actual vs 2 Forecasts)
            isLoadingChart.value = false;
            await nextTick(); 
            
            renderChart(enrichedHistoricalData, combinedForecastData, exponentialForecast);
            
            // 6. EMIT the processed data
            emits('data-loaded', { 
                historical: enrichedHistoricalData, 
                forecast: combinedForecastData
            });

        } catch (error) {
            console.error("Analytics Data Loading Error:", error);
            chartError.value = "Failed to load or process appointment data. Check API/Network/Backend Logs."; 
            emits('data-loaded', { historical: [], forecast: [] });
        } finally {
            if (isLoadingChart.value) {
                isLoadingChart.value = false;
            }
        }
    };

    // --- Chart Rendering Function (Plots 3 lines: Actual + 2 Forecasts) ---
    const renderChart = (historicalData, combinedForecastData, exponentialForecast) => {
        if (chartInstance.value) {
            chartInstance.value.destroy();
        }
        
        if (!chartContainer.value) {
            console.error("Chart container ref is missing or null during render attempt.");
            return;
        }

        const allForecastDates = combinedForecastData.map(f => f.date);
        const combinedLabels = [...historicalData.map(d => d.date), ...allForecastDates];
        const labels = combinedLabels.map(d => moment(d).format('MMM YYYY'));
        
        const historicalCounts = historicalData.map(d => d.count);

        const straightLineCounts = combinedForecastData.map(d => d.straight_line);
        const exponentialSmoothCounts = exponentialForecast.map(d => d.smoothed); 

        // Dataset 1: Actual Appointments (ends at the last historical point)
        const historicalDataSet = [
            ...historicalCounts,
            ...Array(straightLineCounts.length).fill(null)
        ];
        
        // Dataset 2: Straight Line Forecast (starts at the last historical point)
        const slForecastDataSet = [
            ...Array(historicalCounts.length - 1).fill(null),
            historicalCounts[historicalCounts.length - 1],
            ...straightLineCounts
        ];
        
        // Dataset 3: Exponential Forecast (starts at the last historical smoothed point)
        const lastHistoricalSmoothed = historicalData[historicalData.length - 1]?.smoothed || historicalCounts[historicalCounts.length - 1];
        const expForecastDataSet = [
            ...Array(historicalCounts.length - 1).fill(null),
            lastHistoricalSmoothed,
            ...exponentialSmoothCounts
        ];
        
        // NOTE: Moving Average dataset removed.


        const ctx = chartContainer.value.getContext('2d');
        chartInstance.value = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Actual Appointments',
                        data: historicalDataSet,
                        borderColor: '#1565C0', // Blue
                        backgroundColor: 'rgba(21, 101, 192, 0.1)',
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#1565C0',
                        tension: 0 
                    },
                    {
                        label: 'Straight Line Forecast',
                        data: slForecastDataSet,
                        borderColor: '#FF9800', // Orange
                        borderDash: [5, 5],
                        borderWidth: 2,
                        pointRadius: [0, 4, 4, 4], 
                        pointBackgroundColor: '#FF9800',
                        tension: 0
                    },
                    {
                        label: 'Exponential Smooth Forecast',
                        data: expForecastDataSet,
                        borderColor: '#673AB7', // Deep Purple
                        borderDash: [8, 4],
                        borderWidth: 2,
                        pointRadius: [0, 4, 4, 4], 
                        pointBackgroundColor: '#673AB7',
                        tension: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
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
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: `Monthly Appointment Prediction (${moment().format('YYYY')}-${moment().add(FORECAST_MONTHS, 'months').format('YYYY')})`
                    }
                }
            }
        });
    };

    onMounted(() => {
        loadAnalyticsData();
    });
    </script>

    <template>
        <div class="dsa-card prediction-chart-container">
            <h3 class="card-title">Appointment Count Prediction</h3>
            
            <div v-if="isLoadingChart" class="chart-state">
                <p>Loading and performing prediction...</p>
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
        height: 100%;
    }

    .card-title {
        font-size: 1.2rem;
        color: #1565C0;
        margin-top: 0;
        margin-bottom: 20px;
        border-bottom: 1px solid #E0E0E0;
        padding-bottom: 10px;
    }

    .prediction-chart-container {
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
    }

    .chart-state.error {
        color: #C62828;
        font-weight: 600;
    }
    </style>








