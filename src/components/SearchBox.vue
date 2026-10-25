<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { suggest, type Suggestion } from '@/api'
import { categoryStyle } from '@/site'

// The search box with titles suggested while the reader types (arrows + Enter, Esc closes).
// Without JavaScript it is a plain GET form to /search. `hotkey`: "/" focuses it (the header box).
const props = defineProps<{ large?: boolean; hotkey?: boolean }>()
const route = useRoute()
const router = useRouter()
const id = useId()

const routeQ = () =>
  route.name === 'search' && typeof route.query.q === 'string' ? route.query.q : ''
const text = ref(routeQ())
watch(
  () => route.fullPath,
  () => {
    text.value = routeQ()
    close()
  },
)

const input = ref<HTMLInputElement>()
const items = ref<Suggestion[]>([])
const open = ref(false)
const active = ref(-1)
let timer: ReturnType<typeof setTimeout> | undefined
let asked = 0 // only the answer to the latest request counts

function close() {
  open.value = false
  active.value = -1
}

function onInput() {
  clearTimeout(timer)
  const q = text.value.trim()
  if (q.length < 2) {
    items.value = []
    return close()
  }
  timer = setTimeout(async () => {
    const n = ++asked
    const found = await suggest(q).catch(() => [])
    if (n !== asked) return
    items.value = found
    active.value = -1
    open.value = found.length > 0 && document.activeElement === input.value
  }, 200)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') return close()
  const n = items.value.length
  if (!open.value || !n || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return
  e.preventDefault()
  if (e.key === 'ArrowDown') active.value = (active.value + 1) % n
  else active.value = active.value <= 0 ? n - 1 : active.value - 1
}

// Enter: the highlighted title, or all results
function submit() {
  const pick = open.value ? items.value[active.value] : undefined
  if (pick) return go(pick)
  searchAll()
}

function searchAll() {
  stop()
  const q = text.value.trim()
  // the filters of the current search stay; a new word starts again from page 1
  const keep = route.name === 'search' ? { ...route.query, page: undefined } : {}
  router.push({ name: 'search', query: { ...keep, q: q || undefined } })
}

function go(item: Suggestion) {
  stop()
  router.push(`/news/${item.slug}`)
}

// no late answer may reopen the list after the reader has left
function stop() {
  clearTimeout(timer)
  asked++
  close()
  input.value?.blur()
}

// "/" anywhere but in a field: to the search box
function onHotkey(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null
  if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
  if (target?.closest('input, textarea, select, [contenteditable]')) return
  e.preventDefault()
  input.value?.focus()
}
onMounted(() => props.hotkey && window.addEventListener('keydown', onHotkey))
onBeforeUnmount(() => {
  clearTimeout(timer)
  if (props.hotkey) window.removeEventListener('keydown', onHotkey)
})
</script>

<template>
  <form action="/search" method="get" role="search" class="relative" @submit.prevent="submit">
    <input
      ref="input"
      v-model="text"
      name="q"
      type="search"
      :placeholder="large ? 'Search stories, companies, coins…' : 'Search'"
      aria-label="Search stories"
      role="combobox"
      autocomplete="off"
      :aria-expanded="open"
      :aria-controls="`${id}-list`"
      aria-autocomplete="list"
      :aria-activedescendant="active >= 0 ? `${id}-${active}` : undefined"
      class="w-full rounded-full border border-zinc-200 bg-white outline-none focus:border-violet-400 dark:border-zinc-700 dark:bg-zinc-900"
      :class="large ? 'px-5 py-3 text-lg' : 'px-3 py-1 text-sm'"
      @input="onInput"
      @keydown="onKey"
      @focus="open = items.length > 0 && text.trim().length >= 2"
      @blur="close"
    />
    <kbd
      v-if="hotkey && !text"
      class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded border border-zinc-200 px-1.5 text-[10px] text-zinc-400 dark:border-zinc-700"
      aria-hidden="true"
      >/</kbd
    >
    <ul
      v-show="open"
      :id="`${id}-list`"
      role="listbox"
      aria-label="Suggested stories"
      class="absolute right-0 left-0 z-20 mt-2 min-w-72 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1 text-sm shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
    >
      <!-- mousedown: before the input's blur closes the list -->
      <li
        v-for="(item, i) in items"
        :id="`${id}-${i}`"
        :key="item.slug"
        role="option"
        :aria-selected="i === active"
        class="flex cursor-pointer items-start gap-2 px-4 py-2"
        :class="
          i === active
            ? 'bg-zinc-100 dark:bg-zinc-800'
            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
        "
        @mousedown.prevent="go(item)"
      >
        <span
          class="mt-0.5 shrink-0 rounded-full px-1.5 text-[10px] font-semibold"
          :class="categoryStyle(item.category).badge"
          >{{ categoryStyle(item.category).label }}</span
        >
        <span class="leading-snug">{{ item.title }}</span>
      </li>
      <li
        role="option"
        :aria-selected="false"
        class="cursor-pointer border-t border-zinc-100 px-4 py-2 text-xs text-violet-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-violet-400 dark:hover:bg-zinc-800/60"
        @mousedown.prevent="searchAll"
      >
        All results for “{{ text.trim() }}” →
      </li>
    </ul>
  </form>
</template>
