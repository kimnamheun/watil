/* ============================================
   WATIL Admin Dashboard
   ============================================ */

let adminToken = localStorage.getItem('adminToken') || '';
let currentSections = [];
const pageNames = { company:'회사소개', business:'사업영역', solution:'솔루션', product:'제품소개' };
const typeLabels = { hero:'히어로 배너', 'feature-split':'이미지+텍스트', 'card-grid':'카드 그리드', stats:'통계', timeline:'타임라인', cta:'CTA', process:'프로세스' };

// ======================== AUTH ========================
document.addEventListener('DOMContentLoaded', () => {
  if (adminToken) { showAdmin(); loadPage('company'); }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = document.getElementById('loginError');
  errEl.style.display = 'none';
  try {
    const res = await fetch('/api/pages/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ username: document.getElementById('loginUser').value, password: document.getElementById('loginPass').value })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    adminToken = data.token;
    localStorage.setItem('adminToken', adminToken);
    showAdmin();
    loadPage('company');
  } catch(err) {
    errEl.textContent = err.message || '로그인 실패';
    errEl.style.display = 'block';
  }
});

function showAdmin() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminLayout').style.display = 'flex';
}

function logout() {
  adminToken = '';
  localStorage.removeItem('adminToken');
  location.reload();
}

function authHeaders() {
  return { 'Content-Type':'application/json', 'x-admin-token': adminToken };
}

// ======================== PAGE SECTIONS ========================
async function loadPage(slug, btn) {
  // Sidebar active state
  document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else document.querySelector(`[data-page="${slug}"]`)?.classList.add('active');

  document.getElementById('adminTitle').textContent = pageNames[slug] || slug;

  try {
    const res = await fetch(`/api/pages/${slug}/sections`);
    currentSections = await res.json();
    renderSectionEditors(slug);
  } catch(err) {
    document.getElementById('adminContent').innerHTML = '<p style="color:#e53e3e;">섹션을 불러올 수 없습니다.</p>';
  }
}

function renderSectionEditors(slug) {
  const container = document.getElementById('adminContent');

  let html = currentSections.map((s, idx) => {
    const typeLabel = typeLabels[s.section_type] || s.section_type;
    return `
    <div class="editor-card ${idx === 0 ? 'open' : ''}" data-slug="${slug}" data-key="${s.section_key}">
      <div class="editor-card__header" onclick="this.parentElement.classList.toggle('open')">
        <div class="editor-card__title">
          ${s.section_key} <span class="editor-card__type">${typeLabel}</span>
        </div>
        <span class="editor-card__toggle">&#9660;</span>
      </div>
      <div class="editor-card__body">
        ${renderFieldsByType(s)}
      </div>
    </div>`;
  }).join('');

  html += `
  <div class="save-bar">
    <a class="preview-btn" href="/${slug}.html" target="_blank">미리보기</a>
    <button class="save-btn" onclick="saveAllSections('${slug}')">전체 저장</button>
  </div>`;

  container.innerHTML = html;
}

