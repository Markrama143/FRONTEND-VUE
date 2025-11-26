<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiServices from '@/services/apiService';

const router = useRouter();
const isLoading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

// --- State Management ---
const form = ref({
  patientName: '',
  age: '',
  sex: 'Male',
  animalType: '',
  date: '', // YYYY-MM-DD
  time: ''
});

// Master List of Time Slots
const allTimeSlots = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM',
  '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM',
];


const availableSlots = computed(() => {
  if (!form.value.date) return [];

  const selectedDate = new Date(form.value.date);
  const now = new Date();

  const isToday = selectedDate.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);

  if (!isToday) {
    return allTimeSlots;
  }


  return allTimeSlots.filter(slot => {
    const [time, modifier] = slot.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

    const slotDateTime = new Date();
    slotDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    return slotDateTime > now;
  });
});




const goBack = () => {
  router.push('/dashboard');
};


const submitBooking = async () => {
  successMessage.value = '';
  errorMessage.value = '';


  if (!form.value.patientName || !form.value.age || !form.value.animalType || !form.value.date || !form.value.time) {
    errorMessage.value = "Please fill in all fields";
    return;
  }


  if (form.value.age < 1 || form.value.age > 150) {
    errorMessage.value = "Please enter a valid age";
    return;
  }

  isLoading.value = true;

  // 2. Prepare Data
  const bookingData = {
    name: form.value.patientName,
    age: parseInt(form.value.age),
    sex: form.value.sex,
    animal_type: form.value.animalType,
    date: form.value.date,
    time: form.value.time
  };

  try {
    // 3. Call API
    const response = await apiServices.createAppointment(bookingData);

    // 4. Success Feedback
    successMessage.value = "Appointment Booked Successfully!";
    console.log('Booking response:', response);

    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);

  } catch (error) {
    console.error('Booking error:', error);
    errorMessage.value = error.response?.data?.message || error.message || "Booking failed. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="page-container">
    <header class="app-bar">
      <button @click="goBack" class="back-btn">
        <span class="material-icon">←</span>
      </button>
      <h1>Book Appointment</h1>
    </header>

    <div class="content-wrapper">

      <!-- Messages -->
      <div v-if="successMessage" class="message success-message">
        ✓ {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="message error-message">
        ✕ {{ errorMessage }}
      </div>

      <form @submit.prevent="submitBooking" class="form-content">

        <div class="form-group">
          <div class="input-wrapper">
            <input v-model="form.patientName" type="text" placeholder=" " required />
            <label>Patient Name</label>
          </div>
        </div>

        <div class="form-group">
          <div class="input-wrapper">
            <input v-model="form.age" type="number" placeholder=" " required />
            <label>Age</label>
          </div>
        </div>

        <div class="form-group border-box">
          <span class="label-floating">Sex</span>
          <select v-model="form.sex">
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div class="form-group">
          <div class="input-wrapper">
            <input v-model="form.animalType" type="text" placeholder=" " required />
            <label>Animal Type (e.g. Dog, Cat)</label>
          </div>
        </div>

        <div class="form-group border-box">
          <span class="label-floating">Select Date for Appointment</span>
          <div class="date-input-row">
            <span class="icon">📅</span>
            <input v-model="form.date" type="date" :min="new Date().toISOString().split('T')[0]" required />
          </div>
        </div>

        <div class="form-group border-box">
          <span class="label-floating">Select Time</span>
          <div class="time-input-row">
            <span class="icon">🕒</span>
            <select v-model="form.time" :disabled="!form.date">
              <option value="" disabled selected>
                {{ form.date ? 'Select Time Slot' : 'Select Date first' }}
              </option>
              <option v-for="slot in availableSlots" :key="slot" :value="slot">
                {{ slot }}
              </option>
            </select>
          </div>
        </div>

        <div class="action-area">
          <button type="submit" class="btn-confirm" :disabled="isLoading">
            {{ isLoading ? 'Processing...' : 'Confirm Booking' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
/* =========================================
   WEBSITE LAYOUT & DASHBOARD STYLE (Blue/White)
   ========================================= */

/* FIX: Page container takes full width and height */
.page-container {
  max-width: 100%;
  /* FIX: Remove max-width restriction */
  margin: 0;
  /* FIX: Remove auto margins */
  min-height: 100vh;
  background-color: #F5F7FA;
  /* Match dashboard background */
  font-family: 'Segoe UI', Roboto, sans-serif;
}

/* FIX: Content area padding for wider layout */
.content-wrapper {
  padding: 30px;
  max-width: 900px;
  /* NEW: Max width for the form container */
  margin: 0 auto;
  /* NEW: Center the content block on a large screen */
}

/* --- App Bar (Fixed Header Look) --- */
.app-bar {
  display: flex;
  align-items: center;
  padding: 15px 30px;
  /* Increased padding */
  border-bottom: 1px solid #CFD8DC;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-radius: 0;
  /* FIX: Remove border radius for full width header */
}

.app-bar h1 {
  font-size: 1.4rem;
  /* Slightly larger header */
  margin-left: 15px;
  font-weight: 600;
  color: #1565C0;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #1565C0;
  padding: 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #0D47A1;
}

/* --- Messages (Consistent Feedback) --- */
.message {
  padding: 15px 20px;
  margin: 10px 0;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
}

.success-message {
  background-color: #E8F5E9;
  color: #2E7D32;
  border: 1px solid #C8E6C9;
}

.error-message {
  background-color: #FFEBEE;
  color: #C62828;
  border: 1px solid #FFCDD2;
}

/* --- Form Styling --- */
.form-content {
  padding: 30px;
  /* Increased padding */
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: white;
  border-radius: 12px;
  /* Rounded corners for the whole form block */
  border: 1px solid #CFD8DC;
  border-top: 1px solid #CFD8DC;
  /* Ensure border is present */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  /* Card lift */
}

/* Floating Label Logic */
.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 16px 12px;
  border: 1px solid #CFD8DC;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  background: transparent;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.input-wrapper input:focus {
  border-color: #1565C0;
  border-width: 2px;
  padding: 15px 11px;
}

/* The Label */
.input-wrapper label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  padding: 0 4px;
  color: #78909C;
  transition: 0.2s;
  pointer-events: none;
}

/* Move label up when focused or has text */
.input-wrapper input:focus+label,
.input-wrapper input:not(:placeholder-shown)+label {
  top: 0;
  font-size: 0.75rem;
  color: #1565C0;
}

/* --- Dropdowns & Date Pickers (Border Box Style) --- */
.border-box {
  border: 1px solid #CFD8DC;
  border-radius: 8px;
  padding: 12px;
  position: relative;
  margin-top: 0;
  transition: border-color 0.2s;
}

.border-box:focus-within {
  border-color: #1565C0;
  border-width: 2px;
  padding: 11px;
}

.label-floating {
  position: absolute;
  top: -10px;
  left: 10px;
  background: white;
  padding: 0 5px;
  font-size: 0.75rem;
  color: #78909C;
}

.icon {
  margin-right: 10px;
  font-size: 1.2rem;
  opacity: 0.8;
  color: #1565C0;
}

select,
input[type="date"],
input[type="time"] {
  width: 100%;
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
  color: #333;
  padding: 4px 0;
}

/* --- Button --- */
.action-area {
  padding-top: 10px;
}

.btn-confirm {
  width: 100%;
  background-color: #1565C0;
  color: white;
  padding: 15px;
  border: none;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.2s;
  box-shadow: 0 4px 10px rgba(21, 101, 192, 0.3);
}

.btn-confirm:hover {
  background-color: #0D47A1;
}

.btn-confirm:disabled {
  background-color: #BBDEFB;
  cursor: not-allowed;
  box-shadow: none;
}
</style>