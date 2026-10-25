<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePageMeta } from '@/composables/usePageMeta'
import AuthForm from '@/components/AuthForm.vue'

const props = defineProps<{ mode: 'login' | 'register' }>()
const route = useRoute()
const router = useRouter()
const title = computed(() => (props.mode === 'login' ? 'Sign in' : 'Create an account'))
usePageMeta(() => ({ title: title.value, noindex: true }))

// only local paths: ?next=//evil.com must not lead off the site
const next = computed(() => {
  const n = route.query.next
  return typeof n === 'string' && /^\/(?!\/)/.test(n) ? n : '/'
})
</script>

<template>
  <section class="panel mx-auto max-w-md" aria-labelledby="auth-title">
    <h1 id="auth-title" class="mb-6 text-2xl font-black tracking-tight">{{ title }}</h1>
    <AuthForm
      id="auth"
      :mode="mode"
      @mode="router.replace({ name: $event, query: route.query })"
      @done="router.replace(next)"
    />
  </section>
</template>
