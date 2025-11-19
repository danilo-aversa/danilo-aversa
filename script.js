/* v2.2 2025-11-18T19:50:00Z */
document.getElementById("year").textContent = new Date().getFullYear();

/* === Costante per localStorage lingua === */
const LANG_STORAGE_KEY = "portfolioLang";

/* === Lingua === */
const buttons = document.querySelectorAll(".lang-btn");

function switchLanguage(lang) {
  document.documentElement.lang = lang;

  // salva in localStorage (se disponibile)
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch (e) {
    // ignora eventuali errori (es. privacy mode)
  }

  // testi semplici (header, hero, about, pulsanti, ecc.)
  document.querySelectorAll("[data-it]").forEach(el => {
    const value = el.getAttribute(`data-${lang}`);
    if (value != null) el.textContent = value;
  });

  // descrizione del lavoro attualmente aperto (HTML)
  document.querySelectorAll(".slider article.expanded").forEach(card => {
    const descHtml = card.getAttribute(`data-desc-${lang}`);
    const box = ensureWorkDescBox(card);
    box.innerHTML = descHtml || "";
  });
}

// Lingua iniziale: da localStorage oppure "it"
let initialLang = "it";
try {
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored === "it" || stored === "en") initialLang = stored;
} catch (e) {}
switchLanguage(initialLang);

// click sui pulsanti lingua
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang || "it";
    switchLanguage(lang);

    // se il menu mobile è aperto, chiudilo
    const navbarEl = document.querySelector(".navbar");
    const navToggleEl = document.querySelector(".nav-toggle");
    if (navbarEl && navbarEl.classList.contains("nav-open")) {
      navbarEl.classList.remove("nav-open");
      if (navToggleEl) navToggleEl.setAttribute("aria-expanded", "false");
    }
  });
});

/* === Riferimenti slider === */
const sliderEl = document.querySelector(".slider");
const trackEl  = document.querySelector(".slider-track");
const cards    = document.querySelectorAll(".slider article");
const closeBtnMobile = document.querySelector(".slider-close");
let active = null;

// posizione salvata prima di entrare in focus
let savedScrollLeft = 0;

// disabilita drag nativo delle immagini
document.querySelectorAll(".slider img").forEach(img => { img.draggable = false; });

/* === Helper: contenitore per descrizione HTML === */
function ensureWorkDescBox(card) {
  let box = card.querySelector(".work-desc");
  if (!box) {
    box = document.createElement("div");
    box.className = "work-desc";
    card.appendChild(box);
  }
  return box;
}

/* Util: centra una card nello slider (usato solo quando apri un lavoro) */
function centerCardInSlider(slider, card) {
  const sRect = slider.getBoundingClientRect();
  const cRect = card.getBoundingClientRect();
  const current = slider.scrollLeft;
  const deltaToCenter = (cRect.left - sRect.left) + (cRect.width / 2) - (sRect.width / 2);
  const target = current + deltaToCenter;
  slider.scrollTo({ left: target, behavior: "smooth" });
}

/* All’avvio: parti da sinistra */
window.addEventListener("load", () => {
  if (!sliderEl || !trackEl) return;
  sliderEl.scrollLeft = 0;
});

/* === VIDEO helpers === */
function mountVideo(card) {
  if (card.dataset.type !== "video") return;

  let video = card.querySelector("video");
  if (!video) {
    video = document.createElement("video");
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");       // autoplay affidabile
    video.setAttribute("autoplay", "");
    video.preload = "metadata";

    const src = card.dataset.videoSrc;
    if (src) video.src = src;

    const poster = card.dataset.videoPoster;
    if (poster) video.poster = poster;

    const img = card.querySelector("img");
    if (img) img.after(video);
    else card.prepend(video);
  }

  const posterImg = card.querySelector("img");
  if (posterImg) posterImg.setAttribute("data-role", "poster-hidden");

  video.play?.().catch(() => {});
}

function unmountVideo(card) {
  if (card.dataset.type !== "video") return;

  const video = card.querySelector("video");
  if (video) {
    try { video.pause?.(); } catch {}
    video.remove();
  }
  const posterImg = card.querySelector("img");
  if (posterImg) posterImg.removeAttribute("data-role");
}

/* === DRAG TO SCROLL con INERZIA (disabilitato in focus) === */
let isDown = false;
let startX;
let scrollLeft;
let lastX;
let lastTime;
let velocity = 0;
let momentumId = null;

let dragMoved = false;
const DRAG_THRESHOLD = 6;   // px

