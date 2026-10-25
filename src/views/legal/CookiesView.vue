<script setup lang="ts">
import { usePageMeta } from '@/composables/usePageMeta'
import { consentOpen, GA_ID } from '@/consent'
import { SITE } from '@/site'
import LegalPage from '@/components/LegalPage.vue'

usePageMeta(() => ({
  title: 'Cookie Policy',
  description: `Which cookies ${SITE.name} uses and how to accept or refuse them.`,
}))
</script>

<template>
  <LegalPage title="Cookie Policy" updated="October 25, 2026">
    <p>
      Cookies are small files a website stores in your browser. Local storage works in a similar
      way. This page lists everything {{ SITE.name }} stores on your device and why. More about how
      we handle data is in the <RouterLink to="/privacy">Privacy Policy</RouterLink>.
    </p>

    <h2>Strictly necessary</h2>
    <p>Always on: without it we couldn't remember your choice. No consent is needed for it.</p>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Purpose</th>
          <th>Kept</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>cookie-consent</code></td>
          <td>Local storage</td>
          <td>Remembers whether you accepted or rejected analytics cookies</td>
          <td>Until you clear your browser data</td>
        </tr>
      </tbody>
    </table>

    <h2>Analytics (optional)</h2>
    <p>
      Set by Google Analytics only after you click "Accept". They help us count visits and see which
      stories are read. We don't use advertising cookies.
    </p>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Provider</th>
          <th>Purpose</th>
          <th>Kept</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>_ga</code></td>
          <td>Google</td>
          <td>Tells visits from different browsers apart</td>
          <td>2 years</td>
        </tr>
        <tr>
          <td>
            <code>_ga_{{ GA_ID.replace('G-', '') }}</code>
          </td>
          <td>Google</td>
          <td>Keeps the state of the current visit</td>
          <td>2 years</td>
        </tr>
      </tbody>
    </table>

    <h2>Changing your choice</h2>
    <p>
      You can accept or reject analytics at any time:
      <button type="button" class="font-semibold underline" @click="consentOpen = true">
        open cookie settings</button
      >. If you reject them after accepting, we delete the Google Analytics cookies. You can also
      block or delete cookies in your browser's settings; the site works fully without them.
    </p>

    <h2>Contact</h2>
    <p>
      Questions about cookies: <a :href="`mailto:${SITE.contact}`">{{ SITE.contact }}</a
      >.
    </p>
  </LegalPage>
</template>
