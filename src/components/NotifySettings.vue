<script setup lang="ts">
import { ref } from 'vue'
import { errorMessage, getNotifications, setNotifications, type Notifications } from '@/api'

// How a reader gets news of their favorites: the gear on the Favorites page. Stored on the server
// (/me/notifications); the digest and push senders will read it. Telegram is not there yet.
const CHANNELS = [
  {
    key: 'emailDigest',
    title: 'Weekly email digest',
    text: 'Once a week: what happened next in your favorite stories, plus the top news of their topics.',
    icon: '✉',
  },
  {
    key: 'push',
    title: 'Push notifications',
    text: 'The moment a favorite story has a follow-up. Your browser will ask for permission.',
    icon: '🔔',
  },
  {
    key: 'telegram',
    title: 'Telegram',
    text: 'Follow-ups of your favorites in a chat with our bot.',
    icon: '✈',
    soon: true,
  },
] as const

const dialog = ref<HTMLDialogElement>()
const on = ref<Notifications | null>(null) // null until loaded: switches disabled
const error = ref('')

// loaded when opened: the page itself doesn't need it
async function open() {
  dialog.value?.showModal()
  error.value = ''
  try {
    on.value = await getNotifications()
  } catch (e) {
    error.value = errorMessage(e)
  }
}

// at once on screen; back if the server says no
async function toggle(key: keyof Notifications) {
  if (!on.value) return
  const value = !on.value[key]
  on.value[key] = value
  error.value = ''
  try {
    await setNotifications({ [key]: value }) // the answer is not applied: a quicker second click may be newer
  } catch (e) {
    if (on.value) on.value[key] = !value
    error.value = errorMessage(e)
  }
}

const isOn = (key: string) => !!on.value?.[key as keyof Notifications]
</script>

<template>
  <button
    type="button"
    class="flex size-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
    aria-label="Updates on your favorites"
    title="Updates on your favorites"
    @click="open"
  >
    <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M10.3 4.3c.4-1.7 2.9-1.7 3.4 0a1.7 1.7 0 0 0 2.6 1.1c1.5-.9 3.3.8 2.4 2.4a1.7 1.7 0 0 0 1 2.5c1.8.5 1.8 3 0 3.4a1.7 1.7 0 0 0-1 2.6c.9 1.5-.9 3.3-2.4 2.4a1.7 1.7 0 0 0-2.6 1c-.4 1.8-3 1.8-3.4 0a1.7 1.7 0 0 0-2.5-1c-1.6.9-3.3-.9-2.4-2.4a1.7 1.7 0 0 0-1.1-2.6c-1.7-.4-1.7-2.9 0-3.4a1.7 1.7 0 0 0 1.1-2.5c-.9-1.6.8-3.3 2.4-2.4a1.7 1.7 0 0 0 2.5-1.1Z"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  </button>

  <dialog
    ref="dialog"
    aria-labelledby="notify-title"
    class="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-6 text-zinc-900 shadow-xl backdrop:bg-black/50 dark:bg-zinc-900 dark:text-zinc-100"
  >
    <div class="mb-2 flex items-start justify-between gap-4">
      <h2 id="notify-title" class="text-xl font-black">Updates on your favorites</h2>
      <button
        type="button"
        class="text-2xl leading-none text-zinc-400 hover:text-zinc-700"
        aria-label="Close"
        @click="dialog?.close()"
      >
        ×
      </button>
    </div>
    <p class="text-sm text-zinc-500">
      Big stories rarely end in one day. Choose how we let you know when a story you saved gets a
      follow-up.
    </p>

    <ul class="mt-5 space-y-3">
      <li
        v-for="c in CHANNELS"
        :key="c.key"
        class="flex items-start gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800"
        :class="'soon' in c && 'opacity-60'"
      >
        <span class="mt-0.5 text-lg" aria-hidden="true">{{ c.icon }}</span>
        <div class="min-w-0 flex-1">
          <p :id="`notify-${c.key}`" class="font-semibold">
            {{ c.title }}
            <span
              v-if="'soon' in c"
              class="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500 uppercase dark:bg-zinc-800"
              >Soon</span
            >
          </p>
          <p class="mt-0.5 text-sm text-zinc-500">{{ c.text }}</p>
        </div>
        <button
          type="button"
          role="switch"
          :aria-checked="isOn(c.key)"
          :aria-labelledby="`notify-${c.key}`"
          :disabled="'soon' in c || !on"
          class="relative mt-1 h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed"
          :class="isOn(c.key) ? 'bg-violet-600' : 'bg-zinc-300 dark:bg-zinc-700'"
          @click="c.key !== 'telegram' && toggle(c.key)"
        >
          <span
            class="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition"
            :class="isOn(c.key) && 'translate-x-5'"
          />
        </button>
      </li>
    </ul>

    <p v-if="error" class="alert alert-error mt-4" role="alert">{{ error }}</p>
    <button type="button" class="btn btn-primary mt-6 w-full" @click="dialog?.close()">Done</button>
  </dialog>
</template>