function canDrag() {
  return !sliderEl.classList.contains("focused");
}

function stopMomentum() {
  if (momentumId) {
    cancelAnimationFrame(momentumId);
    momentumId = null;
  }
}

function startMomentum() {
  stopMomentum();
  const decay = 0.95;
  const minVel = 0.02;
  let prevTs = performance.now();

  function step(ts) {
    const dt = Math.max(1, ts - prevTs);
    prevTs = ts;

    sliderEl.scrollLeft -= velocity * dt;
    velocity *= decay;

    const atStart = sliderEl.scrollLeft <= 0;
    const atEnd = Math.ceil(sliderEl.scrollLeft + sliderEl.clientWidth) >= sliderEl.scrollWidth;
    if (Math.abs(velocity) < minVel || atStart || atEnd) {
      stopMomentum();
      return;
    }
    momentumId = requestAnimationFrame(step);
  }

  momentumId = requestAnimationFrame(step);
}

/* Mouse */
sliderEl.addEventListener("mousedown", e => {
  if (!canDrag()) return;
  isDown = true;
  sliderEl.classList.add("dragging");
  dragMoved = false;
  stopMomentum();

  startX = e.pageX;
  scrollLeft = sliderEl.scrollLeft;
  lastX = startX;
  lastTime = performance.now();
});

sliderEl.addEventListener("mousemove", e => {
  if (!isDown || !canDrag()) return;
  e.preventDefault();

  const x = e.pageX;
  const dx = x - startX;
  sliderEl.scrollLeft = scrollLeft - dx;

  const now = performance.now();
  const dt = now - lastTime;
  const dist = x - lastX;

  if (dt > 0) velocity = dist / dt;
  if (Math.abs(x - startX) > DRAG_THRESHOLD) dragMoved = true;

  lastX = x;
  lastTime = now;
});

sliderEl.addEventListener("mouseup", () => {
  if (!canDrag()) return;
  isDown = false;
  sliderEl.classList.remove("dragging");
  if (dragMoved) startMomentum();
});

sliderEl.addEventListener("mouseleave", () => {
  if (!canDrag()) return;
  if (isDown && dragMoved) startMomentum();
  isDown = false;
  sliderEl.classList.remove("dragging");
});

/* Touch */
sliderEl.addEventListener("touchstart", e => {
  if (!canDrag()) return;
  const t = e.touches[0];
  dragMoved = false;
  stopMomentum();

  startX = t.pageX;
  scrollLeft = sliderEl.scrollLeft;
  lastX = startX;
  lastTime = performance.now();
}, { passive: true });

sliderEl.addEventListener("touchmove", e => {
  if (!canDrag()) return;
  const t = e.touches[0];

  const x = t.pageX;
  const dx = x - startX;
  sliderEl.scrollLeft = scrollLeft - dx;

  const now = performance.now();
  const dt = now - lastTime;
  const dist = x - lastX;

  if (dt > 0) velocity = dist / dt;
  if (Math.abs(x - startX) > DRAG_THRESHOLD) dragMoved = true;

  lastX = x;
  lastTime = now;
}, { passive: true });

sliderEl.addEventListener("touchend", () => {
  if (!canDrag()) return;
  if (dragMoved) startMomentum();
}, { passive: true });

/* === Apertura / chiusura focus con animazioni + recupero posizione + HTML desc === */
function openFocused(card) {
  const lang = document.documentElement.lang || "it";

  // salva posizione corrente per ripristinarla dopo
  savedScrollLeft = sliderEl.scrollLeft;

  stopMomentum();

  // descrizione HTML in base alla lingua
  const descHtml = card.getAttribute(`data-desc-${lang}`);
  const box = ensureWorkDescBox(card);
  box.innerHTML = descHtml || "";

  sliderEl.classList.add("focused");
  cards.forEach(a => a.classList.remove("expanded"));
  card.classList.add("expanded", "zoom-in");
  active = card;

  mountVideo(card);

  card.addEventListener("animationend", function onEnd() {
    card.classList.remove("zoom-in");
    card.removeEventListener("animationend", onEnd);
  });

  sliderEl.style.scrollBehavior = "auto";
  sliderEl.scrollLeft = 0;
  sliderEl.style.scrollBehavior = "";

  // Sposta la X dentro la card attiva (solo mobile)
  if (closeBtnMobile && window.matchMedia("(max-width: 700px)").matches) {
    card.appendChild(closeBtnMobile);
  }
}

