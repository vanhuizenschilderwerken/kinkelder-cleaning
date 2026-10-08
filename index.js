(function () {
  "use strict";

  /* =========================================================
     INSTELLINGEN
     ========================================================= */
  var MOBILE_BREAKPOINT = 1180;
  var MAX_UPLOAD_TOTAL = 10 * 1024 * 1024;

  /* Web3Forms-key voor info@dekinkeldercleaning.nl */
  var WEB3FORMS_ACCESS_KEY = "632cedec-5574-4c86-ae0e-1483cef3715b";
  var WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

  var fallbackStylesAdded = false;

  document.documentElement.classList.add("js");


  /* =========================================================
     ALGEMENE HELPERS
     ========================================================= */

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        callback,
        { once: true }
      );
    } else {
      callback();
    }
  }


  function normalizeCleanPath(pathname) {
    var path = pathname || "/";

    try {
      path = decodeURIComponent(path);
    } catch (error) {
      /* Gebruik originele pad wanneer decoderen niet lukt. */
    }

    path = path
      .replace(/\\/g, "/")
      .replace(/\/+/g, "/")
      .replace(/\/(?:home|index)\.html?$/i, "/")
      .replace(/\.html?$/i, "/");

    if (path.charAt(0) !== "/") {
      path = "/" + path;
    }

    if (
      path !== "/" &&
      path.charAt(path.length - 1) !== "/"
    ) {
      path += "/";
    }

    return path || "/";
  }


  function convertLegacyPageUrl(value) {
    var rawValue =
      (value || "").trim();

    if (
      !rawValue ||
      rawValue.charAt(0) === "#" ||
      /^(?:mailto:|tel:|sms:|javascript:|data:)/i.test(
        rawValue
      )
    ) {
      return rawValue;
    }

    var url;

    try {
      url = new URL(
        rawValue,
        window.location.href
      );
    } catch (error) {
      return rawValue;
    }

    if (
      url.origin !==
      window.location.origin
    ) {
      return rawValue;
    }

    if (
      !/\.html?$/i.test(
        url.pathname
      )
    ) {
      return rawValue;
    }

    return (
      normalizeCleanPath(
        url.pathname
      ) +
      url.search +
      url.hash
    );
  }


  function upgradeLegacyLinks(root) {
    var scope =
      root &&
      root.querySelectorAll
        ? root
        : document;

    scope
      .querySelectorAll(
        "a[href], form[action]"
      )
      .forEach(
        function (element) {
          var attribute =
            element.tagName === "FORM"
              ? "action"
              : "href";

          var oldValue =
            element.getAttribute(
              attribute
            );

          var newValue =
            convertLegacyPageUrl(
              oldValue
            );

          if (
            newValue &&
            newValue !== oldValue
          ) {
            element.setAttribute(
              attribute,
              newValue
            );
          }
        }
      );
  }


  function resolveIncludeUrl(file) {
    var value =
      (file || "").trim();

    if (!value) {
      return value;
    }

    if (
      /^(?:https?:)?\/\//i.test(
        value
      ) ||
      value.charAt(0) === "/"
    ) {
      return value;
    }

    return (
      "/" +
      value
        .replace(/^\.\//, "")
        .replace(/^\/+/, "")
    );
  }


  function runScripts(container) {
    if (!container) {
      return;
    }

    container
      .querySelectorAll(
        "script"
      )
      .forEach(
        function (oldScript) {
          var newScript =
            document.createElement(
              "script"
            );

          Array.prototype
            .slice.call(
              oldScript.attributes
            )
            .forEach(
              function (
                attribute
              ) {
                newScript.setAttribute(
                  attribute.name,
                  attribute.value
                );
              }
            );

          newScript.text =
            oldScript.textContent;

          oldScript.replaceWith(
            newScript
          );
        }
      );
  }


  function setViewportMode() {
    var root =
      document.documentElement;

    var width =
      window.innerWidth;

    root.classList.toggle(
      "is-mobile",
      width < 760
    );

    root.classList.toggle(
      "is-tablet",
      width >= 760 &&
        width < 1180
    );

    root.classList.toggle(
      "is-desktop",
      width >= 1180
    );
  }


  function initCurrentYear() {
    document
      .querySelectorAll(
        "[data-current-year]"
      )
      .forEach(
        function (node) {
          node.textContent =
            String(
              new Date()
                .getFullYear()
            );
        }
      );
  }


  /* =========================================================
     FALLBACK HEADER / FOOTER
     ========================================================= */

  function ensureFallbackStyles() {
    if (
      fallbackStylesAdded ||
      document.querySelector(
        "[data-fallback-shell-styles]"
      )
    ) {
      return;
    }

    fallbackStylesAdded = true;

    var style =
      document.createElement(
        "style"
      );

    style.setAttribute(
      "data-fallback-shell-styles",
      ""
    );

    style.textContent = [
      ".site-header,.site-header *,.site-footer,.site-footer *{box-sizing:border-box}",
      "body.is-menu-open,body.menu-open{overflow:hidden}",
      ".site-header{position:sticky;top:0;z-index:1000;width:100%;background:#EEF6FA;color:#151515;font-family:Inter,Arial,Helvetica,sans-serif}",
      ".site-header a,.site-footer a{text-decoration:none;color:inherit}",
      ".site-header__shell{max-width:1440px;margin:0 auto;padding:20px 24px}",
      ".site-header__desktop-row{min-height:86px;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:10px 12px 10px 18px;border:1px solid rgba(21,21,21,.06);border-radius:999px;background:rgba(255,255,255,.96);box-shadow:0 24px 70px rgba(18,58,91,.12)}",
      ".site-header__logo{display:inline-flex;align-items:center;gap:12px;font-weight:900}",
      ".site-header__logo-mark{width:42px;height:42px;display:inline-grid;place-items:center;border-radius:9px 9px 9px 2px;background:linear-gradient(155deg,#00A3E0 0%,#063A5A 52%,#151515 100%);color:#fff;font-size:13px}",
      ".site-header__nav--desktop{display:flex;align-items:center;justify-content:center;gap:24px}",
      ".site-header__mobile-bar,.site-header__drawer{display:none}",
      ".site-footer{margin-top:80px;background:#EEF6FA;color:#151515;font-family:Inter,Arial,Helvetica,sans-serif}",
      ".site-footer__wrap{max-width:1180px;margin:0 auto;padding:46px 24px 0}",
      ".site-footer__top{display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:40px;padding:42px 0}",
      ".site-footer__menus{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px}",
      ".site-footer__menu-block ul{list-style:none;margin:0;padding:0}",
      ".site-footer__accordion-button{display:none}",
      ".site-footer__bottom{padding:20px 0;border-top:1px solid rgba(21,21,21,.12)}",
      "@media(max-width:1180px){.site-header__desktop-row{display:none}.site-header__mobile-bar{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:999px;background:#fff}.site-header__mobile-toggle{width:44px;height:44px;border:0;border-radius:50%;background:#151515;color:#fff}.site-header__drawer{position:fixed;inset:0;z-index:1001;display:flex;flex-direction:column;overflow:auto;padding:24px;background:#fff;transform:translateX(104%);transition:transform .28s ease}.site-header.is-open .site-header__drawer,.site-header.nav-open .site-header__drawer{transform:translateX(0)}.site-header__drawer-nav{display:grid}.site-header__drawer-nav a{padding:18px 0;border-bottom:1px solid rgba(21,21,21,.08)}.site-footer__top{grid-template-columns:1fr}.site-footer__menus{grid-template-columns:1fr 1fr}}",
      "@media(max-width:720px){.site-footer__wrap{padding-inline:18px}.site-footer__menus{display:block}.site-footer__accordion-button{display:flex;width:100%;justify-content:space-between;border:0;padding:14px 0;background:transparent}.site-footer__accordion-content{display:none}.site-footer__menu-block.is-open .site-footer__accordion-content{display:block}}"
    ].join("");

    document.head.appendChild(
      style
    );
  }


  function fallbackHeader() {
    return [
      '<header id="site-header" class="site-header" data-header>',
      '<div class="site-header__shell">',
      '<div class="site-header__mobile-bar">',
      '<a href="/" class="site-header__logo" aria-label="Naar home"><span class="site-header__logo-mark">DK</span><span>De Kinkelder Cleaning</span></a>',
      '<button class="site-header__mobile-toggle" type="button" aria-label="Menu openen" aria-expanded="false" data-mobile-menu-open>☰</button>',
      "</div>",
      '<div class="site-header__desktop-row">',
      '<a href="/" class="site-header__logo" aria-label="Naar home"><span class="site-header__logo-mark">DK</span><span>De Kinkelder Cleaning</span></a>',
      '<nav class="site-header__nav site-header__nav--desktop" aria-label="Hoofdmenu">',
      '<a href="/" data-nav-link>Home</a>',
      '<a href="/over-ons/" data-nav-link>Over Ons</a>',
      '<a href="/projecten/" data-nav-link>Projecten</a>',
      '<a href="/contact/" data-nav-link>Contact</a>',
      "</nav>",
      '<a href="/offerte-aanvragen/">Offerte aanvragen</a>',
      "</div>",
      "</div>",
      '<div class="site-header__drawer" aria-hidden="true" data-mobile-drawer>',
      '<button type="button" aria-label="Menu sluiten" data-mobile-menu-close>×</button>',
      '<nav class="site-header__drawer-nav" aria-label="Mobiel menu">',
      '<a href="/" data-nav-link>Home</a>',
      '<a href="/over-ons/" data-nav-link>Over Ons</a>',
      '<a href="/projecten/" data-nav-link>Projecten</a>',
      '<a href="/contact/" data-nav-link>Contact</a>',
      '<a href="/offerte-aanvragen/" data-nav-link>Offerte aanvragen</a>',
      "</nav>",
      "</div>",
      "</header>"
    ].join("");
  }


  function fallbackFooter() {
    return [
      '<footer id="site-footer" class="site-footer" data-footer>',
      '<div class="site-footer__wrap">',
      '<div class="site-footer__top">',
      "<div><h2>De Kinkelder Cleaning</h2><p>Professionele buitenreiniging in Twente en omgeving.</p></div>",
      '<div class="site-footer__menus">',
      '<div class="site-footer__menu-block">',
      '<button class="site-footer__accordion-button" type="button" aria-expanded="false"><span>Menu</span><span>⌄</span></button>',
      '<div class="site-footer__accordion-content"><h3>Menu</h3><ul><li><a href="/">Home</a></li><li><a href="/over-ons/">Over Ons</a></li><li><a href="/projecten/">Projecten</a></li><li><a href="/offerte-aanvragen/">Offerte aanvragen</a></li></ul></div>',
      "</div>",
      '<div class="site-footer__menu-block">',
      '<button class="site-footer__accordion-button" type="button" aria-expanded="false"><span>Bedrijfsbeleid</span><span>⌄</span></button>',
      '<div class="site-footer__accordion-content"><h3>Bedrijfsbeleid</h3><ul><li><a href="/algemene-voorwaarden/">Algemene voorwaarden</a></li><li><a href="/privacybeleid/">Privacybeleid</a></li><li><a href="/cookiebeleid/">Cookiebeleid</a></li></ul></div>',
      "</div>",
      "</div>",
      '<div><h2>Contact</h2><p><a href="mailto:info@dekinkeldercleaning.nl">info@dekinkeldercleaning.nl</a></p></div>',
      "</div>",
      '<div class="site-footer__bottom">&copy; <span data-current-year></span> De Kinkelder Cleaning. Alle rechten voorbehouden.</div>',
      "</div>",
      "</footer>"
    ].join("");
  }


  function getFallbackInclude(file) {
    var fileName =
      (file || "")
        .split("?")[0]
        .split("#")[0]
        .split("/")
        .pop();

    if (
      fileName ===
      "header.liquid"
    ) {
      return fallbackHeader();
    }

    if (
      fileName ===
      "footer.liquid"
    ) {
      return fallbackFooter();
    }

    return "";
  }


  function loadIncludes() {
    var includeNodes =
      document.querySelectorAll(
        "[data-include]"
      );

    var jobs =
      Array.prototype.map.call(
        includeNodes,
        function (node) {
          var file =
            node.getAttribute(
              "data-include"
            );

          var includeUrl =
            resolveIncludeUrl(
              file
            );

          return fetch(
            includeUrl
          )
            .then(
              function (response) {
                if (
                  !response.ok
                ) {
                  throw new Error(
                    "Include niet gevonden: " +
                      file
                  );
                }

                return response.text();
              }
            )
            .then(
              function (html) {
                node.innerHTML =
                  html;

                upgradeLegacyLinks(
                  node
                );

                runScripts(
                  node
                );
              }
            )
            .catch(
              function (error) {
                var fallback =
                  getFallbackInclude(
                    file
                  );

                if (!fallback) {
                  console.error(
                    error
                  );
                  return;
                }

                ensureFallbackStyles();

                node.innerHTML =
                  fallback;

                upgradeLegacyLinks(
                  node
                );

                console.warn(
                  "Include via fetch mislukt. Fallback gebruikt voor " +
                    file +
                    ".",
                  error
                );
              }
            );
        }
      );

    return Promise.all(
      jobs
    );
  }


  /* =========================================================
     HEADER
     ========================================================= */

  function initHeaderShell() {
    var header =
      document.querySelector(
        "[data-header], [data-site-header]"
      );

    if (
      !header ||
      header.dataset
        .jsReady ===
        "true"
    ) {
      return;
    }


    var openButton =
      header.querySelector(
        "[data-mobile-menu-open], [data-menu-toggle]"
      );


    var closeButton =
      header.querySelector(
        "[data-mobile-menu-close]"
      );


    var drawer =
      header.querySelector(
        "[data-mobile-drawer], [data-site-nav]"
      );


    var links =
      header.querySelectorAll(
        "[data-nav-link], .site-nav__link, [data-site-nav] a[href]"
      );


    var lastFocusedElement =
      null;

    var previousBodyOverflow =
      "";

    var scrollFrame =
      null;


    function isMobileNavigation() {
      if (!openButton) {
        return (
          window.innerWidth <=
          MOBILE_BREAKPOINT
        );
      }

      return (
        window.getComputedStyle(
          openButton
        ).display !==
        "none"
      );
    }


    function isMenuOpen() {
      return (
        header.classList.contains(
          "is-open"
        ) ||
        header.classList.contains(
          "nav-open"
        )
      );
    }


    function setDrawerAccessibility(
      isOpen
    ) {
      if (!drawer) {
        return;
      }

      if (
        isMobileNavigation()
      ) {
        drawer.setAttribute(
          "aria-hidden",
          String(
            !isOpen
          )
        );
      } else {
        drawer.removeAttribute(
          "aria-hidden"
        );
      }
    }


    function getFocusableElements() {
      if (!drawer) {
        return [];
      }

      return Array.prototype
        .slice
        .call(
          drawer.querySelectorAll(
            "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])"
          )
        )
        .filter(
          function (
            element
          ) {
            return (
              !element.hasAttribute(
                "hidden"
              ) &&
              window.getComputedStyle(
                element
              ).visibility !==
                "hidden" &&
              window.getComputedStyle(
                element
              ).display !==
                "none"
            );
          }
        );
    }


    function openMenu() {
      if (
        !drawer ||
        !isMobileNavigation()
      ) {
        return;
      }

      lastFocusedElement =
        document.activeElement;

      previousBodyOverflow =
        document.body.style
          .overflow;

      header.classList.add(
        "is-open",
        "nav-open"
      );

      document.body
        .classList.add(
          "is-menu-open",
          "menu-open"
        );

      document.body.style
        .overflow =
        "hidden";


      if (openButton) {
        openButton.setAttribute(
          "aria-expanded",
          "true"
        );

        openButton.setAttribute(
          "aria-label",
          "Menu sluiten"
        );
      }


      setDrawerAccessibility(
        true
      );


      window
        .requestAnimationFrame(
          function () {
            var focusable =
              getFocusableElements();

            var preferred =
              closeButton ||
              drawer.querySelector(
                ".site-nav__link,[data-nav-link],a[href],button"
              );

            if (
              preferred &&
              focusable.indexOf(
                preferred
              ) !== -1
            ) {
              preferred.focus();
            }
          }
        );
    }


    function closeMenu(
      options
    ) {
      var settings =
        options || {};

      var wasOpen =
        isMenuOpen();

      header.classList.remove(
        "is-open",
        "nav-open"
      );

      document.body
        .classList.remove(
          "is-menu-open",
          "menu-open"
        );

      document.body.style
        .overflow =
        previousBodyOverflow;


      if (openButton) {
        openButton.setAttribute(
          "aria-expanded",
          "false"
        );

        openButton.setAttribute(
          "aria-label",
          "Menu openen"
        );
      }


      setDrawerAccessibility(
        false
      );


      if (
        wasOpen &&
        settings.restoreFocus ===
          true &&
        lastFocusedElement &&
        typeof lastFocusedElement
          .focus ===
          "function"
      ) {
        lastFocusedElement
          .focus();
      }
    }


    function toggleMenu() {
      if (isMenuOpen()) {
        closeMenu({
          restoreFocus:
            false
        });
      } else {
        openMenu();
      }
    }


    function updateStickyState() {
      if (
        scrollFrame !==
        null
      ) {
        return;
      }

      scrollFrame =
        window
          .requestAnimationFrame(
            function () {
              header
                .classList.toggle(
                  "is-scrolled",
                  window.scrollY >
                    10
                );

              scrollFrame =
                null;
            }
          );
    }


    function updateActiveLinks() {
      var currentPath =
        normalizeCleanPath(
          window.location
            .pathname
        );

      var currentHash =
        window.location.hash ||
        "";


      links.forEach(
        function (link) {
          var href =
            link.getAttribute(
              "href"
            );

          if (
            !href ||
            /^(?:mailto:|tel:|sms:|javascript:)/i.test(
              href
            )
          ) {
            return;
          }


          var linkUrl;

          try {
            linkUrl =
              new URL(
                href,
                window.location
                  .href
              );
          } catch (error) {
            return;
          }


          var linkPath =
            normalizeCleanPath(
              linkUrl.pathname
            );

          var samePage =
            linkPath ===
            currentPath;

          var isHashLink =
            href.charAt(0) ===
            "#";

          var isActive =
            false;


          if (isHashLink) {
            isActive =
              linkUrl.hash ===
              currentHash;
          } else if (
            linkUrl.hash &&
            samePage
          ) {
            isActive =
              linkUrl.hash ===
              currentHash;
          } else {
            isActive =
              samePage;
          }


          link.classList.toggle(
            "is-active",
            isActive
          );

          link.classList.toggle(
            "is-current",
            isActive &&
              link.classList
                .contains(
                  "site-nav__cta"
                )
          );


          if (isActive) {
            link.setAttribute(
              "aria-current",
              "page"
            );
          } else {
            link.removeAttribute(
              "aria-current"
            );
          }
        }
      );
    }


    if (openButton) {
      openButton
        .addEventListener(
          "click",
          toggleMenu
        );

      openButton
        .setAttribute(
          "aria-expanded",
          "false"
        );
    }


    if (closeButton) {
      closeButton
        .addEventListener(
          "click",
          function () {
            closeMenu({
              restoreFocus:
                true
            });
          }
        );
    }


    links.forEach(
      function (link) {
        link.addEventListener(
          "click",
          function () {
            if (
              isMobileNavigation()
            ) {
              closeMenu({
                restoreFocus:
                  false
              });
            }
          }
        );
      }
    );


    if (drawer) {
      drawer.addEventListener(
        "click",
        function (event) {
          if (
            event.target ===
              drawer &&
            isMenuOpen()
          ) {
            closeMenu({
              restoreFocus:
                false
            });
          }
        }
      );
    }


    document.addEventListener(
      "click",
      function (event) {
        if (
          !isMobileNavigation() ||
          !isMenuOpen() ||
          header.contains(
            event.target
          )
        ) {
          return;
        }

        closeMenu({
          restoreFocus:
            false
        });
      }
    );


    document.addEventListener(
      "keydown",
      function (event) {
        if (!isMenuOpen()) {
          return;
        }


        if (
          event.key ===
          "Escape"
        ) {
          event.preventDefault();

          closeMenu({
            restoreFocus:
              true
          });

          return;
        }


        if (
          event.key !== "Tab" ||
          !isMobileNavigation()
        ) {
          return;
        }


        var focusable =
          getFocusableElements();

        if (
          !focusable.length
        ) {
          event.preventDefault();
          return;
        }


        var first =
          focusable[0];

        var last =
          focusable[
            focusable.length -
              1
          ];

        var active =
          document.activeElement;


        if (
          event.shiftKey &&
          active === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          active === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    );


    window.addEventListener(
      "scroll",
      updateStickyState,
      {
        passive: true
      }
    );


    window.addEventListener(
      "hashchange",
      updateActiveLinks
    );


    window.addEventListener(
      "resize",
      function () {
        if (
          !isMobileNavigation()
        ) {
          closeMenu({
            restoreFocus:
              false
          });

          if (drawer) {
            drawer
              .removeAttribute(
                "aria-hidden"
              );
          }
        } else {
          setDrawerAccessibility(
            isMenuOpen()
          );
        }
      }
    );


    updateStickyState();
    updateActiveLinks();

    setDrawerAccessibility(
      false
    );

    header.dataset.jsReady =
      "true";
  }


  /* =========================================================
     FOOTER
     ========================================================= */

  function initFooterShell() {
    var footer =
      document.querySelector(
        "[data-footer]"
      );

    if (
      !footer ||
      footer.dataset
        .jsReady ===
        "true"
    ) {
      return;
    }


    var yearNode =
      footer.querySelector(
        "[data-current-year]"
      );


    if (yearNode) {
      yearNode.textContent =
        new Date()
          .getFullYear();
    }


    footer
      .querySelectorAll(
        ".site-footer__accordion-button"
      )
      .forEach(
        function (button) {
          button.addEventListener(
            "click",
            function () {
              var block =
                button.closest(
                  ".site-footer__menu-block"
                );

              if (!block) {
                return;
              }

              var isOpen =
                block.classList
                  .toggle(
                    "is-open"
                  );

              button
                .setAttribute(
                  "aria-expanded",
                  String(
                    isOpen
                  )
                );
            }
          );
        }
      );


    footer.dataset.jsReady =
      "true";
  }


  /* =========================================================
     ALGEMENE PAGINAFUNCTIES
     ========================================================= */

  function initQuoteRedirectForms() {
    document
      .querySelectorAll(
        "[data-quote-form]"
      )
      .forEach(
        function (form) {
          if (
            form.dataset
              .jsReady ===
            "true"
          ) {
            return;
          }


          form.addEventListener(
            "submit",
            function (event) {
              event
                .preventDefault();


              var formData =
                new FormData(
                  form
                );

              var params =
                new URLSearchParams();


              formData.forEach(
                function (
                  value,
                  key
                ) {
                  if (
                    typeof value ===
                      "string" &&
                    value
                  ) {
                    params.set(
                      key,
                      value
                    );
                  }
                }
              );


              window.location.href =
                "/offerte-aanvragen/" +
                (
                  params.toString()
                    ? "?" +
                      params.toString()
                    : ""
                );
            }
          );


          form.dataset.jsReady =
            "true";
        }
      );
  }


  function initRevealCards() {
    var cards =
      document.querySelectorAll(
        "[data-reveal]:not(.is-observed)"
      );

    if (!cards.length) {
      return;
    }


    if (
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      cards.forEach(
        function (card) {
          card.classList.add(
            "is-visible"
          );
        }
      );

      return;
    }


    var observer =
      new IntersectionObserver(
        function (entries) {
          entries.forEach(
            function (entry) {
              if (
                !entry
                  .isIntersecting
              ) {
                return;
              }

              entry.target
                .classList.add(
                  "is-visible"
                );

              observer
                .unobserve(
                  entry.target
                );
            }
          );
        },
        {
          threshold: 0.18
        }
      );


    cards.forEach(
      function (card) {
        card.classList.add(
          "is-observed"
        );

        observer.observe(
          card
        );
      }
    );
  }


  function initRails() {
    document
      .querySelectorAll(
        "[data-rail-prev], [data-rail-next]"
      )
      .forEach(
        function (button) {
          if (
            button.dataset
              .railReady ===
            "true"
          ) {
            return;
          }


          button
            .addEventListener(
              "click",
              function () {
                var wrap =
                  button.closest(
                    ".rail-wrap"
                  );

                var rail =
                  wrap
                    ? wrap.querySelector(
                        "[data-rail]"
                      )
                    : null;

                if (!rail) {
                  return;
                }


                var direction =
                  button
                    .hasAttribute(
                      "data-rail-prev"
                    )
                    ? -1
                    : 1;


                rail.scrollBy({
                  left:
                    direction *
                    rail.clientWidth *
                    0.82,

                  behavior:
                    "smooth"
                });
              }
            );


          button.dataset
            .railReady =
            "true";
        }
      );
  }


  function initProjectCount() {
    var grid =
      document.querySelector(
        "[data-project-grid]"
      );

    var countNode =
      document.querySelector(
        "[data-project-count]"
      );

    if (
      !grid ||
      !countNode
    ) {
      return;
    }


    var amount =
      grid.querySelectorAll(
        "[data-project-card]"
      ).length;


    countNode.textContent =
      amount +
      (
        amount === 1
          ? " project zichtbaar"
          : " projecten zichtbaar"
      );
  }


  function initFaq() {
    document
      .querySelectorAll(
        "[data-contact-faq]"
      )
      .forEach(
        function (faq) {
          if (
            faq.dataset
              .faqReady ===
            "true"
          ) {
            return;
          }


          faq
            .querySelectorAll(
              "details"
            )
            .forEach(
              function (item) {
                item
                  .addEventListener(
                    "toggle",
                    function () {
                      if (
                        !item.open
                      ) {
                        return;
                      }


                      faq
                        .querySelectorAll(
                          "details[open]"
                        )
                        .forEach(
                          function (
                            other
                          ) {
                            if (
                              other !==
                              item
                            ) {
                              other.open =
                                false;
                            }
                          }
                        );
                    }
                  );
              }
            );


          faq.dataset
            .faqReady =
            "true";
        }
      );
  }


  /* =========================================================
     WEB3FORMS HELPERS
     ========================================================= */

  var OLD_FORMSUBMIT_NAMES = [
    "_next",
    "_captcha",
    "_template",
    "_subject",
    "_autoresponse",
    "_cc",
    "_honey",
    "next",
    "captcha",
    "template",
    "autoresponse",
    "honey"
  ];


  function removeOldFormSubmitFields(
    form
  ) {
    Array.prototype
      .slice.call(
        form.elements ||
          []
      )
      .forEach(
        function (element) {
          if (
            element &&
            element.name &&
            OLD_FORMSUBMIT_NAMES
              .indexOf(
                element.name
              ) !== -1
          ) {
            element.remove();
          }
        }
      );
  }


  function ensureHiddenField(
    form,
    name,
    value
  ) {
    var input =
      form.querySelector(
        'input[type="hidden"][name="' +
          name +
          '"]'
      );


    if (!input) {
      input =
        document
          .createElement(
            "input"
          );

      input.type =
        "hidden";

      input.name =
        name;

      form.prepend(
        input
      );
    }


    input.value =
      value;

    return input;
  }


  function ensureBotcheck(
    form
  ) {
    var botcheck =
      form.querySelector(
        '[name="botcheck"]'
      );

    if (botcheck) {
      return;
    }


    botcheck =
      document
        .createElement(
          "input"
        );

    botcheck.type =
      "checkbox";

    botcheck.name =
      "botcheck";

    botcheck.tabIndex =
      -1;

    botcheck.autocomplete =
      "off";

    botcheck.style
      .display =
      "none";

    botcheck
      .setAttribute(
        "aria-hidden",
        "true"
      );


    form.prepend(
      botcheck
    );
  }


  function configureWeb3Form(
    form,
    subject
  ) {
    if (!form) {
      return;
    }


    form.setAttribute(
      "action",
      WEB3FORMS_ENDPOINT
    );

    form.setAttribute(
      "method",
      "POST"
    );

    form.setAttribute(
      "enctype",
      "multipart/form-data"
    );


    form.removeAttribute(
      "onsubmit"
    );

    form.onsubmit =
      null;


    removeOldFormSubmitFields(
      form
    );


    ensureHiddenField(
      form,
      "access_key",
      WEB3FORMS_ACCESS_KEY
    );


    ensureHiddenField(
      form,
      "subject",
      subject
    );


    ensureHiddenField(
      form,
      "from_name",
      "De Kinkelder Cleaning website"
    );


    ensureBotcheck(
      form
    );
  }


  function removeEmptyFileFields(
    form,
    formData
  ) {
    form
      .querySelectorAll(
        'input[type="file"][name]'
      )
      .forEach(
        function (
          fileInput
        ) {
          if (
            !fileInput.files ||
            fileInput.files
              .length ===
              0
          ) {
            formData.delete(
              fileInput.name
            );
          }
        }
      );
  }


  function prepareWeb3FormData(
    form,
    subject
  ) {
    var formData =
      new FormData(
        form
      );


    formData.set(
      "access_key",
      WEB3FORMS_ACCESS_KEY
    );


    formData.set(
      "subject",
      subject
    );


    formData.set(
      "from_name",
      "De Kinkelder Cleaning website"
    );


    var senderEmail =
      formData.get(
        "email"
      );


    if (
      typeof senderEmail ===
        "string" &&
      senderEmail.trim()
    ) {
      formData.set(
        "replyto",
        senderEmail.trim()
      );
    }


    OLD_FORMSUBMIT_NAMES
      .forEach(
        function (
          fieldName
        ) {
          formData.delete(
            fieldName
          );
        }
      );


    removeEmptyFileFields(
      form,
      formData
    );


    return formData;
  }


  function getSubmitButton(
    form
  ) {
    return form.querySelector(
      'button[type="submit"], input[type="submit"]'
    );
  }


  function getButtonLabel(
    button
  ) {
    if (!button) {
      return "Versturen";
    }


    var label =
      button.querySelector
        ? button
            .querySelector(
              "[data-submit-label], span"
            )
        : null;


    if (label) {
      return label
        .textContent;
    }


    if (
      button.tagName ===
      "INPUT"
    ) {
      return button.value;
    }


    return button
      .textContent;
  }


  function setButtonLabel(
    button,
    text
  ) {
    if (!button) {
      return;
    }


    var label =
      button.querySelector
        ? button
            .querySelector(
              "[data-submit-label], span"
            )
        : null;


    if (label) {
      label.textContent =
        text;
    } else if (
      button.tagName ===
      "INPUT"
    ) {
      button.value =
        text;
    } else {
      button.textContent =
        text;
    }
  }


  function setSubmitting(
    button,
    isSubmitting
  ) {
    if (!button) {
      return;
    }


    button.disabled =
      isSubmitting;


    if (isSubmitting) {
      button.setAttribute(
        "aria-busy",
        "true"
      );
    } else {
      button.removeAttribute(
        "aria-busy"
      );
    }
  }


  function findOrCreateFormStatus(
    form
  ) {
    var status =
      form.querySelector(
        "[data-form-status]"
      );


    if (status) {
      return status;
    }


    status =
      document
        .createElement(
          "p"
        );

    status.className =
      "contact-form__status";

    status.setAttribute(
      "data-form-status",
      ""
    );

    status.setAttribute(
      "role",
      "status"
    );

    status.setAttribute(
      "aria-live",
      "polite"
    );

    status.hidden =
      true;


    var footer =
      form.querySelector(
        ".contact-form__footer"
      );


    if (footer) {
      footer.appendChild(
        status
      );
    } else {
      form.appendChild(
        status
      );
    }


    return status;
  }


  function showFormStatus(
    form,
    message,
    isError
  ) {
    var status =
      findOrCreateFormStatus(
        form
      );


    status.textContent =
      message || "";

    status.hidden =
      !message;


    status.classList.toggle(
      "is-error",
      Boolean(
        isError
      )
    );


    status.classList.toggle(
      "is-success",
      Boolean(
        message
      ) &&
        !isError
    );
  }


  async function submitWeb3Form(
    form,
    options
  ) {
    var settings =
      options || {};


    var subject =
      settings.subject ||
      "Nieuwe aanvraag via De Kinkelder Cleaning";


    if (
      !form.reportValidity()
    ) {
      return false;
    }


    var submitButton =
      getSubmitButton(
        form
      );


    if (
      submitButton &&
      submitButton.disabled
    ) {
      return false;
    }


    var originalButtonLabel =
      getButtonLabel(
        submitButton
      );


    var formData =
      prepareWeb3FormData(
        form,
        subject
      );


    showFormStatus(
      form,
      "",
      false
    );


    setButtonLabel(
      submitButton,
      settings.loadingText ||
        "Aanvraag wordt verstuurd..."
    );


    setSubmitting(
      submitButton,
      true
    );


    try {
      var response =
        await fetch(
          WEB3FORMS_ENDPOINT,
          {
            method:
              "POST",

            body:
              formData
          }
        );


      var data;


      try {
        data =
          await response
            .json();
      } catch (
        jsonError
      ) {
        throw new Error(
          "Web3Forms gaf geen geldige reactie terug."
        );
      }


      if (
        !response.ok ||
        !data ||
        data.success !==
          true
      ) {
        throw new Error(
          data &&
          data.message
            ? data.message
            : "Web3Forms heeft de aanvraag niet geaccepteerd."
        );
      }


      setButtonLabel(
        submitButton,
        settings.successButtonText ||
          "Verzonden ✓"
      );


      showFormStatus(
        form,
        settings.successMessage ||
          "Bedankt. Uw aanvraag is succesvol verstuurd.",
        false
      );


      form.reset();


      if (
        typeof settings
          .onSuccess ===
        "function"
      ) {
        settings.onSuccess(
          data
        );
      }


      window.setTimeout(
        function () {
          setButtonLabel(
            submitButton,
            originalButtonLabel
          );

          setSubmitting(
            submitButton,
            false
          );
        },
        2500
      );


      return true;
    } catch (error) {
      console.error(
        "Web3Forms fout:",
        error
      );


      showFormStatus(
        form,
        "Kon het formulier niet verzenden. " +
          (
            error &&
            error.message
              ? error.message
              : "Probeer het later opnieuw."
          ),
        true
      );


      setButtonLabel(
        submitButton,
        originalButtonLabel
      );


      setSubmitting(
        submitButton,
        false
      );


      return false;
    }
  }


  /* =========================================================
     CONTACTPAGINA
     Vraag -> Web3Forms
     Hulp -> Web3Forms
     Offerte -> uitgebreide offertepagina
     ========================================================= */

  function initContactPage() {
    var form =
      document.querySelector(
        "[data-contact-form]"
      );


    if (
      !form ||
      form.dataset
        .contactReady ===
        "true"
    ) {
      return;
    }


    var choiceButtons =
      document.querySelectorAll(
        "[data-contact-choice]"
      );


    var typeInputs =
      form.querySelectorAll(
        'input[name="type"]'
      );


    var serviceField =
      form.querySelector(
        "[data-service-field]"
      );


    var serviceSelect =
      form.querySelector(
        "[data-service-select]"
      );


    var locationField =
      form.querySelector(
        "[data-location-field]"
      );


    var locationInput =
      form.querySelector(
        "[data-location-input]"
      );


    var fileField =
      form.querySelector(
        "[data-file-field]"
      );


    var formTitle =
      document.querySelector(
        "[data-contact-form-title]"
      );


    var messageLabel =
      form.querySelector(
        "[data-message-label]"
      );


    var submitLabel =
      form.querySelector(
        "[data-submit-label]"
      );


    var copy = {
      vraag: {
        title:
          "Waar kunnen we u mee helpen?",

        message:
          "Uw vraag",

        submit:
          "Vraag versturen"
      },

      hulp: {
        title:
          "Vertel ons waarbij u advies nodig heeft.",

        message:
          "Omschrijf de situatie",

        submit:
          "Hulpvraag versturen"
      },

      offerte: {
        title:
          "Start uw vrijblijvende offerteaanvraag.",

        message:
          "Omschrijf de werkzaamheden",

        submit:
          "Offerte starten"
      }
    };


    function getSelectedType() {
      var checked =
        form.querySelector(
          'input[name="type"]:checked'
        );


      return checked
        ? checked.value
        : "vraag";
    }


    function setRequired(
      element,
      required
    ) {
      if (!element) {
        return;
      }


      element.required =
        required;


      element.setAttribute(
        "aria-required",
        String(
          required
        )
      );
    }


    function updateForm(
      type
    ) {
      var selectedType =
        copy[type]
          ? type
          : "vraag";


      var needsService =
        selectedType ===
          "hulp" ||
        selectedType ===
          "offerte";


      var needsLocation =
        selectedType ===
        "offerte";


      if (serviceField) {
        serviceField.hidden =
          !needsService;
      }


      if (locationField) {
        locationField.hidden =
          !needsLocation;
      }


      if (fileField) {
        fileField.hidden =
          selectedType ===
          "vraag";
      }


      setRequired(
        serviceSelect,
        needsService
      );


      setRequired(
        locationInput,
        needsLocation
      );


      if (formTitle) {
        formTitle.textContent =
          copy[selectedType]
            .title;
      }


      if (messageLabel) {
        messageLabel.innerHTML =
          copy[selectedType]
            .message +
          " <em>*</em>";
      }


      if (submitLabel) {
        submitLabel.textContent =
          copy[selectedType]
            .submit;
      }


      showFormStatus(
        form,
        "",
        false
      );
    }


    function selectType(
      type,
      shouldScroll
    ) {
      var input =
        form.querySelector(
          'input[name="type"][value="' +
            type +
            '"]'
        );


      if (!input) {
        return;
      }


      input.checked =
        true;


      updateForm(
        type
      );


      if (shouldScroll) {
        var target =
          document
            .getElementById(
              "contactformulier"
            );


        if (target) {
          target
            .scrollIntoView({
              behavior:
                "smooth",

              block:
                "start"
            });
        }


        window.setTimeout(
          function () {
            var firstField =
              form.querySelector(
                'input[name="naam"]'
              );


            if (firstField) {
              firstField.focus({
                preventScroll:
                  true
              });
            }
          },
          520
        );
      }
    }


    function contactSubject(
      type
    ) {
      if (
        type === "hulp"
      ) {
        return "Nieuwe hulpvraag via De Kinkelder Cleaning";
      }


      return "Nieuwe algemene vraag via De Kinkelder Cleaning";
    }


    typeInputs.forEach(
      function (input) {
        input.addEventListener(
          "change",
          function () {
            updateForm(
              input.value
            );
          }
        );
      }
    );


    choiceButtons.forEach(
      function (button) {
        button.addEventListener(
          "click",
          function () {
            selectType(
              button.getAttribute(
                "data-contact-choice"
              ) ||
                "vraag",
              true
            );
          }
        );
      }
    );


    configureWeb3Form(
      form,
      contactSubject(
        getSelectedType()
      )
    );


    form.addEventListener(
      "submit",

      async function (
        event
      ) {
        event.preventDefault();

        event
          .stopImmediatePropagation();


        var selectedType =
          getSelectedType();


        if (
          selectedType ===
          "offerte"
        ) {
          if (
            !form.reportValidity()
          ) {
            return;
          }


          var params =
            new URLSearchParams();


          if (
            serviceSelect &&
            serviceSelect.value
          ) {
            params.set(
              "dienst",
              serviceSelect.value
            );
          }


          if (
            locationInput &&
            locationInput.value
          ) {
            params.set(
              "locatie",
              locationInput.value
            );
          }


          var phoneInput =
            form.querySelector(
              'input[name="telefoon"]'
            );


          if (
            phoneInput &&
            phoneInput.value
          ) {
            params.set(
              "telefoon",
              phoneInput.value
            );
          }


          params.set(
            "bron",
            "contactpagina"
          );


          window.location.href =
            "/offerte-aanvragen/" +
            (
              params.toString()
                ? "?" +
                  params.toString()
                : ""
            );


          return;
        }


        await submitWeb3Form(
          form,
          {
            subject:
              contactSubject(
                selectedType
              ),

            loadingText:
              "Bericht wordt verstuurd...",

            successButtonText:
              "Verzonden ✓",

            successMessage:
              "Bedankt. Uw bericht is succesvol verstuurd. We nemen zo snel mogelijk contact met u op.",

            onSuccess:
              function () {
                updateForm(
                  "vraag"
                );
              }
          }
        );
      },

      true
    );


    updateForm(
      getSelectedType()
    );


    form.dataset
      .contactReady =
      "true";
  }


  /* =========================================================
     UITGEBREID OFFERTEFORMULIER -> WEB3FORMS
     ========================================================= */

  function initQuoteForms() {
    var forms =
      document.querySelectorAll(
        "[data-offerte-form], form.quote-request-form"
      );


    if (!forms.length) {
      return;
    }


    forms.forEach(
      function (form) {
        if (
          form.dataset
            .quoteReady ===
          "true"
        ) {
          return;
        }


        var subject =
          "Nieuwe offerteaanvraag via De Kinkelder Cleaning";


        configureWeb3Form(
          form,
          subject
        );


        var serviceInputs =
          Array.prototype
            .slice.call(
              form.querySelectorAll(
                '[name="dienst[]"]'
              )
            );


        var serviceFeedback =
          form.querySelector(
            "[data-service-feedback]"
          );


        var clientInputs =
          Array.prototype
            .slice.call(
              form.querySelectorAll(
                'input[name="opdrachtgever"]'
              )
            );


        var companyField =
          form.querySelector(
            "[data-company-field]"
          );


        var companyInput =
          form.querySelector(
            "[data-company-input]"
          );


        function selectedClientType() {
          var selected =
            form.querySelector(
              'input[name="opdrachtgever"]:checked'
            );


          return selected
            ? selected.value
            : "particulier";
        }


        function updateCompanyField() {
          var required =
            selectedClientType() !==
            "particulier";


          if (companyField) {
            companyField.hidden =
              !required;
          }


          if (companyInput) {
            companyInput.required =
              required;

            companyInput.disabled =
              !required;

            companyInput
              .setAttribute(
                "aria-required",
                String(
                  required
                )
              );
          }
        }


        function hasSelectedService() {
          if (
            !serviceInputs.length
          ) {
            return true;
          }


          return serviceInputs.some(
            function (input) {
              return input.checked;
            }
          );
        }


        function updateServiceFeedback(
          showError
        ) {
          var valid =
            hasSelectedService();


          if (serviceFeedback) {
            serviceFeedback.hidden =
              valid ||
              !showError;


            serviceFeedback
              .textContent =
              valid
                ? ""
                : "Selecteer minimaal één dienst voordat u het formulier verstuurt.";
          }


          serviceInputs.forEach(
            function (input) {
              input.setAttribute(
                "aria-invalid",
                String(
                  !valid &&
                    showError
                )
              );
            }
          );


          return valid;
        }


        function prefillFromQuery() {
          var params =
            new URLSearchParams(
              window.location
                .search
            );


          var service =
            params.get(
              "dienst"
            );


          var firstName =
            params.get(
              "voornaam"
            );


          var lastName =
            params.get(
              "achternaam"
            );


          var street =
            params.get(
              "straatnaam"
            );


          var houseNumber =
            params.get(
              "huisnummer"
            );


          var postcodeValue =
            params.get(
              "postcode"
            );


          var placeValue =
            params.get(
              "plaats"
            );


          var locationValue =
            params.get(
              "locatie"
            );


          var phone =
            params.get(
              "telefoon"
            );


          if (service) {
            var safeService =
              String(
                service
              ).replace(
                /["\\]/g,
                "\\$&"
              );


            var serviceInput =
              form.querySelector(
                '[name="dienst[]"][value="' +
                  safeService +
                  '"]'
              );


            if (serviceInput) {
              serviceInput.checked =
                true;
            }
          }


          var firstNameInput =
            form.querySelector(
              'input[name="voornaam"]'
            );


          var lastNameInput =
            form.querySelector(
              'input[name="achternaam"]'
            );


          var fullNameInput =
            form.querySelector(
              'input[name="naam"]'
            );


          if (
            firstName &&
            firstNameInput
          ) {
            firstNameInput.value =
              firstName;
          }


          if (
            lastName &&
            lastNameInput
          ) {
            lastNameInput.value =
              lastName;
          }


          if (
            fullNameInput &&
            (
              firstName ||
              lastName
            )
          ) {
            fullNameInput.value =
              [
                firstName || "",
                lastName || ""
              ]
                .join(" ")
                .trim();
          }


          if (street) {
            var streetInput =
              form.querySelector(
                'input[name="straatnaam"], input[name="straat"], input[name="adres"]'
              );


            if (streetInput) {
              streetInput.value =
                street;
            }
          }


          if (houseNumber) {
            var houseNumberInput =
              form.querySelector(
                'input[name="huisnummer"]'
              );


            if (houseNumberInput) {
              houseNumberInput.value =
                houseNumber;
            }
          }


          var postcodeInput =
            form.querySelector(
              '[data-quote-location], input[name="postcode"]'
            );


          var placeInput =
            form.querySelector(
              'input[name="plaats"]'
            );


          if (
            postcodeValue &&
            postcodeInput
          ) {
            postcodeInput.value =
              postcodeValue;
          }


          if (
            placeValue &&
            placeInput
          ) {
            placeInput.value =
              placeValue;
          }


          if (
            locationValue &&
            !postcodeValue &&
            !placeValue
          ) {
            if (
              /^\d{4}\s?[a-z]{2}$/i.test(
                locationValue.trim()
              )
            ) {
              if (postcodeInput) {
                postcodeInput.value =
                  locationValue;
              }
            } else if (placeInput) {
              placeInput.value =
                locationValue;
            }
          }


          if (phone) {
            var phoneInput =
              form.querySelector(
                'input[name="telefoon"]'
              );


            if (phoneInput) {
              phoneInput.value =
                phone;
            }
          }
        }


        clientInputs.forEach(
          function (input) {
            input.addEventListener(
              "change",
              updateCompanyField
            );
          }
        );


        serviceInputs.forEach(
          function (input) {
            input.addEventListener(
              "change",
              function () {
                updateServiceFeedback(
                  false
                );
              }
            );
          }
        );


        form.addEventListener(
          "submit",

          async function (
            event
          ) {
            event.preventDefault();

            event
              .stopImmediatePropagation();


            if (
              !updateServiceFeedback(
                true
              )
            ) {
              if (
                serviceInputs[0]
              ) {
                serviceInputs[0]
                  .focus();
              }

              return;
            }


            await submitWeb3Form(
              form,
              {
                subject:
                  subject,

                loadingText:
                  "Aanvraag wordt verstuurd...",

                successButtonText:
                  "Verzonden ✓",

                successMessage:
                  "Bedankt. Uw offerteaanvraag is succesvol verstuurd. We nemen zo snel mogelijk contact met u op.",

                onSuccess:
                  function () {
                    updateCompanyField();

                    updateServiceFeedback(
                      false
                    );
                  }
              }
            );
          },

          true
        );


        prefillFromQuery();

        updateCompanyField();

        updateServiceFeedback(
          false
        );


        form.dataset
          .quoteReady =
          "true";
      }
    );
  }


  /* =========================================================
     FOTO-UPLOAD + VOORBEELD
     ========================================================= */

  function initFileUploads() {
    document
      .querySelectorAll(
        "[data-file-field]"
      )
      .forEach(
        function (field) {
          if (
            field.dataset
              .fileUploadReady ===
            "true"
          ) {
            return;
          }


          var input =
            field.querySelector(
              '[data-file-input], input[type="file"]'
            );


          if (!input) {
            return;
          }


          var shell =
            field.querySelector(
              "[data-file-upload]"
            );


          var preview =
            field.querySelector(
              "[data-file-preview]"
            );


          var feedback =
            field.querySelector(
              "[data-file-feedback]"
            );


          var selectedFiles =
            Array.prototype
              .slice.call(
                input.files ||
                  []
              );


          if (!shell) {
            shell =
              document.createElement(
                "div"
              );


            shell.className =
              "contact-file-upload";


            shell.setAttribute(
              "data-file-upload",
              ""
            );


            input.parentNode
              .insertBefore(
                shell,
                input
              );


            shell.appendChild(
              input
            );
          }


          if (!preview) {
            preview =
              document.createElement(
                "div"
              );


            preview.className =
              "contact-file-upload__preview";


            preview.setAttribute(
              "data-file-preview",
              ""
            );


            preview.setAttribute(
              "aria-live",
              "polite"
            );


            preview.hidden =
              true;


            shell.appendChild(
              preview
            );
          }


          if (!feedback) {
            feedback =
              document.createElement(
                "p"
              );


            feedback.className =
              "contact-file-upload__feedback";


            feedback.setAttribute(
              "data-file-feedback",
              ""
            );


            feedback.setAttribute(
              "aria-live",
              "polite"
            );


            feedback.hidden =
              true;


            shell.appendChild(
              feedback
            );
          }


          function fileKey(
            file
          ) {
            return [
              file.name,
              file.size,
              file.lastModified
            ].join("::");
          }


          function totalSize(
            files
          ) {
            return files.reduce(
              function (
                sum,
                file
              ) {
                return (
                  sum +
                  file.size
                );
              },
              0
            );
          }


          function syncNativeInput() {
            if (
              typeof DataTransfer ===
              "undefined"
            ) {
              return;
            }


            var transfer =
              new DataTransfer();


            selectedFiles
              .forEach(
                function (file) {
                  transfer.items
                    .add(
                      file
                    );
                }
              );


            input.files =
              transfer.files;
          }


          function showFeedback(
            message
          ) {
            feedback.textContent =
              message ||
              "";


            feedback.hidden =
              !message;
          }


          function removeFile(
            index
          ) {
            selectedFiles.splice(
              index,
              1
            );


            syncNativeInput();

            renderPreviews();

            showFeedback(
              ""
            );
          }


          function createRemoveButton(
            index,
            fileName
          ) {
            var button =
              document.createElement(
                "button"
              );


            button.type =
              "button";


            button.className =
              "contact-file-preview__remove";


            button.setAttribute(
              "aria-label",
              "Verwijder " +
                fileName
            );


            button.innerHTML =
              '<svg viewBox="0 0 24 24" aria-hidden="true">' +
              '<path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>' +
              "</svg>";


            button.addEventListener(
              "click",
              function (event) {
                event.preventDefault();

                event
                  .stopPropagation();


                removeFile(
                  index
                );
              }
            );


            return button;
          }


          function renderPreviews() {
            preview.replaceChildren();


            preview.hidden =
              selectedFiles.length ===
              0;


            selectedFiles.forEach(
              function (
                file,
                index
              ) {
                var item =
                  document.createElement(
                    "figure"
                  );


                var image =
                  document.createElement(
                    "img"
                  );


                var caption =
                  document.createElement(
                    "figcaption"
                  );


                var objectUrl =
                  URL.createObjectURL(
                    file
                  );


                item.className =
                  "contact-file-preview";


                image.src =
                  objectUrl;


                image.alt =
                  "Voorbeeld van " +
                  file.name;


                image.loading =
                  "lazy";


                image.decoding =
                  "async";


                image.addEventListener(
                  "load",
                  function () {
                    URL.revokeObjectURL(
                      objectUrl
                    );
                  },
                  {
                    once: true
                  }
                );


                image.addEventListener(
                  "error",
                  function () {
                    URL.revokeObjectURL(
                      objectUrl
                    );
                  },
                  {
                    once: true
                  }
                );


                caption.className =
                  "contact-file-preview__name";


                caption.textContent =
                  file.name;


                caption.title =
                  file.name;


                item.appendChild(
                  image
                );


                item.appendChild(
                  caption
                );


                item.appendChild(
                  createRemoveButton(
                    index,
                    file.name
                  )
                );


                preview.appendChild(
                  item
                );
              }
            );
          }


          input.addEventListener(
            "change",
            function () {
              var incomingFiles =
                Array.prototype
                  .slice.call(
                    input.files ||
                      []
                  );


              var knownKeys =
                new Set(
                  selectedFiles.map(
                    fileKey
                  )
                );


              var candidates =
                selectedFiles.slice();


              var messages =
                [];


              incomingFiles.forEach(
                function (file) {
                  if (
                    !/^image\/(?:jpeg|png|webp)$/i.test(
                      file.type ||
                        ""
                    )
                  ) {
                    messages.push(
                      file.name +
                        " is geen ondersteunde afbeelding. Gebruik JPG, PNG of WebP."
                    );

                    return;
                  }


                  var key =
                    fileKey(
                      file
                    );


                  if (
                    !knownKeys.has(
                      key
                    )
                  ) {
                    candidates.push(
                      file
                    );

                    knownKeys.add(
                      key
                    );
                  }
                }
              );


              if (
                totalSize(
                  candidates
                ) >
                MAX_UPLOAD_TOTAL
              ) {
                messages.push(
                  "De totale bestandsgrootte mag maximaal 10 MB zijn."
                );
              } else if (
                !messages.length
              ) {
                selectedFiles =
                  candidates;
              }


              syncNativeInput();

              renderPreviews();

              showFeedback(
                messages.join(
                  " "
                )
              );
            }
          );


          var parentForm =
            field.closest(
              "form"
            );


          if (parentForm) {
            parentForm.addEventListener(
              "reset",
              function () {
                window.setTimeout(
                  function () {
                    selectedFiles =
                      [];


                    syncNativeInput();

                    renderPreviews();

                    showFeedback(
                      ""
                    );
                  },
                  0
                );
              }
            );
          }


          syncNativeInput();

          renderPreviews();


          field.dataset
            .fileUploadReady =
            "true";
        }
      );
  }


  /* =========================================================
     CONTACT TRUST STRIP / MARQUEE
     ========================================================= */

  function initContactTrustStrips() {
    var strips =
      document.querySelectorAll(
        ".contact-trust-strip"
      );


    strips.forEach(
      function (strip) {
        if (
          strip.dataset
            .marqueeReady ===
          "true"
        ) {
          return;
        }


        var inner =
          strip.querySelector(
            ".contact-trust-strip__inner"
          );


        if (!inner) {
          return;
        }


        var originalLabels =
          Array.prototype
            .slice
            .call(
              inner.querySelectorAll(
                ":scope > span"
              )
            )
            .map(
              function (span) {
                return span
                  .textContent
                  .trim();
              }
            )
            .filter(
              Boolean
            );


        if (
          !originalLabels.length
        ) {
          var existingGroup =
            inner.querySelector(
              ".contact-trust-strip__group"
            );


          if (existingGroup) {
            originalLabels =
              Array.prototype
                .slice
                .call(
                  existingGroup
                    .querySelectorAll(
                      "span"
                    )
                )
                .map(
                  function (
                    span
                  ) {
                    return span
                      .textContent
                      .trim();
                  }
                )
                .filter(
                  Boolean
                );
          }
        }


        if (
          !originalLabels.length
        ) {
          return;
        }


        var track =
          document.createElement(
            "div"
          );


        var firstGroup =
          document.createElement(
            "div"
          );


        var resizeTimer =
          null;


        track.className =
          "contact-trust-strip__track";


        firstGroup.className =
          "contact-trust-strip__group";


        track.setAttribute(
          "aria-label",
          strip.getAttribute(
            "aria-label"
          ) ||
            "Contactkenmerken"
        );


        function appendLabelSet(
          group
        ) {
          originalLabels
            .forEach(
              function (
                label
              ) {
                var span =
                  document
                    .createElement(
                      "span"
                    );


                span.textContent =
                  label;


                group.appendChild(
                  span
                );
              }
            );
        }


        function restartAnimation() {
          track.style.animation =
            "none";


          void track
            .offsetWidth;


          track.style.animation =
            "";
        }


        function getPixelsPerSecond() {
          var viewportWidth =
            window.innerWidth ||
            document
              .documentElement
              .clientWidth;


          if (
            viewportWidth <=
            390
          ) {
            return 42;
          }


          if (
            viewportWidth <=
            767
          ) {
            return 44;
          }


          if (
            viewportWidth <=
            1024
          ) {
            return 46;
          }


          return 48;
        }


        function ensureSeamlessWidth() {
          var minimumWidth =
            Math.max(
              strip.clientWidth +
                1,
              720
            );


          var safetyCounter =
            0;


          firstGroup
            .replaceChildren();


          appendLabelSet(
            firstGroup
          );


          while (
            firstGroup.scrollWidth <
              minimumWidth &&
            safetyCounter <
              12
          ) {
            appendLabelSet(
              firstGroup
            );


            safetyCounter +=
              1;
          }


          var oldClone =
            track.querySelector(
              "[data-marquee-clone]"
            );


          if (oldClone) {
            oldClone.remove();
          }


          var clone =
            firstGroup.cloneNode(
              true
            );


          clone.setAttribute(
            "aria-hidden",
            "true"
          );


          clone.setAttribute(
            "data-marquee-clone",
            ""
          );


          track.appendChild(
            clone
          );


          var cycleWidth =
            firstGroup
              .getBoundingClientRect()
              .width ||
            firstGroup
              .scrollWidth;


          var duration =
            Math.max(
              18,
              cycleWidth /
                getPixelsPerSecond()
            );


          track.style
            .setProperty(
              "--contact-trust-duration",
              duration
                .toFixed(
                  2
                ) +
                "s"
            );


          restartAnimation();
        }


        appendLabelSet(
          firstGroup
        );


        track.appendChild(
          firstGroup
        );


        inner.replaceChildren(
          track
        );


        inner.classList.add(
          "is-marquee-ready"
        );


        strip.dataset
          .marqueeReady =
          "true";


        window
          .requestAnimationFrame(
            ensureSeamlessWidth
          );


        if (
          "ResizeObserver" in
          window
        ) {
          var observer =
            new ResizeObserver(
              function () {
                window.clearTimeout(
                  resizeTimer
                );


                resizeTimer =
                  window.setTimeout(
                    ensureSeamlessWidth,
                    120
                  );
              }
            );


          observer.observe(
            strip
          );
        } else {
          window.addEventListener(
            "resize",
            function () {
              window.clearTimeout(
                resizeTimer
              );


              resizeTimer =
                window.setTimeout(
                  ensureSeamlessWidth,
                  160
                );
            }
          );
        }
      }
    );
  }


  /* =========================================================
     START
     ========================================================= */

  function initPage() {
    upgradeLegacyLinks(
      document
    );

    initCurrentYear();

    setViewportMode();

    initHeaderShell();

    initFooterShell();

    initQuoteRedirectForms();

    initRevealCards();

    initRails();

    initProjectCount();

    initFaq();

    initContactPage();

    initQuoteForms();

    initFileUploads();

    initContactTrustStrips();


    window.addEventListener(
      "resize",
      setViewportMode
    );
  }


  onReady(
    function () {
      document.body
        .classList.add(
          "is-loading"
        );


      loadIncludes()
        .catch(
          function (
            error
          ) {
            console.error(
              "Fout bij laden van includes:",
              error
            );
          }
        )
        .finally(
          function () {
            document.body
              .classList.remove(
                "is-loading"
              );


            initPage();
          }
        );
    }
  );
})();
