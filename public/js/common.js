/* ============================================
   WATIL - Common JavaScript
   ============================================ */

// --- Header Scroll Effect ---
const header = document.querySelector('.header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// --- Mobile Nav Toggle ---
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    navToggle.classList.toggle('active');
  });

  // Close nav when clicking a link
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.classList.remove('active');
    });
  });

  // Mobile dropdown toggle
  nav.querySelectorAll('.nav__item').forEach(item => {
    const dropdown = item.querySelector('.nav__dropdown');
    if (dropdown) {
      item.querySelector('.nav__link').addEventListener('click', (e) => {
        if (window.innerWidth <= 767) {
          e.preventDefault();
          item.classList.toggle('open');
        }
      });
    }
  });
}

// --- Scroll Animations ---
function initAnimations() {
  const elements = document.querySelectorAll('[data-animate]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  elements.forEach(el => observer.observe(el));
}
document.addEventListener('DOMContentLoaded', initAnimations);

// --- Active Nav Highlight ---
function highlightNav() {
  const path = window.location.pathname.replace('.html', '').replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href')?.replace('.html', '').replace(/\/$/, '') || '/';
    link.classList.toggle('active', href === path);
  });
}
highlightNav();

// --- Helper: Format Date ---
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

// --- Helper: API Fetch ---
async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}
