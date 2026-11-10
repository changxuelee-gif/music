import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 80 }
    return { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { title: '首页' } },
    { path: '/category', name: 'categories', component: () => import('@/views/CategoryView.vue'), meta: { title: '全部分类' } },
    { path: '/category/:slug', name: 'category', component: () => import('@/views/CategoryView.vue') },
    { path: '/playlist/:slug', name: 'playlist', component: () => import('@/views/PlaylistView.vue') },
    { path: '/artists', name: 'artists', component: () => import('@/views/ArtistsView.vue'), meta: { title: '音乐人' } },
    { path: '/artist/:slug', name: 'artist', component: () => import('@/views/ArtistView.vue') },
    { path: '/search', name: 'search', component: () => import('@/views/SearchView.vue'), meta: { title: '搜索' } },
    { path: '/complaint', name: 'complaint', component: () => import('@/views/ComplaintView.vue'), meta: { title: '版权投诉' } },
    { path: '/favorites', name: 'favorites', component: () => import('@/views/FavoritesView.vue'), meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { title: '登录' } },
    { path: '/privacy', name: 'privacy', component: () => import('@/views/LegalView.vue'), meta: { title: '隐私政策', legal: 'privacy' } },
    { path: '/disclaimer', name: 'disclaimer', component: () => import('@/views/LegalView.vue'), meta: { title: '免责声明', legal: 'disclaimer' } },

    // 管理后台（独立布局）
    { path: '/admin/login', name: 'admin-login', component: () => import('@/admin/AdminLogin.vue'), meta: { layout: 'admin' } },
    {
      path: '/admin',
      component: () => import('@/admin/AdminLayout.vue'),
      meta: { layout: 'admin' },
      children: [
        { path: '', name: 'admin-dashboard', component: () => import('@/admin/views/AdminDashboard.vue') },
        { path: 'playlists', name: 'admin-playlists', component: () => import('@/admin/views/AdminPlaylists.vue') },
        { path: 'playlists/new', name: 'admin-playlist-new', component: () => import('@/admin/views/AdminPlaylistEdit.vue') },
        { path: 'playlists/:id/edit', name: 'admin-playlist-edit', component: () => import('@/admin/views/AdminPlaylistEdit.vue') },
        { path: 'taxonomy', name: 'admin-taxonomy', component: () => import('@/admin/views/AdminTaxonomy.vue') },
        { path: 'artists', name: 'admin-artists', component: () => import('@/admin/views/AdminArtists.vue') },
        { path: 'banners', name: 'admin-banners', component: () => import('@/admin/views/AdminBanners.vue') },
        { path: 'complaints', name: 'admin-complaints', component: () => import('@/admin/views/AdminComplaints.vue') },
        { path: 'site', name: 'admin-site', component: () => import('@/admin/views/AdminSiteConfig.vue') },
        { path: 'users', name: 'admin-users', component: () => import('@/admin/views/AdminUsers.vue') }
      ]
    },

    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFound.vue') }
  ]
})

router.beforeEach((to) => {
  const adminToken = localStorage.getItem('fh_admin_token')
  if (to.path.startsWith('/admin')) {
    if (to.name !== 'admin-login' && !adminToken) {
      return { name: 'admin-login', query: { redirect: to.fullPath } }
    }
    if (to.name === 'admin-login' && adminToken) return { name: 'admin-dashboard' }
    return true
  }
  if (to.meta.requiresAuth && !localStorage.getItem('fh_token')) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
