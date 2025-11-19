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

  // salva in localStorage (se disponibile)
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (e) {
    // ignora eventuali errori (es. privacy mode)
  }

  // testi semplici + elementi che vogliono HTML
  document.querySelectorAll("[data-it]").forEach((el) => {
    const value = el.getAttribute(`data-${lang}`);
    if (value == null) return;

    // se l'elemento dichiara che contiene HTML, usa innerHTML
    if (el.dataset.html === "true") {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });

  updateDownloadLinks(lang);
}

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchLanguage(btn.dataset.lang);
  });
});

// lingua di default
switchLanguage("it");

function updateDownloadLinks(lang) {
  const cvBtn = document.getElementById("btn-cv");
  const portBtn = document.getElementById("btn-portfolio");

  if (!cvBtn || !portBtn) return;

  if (lang === "it") {
    cvBtn.href = "assets/pdf/aversa-danilo-cv-it.pdf";
    portBtn.href = "assets/pdf/aversa-danilo-portfolio-it.pdf";
  } else {
    cvBtn.href = "assets/pdf/aversa-danilo-cv-en.pdf";
    portBtn.href = "assets/pdf/aversa-danilo-portfolio-en.pdf";
  }
}

/* === ABOUT FULLSCREEN MODAL === */
const aboutModal = document.getElementById("about-modal");
const aboutOpenBtn = document.querySelector(".about-open");
const aboutCloseBtn = aboutModal
  ? aboutModal.querySelector(".about-close")
  : null;

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
  aboutOpenBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openAboutModal();
  });
}

if (aboutCloseBtn) {
  aboutCloseBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeAboutModal();
  });
}

if (aboutModal) {
  aboutModal.addEventListener("click", (e) => {
    if (e.target === aboutModal) {
      closeAboutModal();
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    aboutModal &&
    aboutModal.classList.contains("open")
  ) {
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
  contactsOpenBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof closeFocused === "function") closeFocused();
    openContactsModal();
  });
}

if (contactsModal) {
  const closeBtn = contactsModal.querySelector(".contacts-close");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeContactsModal();
    });
  }

  contactsModal.addEventListener("click", (e) => {
    if (e.target === contactsModal) closeContactsModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (
    e.key === "Escape" &&
    contactsModal &&
    contactsModal.classList.contains("open")
  ) {
    closeContactsModal();
  }
});

const navToggle = document.querySelector(".nav-toggle");
const navbar = document.querySelector(".navbar");
const navMain = document.querySelector(".nav-main");

if (navToggle && navbar && navMain) {
  navToggle.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // chiudi il menu quando clicchi un link
  navMain.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navbar.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}
