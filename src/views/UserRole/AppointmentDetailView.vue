<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from '@/services/apiService';

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const appointment = ref(null);
const error = ref(null);

// Get the ID from the URL (e.g., /appointment/1)
const appointmentId = route.params.id;

// --- Fetch Data ---
onMounted(async () => {
  try {
    const response = await apiService.getAppointmentById(appointmentId);
    // Adjust .data or .data.data depending on your Laravel Resource wrapper
    appointment.value = response.data.data || response.data;
  } catch (err) {
    console.error(err);
    error.value = "Failed to load details.";
  } finally {
    isLoading.value = false;
  }
});

// --- Cancel Appointment ---
const cancelAppointment = async () => {
  if (!confirm("Are you sure you want to cancel this appointment?")) return;

  try {
    await apiService.deleteAppointment(appointmentId);
    alert("Appointment cancelled successfully.");
    router.push('/dashboard'); // Go back to dashboard
  } catch (err) {
    alert("Failed to delete appointment.");
  }
};

const goBack = () => router.back();
</script>

<template>
  <div class="page-container">
    
    <header class="app-bar">
      <button @click="goBack" class="back-btn">←</button>
      <h1>Appointment Details</h1>
    </header>

    <div v-if="isLoading" class="center-msg">Loading details...</div>
    <div v-else-if="error" class="center-msg error">{{ error }}</div>

    <div v-else-if="appointment" class="content-body">
      
      <div class="details-card">
        
        <div class="detail-row">
          <div class="icon-box">👤</div> <div class="info-text">
            <span class="label">Patient Name</span>
            <span class="value">{{ appointment.name }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="detail-row">
          <div class="icon-box">🐾</div>
          <div class="info-text">
            <span class="label">Animal</span>
            <span class="value">{{ appointment.animal_type || appointment.animal }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="detail-row">
          <div class="icon-box">📅</div>
          <div class="info-text">
            <span class="label">Date</span>
            <span class="value">{{ appointment.date }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="detail-row">
          <div class="icon-box">🕒</div>
          <div class="info-text">
            <span class="label">Time</span>
            <span class="value">{{ appointment.time }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="detail-row">
          <div class="icon-box">ℹ️</div>
          <div class="info-text">
            <span class="label">Age</span>
            <span class="value">{{ appointment.age }} years old</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="detail-row">
          <div class="icon-box">⚧</div>
          <div class="info-text">
            <span class="label">Sex</span>
            <span class="value">{{ appointment.sex }}</span>
          </div>
        </div>

      </div> <div class="footer-action">
        <button class="btn-cancel" @click="cancelAppointment">
          <span class="trash-icon">🗑</span> Cancel Appointment
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Layout */
.page-container {
  background-color: #fcfcfc;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
}

/* Header */
.app-bar {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  /* border-bottom: 1px solid #f0f0f0; */
}
.back-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  margin-right: 15px;
  color: #333;
}
.app-bar h1 {
  font-size: 1.25rem;
  margin: 0;
  font-weight: 500;
}

/* Body */
.content-body {
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

/* Card Styling */
.details-card {
  background: white;
  border-radius: 16px;
  padding: 10px 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}

/* Row Item */
.detail-row {
  display: flex;
  align-items: center;
  padding: 15px 0;
}

.icon-box {
  width: 40px;
  font-size: 1.5rem;
  color: #009688; /* Teal color */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.info-text {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.8rem;
  color: #9e9e9e;
  margin-bottom: 2px;
}

.value {
  font-size: 1.1rem;
  color: #222;
  font-weight: 500;
}

/* Divider Line */
.divider {
  height: 1px;
  background-color: #eee;
  margin-left: 55px; /* Offset to align with text */
}

/* Cancel Button */
.footer-action {
  margin-top: auto;
}

.btn-cancel {
  width: 100%;
  background-color: #FFCDD2; /* Light Red/Pink bg */
  color: #C62828; /* Dark Red text */
  border: none;
  padding: 15px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background-color: #EF9A9A;
}

.trash-icon {
  margin-right: 8px;
}

.center-msg {
  text-align: center;
  margin-top: 50px;
  color: #888;
}
.error { color: red; }
</style>