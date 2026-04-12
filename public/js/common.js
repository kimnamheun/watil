/* ============================================
   WATIL - Common JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Header Scroll Effect ---
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // --- Mobile Nav ---
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');

  if (navToggle && nav) {

    function toggleNav() {
      const opening = !nav.classList.contains('open');
      nav.classList.toggle('open');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = opening ? 'rotate(45deg) translate(5px,5px)' : '';
      spans[1].style.opacity = opening ? '0' : '';
      spans[2].style.transform = opening ? 'rotate(-45deg) translate(5px,-5px)' : '';
    }

    function closeNav() {
      nav.classList.remove('open');
      document.querySelectorAll('.nav__item.open').forEach(i => i.classList.remove('open'));
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }

    // Hamburger button
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleNav();
    });

    // All clicks inside nav
    nav.addEventListener('click', (e) => {
      if (window.innerWidth > 767) return;

      const clickedLink = e.target.closest('a');
      if (!clickedLink) return;

      const navItem = clickedLink.closest('.nav__item');
      const isParentLink = clickedLink.classList.contains('nav__link');
      const hasDropdown = navItem && navItem.querySelector('.nav__dropdown');

      // Case 1: Parent link with dropdown → toggle submenu
      if (isParentLink && hasDropdown) {
        e.preventDefault();
        e.stopPropagation();
        const wasOpen = navItem.classList.contains('open');
        document.querySelectorAll('.nav__item.open').forEach(i => i.classList.remove('open'));
        if (!wasOpen) navItem.classList.add('open');
        return;
      }

      // Case 2: Any other link (dropdown child or simple nav link) → navigate & close
      closeNav();
      // Let the default <a> navigation happen
    });
  }

  // --- Init ---
  initAnimations();
  highlightNav();
});

// --- Scroll Animations (global) ---
function initAnimations() {
  const elements = document.querySelectorAll('[data-animate]:not(.is-visible)');
  if (!elements.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach(el => observer.observe(el));
}

function highlightNav() {
  const path = window.location.pathname.replace('.html', '').replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href')?.replace('.html', '').replace(/\/$/, '') || '/';
    link.classList.toggle('active', href === path);
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}
