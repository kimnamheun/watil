const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/board/categories
router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM board_category ORDER BY sort_order').all();
  res.json(categories);
});

// GET /api/board/posts?category=news&page=1&size=9
router.get('/posts', (req, res) => {
  const { category, page = 1, size = 9, search } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(50, Math.max(1, parseInt(size)));
  const offset = (pageNum - 1) * pageSize;

  let where = 'WHERE bp.is_visible = 1';
  const params = [];

  if (category) {
    where += ' AND bc.slug = ?';
    params.push(category);
  }
  if (search) {
    where += ' AND (bp.title LIKE ? OR bp.content LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const countSql = `SELECT COUNT(*) as total FROM board_post bp JOIN board_category bc ON bp.category_id = bc.id ${where}`;
  const total = db.prepare(countSql).get(...params).total;

  const sql = `
    SELECT bp.*, bc.slug as category_slug, bc.name as category_name
    FROM board_post bp
    JOIN board_category bc ON bp.category_id = bc.id
    ${where}
    ORDER BY bp.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const posts = db.prepare(sql).all(...params, pageSize, offset);

  res.json({
    posts: posts.map(p => ({
      ...p,
      content: undefined,
      summary: p.content ? p.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : ''
    })),
    pagination: {
      page: pageNum,
      size: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  });
});

// GET /api/board/posts/:id
router.get('/posts/:id', (req, res) => {
  const post = db.prepare(`
    SELECT bp.*, bc.slug as category_slug, bc.name as category_name
    FROM board_post bp
    JOIN board_category bc ON bp.category_id = bc.id
    WHERE bp.id = ?
  `).get(req.params.id);

  if (!post) return res.status(404).json({ error: 'Post not found' });

  // Increase hit count
  db.prepare('UPDATE board_post SET hit_count = hit_count + 1 WHERE id = ?').run(req.params.id);
  post.hit_count += 1;

  // Prev/Next
  const prev = db.prepare(`
    SELECT id, title FROM board_post
    WHERE category_id = ? AND id < ? AND is_visible = 1
    ORDER BY id DESC LIMIT 1
  `).get(post.category_id, post.id);

  const next = db.prepare(`
    SELECT id, title FROM board_post
    WHERE category_id = ? AND id > ? AND is_visible = 1
    ORDER BY id ASC LIMIT 1
  `).get(post.category_id, post.id);

  res.json({ ...post, prev: prev || null, next: next || null });
});

// POST /api/board/posts (admin) - JSON or multipart
router.post('/posts', (req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart')) return upload.single('thumbnail')(req, res, next);
  next();
}, (req, res) => {
  const { category_id, title, content, author = 'admin' } = req.body;
  const thumbnail = req.file ? '/uploads/' + req.file.filename : null;

  const result = db.prepare(`
    INSERT INTO board_post (category_id, title, content, author, thumbnail)
    VALUES (?, ?, ?, ?, ?)
  `).run(category_id, title, content, author, thumbnail);

  res.json({ id: result.lastInsertRowid });
});

// PUT /api/board/posts/:id (admin) - JSON or multipart
router.put('/posts/:id', (req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart')) return upload.single('thumbnail')(req, res, next);
  next();
}, (req, res) => {
  const { title, content, category_id } = req.body;
  const thumbnail = req.file ? '/uploads/' + req.file.filename : undefined;

  let sql = 'UPDATE board_post SET title = ?, content = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP';
  const params = [title, content, category_id];

  if (thumbnail) {
    sql += ', thumbnail = ?';
    params.push(thumbnail);
  }

  sql += ' WHERE id = ?';
  params.push(req.params.id);

  db.prepare(sql).run(...params);
  res.json({ success: true });
});

// DELETE /api/board/posts/:id (admin)
router.delete('/posts/:id', (req, res) => {
  db.prepare('DELETE FROM board_post WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
