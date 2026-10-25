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
        path: '/privacy',
        name: 'privacy',
        component: () => import('@/views/legal/PrivacyView.vue'),
      },
      {
        path: '/cookies',
        name: 'cookies',
        component: () => import('@/views/legal/CookiesView.vue'),
      },
      { path: '/terms', name: 'terms', component: () => import('@/views/legal/TermsView.vue') },
      {
        path: '/disclaimer',
        name: 'disclaimer',
        component: () => import('@/views/legal/DisclaimerView.vue'),
      },
      {
        path: '/:path(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
      },
    ],
  })
}
