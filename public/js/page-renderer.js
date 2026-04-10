/* ============================================
   WATIL - Dynamic Page Renderer
   Fetches sections from API and renders them
   ============================================ */

async function renderPage(slug) {
  try {
    const res = await fetch(`/api/pages/${slug}/sections`);
    const sections = await res.json();
    const container = document.getElementById('pageContent');
    if (!container) return;

    container.innerHTML = sections.map(s => renderSection(s)).join('');

    // Trigger scroll animations
    if (typeof initAnimations === 'function') initAnimations();
  } catch (err) {
    console.error('Page render error:', err);
  }
}

function renderSection(s) {
  const renderers = {
    'hero': renderHero,
    'feature-split': renderFeatureSplit,
    'card-grid': renderCardGrid,
    'stats': renderStats,
    'timeline': renderTimeline,
    'cta': renderCTA,
    'process': renderProcess
  };
  const fn = renderers[s.section_type];
  return fn ? fn(s) : '';
}

// --- Hero ---
function renderHero(s) {
  const bg = s.bg_style || 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)';
  let mediaHtml = '';
  if (s.media_url) {
    if (s.media_type === 'video') {
      mediaHtml = `<video autoplay muted loop playsinline style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0;"><source src="${s.media_url}"></video>
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:1;"></div>`;
    } else {
      mediaHtml = `<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:url('${s.media_url}') center/cover;z-index:0;"></div>
      <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.4);z-index:1;"></div>`;
    }
  }

  return `
  <section class="page-hero" style="background:${bg};position:relative;overflow:hidden;">
    ${mediaHtml}
    <div style="position:relative;z-index:2;">
      <h1 class="page-hero__title">${s.title || ''}</h1>
      <p class="page-hero__desc">${s.subtitle || ''}</p>
    </div>
  </section>`;
}