function closeFocused() {
  if (!active) return;
  const card = active;

  card.classList.add("zoom-out");
  unmountVideo(card);

  card.addEventListener("animationend", function onEnd() {
    card.classList.remove("zoom-out", "expanded");
    sliderEl.classList.remove("focused");
    active = null;

    sliderEl.style.scrollBehavior = "auto";
    sliderEl.scrollLeft = savedScrollLeft;
    sliderEl.style.scrollBehavior = "";

    // Riporta la X dentro lo slider (fuori dalla card)
    if (closeBtnMobile) {
      sliderEl.appendChild(closeBtnMobile);
    }

    card.removeEventListener("animationend", onEnd);
  });
}

/* Pulsante mobile per chiudere focus */
if (closeBtnMobile) {
  closeBtnMobile.addEventListener("click", e => {
    e.stopPropagation();
    if (sliderEl.classList.contains("focused")) {
      closeFocused();
    }
  });
}

/* === Click sulle card con protezione anti-click dopo drag === */
cards.forEach(card => {
  card.addEventListener("click", e => {
    if (dragMoved || sliderEl.classList.contains("dragging")) {
      dragMoved = false;
      return;
    }
    e.stopPropagation();

    if (active === card) {
      closeFocused();
      return;
    }

    if (!sliderEl.classList.contains("focused")) {
      centerCardInSlider(sliderEl, card);
      setTimeout(() => openFocused(card), 220);
    } else {
      openFocused(card);
    }
  });
});

/* Click ovunque chiude il focus (solo desktop) */
document.addEventListener("click", () => {
  if (!sliderEl.classList.contains("focused")) return;

  // su mobile NON chiudere con click generico
  const isMobile = window.matchMedia("(max-width: 700px)").matches;
  if (isMobile) return;

  closeFocused();
});

/* ESC per chiudere */
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && sliderEl.classList.contains("focused")) closeFocused();
});

/* === SCROLL ORIZZONTALE CON WHEEL === */
sliderEl.addEventListener("wheel", e => {
  // Se sei in focus → non fare nulla
  if (sliderEl.classList.contains("focused")) {
    e.preventDefault();
    return;
  }

  // Se è aperto l'about modal → NON interferire
  if (aboutModal && aboutModal.classList.contains("open")) return;

  // Previeni lo scroll verticale
  e.preventDefault();

  // Aggiungi scroll orizzontale (0.9 per stabilità)
  sliderEl.scrollLeft += e.deltaY * 0.9;
}, { passive: false });

/* === FRECCE MOBILE PREV/NEXT === */
const prevBtn = document.querySelector(".slider-prev");
const nextBtn = document.querySelector(".slider-next");

function getCardWidth() {
  const firstCard = cards[0];
  if (!firstCard) return 0;

  const styles = window.getComputedStyle(trackEl);
  const gap = parseFloat(styles.gap || styles.columnGap || "0");
  return firstCard.offsetWidth + gap;
}

function scrollByCard(direction) {
  const cardWidth = getCardWidth();
  if (!cardWidth) return;

  sliderEl.scrollBy({
    left: direction * cardWidth,
    behavior: "smooth",
  });
}

if (prevBtn && nextBtn && sliderEl && trackEl) {
  prevBtn.addEventListener("click", e => {
    e.stopPropagation();
    if (sliderEl.classList.contains("focused")) return;
    scrollByCard(-1);
  });

  nextBtn.addEventListener("click", e => {
    e.stopPropagation();
    if (sliderEl.classList.contains("focused")) return;
    scrollByCard(1);
  });
}

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
    if (typeof closeFocused === "function") closeFocused();
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

/* === NAV MOBILE === */
const navToggle = document.querySelector(".nav-toggle");
const navbar = document.querySelector(".navbar");
const navMain = document.querySelector(".nav-main");
const navCloseBtn = document.querySelector(".nav-close");

function closeNavMenu() {
  if (!navbar) return;
  navbar.classList.remove("nav-open");
  if (navToggle) navToggle.setAttribute("aria-expanded", "false");
}

if (navToggle && navbar && navMain) {
  navToggle.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // chiudi il menu quando clicchi un link o il pulsante chiudi
  navMain.addEventListener("click", (e) => {
    const target = e.target;
    if (!target) return;

    if (target.tagName === "A" || target.classList.contains("nav-close")) {
      closeNavMenu();
    }
  });
}

if (navCloseBtn) {
  navCloseBtn.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    closeNavMenu();
  });
}