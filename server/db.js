const Database = require('better-sqlite3');
const path = require('path');

// Vercel serverless: use /tmp (writable), local: use project root
const isVercel = !!process.env.VERCEL;
const dbPath = isVercel
  ? path.join('/tmp', 'watil.db')
  : path.join(__dirname, '..', 'watil.db');

const db = new Database(dbPath);

// WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS board_category (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
  );

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
  );

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
  );

  CREATE TABLE IF NOT EXISTS admin_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

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
  );
`);

// Seed default categories
const categories = [
  { slug: 'news', name: '언론보도', sort_order: 1 },
  { slug: 'notice', name: '공지사항', sort_order: 2 },
  { slug: 'case', name: '도입사례', sort_order: 3 },
  { slug: 'newsletter', name: '뉴스레터', sort_order: 4 }
];

const insertCat = db.prepare('INSERT OR IGNORE INTO board_category (slug, name, sort_order) VALUES (?, ?, ?)');
for (const cat of categories) {
  insertCat.run(cat.slug, cat.name, cat.sort_order);
}

// Seed sample posts
const count = db.prepare('SELECT COUNT(*) as cnt FROM board_post').get();
if (count.cnt === 0) {
  const insertPost = db.prepare(`
    INSERT INTO board_post (category_id, title, content, author, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const samplePosts = [
    [1, 'WATIL, AI 기반 신규 솔루션 출시', '<p>WATIL이 인공지능 기반의 혁신적인 솔루션을 출시했습니다. 이번 솔루션은 기업의 디지털 전환을 가속화하는 데 중점을 두고 있으며, 다양한 산업 분야에 적용 가능합니다.</p><p>특히, 자동화 프로세스와 데이터 분석 기능이 크게 강화되어 업무 효율성을 획기적으로 향상시킬 수 있습니다.</p>', 'WATIL', '2026-04-08'],
    [1, 'WATIL, 글로벌 파트너십 체결', '<p>WATIL이 글로벌 기술 기업과 전략적 파트너십을 체결했습니다. 이번 파트너십을 통해 해외 시장 진출을 본격화할 예정입니다.</p>', 'WATIL', '2026-04-05'],
    [1, '2026 기술 컨퍼런스 참가 안내', '<p>WATIL이 2026 국제 기술 컨퍼런스에 참가합니다. 부스에서 최신 솔루션을 직접 체험하실 수 있습니다.</p>', 'WATIL', '2026-04-01'],
    [2, '홈페이지 리뉴얼 안내', '<p>WATIL 홈페이지가 새롭게 리뉴얼되었습니다. 더 편리하고 직관적인 UI로 서비스 정보를 확인하실 수 있습니다.</p>', 'WATIL', '2026-04-10'],
    [2, '서비스 정기 점검 안내 (4/15)', '<p>서비스 안정성 향상을 위한 정기 점검이 예정되어 있습니다.</p><ul><li>일시: 2026년 4월 15일 02:00~06:00</li><li>대상: 전체 서비스</li></ul>', 'WATIL', '2026-04-09'],
    [3, 'A사 도입 사례 - 물류 자동화', '<p>A사는 WATIL의 물류 자동화 솔루션을 도입하여 물류 처리 시간을 40% 단축하고 운영 비용을 30% 절감하는 성과를 달성했습니다.</p>', 'WATIL', '2026-03-28'],
    [3, 'B병원 도입 사례 - 스마트 헬스케어', '<p>B병원은 WATIL의 스마트 헬스케어 플랫폼을 도입하여 환자 관리 효율성을 크게 향상시켰습니다.</p>', 'WATIL', '2026-03-20'],
    [4, '3월 뉴스레터 - AI 트렌드 리포트', '<p>2026년 3월 AI 산업 트렌드와 WATIL의 최신 소식을 전해드립니다.</p><h3>주요 내용</h3><ul><li>AI 시장 동향</li><li>신규 파트너 소개</li><li>기술 세미나 후기</li></ul>', 'WATIL', '2026-03-31']
  ];

  for (const post of samplePosts) {
    insertPost.run(...post);
  }
}

// Seed admin user (password: admin1234)
db.prepare("INSERT OR IGNORE INTO admin_user (username, password) VALUES (?, ?)").run('admin', 'admin1234');

// Seed page sections from separate file
require('./seed-sections')(db);

// (Old inline seed removed - now in seed-sections.js)

