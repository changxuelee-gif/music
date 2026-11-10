import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { trackVisit } from './utils/track'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 页面级访问埋点（仅非后台路由）
router.afterEach((to) => {
  trackVisit(to.fullPath)
})

app.mount('#app')
