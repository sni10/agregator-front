import { createRouter as createVueRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import FeedView from '@/views/FeedView.vue'

export function createRouter() {
  return createVueRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory()
      : createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
    routes: [
      { path: '/', name: 'home', component: FeedView },
      {
        path: '/:category(it|ai|crypto)',
        name: 'category',
        component: FeedView,
        props: true,
      },
      {
        path: '/news/:slug',
        name: 'story',
        component: () => import('@/views/StoryView.vue'),
        props: true,
      },
      { path: '/search', name: 'search', component: () => import('@/views/SearchView.vue') },
      { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue') },
      {
        path: '/:path(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
      },
    ],
  })
}
