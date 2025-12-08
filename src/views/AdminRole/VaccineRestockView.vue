<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiService from '@/services/apiService';

const date = ref('');
const amount = ref(20);
const loading = ref(false);
const message = ref('');
const success = ref(false);
const stocks = ref([]);

const router = useRouter();
const today = new Date().toISOString().split('T')[0];

const fetchStocks = async () => {
    try {
        const res = await apiService.getVaccineStock();
        stocks.value = res.data.data || res.data;
    } catch (e) {
        console.error("Fetch error", e);
        message.value = 'Failed to load stock list.';
        success.value = false;
    }
};

const saveStock = async () => {
    loading.value = true;
    message.value = '';

    if (!date.value || !amount.value || amount.value <= 0) {
        message.value = 'Please enter a valid date and amount.';
        success.value = false;
        loading.value = false;
        return;
    }

    try {
        // FIX: Change 'quantity' to 'amount' in the payload to match backend validation
        await apiService.postVaccineStock({
            date: date.value,
            amount: amount.value // <--- CORRECTED PAYLOAD KEY
        });
        success.value = true;
        message.value = 'Stock updated successfully!';
        fetchStocks(); // Refresh list
    } catch (e) {
        success.value = false;

        if (e.response && e.response.status === 422) {
            const errors = e.response.data.errors;
            let errorMsg = 'Validation failed: ';
            // Now checks for both keys, just in case
            if (errors.date) {
                errorMsg += errors.date[0];
            } else if (errors.amount) { // Check for 'amount' error
                errorMsg += errors.amount[0];
            } else {
                errorMsg += 'Please check your inputs.';
            }
            message.value = errorMsg;
        } else {
            message.value = e.response?.data?.message || 'Failed to update. Check backend setup.';
        }
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    router.push('/admin');
};


onMounted(() => {
    fetchStocks();
});
</script>

<template>
        <div class="page-container">

        <!-- Header with Back Button -->
        <header class="app-bar">
            <button @click="goBack" class="back-btn">
                <span class="material-icon">←</span>
            </button>
                        <h1>💉 Vaccine Availability Manager</h1>
                   
        </header>

                <div class="content-wrapper">
                        <div class="card stock-card">
                                <h3 class="card-title">Restock Entry</h3>
                               
                                <div class="form-group">
                                        <label>Select Date:</label>
                                        <input type="date" v-model="date" :min="today" class="input-field" />
                                    </div>

                                <div class="form-group">
                                        <label>Total Doses Available:</label>
                                        <input type="number" v-model="amount" placeholder="e.g. 50"
                        class="input-field" />
                                </div>

                                <button @click="saveStock" :disabled="loading" class="btn btn-primary">
                                        {{ loading ? 'Saving...' : 'Update Stock' }}
                                    </button>

                                <p v-if="message" :class="success ? 'msg success' : 'msg error'">{{ message }}</p>
                            </div>

                        <div class="card list-area">
                                <h3 class="card-title">Upcoming Schedule (All Doses)</h3>
                                <ul class="stock-list">
                    <li v-if="stocks.length === 0">No future stock entries found.</li>
                                        <li v-for="stock in stocks" :key="stock.id">
                                                <span class="date-label">{{ stock.date }}:</span>
                        <span class="quantity-label">{{ stock.quantity }} doses</span>
                                       
                    </li>
                                   
                                   
                </ul>
                            </div>
                    </div>
           
    </div>
</template>

<style scoped>
/* =========================================
   BLUE/WHITE DASHBOARD THEME
   ========================================= */
.page-container {
    max-width: 900px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: 'Segoe UI', sans-serif;
    background-color: #F5F7FA;
    /* Light dashboard background */
    min-height: 100vh;
}

/* New Header/Back Button Styles */
.app-bar {
    display: flex;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #CFD8DC;
    background: transparent;
    margin-bottom: 25px;
}

.back-btn {
    background: none;
    border: none;
    font-size: 1.8rem;
    cursor: pointer;
    color: #1565C0;
    padding: 0;
    margin-right: 15px;
    transition: color 0.2s;
}

.back-btn:hover {
    color: #0D47A1;
}

.app-bar h1 {
    font-size: 1.4rem;
    margin: 0;
    font-weight: 600;
    color: #263238;
}

.content-wrapper {
    display: flex;
    gap: 30px;
}

.card {
    border: 1px solid #CFD8DC;
    /* Stroke */
    padding: 25px;
    border-radius: 12px;
    background: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.stock-card {
    flex-grow: 1;
    /* Takes remaining width */
    max-width: 400px;
    /* Max width for the form */
}

.list-area {
    flex-grow: 1;
    min-width: 300px;
}

.card-title {
    color: #1565C0;
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 1px solid #E0E0E0;
    font-size: 1.1rem;
    font-weight: 600;
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #37474F;
}

.input-field {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #CFD8DC;
    border-radius: 6px;
    transition: border-color 0.2s;
}

.input-field:focus {
    outline: none;
    border-color: #1565C0;
}


/* Button Styling */
.btn {
    background: #1565C0;
    color: white;
    border: none;
    padding: 12px 20px;
    cursor: pointer;
    border-radius: 30px;
    width: 100%;
    font-weight: 600;
    transition: background 0.2s;
}

.btn-primary:hover {
    background: #0D47A1;
}

.btn:disabled {
    background: #BBDEFB;
    cursor: not-allowed;
}

/* Messages */
.msg {
    margin-top: 15px;
    padding: 10px;
    border-radius: 6px;
    font-size: 0.9rem;
}

.success {
    color: #2E7D32;
    background: #E8F5E9;
    border: 1px solid #C8E6C9;
}

.error {
    color: #C62828;
    background: #FFEBEE;
    border: 1px solid #FFCDD2;
}

/* List Styling */
.stock-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.stock-list li {
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem;
}

.stock-list li:last-child {
    border-bottom: none;
}

.date-label {
    font-weight: 600;
    color: #263238;
}

.quantity-label {
    color: #1565C0;
    font-weight: 600;
}


@media (max-width: 768px) {
    .content-wrapper {
        flex-direction: column;
        gap: 20px;
    }

    .stock-card {
        max-width: 100%;
    }

    /* Hide specific desktop elements on mobile */
    .app-bar {
        padding: 15px 20px;
    }

    .back-btn {
        font-size: 1.5rem;
    }

    .app-bar h1 {
        font-size: 1.2rem;
    }
}
</style>































