<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { me, signOut, signedIn } from '@/session'

// Header corner: "Sign in" for a guest, a menu for the reader. Empty until the session is known
// (server render, first paint), so the page doesn't flash "Sign in" for a signed-in reader.
const route = useRoute()
const router = useRouter()
const open = ref(false)
watch(
  () => route.fullPath,
  () => (open.value = false),
)

const PERSONAL = ['account', 'favorites']

async function leave() {
  open.value = false
  await signOut()
  if (PERSONAL.includes(String(route.name))) router.replace('/')
}
</script>

<template>
  <div class="relative min-w-9">
    <RouterLink
      v-if="signedIn === false"
      :to="{ name: 'login', query: route.name === 'login' ? undefined : { next: route.fullPath } }"
      class="rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >Sign in</RouterLink
    >
    <template v-else-if="signedIn && me">
      <button
        type="button"
        class="flex size-9 items-center justify-center rounded-full bg-violet-600 font-bold text-white uppercase"
        :aria-expanded="open"
        aria-haspopup="menu"
        :aria-label="`Account menu (${me.email})`"
        @click="open = !open"
      >
        {{ me.email[0] }}
      </button>
      <div
        v-if="open"
        role="menu"
        class="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
      >
        <p class="truncate px-4 py-2 text-xs text-zinc-500">{{ me.email }}</p>
        <RouterLink
          role="menuitem"
          to="/favorites"
          class="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >Favorites</RouterLink
        >
        <RouterLink
          role="menuitem"
          to="/account"
          class="block px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >Account</RouterLink
        >
        <button
          type="button"
          role="menuitem"
          class="block w-full px-4 py-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
          @click="leave"
        >
          Sign out
        </button>
      </div>
    </template>
  </div>
</template>
