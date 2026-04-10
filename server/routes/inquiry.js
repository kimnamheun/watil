const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/inquiry
router.post('/', (req, res) => {
  const { company_name, contact_name, email, phone, inquiry_type, subject, content } = req.body;

  if (!contact_name || !subject || !content) {
    return res.status(400).json({ error: '필수 항목을 입력해주세요.' });
  }

  const result = db.prepare(`
    INSERT INTO inquiry (company_name, contact_name, email, phone, inquiry_type, subject, content)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(company_name, contact_name, email, phone, inquiry_type, subject, content);

  res.json({ id: result.lastInsertRowid, message: '문의가 접수되었습니다.' });
});

// GET /api/inquiry (admin)
router.get('/', (req, res) => {
  const { page = 1, size = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(50, parseInt(size));
  const offset = (pageNum - 1) * pageSize;

  const total = db.prepare('SELECT COUNT(*) as total FROM inquiry').get().total;
  const inquiries = db.prepare('SELECT * FROM inquiry ORDER BY created_at DESC LIMIT ? OFFSET ?').all(pageSize, offset);

  res.json({
    inquiries,
    pagination: { page: pageNum, size: pageSize, total, totalPages: Math.ceil(total / pageSize) }
  });
});

module.exports = router;
