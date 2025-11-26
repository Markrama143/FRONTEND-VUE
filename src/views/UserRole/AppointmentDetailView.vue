<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiService from '@/services/apiService';

const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const appointment = ref(null);
const error = ref(null);

const appointmentId = route.params.id;

// --- Fetch Data ---
onMounted(async () => {
  try {
    const response = await apiService.getAppointmentById(appointmentId);
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

  if (isLoading.value) return;
  isLoading.value = true;

  try {
    await apiService.deleteAppointment(appointmentId);
    alert("Appointment cancelled successfully.");
    router.push('/dashboard');
  } catch (err) {
    alert("Failed to delete appointment.");
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => router.push('/dashboard');
</script>

<template>
  <div class="page-container">

    <header class="app-bar">
      <button @click="goBack" class="back-btn">
        <span class="material-icon">←</span>
      </button>
      <h1>Appointment Details</h1>
    </header>

    <div class="content-wrapper">
      <div v-if="isLoading" class="center-msg loading-msg">Loading details...</div>
      <div v-else-if="error" class="center-msg error">{{ error }}</div>

      <div v-else-if="appointment" class="content-body">

        <div class="details-card">

          <!-- Row: Patient Name -->
          <div class="detail-row">
            <div class="icon-box">👤</div>
            <div class="info-text">
              <span class="label">Patient Name</span>
              <span class="value">{{ appointment.name }}</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Row: Status -->
          <div class="detail-row">
            <div class="icon-box">ⓘ</div>
            <div class="info-text">
              <span class="label">Status</span>
              <span class="status-value" :class="appointment.status.toLowerCase()">{{ appointment.status }}</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Row: Animal -->
          <div class="detail-row">
            <div class="icon-box">🐾</div>
            <div class="info-text">
              <span class="label">Animal</span>
              <span class="value">{{ appointment.animal_type || appointment.animal }}</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Row: Date -->
          <div class="detail-row">
            <div class="icon-box">📅</div>
            <div class="info-text">
              <span class="label">Date</span>
              <span class="value">{{ appointment.date }}</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Row: Time -->
          <div class="detail-row">
            <div class="icon-box">🕒</div>
            <div class="info-text">
              <span class="label">Time</span>
              <span class="value">{{ appointment.time }}</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Row: Age -->
          <div class="detail-row">
            <div class="icon-box">🎂</div>
            <div class="info-text">
              <span class="label">Age</span>
              <span class="value">{{ appointment.age }} years old</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Row: Sex -->
          <div class="detail-row">
            <div class="icon-box">⚧</div>
            <div class="info-text">
              <span class="label">Sex</span>
              <span class="value">{{ appointment.sex }}</span>
            </div>
          </div>

        </div> <!-- End Card -->

        <!-- Cancel Button -->
        <div class="footer-action">
          <button class="btn-cancel" @click="cancelAppointment" :disabled="isLoading">
            <span class="trash-icon">🗑</span>
            {{ isLoading ? 'Cancelling...' : 'Cancel Appointment' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* =========================================
   DASHBOARD STYLE APPLICATION (Blue/White)
   ========================================= */

/* Layout */
.page-container {
  background-color: #F5F7FA;
  /* Match Dashboard BG */
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
}

/* Header */
.app-bar {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background: white;
  border-bottom: 1px solid #CFD8DC;
  /* Stroke */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  margin-right: 15px;
  color: #1565C0;
  /* Primary Blue */
}

.back-btn:hover {
  color: #0D47A1;
}

.app-bar h1 {
  font-size: 1.3rem;
  margin: 0;
  font-weight: 600;
  color: #263238;
}

/* Body */
.content-wrapper {
  padding: 30px;
  flex-grow: 1;
}

.content-body {
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
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid #CFD8DC;
  /* Stroke */
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
  color: #1565C0;
  /* Primary Blue */
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
  color: #78909C;
  /* Soft Grey Label */
  margin-bottom: 2px;
}

.value {
  font-size: 1.1rem;
  color: #263238;
  font-weight: 600;
}

.status-value {
  font-size: 1.1rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
}

.status-value.pending {
  background: #FFF3E0;
  color: #EF6C00;
  border: 1px solid #FFE0B2;
}

.status-value.confirmed {
  background: #E8F5E9;
  color: #2E7D32;
  border: 1px solid #C8E6C9;
}

.status-value.cancelled {
  background: #FFEBEE;
  color: #C62828;
  border: 1px solid #FFCDD2;
}


/* Divider Line */
.divider {
  height: 1px;
  background-color: #E0E0E0;
  margin-left: 55px;
  /* Offset to align with text */
}

/* Cancel Button */
.footer-action {
  padding-bottom: 20px;
}

.btn-cancel {
  width: 100%;
  background-color: #FFEBEE;
  /* Light Red/Pink bg */
  color: #C62828;
  /* Dark Red text */
  border: 1px solid #FFCDD2;
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
  background-color: #FFCDD2;
}

.btn-cancel:disabled {
  background-color: #FAFAFA;
  color: #999;
  cursor: wait;
}

.trash-icon {
  margin-right: 8px;
}

.center-msg {
  text-align: center;
  margin-top: 50px;
  color: #78909C;
}

.loading-msg {
  font-size: 1.2rem;
  color: #1565C0;
}

.error {
  color: #C62828;
}
</style>
