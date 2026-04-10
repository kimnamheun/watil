try { require('dotenv').config(); } catch(e) {}
const express = require('express');
const path = require('path');
const cors = require('cors');
const { db, dbReady } = require('./server/db');
const boardRouter = require('./server/routes/board');
const inquiryRouter = require('./server/routes/inquiry');
const pagesRouter = require('./server/routes/pages');

const app = express();
const PORT = process.env.PORT || 3000;

// Wait for DB init before handling API requests
app.use('/api', async (req, res, next) => {
  try {
    await dbReady;
    next();
  } catch(err) {
    console.error('DB init failed:', err);
    res.status(500).json({ error: 'Database initialization failed' });
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/board', boardRouter);
app.use('/api/inquiry', inquiryRouter);
app.use('/api/pages', pagesRouter);

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  const htmlPath = path.join(__dirname, 'public', req.path.endsWith('.html') ? req.path : req.path + '.html');
  res.sendFile(htmlPath, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
  });
});

// Local dev: listen on port
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`WATIL server running at http://localhost:${PORT}`);
  });
}

// Vercel serverless export
module.exports = app;
