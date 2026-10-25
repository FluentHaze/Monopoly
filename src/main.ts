import { createApp } from 'vue';
import App from './App.vue';
import './global/global.scss';
import routers from './routers/index.js';
import stores from './stores/index.ts';

const app = createApp(App);

app.use(routers);
app.use(stores);

app.mount('#app');
