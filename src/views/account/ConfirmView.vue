<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiError, confirmEmail, confirmEmailChange, errorMessage } from '@/api'
import { initSession, me } from '@/session'
import { usePageMeta } from '@/composables/usePageMeta'

// Landing for email links: /confirm-email?token=… (sign-up) and /confirm-email-change?token=…
// Client only: the token must not be spent by the server render (or the micro-cache).
const props = defineProps<{ change?: boolean }>()
const route = useRoute()
const router = useRouter()
usePageMeta(() => ({ title: 'Email confirmation', noindex: true }))

const message = ref('')
const failed = ref(false)

onMounted(async () => {
  const token = String(route.query.token ?? '')
  try {
    if (props.change) {
      const { email } = await confirmEmailChange(token)
      if (email && me.value) me.value.email = email
      message.value = email ? `Your email is now ${email}.` : 'Your new email is confirmed.'
    } else {
      await confirmEmail(token) // signs in
      await initSession()
      router.replace('/account')
    }
  } catch (e) {
    failed.value = true
    message.value =
      e instanceof ApiError && e.status === 400
        ? 'This link is invalid or has expired.'
        : errorMessage(e)
  }
})
</script>

<template>
  <section class="panel mx-auto max-w-md" aria-labelledby="confirm-title">
    <h1 id="confirm-title" class="mb-4 text-2xl font-black tracking-tight">Email confirmation</h1>
    <p v-if="message" class="alert" :class="failed ? 'alert-error' : 'alert-ok'" role="status">
      {{ message }}
    </p>
    <p v-else class="text-zinc-500" role="status">Checking the link…</p>
    <p v-if="failed && !change" class="mt-4 text-sm">
      <RouterLink to="/login" class="link">Sign in</RouterLink> to get a new confirmation email.
    </p>
  </section>
</template>
