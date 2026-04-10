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
    const isOpen = nav.classList.toggle('open');
    navToggle.classList.toggle('active');
    // Hamburger → X animation
    const spans = navToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close nav when clicking a LEAF link (not a dropdown parent)
  nav.querySelectorAll('.nav__dropdown a, .nav__item > .nav__link').forEach(link => {
    link.addEventListener('click', (e) => {
      const parentItem = link.closest('.nav__item');
      const hasDropdown = parentItem && parentItem.querySelector('.nav__dropdown');

      // If this is a parent link WITH dropdown on mobile → toggle dropdown, don't close nav
      if (hasDropdown && link.classList.contains('nav__link') && window.innerWidth <= 767) {
        e.preventDefault();
        // Close other dropdowns
        nav.querySelectorAll('.nav__item.open').forEach(other => {
          if (other !== parentItem) other.classList.remove('open');
        });
        parentItem.classList.toggle('open');
        return;
      }

      // Otherwise it's a real navigation link → close the mobile nav
      nav.classList.remove('open');
      navToggle.classList.remove('active');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
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
