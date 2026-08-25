/* ======================================================
   ITE Kottakkal — script.js
   ====================================================== */
'use strict';

// ---- Hamburger / Mobile Nav ----
const hamburger = document.getElementById('hamburger');
const mobileOverlay = document.getElementById('mobile-overlay');
const mobileLinks = document.querySelectorAll('.mobile-nav__link');

function openMenu() {
  if (!hamburger || !mobileOverlay) return;
  hamburger.classList.add('open');
  mobileOverlay.classList.add('open');
  mobileOverlay.setAttribute('aria-hidden', 'false');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  if (!hamburger || !mobileOverlay) return;
  hamburger.classList.remove('open');
  mobileOverlay.classList.remove('open');
  mobileOverlay.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger) {
  hamburger.addEventListener('click', () => {
    if (hamburger.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });
}

mobileLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

// ---- Sticky Header Shadow ----
const header = document.getElementById('header');
function onScroll() {
  if (!header) return;
  if (window.scrollY > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}
window.addEventListener('scroll', onScroll, { passive: true });

// ---- Active Nav Link on Scroll ----
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link');

function updateActiveNav() {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionId) {
          link.classList.add('active');
        }
      });
    }
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

// ---- Intersection Observer — reveal animations ----
const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

// Animate course cards, feature cards, contact cards, gallery items
const revealEls = document.querySelectorAll(
  '.course-card, .feature-card, .contact-card, .gallery__item, .timeline__item, .cert-card'
);
revealEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity .6s ease ${i * 0.07}s, transform .6s ease ${i * 0.07}s`;
  revealObserver.observe(el);
});

// ---- Smooth scroll for all anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const headerHeight = document.getElementById('header').offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  });
});

// ---- Gallery Lightbox ----
const galleryItems = document.querySelectorAll('.gallery__item');

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
}

function openGalleryItem(item) {
  const img = item.querySelector('img');
  if (!img) return;
  const caption = item.querySelector('.gallery__caption');
  openLightbox(img.src, img.alt, caption ? caption.textContent : '');
}

galleryItems.forEach(item => {
  const img = item.querySelector('img');
  item.setAttribute('role', 'button');
  item.setAttribute('tabindex', '0');
  item.setAttribute('aria-label', `Open gallery image${img && img.alt ? `: ${img.alt}` : ''}`);

  item.addEventListener('click', () => openGalleryItem(item));
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openGalleryItem(item);
    }
  });
});

function openLightbox(src, alt, caption) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', caption || alt || 'Gallery image');
  lightbox.innerHTML = `
    <div class="lightbox__backdrop"></div>
    <div class="lightbox__content">
      <button class="lightbox__close" aria-label="Close gallery image">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="lightbox__img" />
      <p class="lightbox__caption">${escapeHtml(caption)}</p>
    </div>
  `;
  document.body.appendChild(lightbox);
  document.body.style.overflow = 'hidden';

  // Animate in
  requestAnimationFrame(() => {
    lightbox.style.opacity = '1';
    lightbox.querySelector('.lightbox__content').style.transform = 'scale(1)';
  });

  const closeButton = lightbox.querySelector('.lightbox__close');
  const backdrop = lightbox.querySelector('.lightbox__backdrop');
  const previouslyFocused = document.activeElement;

  function closeLightbox() {
    lightbox.style.opacity = '0';
    document.removeEventListener('keydown', handleLightboxKeydown);
    setTimeout(() => {
      lightbox.remove();
      document.body.style.overflow = '';
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    }, 300);
  }

  function handleLightboxKeydown(e) {
    if (e.key === 'Escape') closeLightbox();
  }

  backdrop.addEventListener('click', closeLightbox);
  closeButton.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', handleLightboxKeydown);
  closeButton.focus();
}

// Inject lightbox styles
const lbStyle = document.createElement('style');
lbStyle.textContent = `
  .lightbox {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity .3s ease;
  }
  .lightbox__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(8,21,56,.92);
    backdrop-filter: blur(8px);
  }
  .lightbox__content {
    position: relative;
    z-index: 1;
    max-width: 90vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    transform: scale(.92);
    transition: transform .3s cubic-bezier(.4,0,.2,1);
  }
  .lightbox__close {
    position: absolute;
    top: -3rem;
    right: 0;
    color: white;
    background: rgba(255,255,255,.15);
    border: none;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .2s;
  }
  .lightbox__close:hover { background: rgba(244,124,32,.8); }
  .lightbox__img {
    max-width: 100%;
    max-height: 75vh;
    border-radius: 12px;
    object-fit: contain;
    box-shadow: 0 32px 80px rgba(0,0,0,.6);
  }
  .lightbox__caption {
    color: rgba(255,255,255,.8);
    font-size: .9rem;
    font-weight: 500;
    text-align: center;
  }
`;
document.head.appendChild(lbStyle);

// ---- Floating WhatsApp pulse animation ----
const floatWa = document.getElementById('float-wa-btn');
if (floatWa) {
  setTimeout(() => {
    floatWa.style.animation = 'wa-bounce 1.2s ease 3';
  }, 3000);
}

const waPulseStyle = document.createElement('style');
waPulseStyle.textContent = `
  @keyframes wa-bounce {
    0%, 100% { transform: scale(1); }
    30% { transform: scale(1.15); }
    60% { transform: scale(.95); }
  }
`;
document.head.appendChild(waPulseStyle);

// ---- Top bar hide on scroll ----
const topBar = document.getElementById('top-bar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  if (currentScroll > 100 && topBar) {
    topBar.style.transform = 'translateY(-100%)';
    topBar.style.transition = 'transform .3s ease';
  } else if (topBar) {
    topBar.style.transform = 'translateY(0)';
  }
  lastScroll = currentScroll;
}, { passive: true });

console.log('ITE Kottakkal website initialized successfully.');
