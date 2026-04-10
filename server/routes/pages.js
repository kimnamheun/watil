const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// File upload (images & videos)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `page-${Date.now()}-${Math.round(Math.random()*1e6)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB for videos

// --- Simple Auth Middleware ---
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (!token) return res.status(401).json({ error: '인증이 필요합니다.' });

  // Token = base64(username:password)
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [username, password] = decoded.split(':');
    const user = db.prepare('SELECT * FROM admin_user WHERE username = ? AND password = ?').get(username, password);
    if (!user) return res.status(401).json({ error: '인증 실패' });
    next();
  } catch {
    return res.status(401).json({ error: '잘못된 토큰' });
  }
}

// POST /api/pages/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM admin_user WHERE username = ? AND password = ?').get(username, password);
  if (!user) return res.status(401).json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' });

  const token = Buffer.from(`${username}:${password}`).toString('base64');
  res.json({ token, username: user.username });
});

// GET /api/pages/:slug/sections (public - FO용)
router.get('/:slug/sections', (req, res) => {
  const sections = db.prepare(
    'SELECT * FROM page_section WHERE page_slug = ? AND is_visible = 1 ORDER BY sort_order'
  ).all(req.params.slug);

  res.json(sections.map(s => ({
    ...s,
    items: s.items_json ? JSON.parse(s.items_json) : null
  })));
});

// GET /api/pages/:slug/sections/:key (public)
router.get('/:slug/sections/:key', (req, res) => {
  const section = db.prepare(
    'SELECT * FROM page_section WHERE page_slug = ? AND section_key = ?'
  ).get(req.params.slug, req.params.key);

  if (!section) return res.status(404).json({ error: 'Section not found' });
  res.json({ ...section, items: section.items_json ? JSON.parse(section.items_json) : null });
});

// PUT /api/pages/:slug/sections/:key (admin)
router.put('/:slug/sections/:key', adminAuth, (req, res) => {
  const { title, subtitle, content, media_url, media_type, items_json, bg_style, is_visible, sort_order } = req.body;

  const existing = db.prepare(
    'SELECT * FROM page_section WHERE page_slug = ? AND section_key = ?'
  ).get(req.params.slug, req.params.key);

  if (!existing) return res.status(404).json({ error: 'Section not found' });

  db.prepare(`
    UPDATE page_section SET
      title = COALESCE(?, title),
      subtitle = COALESCE(?, subtitle),
      content = COALESCE(?, content),
      media_url = COALESCE(?, media_url),
      media_type = COALESCE(?, media_type),
      items_json = COALESCE(?, items_json),
      bg_style = COALESCE(?, bg_style),
      is_visible = COALESCE(?, is_visible),
      sort_order = COALESCE(?, sort_order),
      updated_at = CURRENT_TIMESTAMP
    WHERE page_slug = ? AND section_key = ?
  `).run(
    title ?? null, subtitle ?? null, content ?? null,
    media_url ?? null, media_type ?? null,
    items_json ? (typeof items_json === 'string' ? items_json : JSON.stringify(items_json)) : null,
    bg_style ?? null, is_visible ?? null, sort_order ?? null,
    req.params.slug, req.params.key
  );

  res.json({ success: true });
});

// POST /api/pages/upload (admin - media upload)
router.post('/upload', adminAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '파일이 없습니다.' });
  const url = '/uploads/' + req.file.filename;
  const isVideo = req.file.mimetype.startsWith('video/');
  res.json({ url, type: isVideo ? 'video' : 'image', filename: req.file.filename });
});

// GET /api/pages/all-sections (admin - all pages overview)
router.get('/all-sections/list', adminAuth, (req, res) => {
  const sections = db.prepare('SELECT * FROM page_section ORDER BY page_slug, sort_order').all();
  res.json(sections.map(s => ({
    ...s,
    items: s.items_json ? JSON.parse(s.items_json) : null
  })));
});

module.exports = router;