function renderFieldsByType(s) {
  let html = '';

  // Title & Subtitle (common)
  if (s.section_type !== 'stats') {
    html += field('제목', 'title', s.title || '', 'text');
  }
  html += field('부제목 / 설명', 'subtitle', s.subtitle || '', 'text');

  // Media (hero, feature-split)
  if (s.section_type === 'hero' || s.section_type === 'feature-split') {
    html += `
    <div class="field">
      <label>미디어 (이미지/영상)</label>
      ${s.media_url ? `<div class="media-preview">${s.media_type === 'video'
        ? `<video src="${s.media_url}" controls style="max-height:200px;"></video>`
        : `<img src="${s.media_url}" style="max-height:200px;">`}</div>` : ''}
      <div class="media-upload">
        <input type="file" accept="image/*,video/*" onchange="uploadMedia(this,'${s.page_slug}','${s.section_key}')">
        <select class="media-type-select" style="padding:6px;border:1px solid var(--admin-border);border-radius:4px;font-size:.8125rem;">
          <option value="image" ${s.media_type==='image'?'selected':''}>이미지</option>
          <option value="video" ${s.media_type==='video'?'selected':''}>영상</option>
        </select>
      </div>
      <input type="hidden" class="field-media_url" value="${s.media_url || ''}">
      <input type="hidden" class="field-media_type" value="${s.media_type || 'image'}">
    </div>`;
  }

  // Background style (hero, cta)
  if (s.section_type === 'hero' || s.section_type === 'cta') {
    html += field('배경 스타일 (CSS gradient)', 'bg_style', s.bg_style || '', 'text');
  }

  // Content (feature-split)
  if (s.section_type === 'feature-split') {
    html += `<div class="field"><label>본문 (HTML)</label><textarea class="field-content" rows="5">${escHtml(s.content || '')}</textarea></div>`;
  }

  // Items (card-grid, stats, timeline, process, feature-split with features)
  if (s.items) {
    html += renderItemsEditor(s);
  }

  return html;
}

function field(label, name, value, type) {
  if (type === 'textarea') {
    return `<div class="field"><label>${label}</label><textarea class="field-${name}">${escHtml(value)}</textarea></div>`;
  }
  return `<div class="field"><label>${label}</label><input type="text" class="field-${name}" value="${escAttr(value)}"></div>`;
}

function renderItemsEditor(s) {
  const items = s.items;
  const type = s.section_type;

  // Feature-split with features array (object, not array)
  if (!Array.isArray(items) && items.features) {
    let html = `<div class="field"><label>특장점 목록</label><div class="items-editor" data-field="items_json">`;
    items.features.forEach((f, i) => {
      html += `<div class="item-row"><input placeholder="특장점" value="${escAttr(f)}" data-idx="${i}"><button class="remove-item" onclick="this.parentElement.remove()">삭제</button></div>`;
    });
    html += `</div><button class="add-item-btn" onclick="addFeatureItem(this)">+ 항목 추가</button></div>`;
    return html;
  }

  // Array items (cards, stats, timeline, process)
  let html = `<div class="field"><label>항목 관리 (${items.length}개)</label><div class="items-editor" data-field="items_json">`;

  items.forEach((item, i) => {
    if (type === 'stats') {
      html += `<div class="item-row">
        <input placeholder="숫자" value="${escAttr(item.number||'')}" data-key="number" style="max-width:100px;">
        <input placeholder="라벨" value="${escAttr(item.label||'')}}" data-key="label">
        <button class="remove-item" onclick="this.parentElement.remove()">삭제</button></div>`;
    } else if (type === 'timeline') {
      html += `<div class="item-row">
        <input placeholder="연도" value="${escAttr(item.year||'')}" data-key="year" style="max-width:80px;">
        <input placeholder="제목" value="${escAttr(item.title||'')}" data-key="title">
        <input placeholder="설명" value="${escAttr(item.desc||'')}" data-key="desc">
        <button class="remove-item" onclick="this.parentElement.remove()">삭제</button></div>`;
    } else if (type === 'process') {
      html += `<div class="item-row">
        <input placeholder="단계" value="${item.step||i+1}" data-key="step" style="max-width:50px;" readonly>
        <input placeholder="제목" value="${escAttr(item.title||'')}" data-key="title">
        <input placeholder="설명" value="${escAttr(item.desc||'')}" data-key="desc">
        <button class="remove-item" onclick="this.parentElement.remove()">삭제</button></div>`;
    } else {
      // card-grid
      html += `<div class="item-row" style="flex-wrap:wrap;">
        <input placeholder="아이콘(HTML entity)" value="${escAttr(item.icon||'')}" data-key="icon" style="max-width:120px;">
        <input placeholder="제목" value="${escAttr(item.title||'')}" data-key="title">
        <input placeholder="설명" value="${escAttr(item.desc||'')}" data-key="desc" style="width:100%;margin-top:4px;">
        <button class="remove-item" onclick="this.parentElement.remove()">삭제</button></div>`;
    }
  });

  html += `</div><button class="add-item-btn" onclick="addItem(this,'${type}')">+ 항목 추가</button></div>`;
  return html;
}

