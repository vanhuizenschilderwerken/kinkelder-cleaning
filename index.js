(function () {
  var fallbackStylesAdded = false;


  /*
   * Zet oude interne .html-links automatisch om naar nette URL's:
   * home.html                 -> /
   * over-ons.html             -> /over-ons/
   * offerte-aanvragen.html?... -> /offerte-aanvragen/?...
   *
   * Externe links, e-mailadressen, telefoonnummers en losse hash-links
   * worden niet aangepast.
   */
  function normalizeCleanPath(pathname) {
    var path = pathname || '/';

    try {
      path = decodeURIComponent(path);
    } catch (error) {
      /* Gebruik de oorspronkelijke waarde wanneer decoderen niet lukt. */
    }

    path = path
      .replace(/\\/g, '/')
      .replace(/\/+/g, '/')
      .replace(/\/(?:home|index)\.html?$/i, '/')
      .replace(/\.html?$/i, '/');

    if (path.charAt(0) !== '/') path = '/' + path;
    if (path !== '/' && path.charAt(path.length - 1) !== '/') path += '/';

    return path || '/';
  }

  function convertLegacyPageUrl(value) {
    var rawValue = (value || '').trim();

    if (
      !rawValue ||
      rawValue.charAt(0) === '#' ||
      /^(?:mailto:|tel:|sms:|javascript:|data:)/i.test(rawValue)
    ) {
      return rawValue;
    }

    var url;

    try {
      url = new URL(rawValue, window.location.href);
    } catch (error) {
      return rawValue;
    }

    if (url.origin !== window.location.origin) return rawValue;
    if (!/\.html?$/i.test(url.pathname)) return rawValue;

    return normalizeCleanPath(url.pathname) + url.search + url.hash;
  }

  function upgradeLegacyLinks(root) {
    var scope = root && root.querySelectorAll ? root : document;

    scope.querySelectorAll('a[href], form[action]').forEach(function (element) {
      var attribute = element.tagName === 'FORM' ? 'action' : 'href';
      var oldValue = element.getAttribute(attribute);
      var newValue = convertLegacyPageUrl(oldValue);

      if (newValue && newValue !== oldValue) {
        element.setAttribute(attribute, newValue);
      }
    });
  }

  function resolveIncludeUrl(file) {
    var value = (file || '').trim();

    if (!value) return value;
    if (/^(?:https?:)?\/\//i.test(value) || value.charAt(0) === '/') return value;

    return '/' + value.replace(/^\.\//, '').replace(/^\/+/, '');
  }

  function runScripts(container) {
    var scripts = container.querySelectorAll('script');

    scripts.forEach(function (oldScript) {
      var newScript = document.createElement('script');

      Array.prototype.slice.call(oldScript.attributes).forEach(function (attribute) {
        newScript.setAttribute(attribute.name, attribute.value);
      });

      newScript.text = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
  }

  function ensureFallbackStyles() {
    if (fallbackStylesAdded || document.querySelector('[data-fallback-shell-styles]')) return;
    fallbackStylesAdded = true;

    var style = document.createElement('style');
    style.setAttribute('data-fallback-shell-styles', '');
    style.textContent = [
      '.site-header,.site-header *,.site-footer,.site-footer *{box-sizing:border-box}',
      'body.is-menu-open,body.menu-open{overflow:hidden}',
      '.site-header.is-scrolled .site-header__desktop-row{border-color:rgba(21,21,21,.1);box-shadow:0 20px 56px rgba(18,58,91,.16)}',
      '.site-header{position:sticky;top:0;z-index:1000;width:100%;background:#EEF6FA;color:#151515;font-family:Inter,Arial,Helvetica,sans-serif}',
      '.site-header a,.site-footer a{text-decoration:none;color:inherit}',
      '.site-header__shell{max-width:1440px;margin:0 auto;padding:20px 24px}',
      '.site-header__desktop-row{min-height:86px;display:flex;align-items:center;justify-content:space-between;gap:clamp(18px,2vw,34px);padding:10px 12px 10px 18px;border:1px solid rgba(21,21,21,.06);border-radius:999px;background:rgba(255,255,255,.96);box-shadow:0 24px 70px rgba(18,58,91,.12)}',
      '.site-header__contact-strip{flex:0 0 auto;display:flex;align-items:center;gap:clamp(12px,1.5vw,22px);font-size:14px;font-weight:700}',
      '.site-header__contact-strip a{display:inline-flex;align-items:center;gap:8px}.site-header__contact-strip svg{width:22px;height:22px}',
      '.site-header__mobile-bar{display:none}',
      '.site-header__nav--desktop{flex:1 1 auto;display:flex;align-items:center;justify-content:center;gap:clamp(14px,1.7vw,30px);min-width:280px}',
      '.site-header__nav-link{font-size:15px;font-weight:700;color:rgba(21,21,21,.76);white-space:nowrap}',
      '.site-header__nav-link:hover,.site-header__nav-link.is-active{color:#151515}',
      '.site-header__logo{display:inline-flex;flex-direction:column;align-items:flex-start;gap:6px;width:fit-content;font-family:Manrope,Arial,Helvetica,sans-serif;font-weight:900;line-height:.9;white-space:nowrap}',
      '.site-header__desktop-row .site-header__logo{flex:0 0 auto;flex-direction:row;align-items:center;gap:12px}',
      '.site-header__logo-mark{width:42px;height:42px;display:inline-grid;place-items:center;border-radius:9px 9px 9px 2px;background:linear-gradient(155deg,#00A3E0 0%,#063A5A 52%,#151515 100%);color:#fff;font-size:13px}',
      '.site-header__logo-text{font-size:clamp(17px,1.45vw,22px);letter-spacing:-.04em}',
      '.site-header__actions{display:flex;align-items:center}',
      '.site-header__action{min-height:58px;display:inline-flex;align-items:center;justify-content:center;gap:14px;border-radius:999px;font-size:15px;font-weight:900;white-space:nowrap}',
      '.site-header__action--quote{padding:0 10px 0 24px;background:#00A3E0;color:#fff;box-shadow:0 16px 30px rgba(0,163,224,.24)}',
      '.site-header__action-icon{width:44px;height:44px;display:inline-grid;place-items:center;border-radius:50%;background:#fff;color:#151515;font-size:20px}.site-header__action-icon svg,.site-header__drawer-card a svg{width:21px;height:21px;display:block}',
      '.site-header__mobile-toggle,.site-header__drawer{display:none}',
      '.site-footer{margin-top:80px;background:#EEF6FA;color:#151515;font-family:Inter,Arial,Helvetica,sans-serif}',
      '.site-footer__wrap{max-width:1180px;margin:0 auto;padding:54px 24px 0}',
      '.site-footer__masthead{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:40px;padding-bottom:38px;border-bottom:1px solid rgba(21,21,21,.18)}',
      '.site-footer__brand{display:inline-flex;flex-direction:column;gap:8px;width:fit-content;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:clamp(26px,2.4vw,38px);line-height:.92;font-weight:900;letter-spacing:-.04em}',
      '.site-footer__brand-mark{width:42px;height:42px;display:inline-grid;place-items:center;border-radius:9px 9px 9px 2px;background:linear-gradient(155deg,#00A3E0 0%,#063A5A 52%,#151515 100%);color:#fff;font-size:13px}',
      '.site-footer__mast-actions{justify-self:end;display:flex;align-items:center;gap:clamp(14px,2vw,26px);font-size:15px;font-weight:700}',
      '.site-footer__mast-actions>a:not(.site-footer__quote){display:inline-flex;align-items:center;gap:9px}.site-footer__mast-actions svg{width:24px;height:24px}',
      '.site-footer__quote{min-height:58px;display:inline-flex;align-items:center;gap:14px;padding:0 10px 0 24px;border-radius:999px;background:#00A3E0;color:#fff;font-weight:900;white-space:nowrap}.site-footer__quote span:last-child{width:44px;height:44px;display:inline-grid;place-items:center;border-radius:50%;background:#fff;color:#151515;font-size:20px}.site-footer__quote svg{width:21px;height:21px;display:block}',
      '.site-footer__top{display:grid;grid-template-columns:1.05fr 1fr .95fr;gap:clamp(34px,5vw,78px);padding:62px 0 56px}',
      '.site-footer__brand-block h2{margin:0 0 22px;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:21px;line-height:1.12;font-weight:900;letter-spacing:-.03em}',
      '.site-footer__brand-block p,.site-footer__contact p{max-width:430px;margin:0 0 22px;font-size:17px;line-height:1.5}',
      '.site-footer__trust{display:flex;flex-wrap:wrap;gap:8px}',
      '.site-footer__trust span{padding:8px 10px;border:1px solid rgba(21,21,21,.1);border-radius:999px;background:#fff;font-size:12px;font-weight:800}',
      '.site-footer__menus{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:34px}',
      '.site-footer__menu-block h3,.site-footer__contact h2{margin:0 0 18px;font-size:16px;font-weight:900}',
      '.site-footer__menu-block ul{margin:0;padding:0;list-style:none}',
      '.site-footer__menu-block li{margin:0 0 12px}',
      '.site-footer__menu-block a,.site-footer__contact-links a{font-size:15px;line-height:1.35;font-weight:700}',
      '.site-footer__contact{padding:28px;border-radius:8px;background:#fff;box-shadow:0 18px 44px rgba(18,58,91,.08)}',
      '.site-footer__contact-links{display:grid;gap:12px;margin-bottom:24px}',
      '.site-footer__socials{display:flex;align-items:center;gap:18px}',
      '.site-footer__socials a{width:42px;height:42px;display:inline-grid;place-items:center;border:1px solid rgba(21,21,21,.18);border-radius:999px}',
      '.site-footer__socials svg{width:21px;height:21px;display:block}',
      '.site-footer__bottom{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:0 -24px;padding:24px;background:rgba(255,255,255,.62);font-size:14px;line-height:1.4}.site-footer__bottom nav{display:flex;align-items:center;gap:22px}',
      '.site-footer__accordion-button{display:none}',
      '@media (max-width:1180px){.site-header{background:transparent}.site-header__shell{padding:10px 12px}.site-header__desktop-row{display:none}.site-header__mobile-bar{min-height:58px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:10px 14px;border:1px solid rgba(21,21,21,.08);border-radius:999px;background:rgba(255,255,255,.96);box-shadow:0 18px 44px rgba(18,58,91,.12)}.site-header__mobile-bar .site-header__logo{flex-direction:row;align-items:center}.site-header__mobile-bar .site-header__logo-mark{width:34px;height:34px;font-size:11px}.site-header__mobile-bar .site-header__logo-text{font-size:16px}.site-header__mobile-toggle{width:44px;height:44px;display:inline-grid;place-items:center;border:0;border-radius:50%;background:#151515;color:#fff}.site-header__mobile-toggle svg{width:24px;height:24px;display:block}.site-header__drawer{position:fixed;inset:0;z-index:1001;display:flex;flex-direction:column;min-height:100dvh;overflow:auto;padding:22px 24px 28px;background:#fff;transform:translateX(104%);transition:transform .28s ease}.site-header.is-open .site-header__drawer{transform:translateX(0)}.site-header__drawer-top{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:38px}.site-header__drawer-close{width:42px;height:42px;border:0;background:transparent}.site-header__drawer-close svg{width:34px;height:34px}.site-header__drawer-logo{display:inline-flex;flex-direction:column;gap:8px;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:28px;font-weight:900;line-height:.95;letter-spacing:-.04em}.site-header__drawer-nav{display:grid;margin-bottom:32px}.site-header__drawer-nav a{min-height:62px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(21,21,21,.08);font-size:22px;font-weight:700}.site-header__chevron{width:24px;height:24px;flex:0 0 auto;color:#151515;transition:transform .2s ease}.site-header__drawer-nav a.is-active .site-header__chevron{transform:rotate(180deg)}.site-header__drawer-contact{display:grid;gap:20px;margin-bottom:34px}.site-header__drawer-contact a{display:flex;align-items:center;gap:16px;color:rgba(21,21,21,.78);font-size:18px;font-weight:600}.site-header__drawer-contact svg{width:28px;height:28px}.site-header__drawer-card{margin-top:auto}.site-header__drawer-card strong,.site-header__drawer-card p{display:none}.site-header__drawer-card a{min-height:74px;display:flex;align-items:center;justify-content:space-between;gap:16px;width:min(100%,340px);padding:0 12px 0 28px;border-radius:999px;background:#00A3E0;color:#fff;font-size:19px;font-weight:900}.site-header__drawer-card a span:last-child{width:54px;height:54px;display:inline-grid;place-items:center;border-radius:50%;background:#fff;color:#151515;font-size:25px}.site-footer__wrap{padding:44px 28px 0}.site-footer__masthead{grid-template-columns:1fr;gap:28px}.site-footer__mast-actions{justify-self:stretch;flex-wrap:wrap;justify-content:space-between}.site-footer__top{grid-template-columns:1fr;padding:46px 0 42px}.site-footer__bottom{margin:0 -28px;padding:22px 28px}}',
      '@media (max-width:720px){.site-footer__wrap{padding:34px 18px 0}.site-footer__masthead{padding-bottom:28px}.site-footer__mast-actions{display:grid;justify-content:stretch}.site-footer__quote{width:100%;justify-content:space-between}.site-footer__top{gap:0;padding:34px 0 28px}.site-footer__brand-block{margin-bottom:28px}.site-footer__menus{display:block;margin:0 -18px 32px;border-top:1px solid rgba(21,21,21,.18)}.site-footer__menu-block{border-bottom:1px solid rgba(21,21,21,.18)}.site-footer__accordion-button{width:100%;min-height:48px;display:flex;align-items:center;justify-content:space-between;border:0;padding:0 18px;background:transparent;color:#151515;font:inherit;font-size:15px;font-weight:900}.site-footer__accordion-icon{width:22px;height:22px;display:block;transition:transform .24s ease}.site-footer__accordion-button[aria-expanded="true"] .site-footer__accordion-icon{transform:rotate(180deg)}.site-footer__accordion-content{display:none;padding:0 18px 18px}.site-footer__menu-block.is-open .site-footer__accordion-content{display:block}.site-footer__accordion-content h3{display:none}.site-footer__contact{padding:20px}.site-footer__bottom{display:grid;margin:0 -18px;padding:20px 18px}.site-footer__bottom nav{flex-wrap:wrap;gap:12px 18px}}'
    ].join('');

    document.head.appendChild(style);
  }

  function fallbackHeader() {
    return [
      '<header id="site-header" class="site-header" data-header>',
      '<div class="site-header__shell">',
      '<div class="site-header__mobile-bar"><a href="/" class="site-header__logo" aria-label="Naar home"><span class="site-header__logo-mark">DK</span><span class="site-header__logo-text">De Kinkelder Cleaning</span></a><button class="site-header__mobile-toggle" type="button" aria-label="Menu openen" aria-expanded="false" data-mobile-menu-open><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button></div>',
      '<div class="site-header__desktop-row"><a href="/" class="site-header__logo" aria-label="Naar home"><span class="site-header__logo-mark">DK</span><span class="site-header__logo-text">De Kinkelder Cleaning</span></a>',
      '<nav class="site-header__nav site-header__nav--desktop" aria-label="Hoofdmenu">',
      '<a href="/" class="site-header__nav-link" data-nav-link>Home</a>',
      '<a href="/over-ons/" class="site-header__nav-link" data-nav-link>Over Ons</a>',
      '<a href="/projecten/" class="site-header__nav-link" data-nav-link>Projecten</a>',
      '<a href="/contact/" class="site-header__nav-link" data-nav-link>Contact</a>',
      '</nav>',
      '<div class="site-header__contact-strip"><a href="mailto:info@dekinkeldercleaning.nl"><span>Stuur ons een e-mail</span></a><a href="tel:+31612345678"><span>Bel ons: +31 6 12345678</span></a></div>',
      '<a class="site-header__action site-header__action--quote" href="/offerte-aanvragen/"><span>Offerte aanvragen</span><span class="site-header__action-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a></div></div>',
      '<div class="site-header__drawer" aria-hidden="true" data-mobile-drawer>',
      '<div class="site-header__drawer-top"><a href="/" class="site-header__drawer-logo"><span class="site-header__logo-mark">DK</span><span>De Kinkelder Cleaning</span></a><button class="site-header__drawer-close" type="button" aria-label="Menu sluiten" data-mobile-menu-close><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button></div>',
      '<nav class="site-header__drawer-nav" aria-label="Mobiel menu"><a href="/" data-nav-link><span>Home</span><svg class="site-header__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a><a href="/over-ons/" data-nav-link><span>Over Ons</span><svg class="site-header__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a><a href="/projecten/" data-nav-link><span>Projecten</span><svg class="site-header__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a><a href="/contact/" data-nav-link><span>Contact</span><svg class="site-header__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></a></nav>',
      '<div class="site-header__drawer-contact"><a href="mailto:info@dekinkeldercleaning.nl"><span>Stuur ons een e-mail</span></a><a href="tel:+31612345678"><span>Bel ons: +31 6 12345678</span></a></div>',
      '<div class="site-header__drawer-card"><strong>Gratis prijsinschatting?</strong><p>Stuur foto\'s via WhatsApp of vraag direct een vrijblijvende offerte aan.</p><a href="/offerte-aanvragen/"><span>Offerte aanvragen</span><span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a></div>',
      '</div></header>'
    ].join('');
  }

  function fallbackFooter() {
    return [
      '<footer id="site-footer" class="site-footer" data-footer>',
      '<div class="site-footer__wrap">',
      '<div class="site-footer__masthead"><a href="/" class="site-footer__brand"><span class="site-footer__brand-mark">DK</span><span>De Kinkelder Cleaning</span></a><div class="site-footer__mast-actions"><a href="mailto:info@dekinkeldercleaning.nl"><span>Stuur ons een e-mail</span></a><a href="tel:+31612345678"><span>Bel ons: +31 6 12345678</span></a><a class="site-footer__quote" href="/offerte-aanvragen/"><span>Offerte aanvragen</span><span aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a></div></div>',
      '<div class="site-footer__top">',
      '<div class="site-footer__brand-block"><h2>Professionele buitenreiniging</h2><p>Specialist in zonnepaneel reiniging, glasbewassing, dakkapel reiniging, boeireiniging, gevelbekleding en houtwerk reiniging.</p><div class="site-footer__trust"><span>Vrijblijvende offerte</span><span>Reactie binnen 24 uur</span><span>Particulier en zakelijk</span></div></div>',
      '<div class="site-footer__menus">',
      '<div class="site-footer__menu-block"><button class="site-footer__accordion-button" type="button" aria-expanded="false"><span>Menu</span><svg class="site-footer__accordion-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="site-footer__accordion-content"><h3>Menu</h3><ul><li><a href="/">Home</a></li><li><a href="/over-ons/">Over Ons</a></li><li><a href="/projecten/">Projecten</a></li><li><a href="/offerte-aanvragen/">Offerte aanvragen</a></li></ul></div></div>',
      '<div class="site-footer__menu-block"><button class="site-footer__accordion-button" type="button" aria-expanded="false"><span>Bedrijfsbeleid</span><svg class="site-footer__accordion-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="site-footer__accordion-content"><h3>Bedrijfsbeleid</h3><ul><li><a href="/algemene-voorwaarden/">Algemene voorwaarden</a></li><li><a href="/privacybeleid/">Privacybeleid</a></li><li><a href="/cookiebeleid/">Cookiebeleid</a></li></ul></div></div>',
      '</div>',
      '<div class="site-footer__contact"><h2>Contact</h2><p>Contact opnemen</p><div class="site-footer__contact-links"><a href="tel:+31612345678">+31 6 12345678</a><a href="mailto:info@dekinkeldercleaning.nl">info@dekinkeldercleaning.nl</a></div><div class="site-footer__socials" aria-label="Social media">',
      '<a href="https://www.instagram.com/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg></a>',
      '<a href="https://www.tiktok.com/" target="_blank" rel="noopener" aria-label="TikTok"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.2 2.5c.3 2.4 1.7 3.9 4.1 4.1v3.2c-1.4.1-2.7-.3-4-1.1v6.1c0 3.1-1.9 5.8-5.7 6.3-3.4.4-6.3-1.7-6.8-4.9-.6-3.7 2.3-6.7 6-6.5.3 0 .6.1.9.1v3.4c-.3-.1-.6-.2-1-.2-1.6 0-2.8 1.3-2.5 3 .2 1.2 1.2 2.1 2.5 2.1 1.5 0 2.6-1 2.6-2.8V2.5h3.9z" fill="currentColor"/></svg></a>',
      '<a href="https://www.facebook.com/" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 8.2V6.7c0-.7.4-1.1 1.2-1.1h1.8V2.5c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.7v1.1H7v3.5h3v9h3.7v-9h3l.5-3.5h-3z" fill="currentColor"/></svg></a>',
      '</div></div></div>',
      '<div class="site-footer__bottom"><span>&copy; <span data-current-year></span> De Kinkelder Cleaning. Alle rechten voorbehouden.</span><nav aria-label="Juridische footer links"><a href="/privacybeleid/">Privacybeleid</a><a href="/cookiebeleid/">Cookiebeleid</a><a href="/algemene-voorwaarden/">Algemene voorwaarden</a></nav></div>',
      '</div>',
      '</footer>'
    ].join('');
  }

  function getFallbackInclude(file) {
    var fileName = (file || '').split('?')[0].split('#')[0].split('/').pop();

    if (fileName === 'header.liquid') return fallbackHeader();
    if (fileName === 'footer.liquid') return fallbackFooter();
    return '';
  }

  function loadIncludes() {
    var includeNodes = document.querySelectorAll('[data-include]');
    var jobs = Array.prototype.map.call(includeNodes, function (node) {
      var file = node.getAttribute('data-include');
      var includeUrl = resolveIncludeUrl(file);

      return fetch(includeUrl)
        .then(function (response) {
          if (!response.ok) throw new Error('Include niet gevonden: ' + file);
          return response.text();
        })
        .then(function (html) {
          node.innerHTML = html;
          upgradeLegacyLinks(node);
          runScripts(node);
        })
        .catch(function (error) {
          var fallback = getFallbackInclude(file);

          if (!fallback) {
            console.error(error);
            return;
          }

          ensureFallbackStyles();
          node.innerHTML = fallback;
          upgradeLegacyLinks(node);
          console.warn('Include via fetch mislukt. Fallback gebruikt voor ' + file + '.', error);
        });
    });

    return Promise.all(jobs);
  }

  function initHeaderShell() {
    var header = document.querySelector('[data-header], [data-site-header]');
    if (!header || header.dataset.jsReady === 'true') return;

    /*
     * Ondersteunt beide header-structuren:
     * 1. De bestaande header.liquid:
     *    data-header, data-mobile-menu-open en data-mobile-drawer.
     * 2. De nieuwere sticky/flying header:
     *    data-site-header, data-menu-toggle en data-site-nav.
     */
    var openButton = header.querySelector(
      '[data-mobile-menu-open], [data-menu-toggle]'
    );
    var closeButton = header.querySelector('[data-mobile-menu-close]');
    var drawer = header.querySelector(
      '[data-mobile-drawer], [data-site-nav]'
    );
    var links = header.querySelectorAll('[data-nav-link], .site-nav__link');
    var mobileQuery = window.matchMedia('(max-width: 1180px)');
    var lastFocusedElement = null;
    var previousBodyOverflow = '';
    var scrollFrame = null;

    function isMobileNavigation() {
      if (!openButton) return false;

      /*
       * De daadwerkelijke CSS-weergave is leidend. Hierdoor blijft de JS
       * ook correct wanneer het mobiele breakpoint later wordt gewijzigd.
       */
      return window.getComputedStyle(openButton).display !== 'none';
    }

    function isMenuOpen() {
      return (
        header.classList.contains('is-open') ||
        header.classList.contains('nav-open')
      );
    }

    function setDrawerAccessibility(isOpen) {
      if (!drawer) return;

      if (isMobileNavigation()) {
        drawer.setAttribute('aria-hidden', String(!isOpen));
      } else {
        drawer.removeAttribute('aria-hidden');
      }
    }

    function getFocusableElements() {
      if (!drawer) return [];

      return Array.prototype.slice
        .call(
          drawer.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), ' +
            'select:not([disabled]), textarea:not([disabled]), ' +
            '[tabindex]:not([tabindex="-1"])'
          )
        )
        .filter(function (element) {
          return (
            !element.hasAttribute('hidden') &&
            window.getComputedStyle(element).visibility !== 'hidden' &&
            window.getComputedStyle(element).display !== 'none'
          );
        });
    }

    function openMenu() {
      if (!drawer || !isMobileNavigation()) return;

      lastFocusedElement = document.activeElement;
      previousBodyOverflow = document.body.style.overflow;

      header.classList.add('is-open');
      header.classList.add('nav-open');
      document.body.classList.add('is-menu-open');
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';

      if (openButton) {
        openButton.setAttribute('aria-expanded', 'true');
        openButton.setAttribute('aria-label', 'Menu sluiten');
      }

      setDrawerAccessibility(true);

      window.requestAnimationFrame(function () {
        var focusableElements = getFocusableElements();
        var preferredFocus =
          closeButton ||
          drawer.querySelector('.site-nav__link, [data-nav-link], a[href], button');

        if (preferredFocus && focusableElements.indexOf(preferredFocus) !== -1) {
          preferredFocus.focus();
        }
      });
    }

    function closeMenu(options) {
      var settings = options || {};
      var wasOpen = isMenuOpen();

      header.classList.remove('is-open');
      header.classList.remove('nav-open');
      document.body.classList.remove('is-menu-open');
      document.body.classList.remove('menu-open');
      document.body.style.overflow = previousBodyOverflow;

      if (openButton) {
        openButton.setAttribute('aria-expanded', 'false');
        openButton.setAttribute('aria-label', 'Menu openen');
      }

      setDrawerAccessibility(false);

      if (
        wasOpen &&
        settings.restoreFocus === true &&
        lastFocusedElement &&
        typeof lastFocusedElement.focus === 'function'
      ) {
        lastFocusedElement.focus();
      }
    }

    function toggleMenu() {
      if (isMenuOpen()) {
        closeMenu({ restoreFocus: false });
      } else {
        openMenu();
      }
    }

    function updateStickyState() {
      if (scrollFrame !== null) return;

      scrollFrame = window.requestAnimationFrame(function () {
        header.classList.toggle('is-scrolled', window.scrollY > 10);
        scrollFrame = null;
      });
    }

    function updateActiveLinks() {
      var currentPath = normalizeCleanPath(window.location.pathname);
      var currentHash = window.location.hash || '';

      links.forEach(function (link) {
        var href = link.getAttribute('href');
        if (!href) return;

        var linkUrl;

        try {
          linkUrl = new URL(href, window.location.href);
        } catch (error) {
          return;
        }

        var linkPath = normalizeCleanPath(linkUrl.pathname);
        var samePage = linkPath === currentPath;
        var isHashLink = href.charAt(0) === '#';
        var isActive = false;

        if (isHashLink) {
          isActive = linkUrl.hash === currentHash;
        } else if (linkUrl.hash && samePage) {
          isActive = linkUrl.hash === currentHash;
        } else {
          isActive = samePage;
        }

        link.classList.toggle('is-active', isActive);

        if (isActive) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    function handleLinkClick(event) {
      var link = event.currentTarget;
      var href = link.getAttribute('href') || '';

      links.forEach(function (item) {
        item.classList.remove('is-active');
        item.removeAttribute('aria-current');
      });

      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');

      if (isMobileNavigation()) {
        closeMenu({ restoreFocus: false });
      }

      /*
       * Een hash-link op dezelfde pagina wordt door de browser afgehandeld.
       * De sticky header krijgt via CSS scroll-margin/scroll-padding ruimte.
       */
      if (href.charAt(0) === '#') {
        window.setTimeout(updateActiveLinks, 0);
      }
    }

    function handleDocumentClick(event) {
      if (
        !isMobileNavigation() ||
        !isMenuOpen() ||
        header.contains(event.target)
      ) {
        return;
      }

      closeMenu({ restoreFocus: false });
    }

    function handleKeydown(event) {
      if (!isMenuOpen()) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu({ restoreFocus: true });
        return;
      }

      if (event.key !== 'Tab' || !isMobileNavigation()) return;

      var focusableElements = getFocusableElements();
      if (!focusableElements.length) {
        event.preventDefault();
        return;
      }

      var firstElement = focusableElements[0];
      var lastElement = focusableElements[focusableElements.length - 1];
      var activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    function handleViewportChange() {
      if (!isMobileNavigation()) {
        closeMenu({ restoreFocus: false });
        if (drawer) drawer.removeAttribute('aria-hidden');
      } else {
        setDrawerAccessibility(isMenuOpen());
      }
    }

    if (openButton) {
      openButton.addEventListener('click', toggleMenu);
      openButton.setAttribute('aria-expanded', 'false');
      openButton.setAttribute('aria-label', 'Menu openen');
    }

    if (closeButton) {
      closeButton.addEventListener('click', function () {
        closeMenu({ restoreFocus: true });
      });
    }

    links.forEach(function (link) {
      link.addEventListener('click', handleLinkClick);
    });

    /*
     * Bij een drawer met een lege achtergrond kan daarop worden geklikt
     * om het menu te sluiten. Klikken op de inhoud sluit het menu niet.
     */
    if (drawer) {
      drawer.addEventListener('click', function (event) {
        if (event.target === drawer && isMenuOpen()) {
          closeMenu({ restoreFocus: false });
        }
      });
    }

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('scroll', updateStickyState, { passive: true });
    window.addEventListener('hashchange', updateActiveLinks);

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', handleViewportChange);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(handleViewportChange);
    }

    updateStickyState();
    updateActiveLinks();
    handleViewportChange();

    header.dataset.jsReady = 'true';
  }

  function initFooterShell() {
    var footer = document.querySelector('[data-footer]');
    if (!footer || footer.dataset.jsReady === 'true') return;

    var yearNode = footer.querySelector('[data-current-year]');
    var accordionButtons = footer.querySelectorAll('.site-footer__accordion-button');

    if (yearNode) yearNode.textContent = new Date().getFullYear();

    accordionButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var block = button.closest('.site-footer__menu-block');
        var isOpen = block.classList.toggle('is-open');
        button.setAttribute('aria-expanded', String(isOpen));
      });
    });

    footer.dataset.jsReady = 'true';
  }

  function setViewportMode() {
    var root = document.documentElement;
    var width = window.innerWidth;

    root.classList.toggle('is-mobile', width < 760);
    root.classList.toggle('is-tablet', width >= 760 && width < 1180);
    root.classList.toggle('is-desktop', width >= 1180);
  }

  function initQuoteForm() {
    var form = document.querySelector('[data-quote-form]');
    if (!form || form.dataset.jsReady === 'true') return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var formData = new FormData(form);
      var params = new URLSearchParams();

      formData.forEach(function (value, key) {
        if (value) params.set(key, value);
      });

      window.location.href = '/offerte-aanvragen/' + (params.toString() ? '?' + params.toString() : '');
    });

    form.dataset.jsReady = 'true';
  }

  function initRevealCards() {
    var cards = document.querySelectorAll('[data-reveal]:not(.is-observed)');
    if (!cards.length) return;

    if (!('IntersectionObserver' in window)) {
      cards.forEach(function (card) {
        card.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18 });

    cards.forEach(function (card) {
      card.classList.add('is-observed');
      observer.observe(card);
    });
  }

  function initRails() {
    var controls = document.querySelectorAll('[data-rail-prev], [data-rail-next]');

    controls.forEach(function (button) {
      if (button.dataset.jsReady === 'true') return;

      button.addEventListener('click', function () {
        var wrap = button.closest('.rail-wrap');
        var rail = wrap ? wrap.querySelector('[data-rail]') : button.parentElement.previousElementSibling;

        if (!rail) return;

        var direction = button.hasAttribute('data-rail-prev') ? -1 : 1;
        rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: 'smooth' });
      });

      button.dataset.jsReady = 'true';
    });
  }

  function initPage() {
    upgradeLegacyLinks(document);
    setViewportMode();
    initHeaderShell();
    initFooterShell();
    initQuoteForm();
    initRevealCards();
    initRails();
    window.addEventListener('resize', setViewportMode);
  }

  document.documentElement.classList.add('js');
  document.body.classList.add('is-loading');

  loadIncludes()
    .finally(function () {
      document.body.classList.remove('is-loading');
      initPage();
    });
})();

