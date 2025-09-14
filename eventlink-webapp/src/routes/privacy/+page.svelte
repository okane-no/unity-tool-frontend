<script lang="ts">

  const PRODUCT_NAME = "Okane — Eventlink → Unity Sync";
  const EFFECTIVE_DATE = "8 September 2025";
  const VERSION = "1.0";
  const CONTROLLER_NAME = "Okane";
  const CONTACT_EMAIL = "post@okane.no";
  const SUPERVISORY_AUTHORITY = "Datatilsynet (Norway)"; 
</script>

<svelte:head>
  <title>Privacy Policy • {PRODUCT_NAME}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="mx-auto max-w-3xl px-4 py-8">
  <header class="mb-6">
    <h1 class="text-2xl font-bold text-zinc-900 ">Privacy Policy</h1>
    <p class="mt-1 text-sm text-zinc-600 ">
      <span class="mr-2">Product:</span><span class="font-medium">{PRODUCT_NAME}</span><br />
      <span class="mr-2">Effective date:</span>{EFFECTIVE_DATE} · <span class="mr-2">Version:</span>{VERSION}
    </p>
  </header>

  <div class="rounded-2xl border border-zinc-200  bg-white/70  shadow-sm">
    <div class="p-5 md:p-6 space-y-6 text-sm leading-6 text-zinc-800 dark:text-zinc-200">

      <section>
        <p>
          This Privacy Policy explains how <strong>{CONTROLLER_NAME}</strong> (“we”, “us”) collects and processes
          personal data when you use the tools that help organizers sync Magic: The Gathering™ Eventlink results to
          Unity League, including the web app, the “Eventlink → Unity Sync Helper” browser extension, and related backend APIs
          (collectively, the “Service”).
        </p>
        <p class="mt-2">
          If you do not agree with this Policy, please do not use the Service.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">1) Summary</h2>
        <ul class="list-disc ml-5 space-y-1">
          <li><strong>No passwords.</strong> We do not ask for or store passwords for Eventlink or Unity.</li>
          <li><strong>Access tokens only.</strong> With your permission, the browser extension reads your authenticated session (e.g., cookies or access tokens). An <strong>access token</strong> is sent over HTTPS to our backend solely to perform Unity API actions on your behalf (e.g., create/update an event, upload results).</li>
          <li><strong>Transient processing.</strong> Tokens are used to fulfill your request and are not persistently stored. Aside from transient in-memory processing (and short-lived retry buffers if needed), tokens are discarded after the operation completes. Tokens are not written to logs.</li>
          <li><strong>Minimal logs/metrics.</strong> We keep non-sensitive operational logs (e.g., timestamps, event IDs, success/failure) to operate and improve the Service.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold">2) What data we process</h2>
        <ul class="list-disc ml-5 space-y-1">
          <li><strong>Eventlink data you select:</strong> standings, player names/usernames as shown to organizers, match results, event metadata (date, time, format).</li>
          <li><strong>Unity event data:</strong> event name/date/time/format/category, participant identifiers, upload status, and Unity event IDs created/updated by the Service.</li>
          <li><strong>Auth artifacts:</strong> access tokens and session cookies from Eventlink and/or Unity, obtained from your active browser session via the extension (not passwords).</li>
          <li><strong>Operational metadata:</strong> timestamps, request IDs, non-sensitive status/error messages.</li>
          <li><strong>Device/technical data:</strong> basic browser info and IP address as part of normal HTTPS requests.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold">3) How we obtain data</h2>
        <ul class="list-disc ml-5 space-y-1">
          <li>From <strong>you</strong>, when you use the Service and choose an Eventlink event to sync.</li>
          <li>From your <strong>browser session</strong> via the Helper extension (with your permission) to read session cookies/access tokens.</li>
          <li>From <strong>Unity’s APIs</strong>, when creating/updating events or uploading results as instructed by you.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold">4) Purposes of processing</h2>
        <ul class="list-disc ml-5 space-y-1">
          <li>To read Eventlink data you select and prepare it for Unity.</li>
          <li>To call Unity APIs (using your access token) to create/update events and upload results.</li>
          <li>To operate, secure, and improve the Service (logging, debugging, abuse prevention).</li>
          <li>To communicate with you about the Service (support and updates).</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold">5) Legal bases (GDPR)</h2>
        <ul class="list-disc ml-5 space-y-1">
          <li><strong>Performance of a contract</strong> (Art. 6(1)(b)): providing the functionality you requested (syncing data to Unity).</li>
          <li><strong>Legitimate interests</strong> (Art. 6(1)(f)): operating, securing, and improving the Service; preventing abuse; troubleshooting.</li>
          <li><strong>Consent</strong> (Art. 6(1)(a)): where required (e.g., optional cookies or optional diagnostics, if enabled).</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold">6) Retention</h2>
        <ul class="list-disc ml-5 space-y-1">
          <li><strong>Access tokens &amp; session cookies:</strong> processed transiently to complete your request and not persistently stored. Tokens are not written to logs.</li>
          <li><strong>Operational logs/metrics:</strong> kept for a limited period necessary for operations and security (e.g., diagnosing issues, preventing abuse), then deleted or anonymized.</li>
          <li><strong>Unity event identifiers &amp; audit fields:</strong> retained as part of normal operation records.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold">7) Sharing &amp; processors</h2>
        <p>
          We do not sell your data. We may use standard infrastructure/service providers (e.g., hosting, monitoring) as processors acting on our instructions and bound by appropriate data processing terms.
          We share data with Unity only to perform the actions you request (e.g., create/update an event, upload results).
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">8) International transfers</h2>
        <p>
          If data is transferred outside the EEA, we rely on appropriate safeguards (e.g., Standard Contractual Clauses) or adequacy decisions, where applicable.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">9) Security</h2>
        <ul class="list-disc ml-5 space-y-1">
          <li>Transport encryption (HTTPS) for data in transit.</li>
          <li>Principle of least privilege for service components.</li>
          <li>No persistent storage of access tokens; tokens are not written to logs.</li>
          <li>Operational monitoring and rate limiting to mitigate abuse.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-semibold">10) Your rights (GDPR)</h2>
        <p>
          Depending on your location, you may have rights to access, rectify, erase, restrict, or object to processing, and to data portability. You also have the right to lodge a complaint with {SUPERVISORY_AUTHORITY}.
        </p>
        <p class="mt-2">
          To exercise your rights, contact us at
          <a class="underline decoration-dotted underline-offset-4" href={"mailto:" + CONTACT_EMAIL}>
            {CONTACT_EMAIL}
          </a>.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">11) Cookies &amp; local storage</h2>
        <p>We use a minimal set of cookies/local storage items to operate the Service:</p>
        <ul class="list-disc ml-5 space-y-1">
          <li>Cookies that records that you accepted our Terms (expires ~1 year).</li>
        </ul>
        <p class="mt-2">
          The Helper extension may read Eventlink session cookies in your browser (with your permission) to obtain an access token needed to perform Unity actions; this does not store passwords and is limited to fulfilling your request.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">12) Children</h2>
        <p>
          The Service is intended for organizers and is not directed to children. If you believe we have collected personal data from a child, contact us and we will take appropriate action.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">13) Changes to this Policy</h2>
        <p>
          We may update this Policy from time to time. We will post the updated version here and, if changes are material, provide an in-product notice. Continued use of the Service after an update means you accept the changes.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-semibold">14) Contact</h2>
        <p>
          Questions or requests regarding this Policy? Contact us at
          <a class="underline decoration-dotted underline-offset-4" href={"mailto:" + CONTACT_EMAIL}>
            {CONTACT_EMAIL}
          </a>.
        </p>
      </section>

    </div>
  </div>

  <div class="mt-6 flex items-center justify-end">
    <a href="/" class="text-sm text-zinc-600 underline decoration-dotted underline-offset-4">
      ← Back to app
    </a>
  </div>
</main>
