/* ============================================
   Board (게시판) - 목록 & 상세
   ============================================ */

const categoryNames = {
  '': '전체', news: '언론보도', notice: '공지사항', case: '도입사례', newsletter: '뉴스레터'
};

let currentCategory = '';
let currentPage = 1;

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  currentCategory = params.get('category') || '';
  currentPage = parseInt(params.get('page')) || 1;

  await loadCategories();
  await loadPosts();
  updatePageTitle();
});

// --- Update Page Title ---
function updatePageTitle() {
  const title = categoryNames[currentCategory] || '홍보센터';
  document.getElementById('pageTitle').textContent = title;
  document.title = `${title} - WATIL`;

  const descs = {
    news: 'WATIL의 언론보도 소식을 확인하세요.',
    notice: 'WATIL의 공지사항을 안내합니다.',
    case: '다양한 산업에서의 도입 사례를 소개합니다.',
    newsletter: 'WATIL 뉴스레터를 통해 최신 소식을 받아보세요.'
  };
  document.getElementById('pageDesc').textContent = descs[currentCategory] || 'WATIL의 최신 소식을 전해드립니다.';
}

// --- Load Categories ---
async function loadCategories() {
  const filterEl = document.getElementById('categoryFilter');
  const categories = ['', 'news', 'notice', 'case', 'newsletter'];

  filterEl.innerHTML = categories.map(slug => {
    const isActive = slug === currentCategory;
    return `<button class="btn ${isActive ? 'btn--primary' : 'btn--outline'}"
            style="padding:10px 24px;font-size:.875rem;"
            data-category="${slug}"
            onclick="filterCategory(this)">${categoryNames[slug]}</button>`;
  }).join('');
}

// --- Filter Category ---
function filterCategory(btn) {
  currentCategory = btn.dataset.category;
  currentPage = 1;

  // Update URL
  const url = new URL(window.location);
  if (currentCategory) url.searchParams.set('category', currentCategory);
  else url.searchParams.delete('category');
  url.searchParams.delete('page');
  window.history.pushState({}, '', url);

  // Update buttons
  document.querySelectorAll('#categoryFilter .btn').forEach(b => {
    b.className = `btn ${b.dataset.category === currentCategory ? 'btn--primary' : 'btn--outline'}`;
  });

  updatePageTitle();
  loadPosts();
}

// --- Load Posts ---
async function loadPosts() {
  const grid = document.getElementById('postsGrid');
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px 0;color:var(--color-text-muted);">로딩 중...</div>';

  try {
    let url = `/api/board/posts?page=${currentPage}&size=9`;
    if (currentCategory) url += `&category=${currentCategory}`;

    const data = await apiFetch(url);

    if (!data.posts.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px 0;color:var(--color-text-muted);">등록된 게시글이 없습니다.</div>';
      document.getElementById('pagination').innerHTML = '';
      return;
    }

    grid.innerHTML = data.posts.map(post => `
      <a href="/post.html?id=${post.id}" class="card" data-animate>
        <div class="card__image" style="background:linear-gradient(135deg,#e8f0fe,#d2e3fc);display:flex;align-items:center;justify-content:center;">
          <span style="font-size:2rem;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">&#128196;</span>
        </div>
        <div class="card__body">
          <span class="card__category">${post.category_name}</span>
          <h3 class="card__title">${escapeHtml(post.title)}</h3>
          <p class="card__summary">${escapeHtml(post.summary)}</p>
          <div class="card__meta">
            <span>${formatDate(post.created_at)}</span>
            <span>조회 ${post.hit_count}</span>
          </div>
        </div>
      </a>
    `).join('');

    renderPagination(data.pagination);
    initAnimations();
  } catch (err) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px 0;color:#e53e3e;">게시글을 불러올 수 없습니다.</div>';
  }
}

// --- Pagination ---
function renderPagination(pg) {
  const el = document.getElementById('pagination');
  if (pg.totalPages <= 1) { el.innerHTML = ''; return; }

  let html = '';
  if (pg.page > 1) {
    html += `<button class="pagination__btn" onclick="goPage(${pg.page - 1})">&laquo;</button>`;
  }

  const start = Math.max(1, pg.page - 2);
  const end = Math.min(pg.totalPages, pg.page + 2);

  for (let i = start; i <= end; i++) {
    html += `<button class="pagination__btn ${i === pg.page ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }

  if (pg.page < pg.totalPages) {
    html += `<button class="pagination__btn" onclick="goPage(${pg.page + 1})">&raquo;</button>`;
  }
  el.innerHTML = html;
}

function goPage(page) {
  currentPage = page;
  const url = new URL(window.location);
  url.searchParams.set('page', page);
  window.history.pushState({}, '', url);
  loadPosts();
  window.scrollTo({ top: 300, behavior: 'smooth' });
}

// --- Helpers ---
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
