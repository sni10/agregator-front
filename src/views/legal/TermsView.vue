<script setup lang="ts">
import { usePageMeta } from '@/composables/usePageMeta'
import { SITE } from '@/site'
import LegalPage from '@/components/LegalPage.vue'

usePageMeta(() => ({
  title: 'Terms of Use',
  description: `The rules for using ${SITE.name} and its content.`,
}))
</script>

<template>
  <LegalPage title="Terms of Use" updated="October 25, 2026">
    <p>
      These terms apply to your use of {{ SITE.name }} at renews.me (the "site"). By using the site
      you agree to them. If you don't agree, please don't use the site.
    </p>

    <h2>The service</h2>
    <p>
      {{ SITE.name }} is a free news aggregator. It collects reports on IT, artificial intelligence
      and crypto from other publications, presents them as short stories and links to the original
      articles. No registration is needed. We may change, suspend or stop any part of the site at
      any time.
    </p>

    <h2>Content and intellectual property</h2>
    <ul>
      <li>
        The stories, summaries and the design of the site belong to {{ SITE.name }}, unless stated
        otherwise.
      </li>
      <li>
        Original articles remain the property of their publishers. We link to them and quote only
        short facts; for the full reports, follow the links under each story.
      </li>
      <li>
        Photos come from Pixabay and are used under the Pixabay Content License; the author and a
        link to the source are shown under each photo.
      </li>
      <li>Trademarks and company names mentioned belong to their owners.</li>
    </ul>

    <h2>How you may use the site</h2>
    <p>
      You may read the site, share links to it, follow it through RSS and quote short parts of a
      story with a link back to it. Without our written permission you may not republish whole
      stories, use the content commercially, or scrape or download the site in bulk in a way that
      burdens our servers. You must not try to disrupt the site or get around its security.
    </p>

    <h2>Links to other websites</h2>
    <p>
      The site links to websites we don't control. We are not responsible for their content,
      availability or privacy practices.
    </p>

    <h2>No warranty</h2>
    <p>
      The site and its content are provided "as is" and "as available", for general information
      only. We work to keep stories accurate but don't guarantee that they are complete, correct or
      up to date. Please read our <RouterLink to="/disclaimer">Disclaimer</RouterLink>.
    </p>

    <h2>Limitation of liability</h2>
    <p>
      To the extent permitted by law, {{ SITE.name }} is not liable for any loss or damage arising
      from your use of the site or reliance on its content, including decisions to buy, sell or hold
      any asset. Nothing in these terms limits liability that cannot be limited by law, such as
      liability for intent or gross negligence, or your rights as a consumer under the mandatory law
      of the country where you live.
    </p>

    <h2>Corrections and complaints</h2>
    <p>
      If you find a mistake in a story, or believe content on the site infringes your rights, write
      to <a :href="`mailto:${SITE.contact}`">{{ SITE.contact }}</a> with a link to the page. We
      review every notice and correct or remove content where it is justified.
    </p>

    <h2>Changes to these terms</h2>
    <p>
      We may update these terms. The new version applies from the date shown at the top of this
      page.
    </p>
  </LegalPage>
</template>
