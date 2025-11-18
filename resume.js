/* v1.0 2025-11-18T10:30:00Z */

// Anno in footer
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Switch lingua base (come in index, ma senza slider)
const langButtons = document.querySelectorAll(".lang-btn");

function switchLanguage(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-it]").forEach(el => {
    const value = el.getAttribute(`data-${lang}`);
    if (value != null) {
      el.textContent = value;
    }
  });
}

langButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    switchLanguage(btn.dataset.lang);
  });
});

// lingua di default
switchLanguage("it");

/* === ABOUT FULLSCREEN MODAL === */
const aboutModal = document.getElementById("about-modal");
const aboutOpenBtn = document.querySelector(".about-open");
const aboutCloseBtn = aboutModal ? aboutModal.querySelector(".about-close") : null;

function openAboutModal() {
  if (!aboutModal) return;
  aboutModal.classList.add("open");
  document.body.classList.add("modal-open");
}

function closeAboutModal() {
  if (!aboutModal) return;
  aboutModal.classList.remove("open");
  document.body.classList.remove("modal-open");
}

if (aboutOpenBtn) {
  aboutOpenBtn.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    openAboutModal();
  });
}

if (aboutCloseBtn) {
  aboutCloseBtn.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    closeAboutModal();
  });
}

if (aboutModal) {
  aboutModal.addEventListener("click", e => {
    if (e.target === aboutModal) {
      closeAboutModal();
    }
  });
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && aboutModal && aboutModal.classList.contains("open")) {
    closeAboutModal();
  }
});

const contactsModal = document.getElementById("contacts-modal");
const contactsOpenBtn = document.querySelector(".contacts-open");

function openContactsModal() {
  if (!contactsModal) return;
  contactsModal.classList.add("open");
  document.body.classList.add("modal-open");
}

function closeContactsModal() {
  if (!contactsModal) return;
  contactsModal.classList.remove("open");
  document.body.classList.remove("modal-open");
}

if (contactsOpenBtn) {
  contactsOpenBtn.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof closeFocused === "function") closeFocused();
    openContactsModal();
  });
}

if (contactsModal) {
  const closeBtn = contactsModal.querySelector(".contacts-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      closeContactsModal();
    });
  }

  contactsModal.addEventListener("click", e => {
    if (e.target === contactsModal) closeContactsModal();
  });
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape" && contactsModal && contactsModal.classList.contains("open")) {
    closeContactsModal();
  }
});