/* Contactpagina: typekeuze, dynamische velden en FAQ-gedrag. */
(function () {
  function initContactPage() {
    var form = document.querySelector('[data-contact-form]');
    if (!form || form.dataset.contactReady === 'true') return;

    var choiceButtons = document.querySelectorAll('[data-contact-choice]');
    var typeInputs = form.querySelectorAll('input[name="type"]');
    var serviceField = form.querySelector('[data-service-field]');
    var serviceSelect = form.querySelector('[data-service-select]');
    var locationField = form.querySelector('[data-location-field]');
    var locationInput = form.querySelector('[data-location-input]');
    var fileField = form.querySelector('[data-file-field]');
    var formTitle = document.querySelector('[data-contact-form-title]');
    var messageLabel = form.querySelector('[data-message-label]');
    var submitLabel = form.querySelector('[data-submit-label]');

    var copy = {
      vraag: {
        title: 'Waar kunnen we u mee helpen?',
        message: 'Uw vraag',
        submit: 'Vraag versturen'
      },
      hulp: {
        title: 'Vertel ons waarbij u advies nodig heeft.',
        message: 'Omschrijf de situatie',
        submit: 'Hulpvraag versturen'
      },
      offerte: {
        title: 'Start uw vrijblijvende offerteaanvraag.',
        message: 'Omschrijf de werkzaamheden',
        submit: 'Offerte starten'
      }
    };

    function getSelectedType() {
      var checked = form.querySelector('input[name="type"]:checked');
      return checked ? checked.value : 'vraag';
    }

    function setRequired(element, required) {
      if (!element) return;
      element.required = required;
      element.setAttribute('aria-required', String(required));
    }

    function updateForm(type) {
      var selectedType = copy[type] ? type : 'vraag';
      var needsService = selectedType === 'hulp' || selectedType === 'offerte';
      var needsLocation = selectedType === 'offerte';

      if (serviceField) serviceField.hidden = !needsService;
      if (locationField) locationField.hidden = !needsLocation;
      if (fileField) fileField.hidden = selectedType === 'vraag';

      setRequired(serviceSelect, needsService);
      setRequired(locationInput, needsLocation);

      if (formTitle) formTitle.textContent = copy[selectedType].title;
      if (messageLabel) messageLabel.innerHTML = copy[selectedType].message + ' <em>*</em>';
      if (submitLabel) submitLabel.textContent = copy[selectedType].submit;
    }

    function selectType(type, shouldScroll) {
      var input = form.querySelector('input[name="type"][value="' + type + '"]');
      if (!input) return;

      input.checked = true;
      updateForm(type);

      if (shouldScroll) {
        var target = document.getElementById('contactformulier');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        window.setTimeout(function () {
          var firstField = form.querySelector('input[name="naam"]');
          if (firstField) firstField.focus({ preventScroll: true });
        }, 520);
      }
    }

    typeInputs.forEach(function (input) {
      input.addEventListener('change', function () {
        updateForm(input.value);
      });
    });

    choiceButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        selectType(button.getAttribute('data-contact-choice') || 'vraag', true);
      });
    });

    form.addEventListener('submit', function (event) {
      if (getSelectedType() !== 'offerte') return;

      event.preventDefault();

      if (!form.reportValidity()) return;

      var params = new URLSearchParams();
      if (serviceSelect && serviceSelect.value) params.set('dienst', serviceSelect.value);
      if (locationInput && locationInput.value) params.set('locatie', locationInput.value);
      params.set('bron', 'contactpagina');

      window.location.href = '/offerte-aanvragen/' + (params.toString() ? '?' + params.toString() : '');
    });

    updateForm(getSelectedType());
    form.dataset.contactReady = 'true';
  }

  function initContactFaq() {
    var faq = document.querySelector('[data-contact-faq]');
    if (!faq || faq.dataset.contactReady === 'true') return;

    faq.querySelectorAll('details').forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;

        faq.querySelectorAll('details[open]').forEach(function (otherItem) {
          if (otherItem !== item) otherItem.open = false;
        });
      });
    });

    faq.dataset.contactReady = 'true';
  }

  function startContactPage() {
    initContactPage();
    initContactFaq();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startContactPage);
  } else {
    startContactPage();
  }
})();
/* =========================================================
   Contactkenmerken: vloeiende automatische strook
   Bouwt de bestaande statische spans om tot twee identieke,
   voldoende brede groepen voor een naadloze beweging.
   ========================================================= */
