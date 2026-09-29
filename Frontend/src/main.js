import { createApp } from 'vue'
import { createPinia } from 'pinia' // <-- Importar Pinia
import App from './App.vue'
import router from './router/routes'
import './style.css'

const app = createApp(App)

app.use(createPinia()) // <-- Registrar Pinia en la aplicación
app.use(router)

app.mount('#app')