// --- Feature Split ---
function renderFeatureSplit(s) {
  const items = s.items || {};
  const features = items.features || [];
  const icon = items.icon || '&#128640;';
  const imgBg = items.bg || 'var(--color-bg-light)';
  const isReverse = s.sort_order % 2 === 1;
  const bgClass = s.bg_style === 'bg-light' ? 'section--light' : '';

  let mediaHtml = '';
  if (s.media_url) {
    if (s.media_type === 'video') {
      mediaHtml = `<video src="${s.media_url}" autoplay muted loop playsinline style="width:100%;border-radius:12px;"></video>`;
    } else {
      mediaHtml = `<img src="${s.media_url}" style="width:100%;border-radius:12px;">`;
    }
  } else {
    mediaHtml = `<div class="feature-split__image" style="background:${imgBg};">${icon}</div>`;
  }

  const featuresHtml = features.length ? `
    <div class="feature-list">
      ${features.map(f => `<div class="feature-list__item"><div class="feature-list__icon">&#10003;</div><span>${f}</span></div>`).join('')}
    </div>` : '';

  return `
  <section class="section ${bgClass}">
    <div class="container">
      <div class="feature-split ${isReverse ? 'feature-split--reverse' : ''}" data-animate>
        ${mediaHtml}
        <div class="feature-split__content">
          <h3>${s.title || ''}</h3>
          ${s.content || ''}
          ${featuresHtml}
          ${s.section_key.includes('cloud') || s.section_key.includes('ai') || s.section_key.includes('security') || s.section_key.includes('detail')
            ? '<div style="margin-top:32px;"><a href="/inquiry.html" class="btn btn--primary">도입 문의</a></div>' : ''}
        </div>
      </div>
    </div>
  </section>`;
}

// --- Card Grid ---
function renderCardGrid(s) {
  const items = s.items || [];
  const bgClass = s.bg_style === 'bg-light' ? 'section--light' : '';
  const hasCategory = items.some(i => i.category);

  let cardsHtml;
  if (hasCategory) {
    // Product cards
    cardsHtml = `<div class="grid grid--3">${items.map(item => `
      <div class="card" data-animate>
        <div class="card__image" style="background:${item.bg || 'var(--color-bg-light)'};display:flex;align-items:center;justify-content:center;padding-top:60%;position:relative;">
          <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:3rem;">${item.icon || ''}</span>
        </div>
        <div class="card__body">
          <span class="card__category">${item.category || ''}</span>
          <h3 class="card__title">${item.title || ''}</h3>
          <p class="card__summary">${item.desc || ''}</p>
          ${item.meta ? `<div class="card__meta"><span>${item.meta}</span></div>` : ''}
        </div>
      </div>`).join('')}</div>`;
  } else {
    // Service cards
    cardsHtml = `<div class="services__grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;">
      ${items.map(item => `
      <div class="service-card" data-animate>
        <div class="service-card__icon">${item.icon || ''}</div>
        <h3 class="service-card__title">${item.title || ''}</h3>
        <p class="service-card__desc">${item.desc || ''}</p>
      </div>`).join('')}</div>`;
  }

  return `
  <section class="section ${bgClass}">
    <div class="container">
      ${s.title ? `<div class="text-center" data-animate><h2 class="section__title">${s.title}</h2>${s.subtitle ? `<p class="section__subtitle">${s.subtitle}</p>` : ''}</div>` : ''}
      ${cardsHtml}
    </div>
  </section>`;
}

// --- Stats ---
function renderStats(s) {
  const items = s.items || [];
  return `
  <section class="section section--dark">
    <div class="container">
      <div class="stats">
        ${items.map(item => `<div data-animate><div class="stat__number">${item.number || ''}</div><div class="stat__label">${item.label || ''}</div></div>`).join('')}
      </div>
    </div>
  </section>`;
}

// --- Timeline ---
function renderTimeline(s) {
  const items = s.items || [];
  return `
  <section class="section">
    <div class="container">
      <h2 class="section__title text-center" data-animate>${s.title || ''}</h2>
      ${s.subtitle ? `<p class="section__subtitle text-center" data-animate>${s.subtitle}</p>` : ''}
      <div style="max-width:720px;margin:0 auto;">
        ${items.map((item, i) => `
        <div style="display:flex;gap:24px;padding:24px 0;${i < items.length-1 ? 'border-bottom:1px solid var(--color-border);' : ''}" data-animate>
          <div style="min-width:80px;font-size:1.25rem;font-weight:700;color:var(--color-accent);">${item.year || ''}</div>
          <div>
            <p style="font-weight:600;">${item.title || ''}</p>
            <p style="color:var(--color-text-light);font-size:.9375rem;">${item.desc || ''}</p>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </section>`;
}

// --- CTA ---
function renderCTA(s) {
  return `
  <section class="section cta">
    <div class="container">
      <h2 class="cta__title" data-animate>${s.title || ''}</h2>
      <p class="cta__desc" data-animate>${s.subtitle || ''}</p>
      <div data-animate><a href="/inquiry.html" class="btn btn--white btn--lg">무료 상담 신청</a></div>
    </div>
  </section>`;
}

// --- Process ---
function renderProcess(s) {
  const items = s.items || [];
  const bgClass = s.bg_style === 'bg-light' ? 'section--light' : '';
  return `
  <section class="section ${bgClass}">
    <div class="container text-center">
      <h2 class="section__title" data-animate>${s.title || ''}</h2>
      ${s.subtitle ? `<p class="section__subtitle" data-animate>${s.subtitle}</p>` : ''}
      <div class="grid grid--4" style="margin-top:40px;">
        ${items.map(item => `
        <div data-animate style="padding:32px 24px;background:#fff;border-radius:12px;box-shadow:var(--shadow);">
          <div style="width:48px;height:48px;background:var(--color-accent);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:700;margin:0 auto 16px;">${item.step || ''}</div>
          <h4 style="font-weight:700;margin-bottom:8px;">${item.title || ''}</h4>
          <p style="font-size:.875rem;color:var(--color-text-light);">${item.desc || ''}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>`;
}
