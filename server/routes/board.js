const express = require('express');
const router = express.Router();
const { db } = require('../db');
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
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.getAll('SELECT * FROM board_category ORDER BY sort_order');
    res.json(categories);
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// GET /api/board/posts?category=news&page=1&size=9
router.get('/posts', async (req, res) => {
  try {
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

    const countRow = await db.get(`SELECT COUNT(*) as total FROM board_post bp JOIN board_category bc ON bp.category_id = bc.id ${where}`, params);
    const total = countRow.total;

    const posts = await db.getAll(`
      SELECT bp.*, bc.slug as category_slug, bc.name as category_name
      FROM board_post bp
      JOIN board_category bc ON bp.category_id = bc.id
      ${where}
      ORDER BY bp.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, pageSize, offset]);

    res.json({
      posts: posts.map(p => ({
        ...p,
        content: undefined,
        summary: p.content ? p.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : ''
      })),
      pagination: { page: pageNum, size: pageSize, total, totalPages: Math.ceil(total / pageSize) }
    });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// GET /api/board/posts/:id
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await db.get(`
      SELECT bp.*, bc.slug as category_slug, bc.name as category_name
      FROM board_post bp
      JOIN board_category bc ON bp.category_id = bc.id
      WHERE bp.id = ?
    `, [req.params.id]);

    if (!post) return res.status(404).json({ error: 'Post not found' });

    await db.run('UPDATE board_post SET hit_count = hit_count + 1 WHERE id = ?', [req.params.id]);
    post.hit_count += 1;

    const prev = await db.get('SELECT id, title FROM board_post WHERE category_id = ? AND id < ? AND is_visible = 1 ORDER BY id DESC LIMIT 1', [post.category_id, post.id]);
    const next = await db.get('SELECT id, title FROM board_post WHERE category_id = ? AND id > ? AND is_visible = 1 ORDER BY id ASC LIMIT 1', [post.category_id, post.id]);

    res.json({ ...post, prev: prev || null, next: next || null });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// POST /api/board/posts
router.post('/posts', (req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart')) return upload.single('thumbnail')(req, res, next);
  next();
}, async (req, res) => {
  try {
    const { category_id, title, content, author = 'admin' } = req.body;
    const thumbnail = req.file ? '/uploads/' + req.file.filename : null;
    const result = await db.run('INSERT INTO board_post (category_id, title, content, author, thumbnail) VALUES (?, ?, ?, ?, ?)', [category_id, title, content, author, thumbnail]);
    res.json({ id: result.lastInsertRowid });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/board/posts/:id
router.put('/posts/:id', (req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart')) return upload.single('thumbnail')(req, res, next);
  next();
}, async (req, res) => {
  try {
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

    await db.run(sql, params);
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/board/posts/:id
router.delete('/posts/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM board_post WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
