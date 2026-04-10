# WATIL 기업형 홈페이지 - 프로젝트 문서

## 1. 벤치마킹 대상: clobot.co.kr

### 사이트 개요
- **플랫폼**: iMweb (노코드 웹빌더)
- **기술**: 순수 HTML/CSS/JS (프레임워크 미사용)
- **폰트**: Pretendard
- **반응형**: 768px (모바일) / 992px (데스크톱)

---

## 2. 페이지 구성 분석

### 2-1. 정보성 페이지 (Dynamic CMS)

| 페이지 | 구성 패턴 | 섹션 수 |
|--------|----------|---------|
| 메인 | 풀스크린 히어로 + 서비스 카드 그리드 + 통계 + CTA | (정적 HTML) |
| 회사소개 | 히어로 + 소개 + 비전카드 + 연혁타임라인 + 통계 | 5 |
| 사업영역 | 히어로 + 카드그리드 + 프로세스 + CTA | 4 |
| 솔루션 | 히어로 + 솔루션3개(이미지+텍스트) + CTA | 5 |
| 제품소개 | 히어로 + 제품카드 + 제품상세 + CTA | 4 |

**공통 레이아웃 패턴:**
```
[고정 헤더 80px]
[히어로 섹션] - 풀스크린 배경 (이미지/영상/그래디언트)
[콘텐츠 섹션 1200px] - 카드 그리드 (2~3열)
[이미지+텍스트 교차] - 좌우 번갈아 배치
[CTA 섹션] - 문의/액션 유도
[푸터]
```

### 2-2. 게시판 페이지 (Board)

| 페이지 | 유형 | 구성 |
|--------|------|------|
| 언론보도 | 카드형 갤러리 | 썸네일 + 제목 + 날짜 |
| 공지사항 | 카드형 갤러리 | 썸네일 + 제목 + 날짜 |
| 도입사례 | 카드형 갤러리 | 썸네일 + 제목 + 요약 |
| 뉴스레터 | 카드형 갤러리 | 썸네일 + 제목 |

### 2-3. 폼 페이지 (문의)

| 입력 유형 | 용도 |
|----------|------|
| 텍스트 | 회사명, 담당자명 |
| 이메일 | 이메일 주소 |
| 전화번호 | 연락처 |
| 드롭다운 | 문의 유형 |
| 텍스트에어리어 | 문의 내용 |
| 체크박스 | 개인정보 동의 |

---

## 3. 디자인 시스템

| 요소 | 값 |
|------|-----|
| 주 색상 | `#1a3151` (진한 파랑) |
| 보조 색상 | `#39c7ed` (하늘색) |
| 본문 텍스트 | `#212121` |
| 보조 텍스트 | `#666666` |
| 최대 너비 | 1200px |
| 헤더 높이 | PC 80px / 모바일 64px |
| 폰트 | Pretendard (CDN) |
| 카드 모서리 | 8px |
| 그림자 | `0 2px 12px rgba(0,0,0,.08)` |
| 애니메이션 | transition 0.3s, IntersectionObserver fade-in |
| 브레이크포인트 | 768px (모바일) / 992px (태블릿) |

---

## 4. 기술 스택 (확정)

### Frontend
| 항목 | 기술 |
|------|------|
| 마크업 | HTML5 (정적 + API 동적 렌더링) |
| 스타일 | CSS 커스텀 (CSS Variables) |
| 스크립트 | Vanilla JS (ES6+) |
| 애니메이션 | IntersectionObserver 기반 스크롤 애니메이션 |
| 반응형 | CSS Media Query |

### Backend
| 항목 | 기술 |
|------|------|
| 서버 | Node.js + Express 4.18 |
| DB | SQLite (better-sqlite3, WAL mode) |
| 파일 업로드 | Multer (50MB, 이미지/영상) |
| 인증 | Base64 토큰 (심플 인증) |

---

## 5. 프로젝트 폴더 구조 (현재)

