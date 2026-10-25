<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { changeEmail, changePassword, deleteAccount, hasSession } from '@/api'
import { endSession, favorites, me, signOut } from '@/session'
import { usePageMeta } from '@/composables/usePageMeta'
import { useSubmit } from '@/composables/useSubmit'

// Client only: the server renders the empty frame, the reader's data comes after hydration.
const route = useRoute()
const router = useRouter()
usePageMeta(() => ({ title: 'Account', noindex: true }))

onMounted(() => {
  if (!hasSession()) router.replace({ name: 'login', query: { next: route.fullPath } })
})

const joined = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

const newEmail = ref('')
const emailPassword = ref('')
const emailSentTo = ref('')
const emailForm = useSubmit(async () => {
  await changeEmail(newEmail.value, emailPassword.value)
  emailSentTo.value = newEmail.value
  emailPassword.value = ''
})

const currentPassword = ref('')
const newPassword = ref('')
const passwordDone = ref(false)
const passwordForm = useSubmit(async () => {
  passwordDone.value = false
  await changePassword(currentPassword.value, newPassword.value)
  currentPassword.value = newPassword.value = ''
  passwordDone.value = true
})

const deletePassword = ref('')
const deleteForm = useSubmit(async () => {
  await deleteAccount(deletePassword.value)
  endSession()
  router.replace('/')
})

async function leave() {
  await signOut()
  router.replace('/')
}
</script>

<template>
  <section class="mx-auto max-w-xl space-y-6" aria-labelledby="account-title">
    <h1 id="account-title" class="text-3xl font-black tracking-tight">Account</h1>

    <div class="panel flex flex-wrap items-center gap-4">
      <template v-if="me">
        <div class="min-w-0 flex-1">
          <p class="truncate font-bold">{{ me.email }}</p>
          <p class="text-sm text-zinc-500">Member since {{ joined(me.dateJoined) }}</p>
        </div>
        <RouterLink to="/favorites" class="btn">♥ Favorites ({{ favorites.size }})</RouterLink>
        <button type="button" class="btn" @click="leave">Sign out</button>
      </template>
      <p v-else class="text-zinc-500" role="status">Loading…</p>
    </div>

    <form class="panel space-y-4" @submit.prevent="emailForm.submit">
      <h2 class="text-lg font-bold">Change email</h2>
      <div>
        <label class="input-label" for="new-email">New email</label>
        <input
          id="new-email"
          v-model="newEmail"
          type="email"
          required
          autocomplete="email"
          class="input"
        />
        <p v-if="emailForm.fields.value.newEmail" class="field-error">
          {{ emailForm.fields.value.newEmail }}
        </p>
      </div>
      <div>
        <label class="input-label" for="email-password">Password</label>
        <input
          id="email-password"
          v-model="emailPassword"
          type="password"
          required
          autocomplete="current-password"
          class="input"
        />
        <p v-if="emailForm.fields.value.password" class="field-error">
          {{ emailForm.fields.value.password }}
        </p>
      </div>
      <p v-if="emailForm.error.value" class="alert alert-error" role="alert">
        {{ emailForm.error.value }}
      </p>
      <p v-if="emailSentTo" class="alert alert-ok" role="status">
        We sent a confirmation link to {{ emailSentTo }}. Your email changes once you follow it.
      </p>
      <button class="btn btn-primary" :disabled="emailForm.busy.value">Save</button>
    </form>

    <form class="panel space-y-4" @submit.prevent="passwordForm.submit">
      <h2 class="text-lg font-bold">Change password</h2>
      <div>
        <label class="input-label" for="current-password">Current password</label>
        <input
          id="current-password"
          v-model="currentPassword"
          type="password"
          required
          autocomplete="current-password"
          class="input"
        />
        <p v-if="passwordForm.fields.value.currentPassword" class="field-error">
          {{ passwordForm.fields.value.currentPassword }}
        </p>
      </div>
      <div>
        <label class="input-label" for="new-password">New password</label>
        <input
          id="new-password"
          v-model="newPassword"
          type="password"
          required
          autocomplete="new-password"
          class="input"
        />
        <p v-if="passwordForm.fields.value.newPassword" class="field-error">
          {{ passwordForm.fields.value.newPassword }}
        </p>
      </div>
      <p v-if="passwordForm.error.value" class="alert alert-error" role="alert">
        {{ passwordForm.error.value }}
      </p>
      <p v-if="passwordDone" class="alert alert-ok" role="status">
        Password changed. Your other devices are signed out.
      </p>
      <button class="btn btn-primary" :disabled="passwordForm.busy.value">Save</button>
    </form>

    <!-- GDPR right to erasure. A required checkbox instead of confirm(): no blocking browser dialog.
         Admins can't delete themselves (API: 403), so they get the reason instead of the form -->
    <p v-if="me?.isAdmin" class="text-sm text-zinc-500">Admin accounts can't be deleted here.</p>
    <form
      v-else
      class="panel space-y-4 border-rose-300 dark:border-rose-500/40"
      @submit.prevent="deleteForm.submit"
    >
      <h2 class="text-lg font-bold text-rose-700 dark:text-rose-400">Delete account</h2>
      <p class="text-sm">
        Your account and favorites are deleted for good, and you are signed out everywhere. This
        can't be undone.
      </p>
      <div>
        <label class="input-label" for="delete-password">Password</label>
        <input
          id="delete-password"
          v-model="deletePassword"
          type="password"
          required
          autocomplete="current-password"
          class="input"
        />
        <p v-if="deleteForm.fields.value.password" class="field-error">
          {{ deleteForm.fields.value.password }}
        </p>
      </div>
      <label class="flex items-start gap-2 text-sm">
        <input type="checkbox" required class="mt-1" />
        I understand that the account can't be restored
      </label>
      <p v-if="deleteForm.error.value" class="alert alert-error" role="alert">
        {{ deleteForm.error.value }}
      </p>
      <button class="btn btn-danger" :disabled="deleteForm.busy.value">Delete account</button>
    </form>
  </section>
</template>
