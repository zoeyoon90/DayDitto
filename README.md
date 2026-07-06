# TwoLog

> 나의 하루를, 나의 언어로 다시 쓰다

일기 기반 AI 번역·발음 영어 학습 서비스

---

## 서비스 소개

단어장 예문이 아닌, **오늘 내가 직접 겪은 하루**를 영어로 표현하는 경험을 통해 자연스럽게 영어 감각을 기르는 개인 학습 다이어리입니다.

"오늘 점심에 김치찌개를 먹었는데 너무 매웠다"처럼 내 이야기를 한국어로 작성하면, AI가 자연스러운 영어 문장으로 번역하고 원어민 발음으로 들려줍니다.

**핵심 흐름:** 일기 작성 → AI 양방향 번역 → TTS 발음 청취 → 캘린더 누적

---

## 핵심 기능

| 기능 | 설명 | 상태 |
|------|------|------|
| 일기 작성 | 사진/GIF 1장 + 텍스트 (한 줄 = 한 문장) | MVP |
| AI 양방향 번역 | 한→영 / 영→한, 버튼 1회로 전체 줄 일괄 번역, 원문 바로 아래 대조 표시 | MVP |
| TTS 발음 재생 | 번역 문장 원어민 음성 재생 | MVP |
| 히스토리/캘린더 | 날짜별 일기 목록 및 썸네일 뷰 | Phase 2 |
| 표현 즐겨찾기 | 마음에 든 번역 표현 저장·복습 | Phase 2 |
| 번역 톤 선택 | 격식체·구어체 등 스타일 선택 옵션 | Phase 2 |
| 발음 녹음 비교 | 내 발음과 원어민 발음 비교 | Phase 3 |

---

## 기술 스택

### Frontend — `apps/web`

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.2 (App Router), React 19 |
| 언어 | TypeScript 5.9 |
| 스타일링 | Tailwind CSS v4, Radix UI |
| 폼 관리 | React Hook Form + Zod |
| 인증 | Supabase SSR Auth |

### Backend — `apps/api`

| 항목 | 기술 |
|------|------|
| 프레임워크 | NestJS 11 |
| 언어 | TypeScript 5.7 |
| ORM | Drizzle ORM |
| 데이터베이스 | PostgreSQL (Supabase 관리형) |
| 인증 | JWT (Supabase JWKS, RS256) |

### Infra & Services

| 항목 | 기술 | 비고 |
|------|------|------|
| DB / Auth / Storage | Supabase | PostgreSQL + Auth + Storage 통합 |
| 번역 엔진 | Claude Haiku 4.5 (LLM API) | 계획 — 의역 중심 프롬프트 설계 |
| TTS | Google Cloud TTS / Amazon Polly / OpenAI TTS | 계획 |
| API 배포 | Railway / Render | 계획 |
| CI | GitHub Actions | lint, type-check, build, test |

### Monorepo

- **Turborepo** + **pnpm** workspaces
- `packages/ui` — 공유 컴포넌트
- `packages/eslint-config` — ESLint 공통 설정
- `packages/typescript-config` — tsconfig 공통 설정

---

## 프로젝트 구조

```
TwoLog/
├── apps/
│   ├── web/          # Next.js 프론트엔드 (port 5006)
│   └── api/          # NestJS 백엔드 (port 3000)
├── packages/
│   ├── ui/           # 공유 React 컴포넌트
│   ├── eslint-config/
│   └── typescript-config/
```

---

## 로컬 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (web + api 동시)
pnpm dev
```

- Web: `http://localhost:5006`
- API: `http://localhost:3000`

환경 변수 설정:
- `apps/web/.env.local` — Supabase URL, Anon Key
- `apps/api/.env` — Supabase URL, Service Role Key, DB 연결 정보

---

## 로드맵

| Phase | 범위 |
|-------|------|
| Phase 1 · MVP | 일기 작성(텍스트+사진/GIF), AI 양방향 번역, TTS 발음 재생 |
| Phase 2 | 히스토리/캘린더 뷰, 표현 즐겨찾기, 번역 톤 선택 |
| Phase 3 | 발음 녹음 비교, 모바일 앱(React Native/Expo), 소셜 공유 |

---

## 작성자

윤숙희 (Zoe) · Product Owner / Developer