```
watil/
├── server.js                       # Express 서버 (포트 3000)
├── package.json                    # 의존성 관리
├── watil.db                        # SQLite 데이터베이스
├── SITE_ANALYSIS.md                # 이 문서
│
├── server/                         # 백엔드
│   ├── db.js                       # DB 초기화 + 테이블 생성 + 시드
│   ├── seed-sections.js            # 페이지 섹션 시드 데이터 (18개)
│   └── routes/
│       ├── board.js                # 게시판 CRUD API
│       ├── inquiry.js              # 문의 접수 API
│       └── pages.js                # 페이지 섹션 API + 로그인 + 업로드
│
├── public/                         # 프론트엔드 (정적 파일)
│   ├── index.html                  # 메인 페이지 (정적)
│   ├── company.html                # 회사소개 (동적 렌더링)
│   ├── business.html               # 사업영역 (동적 렌더링)
│   ├── solution.html               # 솔루션 (동적 렌더링)
│   ├── product.html                # 제품소개 (동적 렌더링)
│   ├── board.html                  # 게시판 목록
│   ├── post.html                   # 게시글 상세 (글읽기)
│   ├── inquiry.html                # 도입문의 (글쓰기)
│   ├── admin.html                  # 관리자 대시보드
│   │
│   ├── css/
│   │   ├── reset.css               # CSS 초기화
│   │   ├── common.css              # 공통 스타일 (헤더, 푸터, 카드, 폼 등)
│   │   ├── main.css                # 메인 페이지 + 섹션 스타일
│   │   └── admin.css               # 관리자 전용 스타일
│   │
│   └── js/
│       ├── common.js               # 헤더, 모바일 메뉴, 스크롤 애니메이션, API 헬퍼
│       ├── board.js                # 게시판 목록, 카테고리 필터, 페이지네이션
│       ├── page-renderer.js        # 동적 섹션 렌더러 (8개 타입)
│       └── admin.js                # 관리자 로그인, 섹션 편집, 게시판/문의 관리
│
└── uploads/                        # 업로드 파일 저장소
```

---

## 6. DB 스키마

### board_category
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INTEGER PK | 자동 증가 |
| slug | TEXT UNIQUE | 카테고리 식별자 (news, notice, case, newsletter) |
| name | TEXT | 표시 이름 |
| sort_order | INTEGER | 정렬 순서 |

### board_post
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INTEGER PK | 자동 증가 |
| category_id | INTEGER FK | 카테고리 참조 |
| title | TEXT | 제목 |
| content | TEXT | 본문 (HTML) |
| author | TEXT | 작성자 |
| thumbnail | TEXT | 썸네일 경로 |
| hit_count | INTEGER | 조회수 |
| is_visible | INTEGER | 노출 여부 |
| created_at | DATETIME | 작성일 |
| updated_at | DATETIME | 수정일 |

### page_section
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INTEGER PK | 자동 증가 |
| page_slug | TEXT | 페이지 식별자 (company, business, solution, product) |
| section_key | TEXT | 섹션 식별자 (hero, about, cards, cta 등) |
| section_type | TEXT | 섹션 타입 (hero, feature-split, card-grid, stats, timeline, cta, process) |
| title | TEXT | 제목 (HTML 허용) |
| subtitle | TEXT | 부제목 |
| content | TEXT | 본문 (HTML) |
| media_url | TEXT | 미디어 URL (이미지/영상) |
| media_type | TEXT | 미디어 타입 (image / video) |
| items_json | TEXT | 배열/객체 데이터 (JSON) |
| bg_style | TEXT | 배경 스타일 (CSS gradient, 'dark', 'bg-light') |
| sort_order | INTEGER | 정렬 순서 |
| is_visible | INTEGER | 노출 여부 |
| updated_at | DATETIME | 수정일 |

### inquiry
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INTEGER PK | 자동 증가 |
| company_name | TEXT | 회사명 |
| contact_name | TEXT | 담당자명 |
| email | TEXT | 이메일 |
| phone | TEXT | 연락처 |
| inquiry_type | TEXT | 문의 유형 |
| subject | TEXT | 제목 |
| content | TEXT | 내용 |
| is_read | INTEGER | 읽음 여부 |
| created_at | DATETIME | 접수일 |

