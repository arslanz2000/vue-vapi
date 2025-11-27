import './polyfills.js';
import { createApp } from 'vue';
import '@fortawesome/fontawesome-free/css/all.css';
import App from './App.vue';

import Vue3Toastify from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

const app = createApp(App);

app.use(Vue3Toastify, {
  position: "bottom-right",
  autoClose: 5000,
  pauseOnHover: true,
  closeOnClick: true
});

app.mount('#app');
