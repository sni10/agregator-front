import { createRouter as createVueRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import FeedView from '@/views/FeedView.vue'
import HomeView from '@/views/HomeView.vue'

export function createRouter() {
  return createVueRouter({
    history: import.meta.env.SSR
      ? createMemoryHistory()
      : createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
    routes: [
      // the front page is a selection; old feed pages (/?page=2) moved to /latest
      {
        path: '/',
        name: 'home',
        component: HomeView,
        beforeEnter: (to) => (to.query.page ? { path: '/latest', query: to.query } : true),
      },
      { path: '/latest', name: 'latest', component: FeedView },
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
      {
        path: '/tag/:slug',
        name: 'tag',
        component: () => import('@/views/TagView.vue'),
        props: true,
      },
      { path: '/search', name: 'search', component: () => import('@/views/SearchView.vue') },
      { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue') },
      { path: '/contact', name: 'contact', component: () => import('@/views/ContactView.vue') },
      // accounts: all noindex, filled in the browser only (meta.private: nothing loaded on the server)
      ...(['login', 'register'] as const).map((mode) => ({
        path: `/${mode}`,
        name: mode,
        component: () => import('@/views/account/AuthView.vue'),
        props: { mode },
        meta: { private: true },
      })),
      {
        path: '/forgot-password',
        name: 'forgot-password',
        component: () => import('@/views/account/ResetView.vue'),
        meta: { private: true },
      },
      {
        path: '/reset-password',
        name: 'reset-password',
        component: () => import('@/views/account/ResetView.vue'),
        meta: { private: true },
      },
      {
        path: '/confirm-email',
        name: 'confirm-email',
        component: () => import('@/views/account/ConfirmView.vue'),
        meta: { private: true },
      },
      {
        path: '/confirm-email-change',
        name: 'confirm-email-change',
        component: () => import('@/views/account/ConfirmView.vue'),
        props: { change: true },
        meta: { private: true },
      },
      {
        path: '/account',
        name: 'account',
        component: () => import('@/views/account/AccountView.vue'),
        meta: { private: true },
      },
      {
        path: '/favorites',
        name: 'favorites',
        component: () => import('@/views/account/FavoritesView.vue'),
        meta: { private: true },
      },
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
