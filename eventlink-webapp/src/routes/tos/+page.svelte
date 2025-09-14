<script lang="ts">
  const PRODUCT_NAME = "Okane — Eventlink → Unity Sync";
  const EFFECTIVE_DATE = "8 September 2025";
  const VERSION = "1.0";
  const CONTACT_EMAIL = "post@okane.no";
</script>

<svelte:head>
  <title>Terms of Use • {PRODUCT_NAME}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="mx-auto max-w-3xl px-4 py-8">
  <header class="mb-6">
    <h1 class="text-2xl font-bold text-zinc-900">Terms of Use</h1>
    <p class="mt-1 text-sm text-zinc-600 ">
      <span class="mr-2">Product:</span><span class="font-medium">{PRODUCT_NAME}</span><br />
      <span class="mr-2">Effective date:</span>{EFFECTIVE_DATE} · <span class="mr-2">Version:</span>{VERSION}
    </p>
  </header>

  <div class="rounded-2xl border border-zinc-200  bg-white/70 shadow-sm">
    <div class="p-5 md:p-6 space-y-6 text-sm leading-6 text-zinc-800">

      <section>
        <p>
          These Terms of Use (“<strong>Terms</strong>”) govern your access to and use of
          the tools that help organizers sync Magic: The Gathering™ Eventlink results to Unity League,
          including the web app, the “Okane Helper” browser extension, and related backend APIs
          (collectively, the “<strong>Service</strong>”). By using the Service, you agree to these Terms.
          If you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">1) Who may use the Service</h2>
        <p>
          You must be legally able to enter into these Terms and comply with all applicable rules of
          Wizards Eventlink and Unity League. You are responsible for your accounts with those third-party services.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">2) Your accounts &amp; authentication</h2>
        <ul class="list-disc ml-5 space-y-1">
          <li><strong>No passwords collected.</strong> The Service does not ask for, store, or handle your passwords for Eventlink or Unity League.</li>
          <li>
            <strong>Access tokens &amp; cookies.</strong> The browser extension reads your authenticated browser session
            (e.g., cookies or access tokens) and <strong>sends an access token to our backend</strong> so we can perform Unity API
            actions on your behalf (create/update an event, upload results). Tokens are transmitted over HTTPS.
          </li>
          <li>
            <strong>Token retention.</strong> Tokens are used only to fulfill your request and are not persistently stored.
            Aside from transient in-memory processing (and short-lived retry buffers if needed), tokens are discarded after
            the operation completes. Tokens are not written to logs.
          </li>
          <li>
            <strong>Your responsibility.</strong> Keep your devices secure, log out of Eventlink/Unity when appropriate,
            and promptly revoke access if you suspect compromise.
          </li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold">3) What the Service does</h2>
        <ul class="list-disc ml-5 space-y-1">
          <li>Reads Eventlink data from your active browser session (via the helper extension) with your permission.</li>
          <li>Creates/updates a Unity League event and uploads the results/standings you select.</li>
          <li>Provides previews and controls so you can review data before uploading.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold">4) Permissions you grant</h2>
        <p>
          You grant Okane the limited right to process your Eventlink data and transmit it to Unity on your behalf
          for the purpose of syncing events and results. You also grant us the right to store minimal operational metadata
          (e.g., timestamps, event IDs, non-sensitive logs) needed to operate, debug, and improve the Service.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">5) Acceptable use</h2>
        <p>You agree not to:</p>
        <ul class="list-disc ml-5 space-y-1">
          <li>Violate Eventlink, Wizards, or Unity League terms/policies;</li>
          <li>Misrepresent data, spam, probe, reverse engineer, or otherwise abuse the Service;</li>
          <li>Attempt to access other users’ data or bypass technical controls.</li>
        </ul>
        <p class="mt-2">
          We may rate-limit, suspend, or terminate access for abuse, legal risk, or security concerns.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">6) Third-party services</h2>
        <p>
          Eventlink (Wizards of the Coast) and Unity League are third-party services with their own terms and privacy policies.
          The Service depends on their availability and policies. If they change or revoke access (e.g., tokens, endpoints, rate limits),
          parts of the Service may stop working.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">7) Privacy &amp; data handling (summary)</h2>
        <ul class="list-disc ml-5 space-y-1">
          <li>We do <strong>not</strong> collect passwords.</li>
          <li>We <strong>do</strong> use your <strong>access token</strong> (from Eventlink and/or Unity) to call our backend for Unity API actions.</li>
          <li>Tokens are transmitted via HTTPS, processed to fulfill your request, and <strong>not persistently stored</strong>.</li>
          <li>We keep non-sensitive operational logs and metrics.</li>
        </ul>
        <p class="mt-2">
          For more detail, see our <a href="/privacy" class="underline decoration-dotted underline-offset-4">Privacy Policy</a>.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">8) Availability &amp; changes</h2>
        <p>
          The Service is provided on an “as available” basis. Features may change or be discontinued at any time.
          We may update these Terms; continued use means you accept the updated Terms. Material changes will be notified in-product.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">9) Disclaimers</h2>
        <p class="italic">
          THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW,
          OKANE DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">10) Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, OKANE AND ITS AFFILIATES WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL,
          ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY. OUR AGGREGATE LIABILITY
          FOR DIRECT DAMAGES WILL NOT EXCEED THE GREATER OF (A) NOK 1,000 OR (B) THE AMOUNT YOU PAID US FOR THE SERVICE
          IN THE 3 MONTHS BEFORE THE CLAIM.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">11) Indemnity</h2>
        <p>
          You will indemnify and hold Okane harmless from any claims, damages, losses, and expenses (including reasonable legal fees)
          arising from your use of the Service in violation of these Terms or third-party terms (including Eventlink/Unity policies).
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">12) Termination</h2>
        <p>
          You may stop using the Service at any time. We may suspend or terminate access immediately for violations,
          security risks, or legal requirements. Upon termination, we will cease processing your tokens and delete transient data
          not needed for legal compliance or legitimate business purposes (e.g., audit logs).
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">13) Governing law &amp; venue</h2>
        <p>
          These Terms are governed by Norwegian law, without regard to conflict-of-law principles.
          Exclusive venue is the courts of Oslo, Norway.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">14) Contact</h2>
        <p>
          Questions about these Terms or data handling? Contact us at
          <a class="underline decoration-dotted underline-offset-4" href={"mailto:" + CONTACT_EMAIL}>
            {CONTACT_EMAIL}
          </a>.
        </p>
      </section>

    </div>
  </div>

  <div class="mt-6 flex items-center justify-end">
    <a href="/" class="text-sm text-zinc-600  underline decoration-dotted underline-offset-4">
      ← Back to app
    </a>
  </div>
</main>
