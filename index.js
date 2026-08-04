(function () {
  "use strict";

  var MOBILE_BREAKPOINT = 900;
  var MAX_UPLOAD_TOTAL = 10 * 1024 * 1024;

  document.documentElement.classList.add("js");

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  function normalizePath(pathname) {
    var path = pathname || "/";

    try {
      path = decodeURIComponent(path);
    } catch (error) {
      // Gebruik het oorspronkelijke pad wanneer decoderen niet lukt.
    }

    path = path
      .replace(/\\/g, "/")
      .replace(/\/+/g, "/")
      .replace(/\/(?:index|home)\.html?$/i, "/")
      .replace(/\.html?$/i, "")
      .replace(/\/+$/, "");

    return path || "/";
  }

  function initCurrentYear() {
    document.querySelectorAll("[data-current-year]").forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function initHeader() {
    var header = document.querySelector("[data-site-header]");
    if (!header || header.dataset.navigationReady === "true") return;

    var toggle = header.querySelector("[data-menu-toggle]");
    var nav = header.querySelector("[data-site-nav]");
    var navAnchors = nav ? nav.querySelectorAll("a[href]") : [];
    var currentPath = normalizePath(window.location.pathname);

    function isMobile() {
      return window.innerWidth <= MOBILE_BREAKPOINT;
    }

    function isOpen() {
      return header.classList.contains("nav-open");
    }

    function setMenu(open) {
      header.classList.toggle("nav-open", open);
      document.body.classList.toggle("menu-open", open);

      if (toggle) {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute(
          "aria-label",
          open ? "Menu sluiten" : "Menu openen"
        );
      }

      if (nav) {
        if (isMobile()) {
          nav.setAttribute("aria-hidden", String(!open));
        } else {
          nav.removeAttribute("aria-hidden");
        }
      }
    }

    function updateActiveLinks() {
      navAnchors.forEach(function (link) {
        var href = link.getAttribute("href");

        if (
          !href ||
          href.charAt(0) === "#" ||
          /^(?:mailto:|tel:)/i.test(href)
        ) {
          return;
        }

        var target;

        try {
          target = new URL(href, window.location.href);
        } catch (error) {
          return;
        }

        var active = normalizePath(target.pathname) === currentPath;

        link.classList.toggle("is-active", active);
        link.classList.toggle(
          "is-current",
          active && link.classList.contains("site-nav__cta")
        );

        if (active) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    if (toggle) {
      toggle.addEventListener("click", function () {
        setMenu(!isOpen());
      });
    }

    /*
     * Er wordt hier bewust geen preventDefault() gebruikt.
     * Hierdoor blijven de links normaal naar de HTML-pagina's gaan.
     */
    navAnchors.forEach(function (link) {
      link.addEventListener("click", function () {
        if (isMobile()) {
          setMenu(false);
        }
      });
    });

    document.addEventListener("click", function (event) {
      if (
        !isMobile() ||
        !isOpen() ||
        header.contains(event.target)
      ) {
        return;
      }

      setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        setMenu(false);

        if (toggle) {
          toggle.focus();
        }
      }
    });

    window.addEventListener("resize", function () {
      if (!isMobile()) {
        setMenu(false);
      } else if (nav) {
        nav.setAttribute("aria-hidden", String(!isOpen()));
      }
    });

    window.addEventListener(
      "scroll",
      function () {
        header.classList.toggle(
          "is-scrolled",
          window.scrollY > 10
        );
      },
      { passive: true }
    );

    updateActiveLinks();
    setMenu(false);

    header.dataset.navigationReady = "true";
  }

  function initRailButtons() {
    document
      .querySelectorAll("[data-rail-prev], [data-rail-next]")
      .forEach(function (button) {
        if (button.dataset.railReady === "true") return;

        button.addEventListener("click", function () {
          var wrap = button.closest(".rail-wrap");
          var rail = wrap
            ? wrap.querySelector("[data-rail]")
            : null;

          if (!rail) return;

          var direction = button.hasAttribute("data-rail-prev")
            ? -1
            : 1;

          rail.scrollBy({
            left: direction * rail.clientWidth * 0.82,
            behavior: "smooth"
          });
        });

        button.dataset.railReady = "true";
      });
  }

  function initProjectCount() {
    var grid = document.querySelector("[data-project-grid]");
    var countNode = document.querySelector("[data-project-count]");

    if (!grid || !countNode) return;

    var amount = grid.querySelectorAll(
      "[data-project-card]"
    ).length;

    countNode.textContent =
      amount +
      (amount === 1
        ? " project zichtbaar"
        : " projecten zichtbaar");
  }

  function initFaq() {
    document
      .querySelectorAll("[data-contact-faq] details")
      .forEach(function (item) {
        item.addEventListener("toggle", function () {
          if (!item.open) return;

          document
            .querySelectorAll("[data-contact-faq] details")
            .forEach(function (other) {
              if (other !== item) {
                other.open = false;
              }
            });
        });
      });
  }

  function initQuoteForm() {
    var form = document.querySelector("[data-offerte-form]");

    if (!form || form.dataset.quoteReady === "true") {
      return;
    }

    var serviceInputs = Array.prototype.slice.call(
      form.querySelectorAll('[name="dienst[]"]')
    );

    var serviceFeedback = form.querySelector(
      "[data-service-feedback]"
    );

    var clientInputs = Array.prototype.slice.call(
      form.querySelectorAll(
        'input[name="opdrachtgever"]'
      )
    );

    var companyField = form.querySelector(
      "[data-company-field]"
    );

    var companyInput = form.querySelector(
      "[data-company-input]"
    );

    var submitButton = form.querySelector(
      'button[type="submit"]'
    );

    function selectedClientType() {
      var selected = form.querySelector(
        'input[name="opdrachtgever"]:checked'
      );

      return selected ? selected.value : "particulier";
    }

    function updateCompanyField() {
      var required =
        selectedClientType() !== "particulier";

      if (companyField) {
        companyField.hidden = !required;
      }

      if (companyInput) {
        companyInput.required = required;
        companyInput.disabled = !required;
        companyInput.setAttribute(
          "aria-required",
          String(required)
        );
      }
    }

    function hasSelectedService() {
      return serviceInputs.some(function (input) {
        return input.checked;
      });
    }

    function updateServiceFeedback(showError) {
      var valid = hasSelectedService();

      if (serviceFeedback) {
        serviceFeedback.hidden = valid || !showError;

        serviceFeedback.textContent = valid
          ? ""
          : "Selecteer minimaal één dienst voordat u het formulier verstuurt.";
      }

      serviceInputs.forEach(function (input) {
        input.setAttribute(
          "aria-invalid",
          String(!valid && showError)
        );
      });

      return valid;
    }

    function prefillFromQuery() {
      var params = new URLSearchParams(
        window.location.search
      );

      var service = params.get("dienst");
      var locationValue = params.get("locatie");
      var phone = params.get("telefoon");

      if (service) {
        var safeService = String(service).replace(
          /["\\]/g,
          "\\$&"
        );

        var serviceInput = form.querySelector(
          '[name="dienst[]"][value="' +
            safeService +
            '"]'
        );

        if (serviceInput) {
          serviceInput.checked = true;
        }
      }

      if (locationValue) {
        var postcode = form.querySelector(
          "[data-quote-location]"
        );

        var place = form.querySelector(
          'input[name="plaats"]'
        );

        if (
          /^\d{4}\s?[a-z]{2}$/i.test(
            locationValue.trim()
          )
        ) {
          if (postcode) {
            postcode.value = locationValue;
          }
        } else if (place) {
          place.value = locationValue;
        }
      }

      if (phone) {
        var phoneInput = form.querySelector(
          'input[name="telefoon"]'
        );

        if (phoneInput) {
          phoneInput.value = phone;
        }
      }
    }

    function showSuccessMessage() {
      var params = new URLSearchParams(
        window.location.search
      );

      if (params.get("verzonden") !== "1") {
        return;
      }

      var message = document.createElement("div");

      message.className = "policy-notice";
      message.setAttribute("role", "status");
      message.setAttribute("aria-live", "polite");

      message.innerHTML =
        "<strong>Uw offerteaanvraag is verstuurd.</strong>" +
        "<p>Bedankt. De Kinkelder Cleaning neemt zo snel mogelijk contact met u op.</p>";

      form.parentNode.insertBefore(message, form);
    }

    clientInputs.forEach(function (input) {
      input.addEventListener(
        "change",
        updateCompanyField
      );
    });

    serviceInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        updateServiceFeedback(false);
      });
    });

    form.addEventListener("submit", function (event) {
      if (!updateServiceFeedback(true)) {
        event.preventDefault();

        if (serviceInputs[0]) {
          serviceInputs[0].focus();
        }

        return;
      }

      if (!form.reportValidity()) {
        event.preventDefault();
        return;
      }

      /*
       * Bij een geldige aanvraag wordt preventDefault()
       * niet gebruikt. Het formulier wordt rechtstreeks
       * naar FormSubmit verstuurd.
       */
      if (submitButton) {
        var label =
          submitButton.querySelector("span");

        if (label) {
          label.textContent =
            "Aanvraag wordt verstuurd...";
        }

        submitButton.setAttribute(
          "aria-busy",
          "true"
        );
      }
    });

    prefillFromQuery();
    updateCompanyField();
    updateServiceFeedback(false);
    showSuccessMessage();

    form.dataset.quoteReady = "true";
  }

  function initFileUpload() {
    document
      .querySelectorAll("[data-file-field]")
      .forEach(function (field) {
        if (field.dataset.fileReady === "true") {
          return;
        }

        var input = field.querySelector(
          "[data-file-input]"
        );

        var preview = field.querySelector(
          "[data-file-preview]"
        );

        var feedback = field.querySelector(
          "[data-file-feedback]"
        );

        if (!input || !preview || !feedback) {
          return;
        }

        var selectedFiles = Array.prototype.slice.call(
          input.files || []
        );

        function fileKey(file) {
          return [
            file.name,
            file.size,
            file.lastModified
          ].join("::");
        }

        function syncInput() {
          if (typeof DataTransfer === "undefined") {
            return;
          }

          var transfer = new DataTransfer();

          selectedFiles.forEach(function (file) {
            transfer.items.add(file);
          });

          input.files = transfer.files;
        }

        function totalSize(files) {
          return files.reduce(function (sum, file) {
            return sum + file.size;
          }, 0);
        }

        function showFeedback(message) {
          feedback.textContent = message || "";
          feedback.hidden = !message;
        }

        function removeFile(index) {
          selectedFiles.splice(index, 1);

          syncInput();
          render();
          showFeedback("");
        }

        function render() {
          preview.replaceChildren();
          preview.hidden =
            selectedFiles.length === 0;

          selectedFiles.forEach(function (
            file,
            index
          ) {
            var figure =
              document.createElement("figure");

            var image =
              document.createElement("img");

            var caption =
              document.createElement("figcaption");

            var removeButton =
              document.createElement("button");

            var objectUrl =
              URL.createObjectURL(file);

            figure.className =
              "contact-file-preview";

            image.src = objectUrl;
            image.alt =
              "Voorbeeld van " + file.name;
            image.loading = "lazy";

            image.addEventListener(
              "load",
              function () {
                URL.revokeObjectURL(objectUrl);
              },
              { once: true }
            );

            image.addEventListener(
              "error",
              function () {
                URL.revokeObjectURL(objectUrl);
              },
              { once: true }
            );

            caption.className =
              "contact-file-preview__name";

            caption.textContent = file.name;

            removeButton.type = "button";

            removeButton.className =
              "contact-file-preview__remove";

            removeButton.setAttribute(
              "aria-label",
              "Verwijder " + file.name
            );

            removeButton.textContent = "×";

            removeButton.addEventListener(
              "click",
              function () {
                removeFile(index);
              }
            );

            figure.appendChild(image);
            figure.appendChild(caption);
            figure.appendChild(removeButton);

            preview.appendChild(figure);
          });
        }

        input.addEventListener(
          "change",
          function () {
            var incoming =
              Array.prototype.slice.call(
                input.files || []
              );

            var known = new Set(
              selectedFiles.map(fileKey)
            );

            var candidates =
              selectedFiles.slice();

            var errorMessage = "";

            incoming.forEach(function (file) {
              if (
                !/^image\/(?:jpeg|png|webp)$/i.test(
                  file.type
                )
              ) {
                errorMessage =
                  "Gebruik alleen JPG-, PNG- of WebP-afbeeldingen.";

                return;
              }

              var key = fileKey(file);

              if (!known.has(key)) {
                candidates.push(file);
                known.add(key);
              }
            });

            if (
              totalSize(candidates) >
              MAX_UPLOAD_TOTAL
            ) {
              errorMessage =
                "De totale bestandsgrootte mag maximaal 10 MB zijn.";
            } else if (!errorMessage) {
              selectedFiles = candidates;
            }

            syncInput();
            render();
            showFeedback(errorMessage);
          }
        );

        var form = field.closest("form");

        if (form) {
          form.addEventListener(
            "reset",
            function () {
              window.setTimeout(function () {
                selectedFiles = [];

                syncInput();
                render();
                showFeedback("");
              }, 0);
            }
          );
        }

        render();

        field.dataset.fileReady = "true";
      });
  }

  onReady(function () {
    initCurrentYear();
    initHeader();
    initRailButtons();
    initProjectCount();
    initFaq();
    initQuoteForm();
    initFileUpload();
  });
})();
