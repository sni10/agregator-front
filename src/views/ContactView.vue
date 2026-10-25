<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { sendContact, type ContactTopic } from '@/api'
import { me } from '@/session'
import { usePageMeta } from '@/composables/usePageMeta'
import { useSubmit } from '@/composables/useSubmit'

// Questions, corrections, copyright notices: the backend emails them to the editors.
// ?topic=correction&pageUrl=… comes from "Spotted an error?" under a story.
const route = useRoute()
usePageMeta(() => ({ title: 'Contact us', noindex: true }))

const TOPICS: { value: ContactTopic; label: string }[] = [
  { value: 'question', label: 'Question or feedback' },
  { value: 'correction', label: 'Error in a story' },
  { value: 'copyright', label: 'Copyright' },
  { value: 'other', label: 'Other' },
]
const query = (name: string) => (typeof route.query[name] === 'string' ? route.query[name] : '')
const topic = ref<ContactTopic>(TOPICS.find((t) => t.value === query('topic'))?.value ?? 'question')
const pageUrl = ref(query('pageUrl'))
const email = ref('')
const message = ref('')
const sent = ref(false)

// a signed-in reader: their address, unless they typed another one
watch(
  me,
  (user) => {
    if (user && !email.value) email.value = user.email
  },
  { immediate: true },
)

// Cloudflare Turnstile against spam bots; the backend checks the token. Browser only, loaded on this
// page only. No key in the build -> Cloudflare's always-pass test key (local dev).
const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY || '1x00000000000000000000AA'
const captchaEl = ref<HTMLElement>()
const token = ref('')
let widget: string | undefined

function renderCaptcha() {
  if (!captchaEl.value || !window.turnstile) return
  widget = window.turnstile.render(captchaEl.value, {
    sitekey: SITEKEY,
    callback: (t) => (token.value = t),
    'expired-callback': () => (token.value = ''),
  })
}

onMounted(() => {
  if (window.turnstile) return renderCaptcha()
  const s = document.createElement('script')
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
  s.onload = renderCaptcha
  document.head.append(s)
})
onBeforeUnmount(() => {
  if (widget) window.turnstile?.remove(widget)
})

const { busy, fields, error, submit } = useSubmit(async () => {
  try {
    await sendContact({
      topic: topic.value,
      email: email.value,
      pageUrl: pageUrl.value,
      message: message.value,
      captcha: token.value,
    })
    sent.value = true
  } finally {
    // a token works once: after an error the reader needs a new one
    if (!sent.value && widget) {
      token.value = ''
      window.turnstile?.reset(widget)
    }
  }
})
</script>

<template>
  <section class="panel mx-auto max-w-xl" aria-labelledby="contact-title">
    <h1 id="contact-title" class="mb-2 text-2xl font-black tracking-tight">Contact us</h1>

    <p v-if="sent" class="alert alert-ok mt-4" role="status">
      Thanks, your message is with the editors. We'll reply to <strong>{{ email }}</strong
      >.
    </p>

    <form v-else class="mt-4 space-y-4" @submit.prevent="submit">
      <p class="text-sm text-zinc-500">
        Questions, a mistake in a story, a copyright notice: we read every message.
      </p>
      <div>
        <label class="input-label" for="contact-topic">Topic</label>
        <select id="contact-topic" v-model="topic" class="input">
          <option v-for="t in TOPICS" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
        <p v-if="fields.topic" class="field-error">{{ fields.topic }}</p>
      </div>
      <div>
        <label class="input-label" for="contact-email">Your email</label>
        <input
          id="contact-email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="input"
        />
        <p v-if="fields.email" class="field-error">{{ fields.email }}</p>
      </div>
      <div>
        <label class="input-label" for="contact-page">Link to the story (optional)</label>
        <input
          id="contact-page"
          v-model="pageUrl"
          type="url"
          placeholder="https://renews.me/news/…"
          class="input"
        />
        <p v-if="fields.pageUrl" class="field-error">{{ fields.pageUrl }}</p>
      </div>
      <div>
        <label class="input-label" for="contact-message">Message</label>
        <textarea
          id="contact-message"
          v-model="message"
          required
          minlength="10"
          maxlength="5000"
          rows="6"
          class="input"
        />
        <p v-if="fields.message" class="field-error">{{ fields.message }}</p>
      </div>
      <div ref="captchaEl" />
      <p v-if="fields.captcha" class="field-error">{{ fields.captcha }}</p>
      <p v-if="error" class="alert alert-error" role="alert">{{ error }}</p>
      <button class="btn btn-primary w-full" :disabled="busy || !token">Send</button>
    </form>
  </section>
</template>
