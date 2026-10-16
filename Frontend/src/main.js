import { createApp } from 'vue'
import { createPinia } from 'pinia' // <-- Importar Pinia
import App from './App.vue'
import router from './router/routes'
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

const app = createApp(App)


app.use(createPinia()) // <-- Registrar Pinia en la aplicación
app.use(router)

app.mount('#app')
