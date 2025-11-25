import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // If you use vue-router, see note below
import './assets/main.css'

// Optionally import a global CSS file
// import './assets/main.css'

const app = createApp(App)

app.use(router) // Only if you set up vue-router

app.mount('#app')
