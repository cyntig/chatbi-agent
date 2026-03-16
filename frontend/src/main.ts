// Application entry point

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/main.css'

// Naive UI
import naive from 'naive-ui'

// Create Vue app
const app = createApp(App)

// Install plugins
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(naive)

// Mount app
app.mount('#app')
