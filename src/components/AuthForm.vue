<script setup lang="ts">
import { ref, watch } from 'vue'
import { ApiError, login, register, resendConfirmation } from '@/api'
import { initSession } from '@/session'
import { useSubmit } from '@/composables/useSubmit'

// Sign in / sign up: the /login and /register pages and the window a guest gets from a heart.
const props = defineProps<{ mode: 'login' | 'register'; id: string }>()
// done: signed in; leave: the reader followed a link away (the window closes)
const emit = defineEmits<{ done: []; leave: []; mode: ['login' | 'register'] }>()

const email = ref('')
const password = ref('')
const accepted = ref(false)
const sent = ref(false) // the confirmation email is on its way
const unconfirmed = ref(false)

const { busy, fields, error, submit } = useSubmit(async () => {
  unconfirmed.value = false
  if (props.mode === 'register') {
    await register(email.value, password.value)
    sent.value = true
    return
  }
  try {
    await login(email.value, password.value)
  } catch (e) {
    if (e instanceof ApiError && e.status === 403 && e.data.code === 'email_not_confirmed') {
      unconfirmed.value = true
      return
    }
    throw e
  }
  await initSession()
  emit('done')
})
watch(
  () => props.mode,
  () => (unconfirmed.value = sent.value = false),
)

async function resend() {
  await resendConfirmation(email.value).catch(() => {}) // always 204
  unconfirmed.value = false
  sent.value = true
}
</script>

<template>
  <div v-if="sent" class="space-y-4">
    <p class="alert alert-ok" role="status">
      We sent an email to <strong>{{ email }}</strong
      >. Follow the link in it to confirm your address.
    </p>
    <button type="button" class="btn" @click="resend">Send the email again</button>
  </div>

  <form v-else class="space-y-4" @submit.prevent="submit">
    <div>
      <label class="input-label" :for="`${id}-email`">Email</label>
      <input
        :id="`${id}-email`"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        class="input"
      />
      <p v-if="fields.email" class="field-error">{{ fields.email }}</p>
    </div>
    <div>
      <label class="input-label" :for="`${id}-password`">Password</label>
      <input
        :id="`${id}-password`"
        v-model="password"
        type="password"
        required
        :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
        class="input"
      />
      <p v-if="fields.password" class="field-error">{{ fields.password }}</p>
      <RouterLink
        v-if="mode === 'login'"
        to="/forgot-password"
        class="mt-1 inline-block text-sm text-zinc-500 hover:underline"
        @click="emit('leave')"
        >Forgot your password?</RouterLink
      >
    </div>

    <!-- required: the browser won't send the form without it; the backend checks termsAccepted too -->
    <div v-if="mode === 'register'" class="space-y-2 text-sm">
      <label class="flex items-start gap-2">
        <input v-model="accepted" type="checkbox" required class="mt-1" />
        <span>
          I accept the
          <!-- new tab: the filled-in form stays put -->
          <RouterLink to="/terms" target="_blank" class="link">Terms of Use</RouterLink>
        </span>
      </label>
      <p v-if="fields.termsAccepted" class="field-error">{{ fields.termsAccepted }}</p>
      <!-- GDPR Art. 13: say how the data is used where it is collected -->
      <p class="text-zinc-500">
        We use your email only for your account and service emails. See the
        <RouterLink to="/privacy" target="_blank" class="link">Privacy Policy</RouterLink>.
      </p>
    </div>

    <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
    <div v-if="unconfirmed" class="alert alert-error" role="alert">
      Your email is not confirmed yet.
      <button type="button" class="font-semibold underline" @click="resend">
        Send the email again
      </button>
    </div>

    <button class="btn btn-primary w-full" :disabled="busy">
      {{ mode === 'login' ? 'Sign in' : 'Create account' }}
    </button>
    <p class="text-center text-sm text-zinc-500">
      <template v-if="mode === 'login'">
        No account?
        <button type="button" class="link" @click="emit('mode', 'register')">Sign up</button>
      </template>
      <template v-else>
        Already have an account?
        <button type="button" class="link" @click="emit('mode', 'login')">Sign in</button>
      </template>
    </p>
  </form>
</template>
