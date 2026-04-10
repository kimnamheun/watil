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
    // Hamburger toggle
    navToggle.addEventListener('click', () => {
      const opening = !nav.classList.contains('open');
      nav.classList.toggle('open');
      // Animate hamburger ↔ X
      const [s1, s2, s3] = navToggle.querySelectorAll('span');
      if (opening) {
        s1.style.transform = 'rotate(45deg) translate(5px,5px)';
        s2.style.opacity = '0';
        s3.style.transform = 'rotate(-45deg) translate(5px,-5px)';
      } else {
        s1.style.transform = '';
        s2.style.opacity = '';
        s3.style.transform = '';
      }
    });

    // Dropdown parents (사업영역, 제품, 홍보센터) - mobile only
    document.querySelectorAll('.nav__item').forEach(item => {
      const link = item.querySelector(':scope > .nav__link');
      const dropdown = item.querySelector('.nav__dropdown');
      if (!link || !dropdown) return;

      link.addEventListener('click', (e) => {
        if (window.innerWidth > 767) return; // desktop: default hover behavior
        e.preventDefault();
        const wasOpen = item.classList.contains('open');
        // close all
        document.querySelectorAll('.nav__item.open').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });

    // Any real link click inside nav → close mobile menu
    nav.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      // This is a real navigation link
      nav.classList.remove('open');
      const [s1, s2, s3] = navToggle.querySelectorAll('span');
      s1.style.transform = '';
      s2.style.opacity = '';
      s3.style.transform = '';
    });
  }

  // --- Scroll Animations ---
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