### admin_user
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INTEGER PK | 자동 증가 |
| username | TEXT UNIQUE | 아이디 |
| password | TEXT | 비밀번호 |

---

## 7. API 엔드포인트

### 게시판 (`/api/board`)
| Method | URL | 설명 |
|--------|-----|------|
| GET | `/api/board/categories` | 카테고리 목록 |
| GET | `/api/board/posts?category=&page=&size=&search=` | 게시글 목록 (페이징, 검색) |
| GET | `/api/board/posts/:id` | 게시글 상세 + 이전/다음 |
| POST | `/api/board/posts` | 게시글 작성 (JSON/multipart) |
| PUT | `/api/board/posts/:id` | 게시글 수정 (JSON/multipart) |
| DELETE | `/api/board/posts/:id` | 게시글 삭제 |

### 문의 (`/api/inquiry`)
| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/inquiry` | 문의 접수 |
| GET | `/api/inquiry?page=&size=` | 문의 목록 (관리자) |

### 페이지 관리 (`/api/pages`)
| Method | URL | 설명 |
|--------|-----|------|
| POST | `/api/pages/login` | 관리자 로그인 |
| GET | `/api/pages/:slug/sections` | 페이지 섹션 목록 (FO용) |
| GET | `/api/pages/:slug/sections/:key` | 섹션 1건 조회 |
| PUT | `/api/pages/:slug/sections/:key` | 섹션 수정 (관리자, x-admin-token) |
| POST | `/api/pages/upload` | 미디어 업로드 (관리자) |

---

## 8. 섹션 타입별 렌더링

| 타입 | 설명 | 편집 가능 항목 |
|------|------|-------------|
| `hero` | 페이지 상단 배너 | 제목, 부제목, 배경(gradient/이미지/영상) |
| `feature-split` | 이미지 + 텍스트 교차 | 제목, 본문(HTML), 미디어, 특장점 목록 |
| `card-grid` | 카드형 그리드 | 제목, 부제목, 카드 항목(아이콘/제목/설명) |
| `stats` | 숫자 통계 블록 | 통계 항목(숫자/라벨) |
| `timeline` | 연혁 타임라인 | 타임라인 항목(연도/제목/설명) |
| `process` | 단계별 프로세스 | 프로세스 항목(단계/제목/설명) |
| `cta` | Call-to-Action | 제목, 부제목 |

---

## 9. 관리자 기능

### 접속 정보
- **URL**: http://localhost:3000/admin.html
- **ID / PW**: `admin` / `admin1234`

### 기능 목록

| 메뉴 | 기능 |
|------|------|
| **페이지 관리** (4개) | 섹션별 제목/내용/미디어 편집, 카드 항목 추가/삭제, 전체 저장, 미리보기 |
| **게시판 관리** | 게시글 목록, 상세 읽기, 새 글 작성, 수정, 삭제 |
| **문의 관리** | 접수된 문의 목록 조회 |

---

## 10. 실행 방법

```bash
cd C:\dev\watil
npm install          # 최초 1회
npm start            # http://localhost:3000
```

| URL | 설명 |
|-----|------|
| http://localhost:3000 | 메인 페이지 |
| http://localhost:3000/company.html | 회사소개 |
| http://localhost:3000/business.html | 사업영역 |
| http://localhost:3000/solution.html | 솔루션 |
| http://localhost:3000/product.html | 제품소개 |
| http://localhost:3000/board.html | 게시판 |
| http://localhost:3000/inquiry.html | 도입문의 |
| http://localhost:3000/admin.html | 관리자 |

---

## 11. 향후 작업 (TODO)

- [ ] 메인 페이지도 동적 CMS 전환
- [ ] 관리자 비밀번호 암호화 (bcrypt)
- [ ] WYSIWYG 에디터 연동 (게시판 글쓰기)
- [ ] 게시글 썸네일 이미지 업로드
- [ ] 이미지 최적화 (리사이즈, WebP 변환)
- [ ] SEO 메타 태그 관리
- [ ] 실 서버 배포 (PM2 + nginx)
- [ ] SSL 인증서 적용
