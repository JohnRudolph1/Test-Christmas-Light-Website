const navToggle = document.getElementById("navToggle");
const siteNav = document.getElementById("siteNav");
const navLinks = document.querySelectorAll('.site-nav a[href^="#"], .footer-nav a[href^="#"]');
const topLinks = document.querySelectorAll('.brand[href="#top"], .footer-brand[href="#top"]');
const revealItems = document.querySelectorAll(".reveal");
const quoteForm = document.getElementById("quoteForm");
const formStatus = document.getElementById("formStatus");
const header = document.querySelector(".site-header");
const pageSections = document.querySelectorAll("main section[id]");
const galleryItems = document.querySelectorAll(".gallery-item");
const lightbox = document.getElementById("galleryLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const lightboxCloseTargets = document.querySelectorAll("[data-lightbox-close]");
let galleryImageData = [];
let activeGalleryIndex = -1;

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.classList.toggle("is-open");
    siteNav.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });

  siteNav.addEventListener("click", (event) => {
    if (!event.target.matches('a[href^="#"]')) {
      return;
    }

    navToggle.classList.remove("is-open");
    siteNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = targetId ? document.querySelector(targetId) : null;

    if (!target) {
      return;
    }

    event.preventDefault();
    const headerOffset = header ? header.offsetHeight + 8 : 96;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top: targetTop,
      behavior: "smooth"
    });
  });
});

topLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});

if (revealItems.length) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.16,
    rootMargin: "0px 0px -40px 0px"
  });

  revealItems.forEach((item) => revealObserver.observe(item));
}

if (pageSections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const currentId = entry.target.getAttribute("id");
      document.querySelectorAll(".site-nav a").forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
      });
    });
  }, {
    threshold: 0.45
  });

  pageSections.forEach((section) => sectionObserver.observe(section));
}

function showError(field, message) {
  field.classList.add("invalid");
  const errorField = field.parentElement.querySelector(".form-error");
  if (errorField) {
    errorField.textContent = message;
  }
}

function clearError(field) {
  field.classList.remove("invalid");
  const errorField = field.parentElement.querySelector(".form-error");
  if (errorField) {
    errorField.textContent = "";
  }
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value) {
  return /^[0-9+().\-\s]{10,}$/.test(value.trim());
}

if (quoteForm && formStatus) {
  const requiredFields = quoteForm.querySelectorAll("[required]");

  requiredFields.forEach((field) => {
    field.addEventListener("input", () => clearError(field));
    field.addEventListener("change", () => clearError(field));
  });

  quoteForm.addEventListener("submit", (event) => {
    let isValid = true;
    formStatus.textContent = "";
    formStatus.className = "error-message text-danger form-status";

    requiredFields.forEach((field) => {
      const value = field.value.trim();

      if (!value) {
        showError(field, "This field is required.");
        isValid = false;
        return;
      }

      if (field.type === "email" && !validateEmail(value)) {
        showError(field, "Enter a valid email address.");
        isValid = false;
        return;
      }

      if (field.name === "phone" && !validatePhone(value)) {
        showError(field, "Enter a valid phone number.");
        isValid = false;
      }
    });

    if (!isValid) {
      event.preventDefault();
      formStatus.textContent = "Please correct the highlighted fields and submit again.";
      formStatus.classList.add("error");
      const firstInvalidField = quoteForm.querySelector(".invalid");
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
      return;
    }

    formStatus.textContent = "Sending your message...";
    formStatus.classList.remove("text-danger");
    formStatus.classList.add("success");
  });
}

function closeLightbox() {
  if (!lightbox || !lightboxImage || !lightboxCaption) {
    return;
  }

  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lightboxImage.src = "";
  lightboxImage.alt = "";
  lightboxCaption.textContent = "";
  activeGalleryIndex = -1;
}

function renderLightboxImage(index) {
  if (!galleryImageData.length || !lightboxImage || !lightboxCaption) {
    return;
  }

  const boundedIndex = (index + galleryImageData.length) % galleryImageData.length;
  const currentItem = galleryImageData[boundedIndex];

  activeGalleryIndex = boundedIndex;
  lightboxImage.src = currentItem.src;
  lightboxImage.alt = currentItem.alt;
  lightboxCaption.textContent = currentItem.caption;
}

if (
  galleryItems.length &&
  lightbox &&
  lightboxImage &&
  lightboxCaption &&
  lightboxClose &&
  lightboxPrev &&
  lightboxNext
) {
  galleryItems.forEach((item) => {
    const image = item.querySelector("img");
    const caption = item.querySelector("figcaption");

    if (!image) {
      return;
    }

    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `Expand image: ${image.alt}`);

    const itemIndex = galleryImageData.push({
      src: image.src,
      alt: image.alt,
      caption: caption ? caption.textContent : ""
    }) - 1;

    const openLightbox = () => {
      renderLightboxImage(itemIndex);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      lightboxClose.focus();
    };

    item.addEventListener("click", openLightbox);
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox();
      }
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", () => renderLightboxImage(activeGalleryIndex - 1));
  lightboxNext.addEventListener("click", () => renderLightboxImage(activeGalleryIndex + 1));
  lightboxCloseTargets.forEach((target) => {
    target.addEventListener("click", closeLightbox);
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
      return;
    }

    if (event.key === "ArrowLeft") {
      renderLightboxImage(activeGalleryIndex - 1);
      return;
    }

    if (event.key === "ArrowRight") {
      renderLightboxImage(activeGalleryIndex + 1);
    }
  });
}
