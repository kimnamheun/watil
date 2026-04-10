/**
 * Seed page_section data - called from db.js
 */
module.exports = function seedSections(db) {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM page_section').get();
  if (count.cnt > 0) return;

  const ins = db.prepare(`INSERT INTO page_section
    (page_slug, section_key, section_type, title, subtitle, content, media_url, media_type, items_json, bg_style, sort_order)
    VALUES (@ps, @sk, @st, @title, @subtitle, @content, @media_url, @media_type, @items_json, @bg_style, @sort_order)`);

  const rows = [
    // COMPANY
    { ps:'company', sk:'hero', st:'hero', title:'회사소개', subtitle:'WATIL은 기술로 세상을 변화시킵니다.', content:null, media_url:null, media_type:'image', items_json:null, bg_style:'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)', sort_order:1 },
    { ps:'company', sk:'about', st:'feature-split', title:'기술 혁신을 선도하는 <span class="text-accent">WATIL</span>', subtitle:null, content:'<p>WATIL은 2011년 설립 이래 기업의 디지털 전환과 기술 혁신을 위해 끊임없이 도전해왔습니다.</p><p>우리는 기술이 사람과 비즈니스를 연결하는 다리가 된다고 믿습니다.</p>', media_url:null, media_type:'image', items_json:null, bg_style:null, sort_order:2 },
    { ps:'company', sk:'vision', st:'card-grid', title:'비전 & 미션', subtitle:'기술로 더 나은 세상을 만들어갑니다.', content:null, media_url:null, media_type:'image', items_json:JSON.stringify([
      { icon:'&#127891;', title:'Vision', desc:'글로벌 기술 리더로서 모든 기업의 디지털 전환을 실현합니다.' },
      { icon:'&#127919;', title:'Mission', desc:'혁신적인 기술과 최고의 서비스로 고객의 성공을 함께 만들어갑니다.' },
      { icon:'&#128161;', title:'Core Value', desc:'혁신, 신뢰, 협력을 바탕으로 지속 가능한 성장을 추구합니다.' }
    ]), bg_style:'bg-light', sort_order:3 },
    { ps:'company', sk:'history', st:'timeline', title:'연혁', subtitle:'WATIL의 성장 여정', content:null, media_url:null, media_type:'image', items_json:JSON.stringify([
      { year:'2026', title:'AI 사업부 신설', desc:'해외 시장 진출 본격화' },
      { year:'2023', title:'클라우드 서비스 플랫폼 런칭', desc:'매니지드 서비스 개시' },
      { year:'2020', title:'누적 매출 1,000억 돌파', desc:'고객사 200개 돌파' },
      { year:'2015', title:'기업부설 연구소 설립', desc:'빅데이터 및 AI 연구' },
      { year:'2011', title:'WATIL 법인 설립', desc:'SI 사업 시작' }
    ]), bg_style:null, sort_order:4 },
    { ps:'company', sk:'stats', st:'stats', title:null, subtitle:null, content:null, media_url:null, media_type:'image', items_json:JSON.stringify([
      { number:'150+', label:'전문 인력' }, { number:'500+', label:'수행 프로젝트' },
      { number:'200+', label:'고객사' }, { number:'15+', label:'특허 및 인증' }
    ]), bg_style:'dark', sort_order:5 },

    // BUSINESS
    { ps:'business', sk:'hero', st:'hero', title:'사업영역', subtitle:'기술의 힘으로 산업의 미래를 혁신합니다.', content:null, media_url:null, media_type:'image', items_json:null, bg_style:'linear-gradient(135deg,#0e2052 0%,#1a3151 100%)', sort_order:1 },
    { ps:'business', sk:'areas', st:'card-grid', title:'핵심 사업 분야', subtitle:'다양한 산업 분야에서 검증된 기술력으로 최적의 솔루션을 제공합니다.', content:null, media_url:null, media_type:'image', items_json:JSON.stringify([
      { icon:'&#128736;', title:'시스템 통합 (SI)', desc:'업무 시스템 분석 및 통합 구축' },
      { icon:'&#9729;', title:'클라우드 서비스', desc:'멀티 클라우드 인프라 구축' },
      { icon:'&#129302;', title:'AI & 데이터', desc:'AI 솔루션과 빅데이터 분석' },
      { icon:'&#128274;', title:'보안 솔루션', desc:'통합 보안 체계 수립' },
      { icon:'&#128241;', title:'모바일 & 웹', desc:'앱과 웹 서비스 기획/개발' },
      { icon:'&#128640;', title:'디지털 전환 컨설팅', desc:'디지털 전환 로드맵 수립' }
    ]), bg_style:null, sort_order:2 },
    { ps:'business', sk:'process', st:'process', title:'프로젝트 수행 프로세스', subtitle:'체계적인 프로세스로 성공적인 프로젝트를 수행합니다.', content:null, media_url:null, media_type:'image', items_json:JSON.stringify([
      { step:1, title:'분석 & 기획', desc:'요구사항 분석, 솔루션 설계' },
      { step:2, title:'설계 & 개발', desc:'아키텍처 설계, 개발' },
      { step:3, title:'테스트 & 검증', desc:'통합 테스트, 보안 점검' },
      { step:4, title:'운영 & 유지보수', desc:'시스템 안정화, 모니터링' }
    ]), bg_style:'bg-light', sort_order:3 },
    { ps:'business', sk:'cta', st:'cta', title:'프로젝트를 함께 시작하세요', subtitle:'전문 컨설턴트가 최적의 솔루션을 제안합니다.', content:null, media_url:null, media_type:'image', items_json:null, bg_style:null, sort_order:4 },

    // SOLUTION
    { ps:'solution', sk:'hero', st:'hero', title:'솔루션', subtitle:'비즈니스 과제를 해결하는 최적의 기술 솔루션', content:null, media_url:null, media_type:'image', items_json:null, bg_style:'linear-gradient(135deg,#173273 0%,#0e2052 100%)', sort_order:1 },
    { ps:'solution', sk:'cloud', st:'feature-split', title:'WATIL <span class="text-accent">Cloud Platform</span>', subtitle:null, content:'<p>하이브리드 및 멀티 클라우드 환경을 통합 관리하는 플랫폼입니다.</p>', media_url:null, media_type:'image', items_json:JSON.stringify({ icon:'&#9729;', bg:'linear-gradient(135deg,#e8f4f8,#d1ecf1)', features:['멀티 클라우드 통합 관리','자동 스케일링 & 비용 최적화','실시간 모니터링 & 알림'] }), bg_style:null, sort_order:2 },
    { ps:'solution', sk:'ai', st:'feature-split', title:'WATIL <span class="text-accent">AI Analytics</span>', subtitle:null, content:'<p>AI 기반 실시간 인사이트 분석 플랫폼입니다.</p>', media_url:null, media_type:'image', items_json:JSON.stringify({ icon:'&#129302;', bg:'linear-gradient(135deg,#f0e8f8,#e1d1f1)', features:['실시간 데이터 파이프라인','머신러닝 기반 예측 분석','맞춤형 대시보드 & 리포트'] }), bg_style:'bg-light', sort_order:3 },
    { ps:'solution', sk:'security', st:'feature-split', title:'WATIL <span class="text-accent">Security Guard</span>', subtitle:null, content:'<p>기업 IT 자산을 종합 보호하는 통합 보안 솔루션입니다.</p>', media_url:null, media_type:'image', items_json:JSON.stringify({ icon:'&#128274;', bg:'linear-gradient(135deg,#e8f8e8,#d1f1d1)', features:['24/7 보안 관제','제로트러스트 아키텍처','자동 보안 패치 관리'] }), bg_style:null, sort_order:4 },
    { ps:'solution', sk:'cta', st:'cta', title:'우리 솔루션이 궁금하신가요?', subtitle:'전문가가 비즈니스에 맞는 최적의 솔루션을 제안합니다.', content:null, media_url:null, media_type:'image', items_json:null, bg_style:null, sort_order:5 },

    // PRODUCT
    { ps:'product', sk:'hero', st:'hero', title:'제품 소개', subtitle:'검증된 기술력, 신뢰할 수 있는 제품', content:null, media_url:null, media_type:'image', items_json:null, bg_style:'linear-gradient(135deg,#0e1b2d,#2a4a6b)', sort_order:1 },
    { ps:'product', sk:'products', st:'card-grid', title:null, subtitle:null, content:null, media_url:null, media_type:'image', items_json:JSON.stringify([
      { icon:'&#9729;', category:'Cloud', title:'CloudManager Pro', desc:'멀티 클라우드 통합 관리 플랫폼', meta:'v3.2 | Enterprise', bg:'linear-gradient(135deg,#e3f2fd,#bbdefb)' },
      { icon:'&#129302;', category:'AI', title:'DataInsight AI', desc:'AI 기반 데이터 분석 도구', meta:'v2.5 | Standard / Pro', bg:'linear-gradient(135deg,#f3e5f5,#e1bee7)' },
      { icon:'&#128274;', category:'Security', title:'SecureShield', desc:'제로트러스트 통합 보안 솔루션', meta:'v4.0 | Enterprise', bg:'linear-gradient(135deg,#e8f5e9,#c8e6c9)' }
    ]), bg_style:null, sort_order:2 },
    { ps:'product', sk:'detail', st:'feature-split', title:'CloudManager Pro <span class="text-accent">3.2</span>', subtitle:'Cloud Platform', content:'<p>AWS, Azure, GCP를 하나의 대시보드에서 통합 관리합니다.</p>', media_url:null, media_type:'image', items_json:JSON.stringify({ icon:'&#128187;', bg:'linear-gradient(135deg,#e3f2fd,#bbdefb)', features:['멀티 클라우드 통합 대시보드','AI 기반 비용 최적화 추천','자동화된 보안 컴플라이언스','API 기반 확장 아키텍처'] }), bg_style:'bg-light', sort_order:3 },
    { ps:'product', sk:'cta', st:'cta', title:'제품 데모를 요청하세요', subtitle:'실제 환경에서 제품을 체험해보실 수 있습니다.', content:null, media_url:null, media_type:'image', items_json:null, bg_style:null, sort_order:4 }
  ];

  for (const row of rows) {
    ins.run(row);
  }
  console.log(`Seeded ${rows.length} page sections`);
};
