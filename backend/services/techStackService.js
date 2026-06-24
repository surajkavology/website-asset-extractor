function detectTechStack(html, jsFiles, cssFiles) {
  const checks = [
    { name: 'React', category: 'framework', icon: '⚛️', detect: () => /react(?:\.min)?\.js|__REACT|_reactFiber|data-reactroot/i.test(html) || jsFiles.some((j) => /react/i.test(j.url)) },
    { name: 'Next.js', category: 'framework', icon: '▲', detect: () => /__NEXT_DATA__|_next\/static|nextjs/i.test(html) },
    { name: 'Vue.js', category: 'framework', icon: '💚', detect: () => /vue(?:\.min)?\.js|__vue__|data-v-/i.test(html) || jsFiles.some((j) => /vue/i.test(j.url)) },
    { name: 'Angular', category: 'framework', icon: '🔴', detect: () => /ng-version|angular(?:\.min)?\.js|\[ng-/i.test(html) || jsFiles.some((j) => /angular/i.test(j.url)) },
    { name: 'Svelte', category: 'framework', icon: '🧡', detect: () => /svelte|__svelte/i.test(html) || jsFiles.some((j) => /svelte/i.test(j.url)) },
    { name: 'Nuxt.js', category: 'framework', icon: '💚', detect: () => /__NUXT__|nuxt\.js/i.test(html) },
    { name: 'Gatsby', category: 'framework', icon: '💜', detect: () => /gatsby|___gatsby/i.test(html) },
    { name: 'WordPress', category: 'cms', icon: '🔵', detect: () => /wp-content|wp-includes|wordpress/i.test(html) },
    { name: 'Shopify', category: 'cms', icon: '🟢', detect: () => /shopify|myshopify\.com|Shopify\.theme/i.test(html) },
    { name: 'WooCommerce', category: 'cms', icon: '🟣', detect: () => /woocommerce|wc-/i.test(html) },
    { name: 'Elementor', category: 'plugin', icon: '🎨', detect: () => /elementor/i.test(html) },
    { name: 'Webflow', category: 'platform', icon: '🌊', detect: () => /webflow\.com|data-wf-/i.test(html) },
    { name: 'Squarespace', category: 'platform', icon: '◻️', detect: () => /squarespace\.com|squarespace/i.test(html) },
    { name: 'Wix', category: 'platform', icon: '✳️', detect: () => /wix\.com|wixsite|_wix_/i.test(html) },
    { name: 'Tailwind CSS', category: 'styling', icon: '🎨', detect: () => /tailwind/i.test(html) || cssFiles.some((c) => /tailwind/i.test(c.url)) },
    { name: 'Bootstrap', category: 'styling', icon: '🅱️', detect: () => /bootstrap/i.test(html) || cssFiles.some((c) => /bootstrap/i.test(c.url)) || jsFiles.some((j) => /bootstrap/i.test(j.url)) },
    { name: 'Material UI', category: 'styling', icon: '🎭', detect: () => /MuiButton|material-ui|@mui/i.test(html) },
    { name: 'GSAP', category: 'animation', icon: '💫', detect: () => /gsap|greensock|TweenMax|TweenLite/i.test(html) || jsFiles.some((j) => /gsap/i.test(j.url)) },
    { name: 'jQuery', category: 'library', icon: '📦', detect: () => /jquery(?:\.min)?\.js|\$\(document\)|jQuery/i.test(html) || jsFiles.some((j) => /jquery/i.test(j.url)) },
    { name: 'Lodash', category: 'library', icon: '🔧', detect: () => /lodash/i.test(html) || jsFiles.some((j) => /lodash/i.test(j.url)) },
    { name: 'Google Analytics', category: 'analytics', icon: '📊', detect: () => /google-analytics\.com|gtag\(|ga\(|UA-\d|G-\w/i.test(html) },
    { name: 'Google Tag Manager', category: 'analytics', icon: '🏷️', detect: () => /googletagmanager\.com|gtm\.js/i.test(html) },
    { name: 'Hotjar', category: 'analytics', icon: '🔥', detect: () => /hotjar|hjSiteSettings/i.test(html) },
    { name: 'Cloudflare', category: 'infrastructure', icon: '☁️', detect: () => /cloudflare|__cf_/i.test(html) },
    { name: 'Vercel', category: 'infrastructure', icon: '▲', detect: () => /vercel\.app|\.vercel\./i.test(html) },
    { name: 'TypeScript', category: 'language', icon: '🔷', detect: () => jsFiles.some((j) => /\.ts($|\?)/i.test(j.url)) },
    { name: 'Vite', category: 'build-tool', icon: '⚡', detect: () => /vite|@vite/i.test(html) || jsFiles.some((j) => /vite/i.test(j.url)) },
    { name: 'Webpack', category: 'build-tool', icon: '📦', detect: () => /webpack|__webpack_require__/i.test(html) },
    { name: 'Font Awesome', category: 'icons', icon: '🔠', detect: () => /font-awesome|fontawesome|fa-/i.test(html) || cssFiles.some((c) => /font-awesome|fontawesome/i.test(c.url)) },
    { name: 'Stripe', category: 'payment', icon: '💳', detect: () => /stripe\.com|Stripe\(/i.test(html) },
    { name: 'Intercom', category: 'support', icon: '💬', detect: () => /intercom/i.test(html) },
    { name: 'Sentry', category: 'monitoring', icon: '🛡️', detect: () => /sentry\.io|@sentry/i.test(html) },
  ];

  return checks
    .filter((t) => {
      try { return t.detect(); } catch { return false; }
    })
    .map(({ name, category, icon }) => ({ name, category, icon }));
}

module.exports = { detectTechStack };
