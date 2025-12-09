<template>
  <div class="page-center">
    
    <form @submit.prevent="submit">
    <h1>Login</h1>
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
      />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success">{{ success }}</div>
      <router-link to="/register"><h4>Create your account.</h4></router-link>
    </form>
    
  </div>
</template>


<!-- <script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/auth.js'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')

const submit = async () => {
  error.value = ''
  success.value = ''
  try {
    const response = await login(email.value, password.value)

    // ============================================================
    // FIX: Use 'token' (matches your Laravel LoginController)
    // ============================================================
    const token = response.data.token;

    if (!token) {
       throw new Error("Login succeeded but no token received.");
    }

    localStorage.setItem('user_token', token);
    // ============================================================

    success.value = 'Login successful!'
    
    // Redirect to Dashboard
    router.push('/dashboard')

  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || 'Login failed'
  }
}
</script> -->

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/auth.js'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const success = ref('')

const submit = async () => {
  error.value = ''
  success.value = ''
  try {
    const response = await login(email.value, password.value)

    // 1. Get Token & User from response
    const token = response.data.token;
    const user = response.data.user; // <--- Get the user object

    if (!token) {
       throw new Error("Login succeeded but no token received.");
    }

    // 2. Save Token & Role
    localStorage.setItem('user_token', token);
    
    // Safety check: Ensure user object exists before accessing role
    if (user && user.role) {
      localStorage.setItem('user_role', user.role); 
    }

    success.value = 'Login successful!'
    
    // ============================================================
    // 3. DYNAMIC REDIRECT LOGIC
    // ============================================================
    // Check if the role is 'admin' (Make sure this matches your Database value!)
    if (user && user.role === 'admin') {
      console.log("Admin detected. Navigating to Admin Dashboard...");
      router.push('/admin'); // <--- Go to Admin Dashboard
    } else {
      console.log("User detected. Navigating to User Dashboard...");
      router.push('/dashboard'); // <--- Go to Regular Dashboard
    }
    // ============================================================

  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || 'Login failed'
  }
}
</script>

































































