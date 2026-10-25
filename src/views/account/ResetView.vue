<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { requestPasswordReset, resetPassword } from '@/api'
import { initSession } from '@/session'
import { usePageMeta } from '@/composables/usePageMeta'
import { useSubmit } from '@/composables/useSubmit'

// /forgot-password: ask for the email. /reset-password?token=… (the link from it): set a new password
const route = useRoute()
const router = useRouter()
usePageMeta(() => ({ title: 'Reset password', noindex: true }))

const token = typeof route.query.token === 'string' ? route.query.token : ''
const email = ref('')
const password = ref('')
const sent = ref(false)

const { busy, fields, error, submit } = useSubmit(async () => {
  if (!token) {
    await requestPasswordReset(email.value)
    sent.value = true
    return
  }
  await resetPassword(token, password.value) // signs in, other devices are signed out
  await initSession()
  router.replace('/account')
})
</script>

<template>
  <section class="panel mx-auto max-w-md" aria-labelledby="reset-title">
    <h1 id="reset-title" class="mb-6 text-2xl font-black tracking-tight">Reset password</h1>

    <p v-if="sent" class="alert alert-ok" role="status">
      If there is an account for <strong>{{ email }}</strong
      >, an email with a link is on its way.
    </p>

    <form v-else class="space-y-4" @submit.prevent="submit">
      <div v-if="!token">
        <label class="input-label" for="reset-email">Email</label>
        <input
          id="reset-email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="input"
        />
        <p v-if="fields.email" class="field-error">{{ fields.email }}</p>
        <p class="mt-1 text-sm text-zinc-500">We'll send you a link to set a new password.</p>
      </div>
      <div v-else>
        <label class="input-label" for="reset-password">New password</label>
        <input
          id="reset-password"
          v-model="password"
          type="password"
          required
          autocomplete="new-password"
          class="input"
        />
        <p v-if="fields.password" class="field-error">{{ fields.password }}</p>
      </div>
      <!-- a dead link: offer a fresh one -->
      <p v-if="fields.token" class="alert alert-error" role="alert">
        This link is invalid or has expired.
        <RouterLink to="/forgot-password" class="font-semibold underline">Get a new one</RouterLink>
      </p>
      <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
      <button class="btn btn-primary w-full" :disabled="busy">
        {{ token ? 'Save the new password' : 'Send the link' }}
      </button>
    </form>

    <p class="mt-4 text-center text-sm">
      <RouterLink to="/login" class="link">Back to sign in</RouterLink>
    </p>
  </section>
</template>
