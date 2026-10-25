<script setup lang="ts">
import { usePageMeta } from '@/composables/usePageMeta'
import { SITE } from '@/site'
import LegalPage from '@/components/LegalPage.vue'

usePageMeta(() => ({
  title: 'Privacy Policy',
  description: `What personal data ${SITE.name} processes, why, and what your rights are.`,
}))
</script>

<template>
  <LegalPage title="Privacy Policy" updated="October 25, 2026">
    <p>
      This policy explains how {{ SITE.name }} (renews.me, "we", "us") handles personal data when
      you visit the site. It is written to meet the EU and UK General Data Protection Regulation
      (GDPR) and the ePrivacy rules on cookies.
    </p>

    <h2>Who is responsible</h2>
    <p>
      The controller of your personal data is {{ SITE.name }}. For any question or request about
      your data, write to <a :href="`mailto:${SITE.contact}`">{{ SITE.contact }}</a
      >.
    </p>

    <h2>The short version</h2>
    <ul>
      <li>
        {{ SITE.name }} is a news feed. You can read everything without an account; an account is
        optional and only keeps your favorite stories.
      </li>
      <li>
        For an account we need just an email and a password. We don't ask for your name or any other
        details, and we don't sell data.
      </li>
      <li>We don't show ads and don't build profiles of visitors.</li>
      <li>Analytics cookies are used only if you accept them, and you can change your mind.</li>
    </ul>

    <h2>What we process and why</h2>
    <p><strong>Server logs.</strong></p>
    <p>
      When your browser requests a page, our servers automatically receive technical data: IP
      address, date and time, the page requested, the referring page, and the browser and device
      type. We use it only to deliver the site, keep it secure and fix errors. Legal basis: our
      legitimate interest in running a secure website (Art. 6(1)(f) GDPR). Logs are kept for a short
      period and then deleted; we don't combine them with other data.
    </p>
    <p><strong>Your account (only if you create one).</strong></p>
    <p>
      Your email address, your password (stored only as a one-way hash: we can't see it), the date
      you signed up, the date and version of the Terms of Use you accepted, and the stories you add
      to your favorites. We use them to run your account: to sign you in, keep your favorites and
      send service emails (confirming your address, resetting your password, confirming an email
      change). We never send newsletters or ads. Legal basis: performing our agreement with you
      (Art. 6(1)(b) GDPR). While you are signed in, your browser keeps a sign-in token in local
      storage; it is removed when you sign out.
    </p>
    <p>
      We keep account data until you delete the account. You can do that yourself at any time on the
      Account page: the account and its favorites are deleted at once, and you are signed out on all
      devices.
    </p>
    <p><strong>Analytics (only with your consent).</strong></p>
    <p>
      If you click "Accept" in the cookie banner, we use Google Analytics 4 to understand how the
      site is used: which pages are viewed, how visitors arrive, their approximate location (country
      or city, derived from the IP address, which Google does not store), device and browser. Google
      Analytics is not loaded at all until you accept. Legal basis: your consent (Art. 6(1)(a)
      GDPR), which you can withdraw at any time through "Cookie settings" at the bottom of every
      page. Data is kept for the retention period set in our Google Analytics account, no longer
      than 14 months.
    </p>
    <p><strong>Your cookie choice.</strong></p>
    <p>
      We store your choice in your browser's local storage so we don't ask again on every page. It
      contains only "granted" or "denied" and is never sent to us. Legal basis: our legitimate
      interest and the ePrivacy exemption for storage strictly necessary to respect your choice.
    </p>

    <h2>Who receives the data</h2>
    <ul>
      <li>
        <strong>Our hosting provider</strong>, which runs the servers on our behalf under a data
        processing agreement.
      </li>
      <li>
        <strong>Brevo</strong> (Sendinblue SAS, France), which delivers our service emails on our
        behalf. It receives your email address and the content of those emails, and processes them
        in the EU.
      </li>
      <li>
        <strong>Google Ireland Limited</strong> (Gordon House, Barrow Street, Dublin 4, Ireland),
        only if you accept analytics, as our processor for Google Analytics. Data may be transferred
        to Google LLC in the United States, which is certified under the EU-U.S. Data Privacy
        Framework; Google's Standard Contractual Clauses apply as well. See
        <a href="https://policies.google.com/privacy" rel="noopener" target="_blank"
          >Google's privacy policy</a
        >.
      </li>
    </ul>
    <p>We don't share personal data with anyone else unless the law requires it.</p>

    <h2>Links and images</h2>
    <p>
      Stories link to the original articles and photo pages on other websites (news publishers,
      Pixabay). They are loaded only when you click them, and their own privacy policies apply
      there. Story photos are served from our own servers.
    </p>

    <h2>Your rights</h2>
    <p>Under the GDPR you have the right to:</p>
    <ul>
      <li>access the personal data we hold about you and get a copy of it;</li>
      <li>have inaccurate data corrected;</li>
      <li>have your data erased;</li>
      <li>
        restrict or object to its processing, including processing based on legitimate interest;
      </li>
      <li>data portability;</li>
      <li>withdraw your consent at any time, without affecting earlier processing;</li>
      <li>
        lodge a complaint with a data protection supervisory authority, in particular in the country
        where you live or work.
      </li>
    </ul>
    <p>
      Write to <a :href="`mailto:${SITE.contact}`">{{ SITE.contact }}</a
      >, from the email address of your account if you have one. We answer within one month. For
      visitors without an account we may need details (such as an IP address and time of visit) to
      find data relating to you.
    </p>

    <h2>Children</h2>
    <p>
      The site is a general news service not directed at children. You must be at least 16 to create
      an account, and we don't knowingly collect data from children; if we learn of such an account,
      we delete it.
    </p>

    <h2>Changes</h2>
    <p>
      If this policy changes, we will publish the new version here with a new date. Significant
      changes to how we use cookies will be asked about again in the cookie banner.
    </p>
  </LegalPage>
</template>
