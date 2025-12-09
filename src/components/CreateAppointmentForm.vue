<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiServices from '@/services/apiService';

const router = useRouter();


// Reactive state for the form
const form = ref({
  doctors_id: '',
  patient_id: '',
  date: '',
  time: ''
});

// Reactive state for dropdowns
const doctors = ref([]);
const patients = ref([]);

// State for messages
const isLoading = ref(false);
const successMessage = ref('');
const errors = ref({}); // To store validation errors

// --- Functions ---

// Fetch doctors for the dropdown
async function fetchDoctors() {
  try {
    const response = await apiServices.getAllDoctors();
    doctors.value = response.data;
  } catch (err) {
    console.error('Failed to fetch doctors:', err);
  }
}

// Fetch patients for the dropdown
async function fetchPatients() {
  try {
    const response = await apiServices.getAllPatients();
    patients.value = response.data;
  } catch (err) {
    console.error('Failed to fetch patients:', err);
  }
}

// Handle form submission
async function handleSubmit() {
  isLoading.value = true;
  successMessage.value = '';
  errors.value = {}; // Clear old errors

  try {
    // Send the form data to the Laravel API
    await apiServices.createAppointment(form.value);
    
    // Show success
    successMessage.value = 'Appointment created successfully!';

    // Reset the form
    form.value = { doctors_id: '', patient_id: '', date: '', time: '' };

    // After 2 seconds, redirect to the main list
    setTimeout(() => {
      router.push('/');
    }, 2000);

  } catch (err) {
    if (err.response && err.response.status === 422) {
      // Handle Laravel validation errors
      errors.value = err.response.data.errors;
    } else {
      // Handle other errors
      console.error('Form submission error:', err);
      errors.value.general = ['An unexpected error occurred. Please try again.'];
    }
  } finally {
    isLoading.value = false;
  }
}

// Fetch data when the component is first mounted
onMounted(() => {
  fetchDoctors();
  fetchPatients();
});
</script>

<template>
  <div class="page-background">
    <div class="form-container">
      
      <div class="form-header">
        
        <h2>Appointment Booking Form</h2>
        <p>Please fill out the details below to schedule your appointment.</p>
      </div>

      <form @submit.prevent="handleSubmit">
        
        <fieldset>
          <legend>Patient Details</legend>
          <div class="form-group">
            <label for="patient">Patient Name</label>
            <select id="patient" v-model="form.patient_id" required>
              <option value="" disabled>Select a patient</option>
              <option v-for="pat in patients" :key="pat.patient_id" :value="pat.patient_id">
                {{ pat.name }}
              </option>
            </select>
            <div v-if="errors.patient_id" class="error-msg">{{ errors.patient_id[0] }}</div>
          </div>
        </fieldset>
        
        <fieldset>
          <legend>Appointment Details</legend>
          <div class="form-group">
            <label for="doctor">Preferred Doctor</label>
            <select id="doctor" v-model="form.doctors_id" required>
              <option value="" disabled>Select a doctor</option>
              <option v-for="doc in doctors" :key="doc.doctors_id" :value="doc.doctors_id">
                {{ doc.name }}
              </option>
            </select>
            <div v-if="errors.doctors_id" class="error-msg">{{ errors.doctors_id[0] }}</div>
          </div>

          <div class="form-row">
            <div class="form-group half-width">
              <label for="date">Date</label>
              <input id="date" type="date" v-model="form.date" required>
              <div v-if="errors.date" class="error-msg">{{ errors.date[0] }}</div>
            </div>

            <div class="form-group half-width">
              <label for="time">Time</label>
              <input id="time" type="time" v-model="form.time" required>
              <div v-if="errors.time" class="error-msg">{{ errors.time[0] }}</div>
            </div>
          </div>
        </fieldset>

        <div class="submission-area">
          <button type="submit" :disabled="isLoading">
            {{ isLoading ? 'Submitting...' : 'Book Appointment' }}
          </button>

          <div v-if="successMessage" class="success-msg">
            {{ successMessage }}
          </div>

          <div v-if="errors.general" class="error-msg">
            {{ errors.general[0] }}
          </div>
        </div>
        
      </form>
    </div>
  </div>
</template>

<style scoped>
/* New: Added a background for the whole page */
.page-background {
  background-color: #f4f7f6;
  padding: 2rem 1rem;
  min-height: 100vh; /* Ensures it covers the screen */
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 2.5rem; /* Added more horizontal padding */
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* New: Styling for the form header */
.form-header {
  text-align: center;
  margin-bottom: 2rem;
}
.form-header h2 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}
.form-header p {
  font-size: 1rem;
  color: #555;
  margin: 0;
}

/* New: Styling for fieldset and legend */
fieldset {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

legend {
  font-size: 1.2rem;
  font-weight: 600;
  color: #42b983; /* Use the theme color */
  padding: 0 0.5rem; /* Spacing around the text */
  margin-left: 0.5rem; /* Align with content */
}

/* New: Utility for side-by-side fields */
.form-row {
  display: flex;
  gap: 1.5rem;
}
.half-width {
  flex: 1; /* Each takes up half the space */
  min-width: 0; /* Prevents overflow */
}

.form-group {
  margin-bottom: 1.5rem;
}
/* Remove bottom margin for the last group in a row */
.form-row .form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* Important for padding to work nicely */
}

.submission-area {
  margin-top: 1.5rem; /* Space above the button */
}

button {
  width: 100%;
  padding: 0.85rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  background-color: #42b983;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #36a46f;
}

button:disabled {
  background-color: #a5d6b8;
  cursor: not-allowed;
}

.error-msg {
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.success-msg {
  color: #27ae60;
  font-size: 1rem;
  text-align: center;
  margin-top: 1.5rem;
  font-weight: 600;
}
</style>































































