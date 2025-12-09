<template>
  <div class="page-center">
    <form @submit.prevent="submit">
      <h1>Register</h1>
      <input v-model="name" type="text" placeholder="Name" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <input v-model="password_confirmation" type="password" placeholder="Confirm Password" required />
      <button type="submit">Register</button>
      <h4>Already have an account?<router-link to="/"> Login here.</router-link></h4>
      <div v-if="error">{{ error }}</div>
      <div v-if="success">{{ success }}</div>
    </form>
    
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'  // Import useRouter
import { register } from '../services/auth.js'

const router = useRouter()  // Get router instance

const name = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')
const error = ref('')
const success = ref('')

const submit = async () => {
  error.value = ''
  success.value = ''
  try {
    const response = await register(
      name.value,
      email.value,
      password.value,
      password_confirmation.value
    )
    success.value = response.data.message
    // Optionally, save token: localStorage.setItem('token', response.data.access_token)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed'
  }
}

</script>

































