// ======================== ITEM MANAGEMENT ========================
function addItem(btn, type) {
  const editor = btn.previousElementSibling.querySelector('.items-editor') || btn.previousElementSibling;
  let row = '';
  if (type === 'stats') {
    row = `<div class="item-row"><input placeholder="숫자" data-key="number" style="max-width:100px;"><input placeholder="라벨" data-key="label"><button class="remove-item" onclick="this.parentElement.remove()">삭제</button></div>`;
  } else if (type === 'timeline') {
    row = `<div class="item-row"><input placeholder="연도" data-key="year" style="max-width:80px;"><input placeholder="제목" data-key="title"><input placeholder="설명" data-key="desc"><button class="remove-item" onclick="this.parentElement.remove()">삭제</button></div>`;
  } else if (type === 'process') {
    const count = editor.querySelectorAll('.item-row').length + 1;
    row = `<div class="item-row"><input placeholder="단계" data-key="step" value="${count}" style="max-width:50px;" readonly><input placeholder="제목" data-key="title"><input placeholder="설명" data-key="desc"><button class="remove-item" onclick="this.parentElement.remove()">삭제</button></div>`;
  } else {
    row = `<div class="item-row" style="flex-wrap:wrap;"><input placeholder="아이콘" data-key="icon" style="max-width:120px;"><input placeholder="제목" data-key="title"><input placeholder="설명" data-key="desc" style="width:100%;margin-top:4px;"><button class="remove-item" onclick="this.parentElement.remove()">삭제</button></div>`;
  }
  const container = btn.closest('.field').querySelector('.items-editor');
  container.insertAdjacentHTML('beforeend', row);
}

function addFeatureItem(btn) {
  const container = btn.closest('.field').querySelector('.items-editor');
  container.insertAdjacentHTML('beforeend', `<div class="item-row"><input placeholder="특장점"><button class="remove-item" onclick="this.parentElement.remove()">삭제</button></div>`);
}

// ======================== MEDIA UPLOAD ========================
async function uploadMedia(input, slug, key) {
  const file = input.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/pages/upload', {
      method:'POST',
      headers:{ 'x-admin-token': adminToken },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    // Update hidden fields
    const card = input.closest('.editor-card');
    card.querySelector('.field-media_url').value = data.url;
    card.querySelector('.field-media_type').value = data.type;

    // Update preview
    const preview = card.querySelector('.media-preview');
    if (preview) preview.remove();
    const previewHtml = data.type === 'video'
      ? `<div class="media-preview"><video src="${data.url}" controls style="max-height:200px;"></video></div>`
      : `<div class="media-preview"><img src="${data.url}" style="max-height:200px;"></div>`;
    input.closest('.field').insertAdjacentHTML('afterbegin', previewHtml);

    toast('파일이 업로드되었습니다.', 'success');
  } catch(err) {
    toast('업로드 실패: ' + err.message, 'error');
  }
}

