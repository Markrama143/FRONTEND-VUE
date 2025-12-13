<script setup>
import { ref, onMounted } from 'vue';
import moment from 'moment';
import apiService from '@/services/apiService';
// 👇 CORRECT: Import useRouter to define the 'router' variable
import { useRouter } from 'vue-router';

// 👇 CORRECT: Define the 'router' variable
const router = useRouter();


const holidays = ref([]);
const isLoading = ref(false);
const showModal = ref(false);
const isSaving = ref(false);

// State for NEW Holiday (Create mode)
const newHoliday = ref({
  date: moment().format('YYYY-MM-DD'),
  name: '',
});

// State for EDIT Holiday (Update mode)
const isEditing = ref(false);
const editingHoliday = ref(null);

// --- Utility Functions ---

const getDayOfWeek = (dateString) => {
  return moment(dateString).format('dddd');
};

const resetNewHoliday = () => {
  newHoliday.value = {
    date: moment().format('YYYY-MM-DD'),
    name: '',
  };
  isEditing.value = false;
  editingHoliday.value = null;
};

// --- API & Logic Functions ---

const fetchHolidays = async () => {
  isLoading.value = true;
  holidays.value = [];
  try {
    // READ: apiClient.get("/holidays")
    const response = await apiService.getHolidays();

    // Assuming API response data structure: { data: [{id, date, name}, ...] }
    holidays.value = Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);

  } catch (error) {
    console.error("Failed to fetch holidays from API:", error);
    holidays.value = []; // Clear data on real error
  } finally {
    isLoading.value = false;
  }
};

const openEditModal = (holiday) => {
  // Set state to editing mode
  isEditing.value = true;
  editingHoliday.value = { ...holiday }; // Deep copy the data
  // Populate the newHoliday model with current data for the form
  newHoliday.value = { ...holiday };
  showModal.value = true;
};

const saveHoliday = async () => {
  // Use data from newHoliday.value for submission
  const dataToSave = newHoliday.value;

  if (!dataToSave.date || !dataToSave.name) return;

  isSaving.value = true;
  try {
    if (isEditing.value) {
      // UPDATE: Using apiClient.put("/holidays/{id}", data)
      await apiService.updateHoliday(editingHoliday.value.id, {
        date: dataToSave.date,
        name: dataToSave.name
      });
      alert(`Holiday "${dataToSave.name}" updated successfully!`);
    } else {
      // CREATE: Using apiClient.post("/holidays", data)
      await apiService.createHoliday({
        date: dataToSave.date,
        name: dataToSave.name
      });
      alert(`Holiday "${dataToSave.name}" on ${dataToSave.date} saved successfully!`);
    }

    showModal.value = false;
    resetNewHoliday();
    await fetchHolidays(); // Refresh the list

  } catch (error) {
    console.error(`Failed to ${isEditing.value ? 'update' : 'save'} holiday:`, error);
    const errorMessage = error.response?.data?.message || `Failed to ${isEditing.value ? 'update' : 'save'} the holiday. Check API/network.`;
    alert(errorMessage);
  } finally {
    isSaving.value = false;
  }
};