(function () {
  'use strict';

  function initContactTrustStrips() {
    var strips = document.querySelectorAll('.contact-trust-strip');

    strips.forEach(function (strip) {
      if (strip.dataset.marqueeReady === 'true') return;

      var inner = strip.querySelector('.contact-trust-strip__inner');
      if (!inner) return;

      var originalLabels = Array.prototype.slice
        .call(inner.querySelectorAll(':scope > span'))
        .map(function (span) {
          return span.textContent.trim();
        })
        .filter(Boolean);

      /* Ondersteun ook een pagina waarop de track al in de HTML staat. */
      if (!originalLabels.length) {
        var existingGroup = inner.querySelector('.contact-trust-strip__group');
        if (existingGroup) {
          originalLabels = Array.prototype.slice
            .call(existingGroup.querySelectorAll('span'))
            .map(function (span) {
              return span.textContent.trim();
            })
            .filter(Boolean);
        }
      }

      if (!originalLabels.length) return;

      var track = document.createElement('div');
      var firstGroup = document.createElement('div');
      var resizeTimer = null;

      track.className = 'contact-trust-strip__track';
      firstGroup.className = 'contact-trust-strip__group';
      track.setAttribute('aria-label', strip.getAttribute('aria-label') || 'Contactkenmerken');

      function appendLabelSet(group) {
        originalLabels.forEach(function (label) {
          var span = document.createElement('span');
          span.textContent = label;
          group.appendChild(span);
        });
      }

      function restartAnimation() {
        track.style.animation = 'none';
        /* Forceer één reflow zodat de animatie opnieuw vanaf nul start. */
        void track.offsetWidth;
        track.style.animation = '';
      }

      function getPixelsPerSecond() {
        var viewportWidth = window.innerWidth || document.documentElement.clientWidth;

        /* Dezelfde rustige, gelijkmatige waarneming als de Home-strook. */
        if (viewportWidth <= 390) return 42;
        if (viewportWidth <= 767) return 44;
        if (viewportWidth <= 1024) return 46;
        return 48;
      }

      function ensureSeamlessWidth() {
        var minimumWidth = Math.max(strip.clientWidth + 1, 720);
        var safetyCounter = 0;

        /* Bij iedere meting opnieuw beginnen voorkomt ongewenste ophoping
           van labels na draaien of schalen van het scherm. */
        firstGroup.replaceChildren();
        appendLabelSet(firstGroup);

        while (firstGroup.scrollWidth < minimumWidth && safetyCounter < 12) {
          appendLabelSet(firstGroup);
          safetyCounter += 1;
        }

        var oldClone = track.querySelector('[data-marquee-clone]');
        if (oldClone) oldClone.remove();

        var clone = firstGroup.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('data-marquee-clone', '');
        track.appendChild(clone);

        /* Een vaste snelheid in pixels per seconde voorkomt dat een bredere
           contactgroep sneller beweegt dan de strook op de Home-pagina. */
        var cycleWidth = firstGroup.getBoundingClientRect().width || firstGroup.scrollWidth;
        var duration = Math.max(18, cycleWidth / getPixelsPerSecond());
        track.style.setProperty('--contact-trust-duration', duration.toFixed(2) + 's');

        restartAnimation();
      }

      appendLabelSet(firstGroup);
      track.appendChild(firstGroup);
      inner.replaceChildren(track);
      inner.classList.add('is-marquee-ready');
      strip.dataset.marqueeReady = 'true';

      window.requestAnimationFrame(ensureSeamlessWidth);

      if ('ResizeObserver' in window) {
        var observer = new ResizeObserver(function () {
          window.clearTimeout(resizeTimer);
          resizeTimer = window.setTimeout(ensureSeamlessWidth, 120);
        });
        observer.observe(strip);
      } else {
        window.addEventListener('resize', function () {
          window.clearTimeout(resizeTimer);
          resizeTimer = window.setTimeout(ensureSeamlessWidth, 160);
        });
      }
    });
  }

  function startContactTrustStrips() {
    initContactTrustStrips();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startContactTrustStrips, { once: true });
  } else {
    startContactTrustStrips();
  }
})();

