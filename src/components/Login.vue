<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/authService';

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref('');
const router = useRouter();

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Email and password are required';
    return;
  }
  isLoading.value = true;
  error.value = '';
  try {
    await authService.login(email.value, password.value);
    authService.setupAxios();
    router.push('/dashboard');
  } catch (err) {
    error.value = err?.message || 'Login failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const handleRegister = async () => {
  if (!email.value || !password.value) {
    error.value = 'Email and password are required';
    return;
  }
  isLoading.value = true;
  error.value = '';
  try {
    await authService.register({
      name: email.value.split('@')[0],
      email: email.value,
      password: password.value,
      password_confirmation: password.value
    });
    authService.setupAxios();
    router.push('/dashboard');
  } catch (err) {
    error.value = err?.message || 'Registration failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Animal BiteCare</h1>
      <h2>Admin Dashboard</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email:</label>
          <input v-model="email" type="email" id="email" placeholder="Enter your email" />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input v-model="password" type="password" id="password" placeholder="Enter your password" />
        </div>
        <div v-if="error" class="error-message">{{ error }}</div>
        <div class="button-group">
          <button type="submit" :disabled="isLoading" class="btn btn-login">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
          <button type="button" @click="handleRegister" :disabled="isLoading" class="btn btn-register">
            {{ isLoading ? 'Registering...' : 'Register' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  padding: 2em;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 0.5em;
  font-size: 1.5em;
}

h2 {
  color: #667eea;
  text-align: center;
  margin-bottom: 1.5em;
  font-size: 1.2em;
}

.form-group {
  margin-bottom: 1.5em;
}

label {
  display: block;
  margin-bottom: 0.5em;
  color: #333;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.8em;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 5px rgba(102, 126, 234, 0.3);
}

.error-message {
  color: #e74c3c;
  margin-bottom: 1em;
  padding: 0.8em;
  background: #fee;
  border-radius: 4px;
  text-align: center;
}

.button-group {
  display: flex;
  gap: 1em;
}

.btn {
  flex: 1;
  padding: 0.8em;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-login {
  background: #667eea;
  color: white;
}

.btn-login:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
}

.btn-register {
  background: #f0f0f0;
  color: #333;
  border: 2px solid #667eea;
}

.btn-register:hover:not(:disabled) {
  background: #e8e8ff;
  transform: translateY(-2px);
}
</style>