const confirmDelete = async (holiday) => {
  if (confirm(`Are you sure you want to delete the holiday "${holiday.name}" on ${holiday.date}?`)) {
    try {
      // DELETE: Using apiClient.delete(`/holidays/${holiday.id}`)
      await apiService.deleteHoliday(holiday.id);

      alert(`Holiday "${holiday.name}" deleted successfully.`);
      await fetchHolidays(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete holiday:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete the holiday. Check API/network.";
      alert(errorMessage);
    }
  }
};

const goBack = () => {
  router.push('/admin');
};

const openAddModal = () => {
  resetNewHoliday(); // Ensure we are in Create mode
  showModal.value = true;
};


onMounted(() => {
  fetchHolidays();
});
</script>

<template>
      <div class="holidays-view-container">
           
            <div class="app-bar">
      <button @click="goBack" class="back-btn">
                        <span class="material-icon">←</span>
                    </button>
                  <h2>Calendar & Holiday Management 🗓️</h2>
                  
          
             
    </div>

            <div class="controls-bar">
                  <button class="btn-primary" @click="openAddModal">
                        <span class="icon">➕</span> Add New Holiday
                      </button>
                  <button class="btn-refresh" @click="fetchHolidays">
                        <span class="icon">🔄</span> Refresh List
                      </button>
              </div>

            <div class="table-card">
                  <div v-if="isLoading" class="loading-state">Loading Holidays...</div>

                  <div v-else-if="holidays.length === 0" class="empty-state">
                        <p>No holidays have been set yet. Click "Add New Holiday" to get started.</p>
                    </div>

                  <div v-else class="table-responsive">
                        <table class="data-table">
                              <thead>
                                    <tr>
                                          <th>Date</th>
                                          <th>Name/Description</th>
                                          <th>Actions</th>
                                        </tr>
                                  </thead>
                              <tbody>
                                    <tr v-for="holiday in holidays" :key="holiday.id">
                                          <td>
                                                <span class="fw-bold">{{ holiday.date }}</span>
                                                <span class="day-of-week">({{ getDayOfWeek(holiday.date) }})</span>
                                              </td>
                                          <td>{{ holiday.name }}</td>
                                          <td class="actions-cell">
                                                <button @click="openEditModal(holiday)" class="btn-edit">
                                                      <span class="icon">✏️</span> Edit
                                                  </button>
                                                <button @click="confirmDelete(holiday)" class="btn-delete">
                                                      <span class="icon">🗑️</span> Delete
                                                  </button>
                                            </td>
                                      </tr>
                                  </tbody>
                          </table>
                      </div>
              </div>

            <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
                  <div class="modal-content">
                        <h3>{{ isEditing ? 'Edit Clinic Holiday' : 'Add New Clinic Holiday' }}</h3>
                        <form @submit.prevent="saveHoliday">
                              <div class="form-group">
                                    <label for="holidayDate">Date:</label>
                                    <input type="date" id="holidayDate" v-model="newHoliday.date" required>
                                </div>
                              <div class="form-group">
                                    <label for="holidayName">Name/Description:</label>
                                    <input type="text" id="holidayName" v-model="newHoliday.name"                      
                    placeholder="e.g., Christmas Day" required>
                                </div>
                              <div class="modal-actions">
                                    <button type="button" @click="showModal = false; resetNewHoliday()"
              class="btn-secondary"                             :disabled="isSaving">Cancel</button>
                                    <button type="submit" class="btn-primary" :disabled="isSaving">
                                          {{ isSaving ? 'Saving...' : (isEditing ? 'Update Holiday' : 'Save Holiday') }}
                                      </button>
                                </div>
                          </form>
                    </div>
              </div>

        </div>
</template>

<style scoped>
/* =======================================================
    REUSED STYLES (from AdminDashboardView for consistency)
    ======================================================= */
/* ... (styles remain the same) ... */
.table-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #CFD8DC;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 15px;
  background: #1565C0;
  color: white;
  border-bottom: 1px solid #0D47A1;
  white-space: nowrap;
}

.data-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #EEEEEE;
  vertical-align: middle;
}

.fw-bold {
  font-weight: 600;
  color: #333;
  margin-right: 5px;
}

.icon {
  margin-right: 5px;
}

/* =======================================================
    NEW HOLIDAYS VIEW STYLES
    ======================================================= */
.holidays-view-container {
  padding: 0 30px 30px 30px;
  /* Adjust padding to match surrounding layout */
}

.header-section {
  margin-bottom: 20px;
}

.header-section h2 {
  font-size: 1.5rem;
  color: #1565C0;
}

.controls-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-primary {
  background-color: #4CAF50;
  /* Green */
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  display: flex;
  align-items: center;
}

.btn-primary:hover:not(:disabled) {
  background-color: #388E3C;
}

.btn-primary:disabled {
  background-color: #A5D6A7;
  cursor: not-allowed;
}

.btn-refresh {
  background-color: #E3F2FD;
  color: #1565C0;
  border: 1px solid #BBDEFB;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  display: flex;
  align-items: center;
}

.btn-refresh:hover {
  background-color: #BBDEFB;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #78909C;
}

.day-of-week {
  font-size: 0.85rem;
  color: #78909C;
}

/* Actions Cell Styling */
.actions-cell {
  display: flex;
  gap: 8px;
  /* Space between buttons */
}

/* Edit Button */
.btn-edit {
  background: #FFF3E0;
  color: #FF9800;
  border: 1px solid #FFCC80;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
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

.btn-edit:hover {
  background: #FFCC80;
}

/* Delete Button */
.btn-delete {
  background: #FFEBEE;
  color: #C62828;
  border: 1px solid #FFCDD2;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-delete:hover {
  background: #FFCDD2;
}

/* --- Modal Styles --- */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin-top: 0;
  color: #1565C0;
  border-bottom: 1px solid #E0E0E0;
  padding-bottom: 15px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 5px;
  color: #546E7A;
}

.form-group input[type="date"],
.form-group input[type="text"],
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #CFD8DC;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 1rem;
}

.modal-actions {
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-secondary {
  background-color: #EEEEEE;
  color: #424242;
  border: 1px solid #CFD8DC;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background-color: #E0E0E0;
}

.app-bar {
    display: flex;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #CFD8DC;
    background: transparent;
    margin-bottom: 25px;
}
</style>