// ======================== SAVE ========================
async function saveAllSections(slug) {
  const cards = document.querySelectorAll('.editor-card');
  const saveBtn = document.querySelector('.save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = '저장 중...';

  let success = 0;
  for (const card of cards) {
    const key = card.dataset.key;
    const body = collectCardData(card);

    try {
      const res = await fetch(`/api/pages/${slug}/sections/${key}`, {
        method:'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body)
      });
      if (res.ok) success++;
    } catch(err) { /* continue */ }
  }

  saveBtn.disabled = false;
  saveBtn.textContent = '전체 저장';
  toast(`${success}/${cards.length} 섹션 저장 완료`, success === cards.length ? 'success' : 'error');
}

function collectCardData(card) {
  const data = {};

  const titleEl = card.querySelector('.field-title');
  if (titleEl) data.title = titleEl.value;

  const subtitleEl = card.querySelector('.field-subtitle');
  if (subtitleEl) data.subtitle = subtitleEl.value;

  const contentEl = card.querySelector('.field-content');
  if (contentEl) data.content = contentEl.value;

  const bgEl = card.querySelector('.field-bg_style');
  if (bgEl) data.bg_style = bgEl.value;

  const mediaUrl = card.querySelector('.field-media_url');
  if (mediaUrl) data.media_url = mediaUrl.value;

  const mediaType = card.querySelector('.field-media_type');
  if (mediaType) data.media_type = mediaType.value;

  // Collect items
  const itemsEditor = card.querySelector('.items-editor');
  if (itemsEditor) {
    const rows = itemsEditor.querySelectorAll('.item-row');
    if (rows.length > 0) {
      const firstInput = rows[0].querySelector('input');
      // Check if it's feature-list (no data-key) or structured items
      if (firstInput && !firstInput.dataset.key) {
        // Feature list
        const section = currentSections.find(s => s.section_key === card.dataset.key);
        const base = section?.items || {};
        const features = Array.from(rows).map(r => r.querySelector('input').value).filter(Boolean);
        data.items_json = JSON.stringify({ ...base, features });
      } else {
        // Structured items
        const items = Array.from(rows).map(row => {
          const obj = {};
          row.querySelectorAll('input').forEach(inp => {
            if (inp.dataset.key) obj[inp.dataset.key] = inp.value;
          });
          return obj;
        });
        data.items_json = JSON.stringify(items);
      }
    }
  }

  return data;
}

// ======================== BOARD ADMIN ========================
let boardCategories = [];

async function loadBoardAdmin(btn) {
  document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('adminTitle').textContent = '게시판 관리';

  try {
    // Load categories for later use
    if (!boardCategories.length) {
      const catRes = await fetch('/api/board/categories');
      boardCategories = await catRes.json();
    }

    const res = await fetch('/api/board/posts?size=50');
    const data = await res.json();
    let html = `<div style="margin-bottom:16px;text-align:right;">
      <button class="save-btn" onclick="showPostEditor(null)" style="padding:10px 20px;font-size:.875rem;">+ 새 글 작성</button>
    </div>
    <table class="admin-table">
      <thead><tr><th style="width:50px">ID</th><th>카테고리</th><th>제목</th><th>작성일</th><th style="width:60px">조회</th><th style="width:160px">관리</th></tr></thead><tbody>`;
    data.posts.forEach(p => {
      html += `<tr>
        <td>${p.id}</td>
        <td>${p.category_name}</td>
        <td><a href="#" onclick="viewPost(${p.id});return false;" style="color:var(--admin-primary);font-weight:500;">${escHtml(p.title)}</a></td>
        <td>${p.created_at?.substring(0,10)}</td>
        <td>${p.hit_count}</td>
        <td>
          <button onclick="showPostEditor(${p.id})" style="color:var(--admin-accent);cursor:pointer;background:none;border:none;font-size:.8125rem;font-weight:600;">수정</button>
          <button onclick="deletePost(${p.id})" style="color:#e53e3e;cursor:pointer;background:none;border:none;font-size:.8125rem;margin-left:8px;">삭제</button>
        </td>
      </tr>`;
    });
    html += '</tbody></table>';
    if (!data.posts.length) {
      html += '<div style="text-align:center;padding:48px;color:var(--admin-muted);">등록된 게시글이 없습니다.</div>';
    }
    document.getElementById('adminContent').innerHTML = html;
  } catch(err) {
    document.getElementById('adminContent').innerHTML = '<p style="color:#e53e3e;">불러오기 실패</p>';
  }
}

// --- View Post (읽기) ---
async function viewPost(id) {
  try {
    const res = await fetch(`/api/board/posts/${id}`);
    const post = await res.json();

    document.getElementById('adminTitle').textContent = '게시글 상세';
    document.getElementById('adminContent').innerHTML = `
      <div style="margin-bottom:16px;">
        <button onclick="loadBoardAdmin()" style="background:none;border:1px solid var(--admin-border);padding:8px 16px;border-radius:6px;cursor:pointer;font-size:.8125rem;">&larr; 목록으로</button>
        <button onclick="showPostEditor(${post.id})" style="background:var(--admin-accent);color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:.8125rem;margin-left:8px;">수정</button>
      </div>
      <div class="editor-card open">
        <div style="border-bottom:2px solid var(--admin-primary);padding-bottom:16px;margin-bottom:24px;">
          <div style="font-size:.75rem;color:var(--admin-accent);font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">${escHtml(post.category_name)}</div>
          <h2 style="font-size:1.5rem;font-weight:700;margin-bottom:12px;">${escHtml(post.title)}</h2>
          <div style="display:flex;gap:20px;font-size:.8125rem;color:var(--admin-muted);">
            <span>작성자: ${escHtml(post.author)}</span>
            <span>작성일: ${post.created_at?.substring(0,10)}</span>
            <span>조회: ${post.hit_count}</span>
          </div>
        </div>
        <div style="line-height:1.8;font-size:.9375rem;">${post.content || '<span style="color:var(--admin-muted);">(내용 없음)</span>'}</div>
        ${post.prev || post.next ? `
        <div style="border-top:1px solid var(--admin-border);margin-top:32px;padding-top:16px;">
          ${post.prev ? `<div style="padding:8px 0;font-size:.875rem;"><span style="color:var(--admin-muted);margin-right:12px;">이전글</span> <a href="#" onclick="viewPost(${post.prev.id});return false;" style="color:var(--admin-primary);">${escHtml(post.prev.title)}</a></div>` : ''}
          ${post.next ? `<div style="padding:8px 0;font-size:.875rem;"><span style="color:var(--admin-muted);margin-right:12px;">다음글</span> <a href="#" onclick="viewPost(${post.next.id});return false;" style="color:var(--admin-primary);">${escHtml(post.next.title)}</a></div>` : ''}
        </div>` : ''}
      </div>`;
  } catch(err) {
    toast('게시글을 불러올 수 없습니다.', 'error');
  }
}

// --- Post Editor (작성/수정) ---
async function showPostEditor(postId) {
  let post = { title:'', content:'', category_id:'', author:'admin' };

  if (postId) {
    try {
      const res = await fetch(`/api/board/posts/${postId}`);
      post = await res.json();
    } catch(err) {
      toast('게시글을 불러올 수 없습니다.', 'error');
      return;
    }
  }

  const isEdit = !!postId;
  document.getElementById('adminTitle').textContent = isEdit ? '게시글 수정' : '새 글 작성';

  const catOptions = boardCategories.map(c =>
    `<option value="${c.id}" ${c.id == post.category_id ? 'selected' : ''}>${c.name}</option>`
  ).join('');

  document.getElementById('adminContent').innerHTML = `
    <div style="margin-bottom:16px;">
      <button onclick="loadBoardAdmin()" style="background:none;border:1px solid var(--admin-border);padding:8px 16px;border-radius:6px;cursor:pointer;font-size:.8125rem;">&larr; 목록으로</button>
    </div>
    <div class="editor-card open">
      <div class="editor-card__body" style="display:block;">
        <div class="field">
          <label>카테고리</label>
          <select class="form-control" id="postCategory" style="width:100%;padding:10px 12px;border:1px solid var(--admin-border);border-radius:6px;">
            <option value="">선택</option>
            ${catOptions}
          </select>
        </div>
        <div class="field">
          <label>제목</label>
          <input type="text" id="postTitle" value="${escAttr(post.title)}" placeholder="게시글 제목" style="width:100%;padding:10px 12px;border:1px solid var(--admin-border);border-radius:6px;">
        </div>
        <div class="field">
          <label>작성자</label>
          <input type="text" id="postAuthor" value="${escAttr(post.author || 'admin')}" placeholder="작성자" style="width:100%;padding:10px 12px;border:1px solid var(--admin-border);border-radius:6px;">
        </div>
        <div class="field">
          <label>내용 (HTML 지원)</label>
          <textarea id="postContent" rows="15" placeholder="게시글 내용을 입력하세요. HTML 태그를 사용할 수 있습니다." style="width:100%;padding:12px;border:1px solid var(--admin-border);border-radius:6px;font-family:monospace;font-size:.875rem;line-height:1.6;resize:vertical;">${escHtml(post.content || '')}</textarea>
        </div>
        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:24px;">
          <button onclick="loadBoardAdmin()" style="padding:12px 24px;border:1px solid var(--admin-border);background:#fff;border-radius:8px;cursor:pointer;">취소</button>
          <button onclick="savePost(${postId || 'null'})" class="save-btn" id="postSaveBtn">${isEdit ? '수정 저장' : '게시글 등록'}</button>
        </div>
      </div>
    </div>`;
}

// --- Save Post ---
async function savePost(postId) {
  const title = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();
  const category_id = document.getElementById('postCategory').value;
  const author = document.getElementById('postAuthor').value.trim() || 'admin';

  if (!title) { toast('제목을 입력하세요.', 'error'); return; }
  if (!category_id) { toast('카테고리를 선택하세요.', 'error'); return; }

  const btn = document.getElementById('postSaveBtn');
  btn.disabled = true;
  btn.textContent = '저장 중...';

  try {
    const isEdit = postId !== null;
    const url = isEdit ? `/api/board/posts/${postId}` : '/api/board/posts';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify({ title, content, category_id, author })
    });

    if (!res.ok) throw new Error('저장 실패');
    const data = await res.json();

    toast(isEdit ? '수정되었습니다.' : '등록되었습니다.', 'success');

    // 수정 후 상세보기, 등록 후 목록
    if (isEdit) {
      viewPost(postId);
    } else {
      loadBoardAdmin();
    }
  } catch(err) {
    toast('저장에 실패했습니다.', 'error');
    btn.disabled = false;
    btn.textContent = postId ? '수정 저장' : '게시글 등록';
  }
}

