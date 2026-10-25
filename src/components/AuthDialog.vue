<script setup lang="ts">
import { ref, watch } from 'vue'
import { authDialog } from '@/session'
import AuthForm from './AuthForm.vue'

// The window a guest gets from a heart: sign in or sign up without leaving the page.
// <dialog>: focus trap, Esc and the backdrop come from the browser.
const dialog = ref<HTMLDialogElement>()
const mode = ref<'login' | 'register'>('login')

watch(authDialog, (open) => {
  if (open && !dialog.value?.open) dialog.value?.showModal()
  if (!open) dialog.value?.close()
})
</script>

<template>
  <dialog
    ref="dialog"
    aria-labelledby="auth-dialog-title"
    class="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-6 text-zinc-900 shadow-xl backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-100"
    @close="authDialog = false"
  >
    <div class="mb-4 flex items-start justify-between gap-4">
      <div>
        <h2 id="auth-dialog-title" class="text-xl font-black">
          {{ mode === 'login' ? 'Sign in' : 'Create an account' }}
        </h2>
        <p class="mt-1 text-sm text-zinc-500">Keep the stories you like in your favorites.</p>
      </div>
      <button
        type="button"
        class="text-2xl leading-none text-zinc-400 hover:text-zinc-700"
        aria-label="Close"
        @click="authDialog = false"
      >
        ×
      </button>
    </div>
    <AuthForm
      id="auth-dialog"
      :mode="mode"
      @mode="mode = $event"
      @done="authDialog = false"
      @leave="authDialog = false"
    />
  </dialog>
</template>
