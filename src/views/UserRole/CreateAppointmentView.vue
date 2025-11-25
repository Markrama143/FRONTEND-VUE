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

// Master List of Time Slots (Matches your Flutter code)
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
    const slotDate = convertTimeToDateObject(slot);
    return slotDate > now;
  });
});


const convertTimeToDateObject = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') hours = '00';
  if (modifier === 'PM') hours = parseInt(hours, 10) + 12;

  const d = new Date();
  d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return d;
};


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
          <input 
            v-model="form.patientName" 
            type="text" 
            placeholder=" " 
            required 
          />
          <label>Patient Name</label>
        </div>
      </div>

      <div class="form-group">
        <div class="input-wrapper">
          <input 
            v-model="form.age" 
            type="number" 
            placeholder=" " 
            required 
          />
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
          <input 
            v-model="form.animalType" 
            type="text" 
            placeholder=" " 
            required 
          />
          <label>Animal Type (e.g. Dog, Cat)</label>
        </div>
      </div>

      <div class="form-group border-box">
        <span class="label-floating">Select Date for Appointment</span>
        <div class="date-input-row">
          <span class="icon">📅</span>
          <input 
            v-model="form.date" 
            type="date" 
            :min="new Date().toISOString().split('T')[0]"
            required 
          />
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
</template>

<style scoped>
/* --- Layout & Global --- */
.page-container {
  max-width: 600px; /* Restrict width on desktop */
  margin: 0 auto;
  min-height: 100vh;
  background-color: #fff;
  font-family: 'Segoe UI', Roboto, sans-serif;
}

/* --- App Bar --- */
.app-bar {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  background: white;
}

.app-bar h1 {
  font-size: 1.25rem;
  margin-left: 16px;
  font-weight: 500;
  color: #222;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #444;
  padding: 0;
}

/* --- Form Styling --- */
.form-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Floating Label Logic using CSS Grid/Positioning mimicry */
.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 16px 12px;
  border: 1px solid #757575;
  border-radius: 4px;
  font-size: 1rem;
  outline: none;
  background: transparent;
  box-sizing: border-box;
}

.input-wrapper input:focus {
  border-color: #009688;
  border-width: 2px;
  padding: 15px 11px; /* Adjust for border width change */
}

/* The Label */
.input-wrapper label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background-color: white;
  padding: 0 4px;
  color: #757575;
  transition: 0.2s;
  pointer-events: none;
}

/* Move label up when focused or has text */
.input-wrapper input:focus + label,
.input-wrapper input:not(:placeholder-shown) + label {
  top: 0;
  font-size: 0.75rem;
  color: #009688;
}

/* --- Dropdowns & Date Pickers (Border Box Style) --- */
.border-box {
  border: 1px solid #757575;
  border-radius: 4px;
  padding: 8px 12px;
  position: relative;
  margin-top: 4px;
}

.label-floating {
  position: absolute;
  top: -10px;
  left: 10px;
  background: white;
  padding: 0 5px;
  font-size: 0.75rem;
  color: #757575;
}

.date-input-row, .time-input-row {
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 10px;
  font-size: 1.2rem;
  opacity: 0.7;
}

select, input[type="date"] {
  width: 100%;
  border: none;
  outline: none;
  font-size: 1rem;
  background: transparent;
  color: #333;
  padding: 8px 0;
}

/* --- Button --- */

</style>