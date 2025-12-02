import {createApp} from 'vue'
import App from './App.vue'
import './global/global.scss'
import './utils/rem.ts';
import routers from './routers/index.js';
import stores from './stores/index.ts'
import 'vant/lib/index.css';
import { Popup } from 'vant';

const app = createApp(App);

app.use(routers);
app.use(stores);
app.use(Popup);

app.mount('#app')