async function deletePost(id) {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  await fetch(`/api/board/posts/${id}`, { method:'DELETE', headers:authHeaders() });
  toast('삭제되었습니다.', 'success');
  loadBoardAdmin();
}

// ======================== INQUIRY ADMIN ========================
async function loadInquiryAdmin(btn) {
  document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('adminTitle').textContent = '문의 관리';

  try {
    const res = await fetch('/api/inquiry', { headers:authHeaders() });
    const data = await res.json();
    let html = `<table class="admin-table">
      <thead><tr><th>ID</th><th>회사명</th><th>담당자</th><th>제목</th><th>접수일</th><th>유형</th></tr></thead><tbody>`;
    data.inquiries.forEach(q => {
      html += `<tr><td>${q.id}</td><td>${escHtml(q.company_name||'-')}</td><td>${escHtml(q.contact_name)}</td>
        <td>${escHtml(q.subject)}</td><td>${q.created_at?.substring(0,10)}</td><td>${q.inquiry_type||'-'}</td></tr>`;
    });
    html += '</tbody></table>';
    document.getElementById('adminContent').innerHTML = html;
  } catch(err) {
    document.getElementById('adminContent').innerHTML = '<p style="color:#e53e3e;">불러오기 실패</p>';
  }
}

// ======================== HELPERS ========================
function escHtml(str) { if(!str) return ''; const d=document.createElement('div'); d.textContent=str; return d.innerHTML; }
function escAttr(str) { return (str||'').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

function toast(msg, type='success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast toast--${type} show`;
  setTimeout(() => el.classList.remove('show'), 3000);
}