/* =========================================================
   Contactpagina: foto-upload met lokale voorbeeldweergave.
   De bestanden worden niet naar een externe dienst gestuurd;
   de voorbeelden worden uitsluitend in de browser opgebouwd.
   ========================================================= */
(function () {
  'use strict';

  var MAX_FILE_SIZE = 10 * 1024 * 1024;

  function fileKey(file) {
    return [file.name, file.size, file.lastModified].join('::');
  }

  function initContactFileUpload(field) {
    if (!field || field.dataset.fileUploadReady === 'true') return;

    var input = field.querySelector('[data-file-input], input[type="file"]');
    if (!input) return;

    var shell = field.querySelector('[data-file-upload]');
    var preview = field.querySelector('[data-file-preview]');
    var feedback = field.querySelector('[data-file-feedback]');
    var selectedFiles = Array.prototype.slice.call(input.files || []);

    /* Ondersteun ook oudere contact.html-versies zonder preview-markup. */
    if (!shell) {
      shell = document.createElement('div');
      shell.className = 'contact-file-upload';
      shell.setAttribute('data-file-upload', '');
      input.parentNode.insertBefore(shell, input);
      shell.appendChild(input);
    }

    if (!preview) {
      preview = document.createElement('div');
      preview.className = 'contact-file-upload__preview';
      preview.setAttribute('data-file-preview', '');
      preview.setAttribute('aria-live', 'polite');
      preview.hidden = true;
      shell.appendChild(preview);
    }

    if (!feedback) {
      feedback = document.createElement('p');
      feedback.className = 'contact-file-upload__feedback';
      feedback.setAttribute('data-file-feedback', '');
      feedback.setAttribute('aria-live', 'polite');
      feedback.hidden = true;
      shell.appendChild(feedback);
    }

    function syncNativeInput() {
      if (typeof DataTransfer === 'undefined') return;

      var transfer = new DataTransfer();
      selectedFiles.forEach(function (file) {
        transfer.items.add(file);
      });
      input.files = transfer.files;
    }

    function showFeedback(messages) {
      var text = messages.filter(Boolean).join(' ');
      feedback.textContent = text;
      feedback.hidden = !text;
    }

    function removeFile(index) {
      selectedFiles.splice(index, 1);
      syncNativeInput();
      renderPreviews();
      showFeedback([]);
    }

    function createRemoveButton(index, fileName) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'contact-file-preview__remove';
      button.setAttribute('aria-label', 'Verwijder ' + fileName);
      button.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
        '</svg>';

      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        removeFile(index);
      });

      return button;
    }

    function renderPreviews() {
      preview.replaceChildren();
      preview.hidden = selectedFiles.length === 0;

      selectedFiles.forEach(function (file, index) {
        var item = document.createElement('figure');
        var image = document.createElement('img');
        var caption = document.createElement('figcaption');
        var objectUrl = URL.createObjectURL(file);

        item.className = 'contact-file-preview';
        image.src = objectUrl;
        image.alt = 'Voorbeeld van ' + file.name;
        image.loading = 'lazy';
        image.decoding = 'async';
        image.addEventListener('load', function () {
          URL.revokeObjectURL(objectUrl);
        }, { once: true });
        image.addEventListener('error', function () {
          URL.revokeObjectURL(objectUrl);
        }, { once: true });

        caption.className = 'contact-file-preview__name';
        caption.textContent = file.name;
        caption.title = file.name;

        item.appendChild(image);
        item.appendChild(caption);
        item.appendChild(createRemoveButton(index, file.name));
        preview.appendChild(item);
      });
    }

    input.addEventListener('change', function () {
      var incomingFiles = Array.prototype.slice.call(input.files || []);
      var knownKeys = new Set(selectedFiles.map(fileKey));
      var messages = [];

      incomingFiles.forEach(function (file) {
        if (!file.type || file.type.indexOf('image/') !== 0) {
          messages.push(file.name + ' is geen ondersteunde afbeelding.');
          return;
        }

        if (file.size > MAX_FILE_SIZE) {
          messages.push(file.name + ' is groter dan 10 MB.');
          return;
        }

        var key = fileKey(file);
        if (!knownKeys.has(key)) {
          selectedFiles.push(file);
          knownKeys.add(key);
        }
      });

      syncNativeInput();
      renderPreviews();
      showFeedback(messages);
    });

    var form = field.closest('form');
    if (form) {
      form.addEventListener('reset', function () {
        window.setTimeout(function () {
          selectedFiles = [];
          syncNativeInput();
          renderPreviews();
          showFeedback([]);
        }, 0);
      });
    }

    syncNativeInput();
    renderPreviews();
    field.dataset.fileUploadReady = 'true';
  }

  function startContactFileUploads() {
    document.querySelectorAll('[data-file-field]').forEach(initContactFileUpload);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startContactFileUploads, { once: true });
  } else {
    startContactFileUploads();
  }
})();