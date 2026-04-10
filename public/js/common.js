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
    function closeNav() {
      nav.classList.remove('open');
      navToggle.querySelectorAll('span').forEach(s => s.style.cssText = '');
    }

    function openNav() {
      nav.classList.add('open');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.cssText = 'transform:rotate(45deg) translate(5px,5px)';
      spans[1].style.cssText = 'opacity:0';
      spans[2].style.cssText = 'transform:rotate(-45deg) translate(5px,-5px)';
    }

    // Toggle button
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (nav.classList.contains('open')) closeNav();
      else openNav();
    });

    // Handle each nav item
    nav.querySelectorAll('.nav__item').forEach(item => {
      const link = item.querySelector('.nav__link');
      const dropdown = item.querySelector('.nav__dropdown');

      if (link && dropdown) {
        // Has dropdown → toggle on mobile
        link.addEventListener('click', (e) => {
          if (window.innerWidth <= 767) {
            e.preventDefault();
            e.stopPropagation();
            // Close others
            nav.querySelectorAll('.nav__item').forEach(other => {
              if (other !== item) other.classList.remove('open');
            });
            item.classList.toggle('open');
          }
        });

        // Dropdown child links → navigate & close
        dropdown.querySelectorAll('a').forEach(a => {
          a.addEventListener('click', () => {
            if (window.innerWidth <= 767) closeNav();
          });
        });
      } else if (link) {
        // No dropdown → just close nav on mobile click
        link.addEventListener('click', () => {
          if (window.innerWidth <= 767) closeNav();
        });
      }
    });
  }

  // --- Scroll Animations ---
  initAnimations();

  // --- Active Nav Highlight ---
  highlightNav();
});

// --- Scroll Animations (global for re-use) ---
function initAnimations() {
  const elements = document.querySelectorAll('[data-animate]:not(.is-visible)');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach(el => observer.observe(el));
}

// --- Active Nav Highlight ---
function highlightNav() {
  const path = window.location.pathname.replace('.html', '').replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav__link').forEach(link => {
    const href = link.getAttribute('href')?.replace('.html', '').replace(/\/$/, '') || '/';
    link.classList.toggle('active', href === path);
  });
}

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
