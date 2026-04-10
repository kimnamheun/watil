const { createClient } = require('@libsql/client');

// Load .env for local development
try { require('dotenv').config(); } catch(e) {}

// --- Create Turso client ---
const dbUrl = (process.env.TURSO_DATABASE_URL || 'file:watil.db').trim();
const dbToken = process.env.TURSO_AUTH_TOKEN ? process.env.TURSO_AUTH_TOKEN.trim() : undefined;
console.log(`[DB] Connecting to: ${dbUrl.substring(0, 30)}... (token: ${dbToken ? 'set' : 'NOT SET'})`);

const clientConfig = { url: dbUrl };
if (dbToken) clientConfig.authToken = dbToken;
const client = createClient(clientConfig);

// --- DB Wrapper (compatible with better-sqlite3 patterns) ---
// libSQL doesn't accept undefined - convert to null
function sanitizeParams(params) {
  return params.map(p => p === undefined ? null : p);
}

const db = {
  /** SELECT single row */
  async get(sql, params = []) {
    const result = await client.execute({ sql, args: sanitizeParams(params) });
    return result.rows[0] || null;
  },

  /** SELECT multiple rows */
  async getAll(sql, params = []) {
    const result = await client.execute({ sql, args: sanitizeParams(params) });
    return result.rows;
  },

  /** INSERT / UPDATE / DELETE */
  async run(sql, params = []) {
    const result = await client.execute({ sql, args: sanitizeParams(params) });
    return {
      lastInsertRowid: Number(result.lastInsertRowid),
      changes: result.rowsAffected
    };
  },

  /** Execute raw SQL (DDL, multi-statement) */
  async exec(sql) {
    // Split by semicolons and execute each statement
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await client.execute(stmt);
    }
  },

  /** Initialize: create tables + seed data */
  async init() {
    // Create tables
    await this.exec(`
      CREATE TABLE IF NOT EXISTS board_category (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      )
    `);
    await this.exec(`
      CREATE TABLE IF NOT EXISTS board_post (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        author TEXT DEFAULT 'admin',
        thumbnail TEXT,
        hit_count INTEGER DEFAULT 0,
        is_visible INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES board_category(id)
      )
    `);
    await this.exec(`
      CREATE TABLE IF NOT EXISTS page_section (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page_slug TEXT NOT NULL,
        section_key TEXT NOT NULL,
        section_type TEXT NOT NULL,
        title TEXT,
        subtitle TEXT,
        content TEXT,
        media_url TEXT,
        media_type TEXT DEFAULT 'image',
        items_json TEXT,
        bg_style TEXT,
        sort_order INTEGER DEFAULT 0,
        is_visible INTEGER DEFAULT 1,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(page_slug, section_key)
      )
    `);
    await this.exec(`
      CREATE TABLE IF NOT EXISTS admin_user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);
    await this.exec(`
      CREATE TABLE IF NOT EXISTS inquiry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT,
        contact_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        inquiry_type TEXT,
        subject TEXT NOT NULL,
        content TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed categories
    const categories = [
      { slug: 'news', name: '언론보도', sort_order: 1 },
      { slug: 'notice', name: '공지사항', sort_order: 2 },
      { slug: 'case', name: '도입사례', sort_order: 3 },
      { slug: 'newsletter', name: '뉴스레터', sort_order: 4 }
    ];
    for (const cat of categories) {
      await this.run('INSERT OR IGNORE INTO board_category (slug, name, sort_order) VALUES (?, ?, ?)', [cat.slug, cat.name, cat.sort_order]);
    }

    // Seed admin
    await this.run('INSERT OR IGNORE INTO admin_user (username, password) VALUES (?, ?)', ['admin', 'admin1234']);

    // Seed sample posts
    const postCount = await this.get('SELECT COUNT(*) as cnt FROM board_post');
    if (postCount.cnt === 0) {
      const posts = [
        [1, 'WATIL, AI 기반 신규 솔루션 출시', '<p>WATIL이 인공지능 기반의 혁신적인 솔루션을 출시했습니다.</p>', 'WATIL', '2026-04-08'],
        [1, 'WATIL, 글로벌 파트너십 체결', '<p>WATIL이 글로벌 기술 기업과 전략적 파트너십을 체결했습니다.</p>', 'WATIL', '2026-04-05'],
        [1, '2026 기술 컨퍼런스 참가 안내', '<p>WATIL이 2026 국제 기술 컨퍼런스에 참가합니다.</p>', 'WATIL', '2026-04-01'],
        [2, '홈페이지 리뉴얼 안내', '<p>WATIL 홈페이지가 새롭게 리뉴얼되었습니다.</p>', 'WATIL', '2026-04-10'],
        [2, '서비스 정기 점검 안내 (4/15)', '<p>서비스 안정성 향상을 위한 정기 점검이 예정되어 있습니다.</p>', 'WATIL', '2026-04-09'],
        [3, 'A사 도입 사례 - 물류 자동화', '<p>A사는 WATIL의 물류 자동화 솔루션을 도입하여 성과를 달성했습니다.</p>', 'WATIL', '2026-03-28'],
        [3, 'B병원 도입 사례 - 스마트 헬스케어', '<p>B병원은 WATIL의 스마트 헬스케어 플랫폼을 도입했습니다.</p>', 'WATIL', '2026-03-20'],
        [4, '3월 뉴스레터 - AI 트렌드 리포트', '<p>2026년 3월 AI 산업 트렌드와 최신 소식을 전해드립니다.</p>', 'WATIL', '2026-03-31']
      ];
      for (const p of posts) {
        await this.run('INSERT INTO board_post (category_id, title, content, author, created_at) VALUES (?, ?, ?, ?, ?)', p);
      }
    }

    // Seed page sections
    await require('./seed-sections')(this);

    console.log('DB initialized successfully');
  }
};

// Run init (async) - store error for diagnostics
let initError = null;
const dbReady = db.init().catch(err => {
  console.error('DB init error:', err.message, err.stack);
  initError = err;
});

module.exports = { db, dbReady, getInitError: () => initError };
