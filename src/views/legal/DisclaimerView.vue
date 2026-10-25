<script setup lang="ts">
import { usePageMeta } from '@/composables/usePageMeta'
import { SITE } from '@/site'
import LegalPage from '@/components/LegalPage.vue'

usePageMeta(() => ({
  title: 'Disclaimer',
  description: `${SITE.name} is news, not advice: what to keep in mind when reading the stories.`,
}))
</script>

<template>
  <LegalPage title="Disclaimer" updated="October 25, 2026">
    <h2>News, not advice</h2>
    <p>
      Everything on {{ SITE.name }} is general news and information. It is not financial,
      investment, legal, tax or any other professional advice, and it is not an offer or a
      recommendation to buy, sell or hold any cryptocurrency, security or other asset.
    </p>

    <h2>Crypto is risky</h2>
    <p>
      Cryptocurrencies and related products are highly volatile and largely unregulated, and you can
      lose all the money you put into them. Do your own research and, before any financial decision,
      consult a qualified, licensed adviser. We don't predict prices.
    </p>

    <h2>Accuracy</h2>
    <p>
      Stories are based on reports from other publications, linked under each story. We check them
      carefully, but sources can be wrong, events move fast and mistakes happen. We give no
      guarantee that any story is complete, accurate or current. For the full details, read the
      original sources. If you spot an error, tell us at
      <a :href="`mailto:${SITE.contact}`">{{ SITE.contact }}</a
      >.
    </p>

    <h2>Third parties</h2>
    <p>
      Mentioning a company, product or project is not an endorsement. We are not affiliated with the
      publishers we link to and receive no payment for coverage.
    </p>

    <h2>Liability</h2>
    <p>
      You use the information on this site at your own risk. To the extent permitted by law,
      {{ SITE.name }} is not responsible for any loss resulting from it. See the
      <RouterLink to="/terms">Terms of Use</RouterLink>.
    </p>
  </LegalPage>
</template>
