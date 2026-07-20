<template>
  <footer>
    <div class="wrap">
      <div class="cols">
        <div class="col" style="max-width: 250px">
          <NuxtLink class="brand" to="/" style="margin-bottom: 14px; display: flex">
            <svg viewBox="0 0 32 32" fill="none" stroke="#fff" stroke-width="2.4"><rect x="3" y="6" width="26" height="20" rx="2" /><path d="M3 12h26" /><path d="M8 18h6M8 22h10" stroke-width="1.8" /></svg>achkit
          </NuxtLink>
          <p style="font-size: 15px; color: var(--smoke); margin: 0 0 16px">The ACH file toolkit for developers. Ship NACHA files with confidence.</p>
          <p class="mailrow">hello <a href="mailto:hello@achkit.com">hello@achkit.com</a></p>
        </div>
        <div class="col"><h4>Product</h4><NuxtLink to="/docs">Docs</NuxtLink><NuxtLink to="/#pricing">Pricing</NuxtLink><a href="https://github.com/achkit/achkit/releases">Changelog</a></div>
        <div class="col"><h4>Developers</h4><a href="https://github.com/achkit/achkit">GitHub</a><a href="https://www.npmjs.com/package/achkit">npm</a><a href="https://pypi.org/project/achkit/">PyPI</a><a href="/llms.txt">llms.txt</a></div>
        <div class="col"><h4>Company</h4><NuxtLink to="/contact">Contact</NuxtLink><NuxtLink to="/privacy">Privacy</NuxtLink><NuxtLink to="/terms">Terms</NuxtLink></div>
      </div>
      <div class="base">
        <span>(c) 2026 achkit</span>
        <span>Not affiliated with Nacha. ACH is a US payment network.</span>
      </div>
    </div>
  </footer>
</template>