/* REMOVED OLD SEED - START
    // === COMPANY ===
    ['company','hero','hero','회사소개','WATIL은 기술로 세상을 변화시킵니다.',null,null,'image',null,'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',1],
    ['company','about','feature-split','기술 혁신을 선도하는 <span class="text-accent">WATIL</span>',null,'<p>WATIL은 2011년 설립 이래 기업의 디지털 전환과 기술 혁신을 위해 끊임없이 도전해왔습니다. 시스템 통합, 클라우드, AI 분야에서 축적된 전문 역량을 바탕으로 고객에게 최적의 솔루션을 제공합니다.</p><p>우리는 기술이 사람과 비즈니스를 연결하는 다리가 된다고 믿습니다.</p>',null,'image',null,null,2],
    ['company','vision','card-grid','비전 & 미션','기술로 더 나은 세상을 만들어갑니다.',null,null,'image',JSON.stringify([
      {icon:'&#127891;',title:'Vision',desc:'글로벌 기술 리더로서 모든 기업의 디지털 전환을 실현합니다.'},
      {icon:'&#127919;',title:'Mission',desc:'혁신적인 기술과 최고의 서비스로 고객의 성공을 함께 만들어갑니다.'},
      {icon:'&#128161;',title:'Core Value',desc:'혁신, 신뢰, 협력을 바탕으로 지속 가능한 성장을 추구합니다.'}
    ]),null,'bg-light',3],
    ['company','history','timeline','연혁','WATIL의 성장 여정',null,null,'image',JSON.stringify([
      {year:'2026',title:'AI 사업부 신설 및 글로벌 파트너십 체결',desc:'해외 시장 진출 본격화'},
      {year:'2023',title:'클라우드 서비스 플랫폼 런칭',desc:'기업용 클라우드 매니지드 서비스 개시'},
      {year:'2020',title:'누적 매출 1,000억 돌파',desc:'고객사 200개 돌파'},
      {year:'2015',title:'기업부설 연구소 설립',desc:'빅데이터 및 AI 연구 시작'},
      {year:'2011',title:'WATIL 법인 설립',desc:'SI 사업 시작'}
    ]),null,null,4],
    ['company','stats','stats',null,null,null,null,'image',JSON.stringify([
      {number:'150+',label:'전문 인력'},{number:'500+',label:'수행 프로젝트'},
      {number:'200+',label:'고객사'},{number:'15+',label:'특허 및 인증'}
    ]),'dark',5],

    // === BUSINESS ===
    ['business','hero','hero','사업영역','기술의 힘으로 산업의 미래를 혁신합니다.',null,null,'image',null,'linear-gradient(135deg,#0e2052 0%,#1a3151 100%)',1],
    ['business','areas','card-grid','핵심 사업 분야','다양한 산업 분야에서 검증된 기술력으로 최적의 솔루션을 제공합니다.',null,null,'image',JSON.stringify([
      {icon:'&#128736;',title:'시스템 통합 (SI)',desc:'기업의 업무 시스템을 분석하고 최적화된 통합 시스템을 설계, 구축합니다.'},
      {icon:'&#9729;',title:'클라우드 서비스',desc:'AWS, Azure, GCP 등 멀티 클라우드 환경에서 안정적인 인프라를 구축합니다.'},
      {icon:'&#129302;',title:'AI & 데이터',desc:'머신러닝, 딥러닝 기반의 AI 솔루션과 빅데이터 분석 플랫폼을 제공합니다.'},
      {icon:'&#128274;',title:'보안 솔루션',desc:'기업 정보 자산을 보호하는 통합 보안 체계를 수립합니다.'},
      {icon:'&#128241;',title:'모바일 & 웹',desc:'사용자 중심의 모바일 앱과 웹 서비스를 기획, 디자인, 개발합니다.'},
      {icon:'&#128640;',title:'디지털 전환 컨설팅',desc:'기업의 현재 상태를 분석하고 단계별 디지털 전환 로드맵을 수립합니다.'}
    ]),null,null,2],
    ['business','process','process','프로젝트 수행 프로세스','체계적인 프로세스로 성공적인 프로젝트를 수행합니다.',null,null,'image',JSON.stringify([
      {step:1,title:'분석 & 기획',desc:'요구사항 분석, 현황 진단, 솔루션 설계'},
      {step:2,title:'설계 & 개발',desc:'아키텍처 설계, 개발, 단위 테스트'},
      {step:3,title:'테스트 & 검증',desc:'통합 테스트, 성능 검증, 보안 점검'},
      {step:4,title:'운영 & 유지보수',desc:'시스템 안정화, 모니터링, 지속 개선'}
    ]),null,'bg-light',3],
    ['business','cta','cta','프로젝트를 함께 시작하세요','전문 컨설턴트가 최적의 솔루션을 제안합니다.',null,null,'image',null,null,4],

    // === SOLUTION ===
    ['solution','hero','hero','솔루션','비즈니스 과제를 해결하는 최적의 기술 솔루션',null,null,'image',null,'linear-gradient(135deg,#173273 0%,#0e2052 100%)',1],
    ['solution','cloud','feature-split','WATIL <span class="text-accent">Cloud Platform</span>',null,'<p>하이브리드 및 멀티 클라우드 환경을 통합 관리하는 플랫폼입니다. 직관적인 대시보드로 인프라 현황을 한눈에 파악하고, 자동화된 운영으로 비용을 절감합니다.</p>',null,'image',JSON.stringify({icon:'&#9729;',bg:'linear-gradient(135deg,#e8f4f8,#d1ecf1)',features:['멀티 클라우드 통합 관리','자동 스케일링 & 비용 최적화','실시간 모니터링 & 알림']}),null,2],
    ['solution','ai','feature-split','WATIL <span class="text-accent">AI Analytics</span>',null,'<p>기업의 데이터를 수집, 분석하여 실시간 인사이트를 제공하는 AI 분석 플랫폼입니다.</p>',null,'image',JSON.stringify({icon:'&#129302;',bg:'linear-gradient(135deg,#f0e8f8,#e1d1f1)',features:['실시간 데이터 파이프라인','머신러닝 기반 예측 분석','맞춤형 대시보드 & 리포트']}),null,'bg-light',3],
    ['solution','security','feature-split','WATIL <span class="text-accent">Security Guard</span>',null,'<p>기업의 IT 자산을 종합적으로 보호하는 통합 보안 솔루션입니다.</p>',null,'image',JSON.stringify({icon:'&#128274;',bg:'linear-gradient(135deg,#e8f8e8,#d1f1d1)',features:['24/7 보안 관제 서비스','제로트러스트 아키텍처','자동화된 보안 패치 관리']}),null,4],
    ['solution','cta','cta','우리 솔루션이 궁금하신가요?','전문가가 비즈니스에 맞는 최적의 솔루션을 제안합니다.',null,null,'image',null,null,5],

    // === PRODUCT ===
    ['product','hero','hero','제품 소개','검증된 기술력, 신뢰할 수 있는 제품',null,null,'image',null,'linear-gradient(135deg,#0e1b2d,#2a4a6b)',1],
    ['product','products','card-grid',null,null,null,null,'image',JSON.stringify([
      {icon:'&#9729;',category:'Cloud',title:'CloudManager Pro',desc:'멀티 클라우드 통합 관리 플랫폼으로 인프라 비용을 최대 40% 절감합니다.',meta:'v3.2 | Enterprise',bg:'linear-gradient(135deg,#e3f2fd,#bbdefb)'},
      {icon:'&#129302;',category:'AI',title:'DataInsight AI',desc:'AI 기반 데이터 분석 도구로 비즈니스 인사이트를 실시간 제공합니다.',meta:'v2.5 | Standard / Pro',bg:'linear-gradient(135deg,#f3e5f5,#e1bee7)'},
      {icon:'&#128274;',category:'Security',title:'SecureShield',desc:'제로트러스트 기반 통합 보안 솔루션으로 기업 자산을 보호합니다.',meta:'v4.0 | Enterprise',bg:'linear-gradient(135deg,#e8f5e9,#c8e6c9)'}
    ]),null,null,2],
    ['product','detail','feature-split','CloudManager Pro <span class="text-accent">3.2</span>','Cloud Platform','<p>AWS, Azure, GCP를 하나의 대시보드에서 통합 관리합니다.</p>',null,'image',JSON.stringify({icon:'&#128187;',bg:'linear-gradient(135deg,#e3f2fd,#bbdefb)',features:['멀티 클라우드 통합 대시보드','AI 기반 비용 최적화 추천','자동화된 보안 컴플라이언스','API 기반 확장 가능한 아키텍처']}),null,'bg-light',3],
    ['product','cta','cta','제품 데모를 요청하세요','실제 환경에서 제품을 체험해보실 수 있습니다.',null,null,'image',null,null,4]
  ];

REMOVED OLD SEED - END */

module.exports = db;
