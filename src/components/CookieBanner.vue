<script setup lang="ts">
import { consentOpen, setConsent } from '@/consent'

// Accept and Reject side by side and equally visible: refusing must be as easy as agreeing.
</script>

<template>
  <div
    v-if="consentOpen"
    role="dialog"
    aria-labelledby="cookie-title"
    class="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95"
  >
    <div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center">
      <p class="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
        <strong id="cookie-title" class="text-zinc-900 dark:text-zinc-100">Cookies.</strong>
        We'd like to use Google Analytics cookies to count visits and see which stories are read.
        They are set only if you accept. The site works the same either way.
        <RouterLink to="/cookies" class="underline">Cookie policy</RouterLink>
      </p>
      <div class="flex gap-2">
        <button
          type="button"
          class="flex-1 rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold sm:flex-none dark:border-zinc-700"
          @click="setConsent('denied')"
        >
          Reject
        </button>
        <button
          type="button"
          class="flex-1 rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold sm:flex-none dark:border-zinc-700"
          @click="setConsent('granted')"
        >
          Accept
        </button>
      </div>
    </div>
  </div>
</template>
