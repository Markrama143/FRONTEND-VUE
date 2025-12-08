<template>
  <button @click="logoutUser">Logout</button>
  <div v-if="error">{{ error }}</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'       // Add this import!
import { logout } from '../services/auth.js'

const router = useRouter()                  // Get the router instance

const error = ref('')

const logoutUser = async () => {
  error.value = ''
  try {
    const token = localStorage.getItem('user_token')
    await logout(token)
    localStorage.removeItem('user_token')
    error.value = 'Logged out'
    router.push('/')        // Redirect to home or your login page after logout
  } catch (err) {
    error.value = err?.response?.data?.message || 'Logout failed'
  }
}
</script>







































