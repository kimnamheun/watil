try { require('dotenv').config(); } catch(e) {}
const express = require('express');
const path = require('path');
const cors = require('cors');
const { db, dbReady, getInitError } = require('./server/db');
const boardRouter = require('./server/routes/board');
const inquiryRouter = require('./server/routes/inquiry');
const pagesRouter = require('./server/routes/pages');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Debug endpoint
app.get('/api/health', async (req, res) => {
  await dbReady;
  const err = getInitError();
  res.json({
    status: err ? 'error' : 'ok',
    error: err ? err.message : null,
    env: {
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ? 'SET' : 'NOT SET',
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? 'SET' : 'NOT SET',
      VERCEL: process.env.VERCEL || 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    }
  });
});

// Wait for DB init before handling API requests
app.use('/api', async (req, res, next) => {
  try {
    await dbReady;
    const err = getInitError();
    if (err) {
      return res.status(500).json({ error: 'DB init failed: ' + err.message });
    }
    next();
  } catch(err) {
    res.status(500).json({ error: 'DB error: ' + err.message });
  }
});

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
