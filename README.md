<div align="center">

# DayDitto

**하루를 한 번 더, 다른 언어로 쓰다**

일기를 쓰면 자연스러운 영어 문장으로, 오늘 하루를 한 번 더 써보는 개인용 언어 학습 다이어리

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

🔗 **[dayditto.co.kr](https://dayditto.co.kr)** — 실제 배포된 서비스를 바로 확인할 수 있습니다.

</div>

---

## 소개

DayDitto는 오늘의 일기를 한국어로 쓰면 자연스러운 영어 문장으로, 영어로 쓰면 한국어로 즉시 번역해서 보여주고, 번역된 문장을 원어민 발음(TTS)으로 들려주는 개인용 언어 학습 다이어리 서비스입니다.

단어를 암기하고 문법 규칙을 익히는 전통적인 학습 방식은 실제로 말하고 쓰는 순간에는 잘 떠오르지 않습니다. 학습한 내용이 "나의 경험"과 연결되어 있지 않기 때문입니다. DayDitto는 낯선 단어장 예문 대신, 사용자가 실제로 겪은 하루를 그대로 학습 재료로 삼습니다. "오늘 점심에 회사 앞 식당에서 김치찌개를 먹었는데 너무 매웠다"처럼 나의 실제 하루가 영어 문장으로 번역되는 경험을 통해 "내 이야기는 영어로 이렇게 표현하는구나"를 자연스럽게 익히도록 돕습니다.

> "오늘의 나를 한 번 더 쓰면, 그게 나의 교재가 된다"

## 이름의 의미

DayDitto는 '하루(Day)'와 '그대로 따라 쓰다·복제하다(Ditto)'를 합친 이름입니다. 영어 복합어에서 뒤에 오는 단어가 핵심을 이루는 원칙에 따라, DayDitto는 오늘 겪은 하루를 다른 언어로 한 번 더 옮겨 쓰는 이 서비스의 핵심 경험을 이름에 그대로 담았습니다. 초기 기획 단계에서는 TwoLog라는 이름으로 시작했지만, "두 개의 기록"이라는 형식보다 "하루를 다른 언어로 다시 쓰는 행위" 자체를 이름에 담기 위해 DayDitto로 리네이밍했습니다.

## 왜 DayDitto인가

번역 다이어리를 표방하는 서비스나 AI 첨삭 서비스, 예문 기반 암기 서비스는 이미 있지만, "개인의 하루 일기를 실시간으로 번역하고, 그 번역 결과를 바로 음성으로 확인할 수 있는 서비스"는 찾기 어려웠습니다. DayDitto는 이 공백, 즉 나의 하루 기록 → 실시간 번역 → 음성 확인이 하나의 흐름으로 이어지는 지점을 채우고자 합니다.

- **일기라는 형식** — 학습 콘텐츠가 아니라 개인 기록이라서 진입 장벽이 낮고 꾸준히 이어가기 쉽습니다
- **번역 + 발음의 결합** — 일기 번역과 TTS 발음 확인을 하나의 흐름으로 제공합니다
- **양방향 학습** — 한국어 사용자의 영어 학습뿐 아니라, 영어 사용자의 한국어 학습에도 같은 구조로 활용할 수 있습니다

---

## 구현 완료 기능

| 기능 | 내용 |
|---|---|
| 인증 | 이메일/비밀번호, Google/Kakao 소셜 로그인 |
| 일기 작성 | 멀티라인 텍스트, 기분/날씨, 이미지 업로드, GIF 삽입, 폰트 선택 |
| 번역 | 한↔영 방향 자동 감지 양방향 번역 (Claude API) |
| TTS | 라인별/배치/즐겨찾기 음성 생성 (Google Cloud TTS) |
| 북마크 | 즐겨찾기 표현 저장 + 음성 재생 |
| 프로필 관리 | 닉네임 수정, 비밀번호 변경, 계정 삭제 |
| 문의 | 작성 / 조회 / 관리자 답변 확인 |
| 공지사항 | 활성 공지 모달 표시 |
| 관리자 페이지 | 사용자 / 문의 / 공지 관리, 통계 조회 (별도 배포) |

### 페이지

| 경로 | 기능 |
|---|---|
| `/` | 홈 (비인증 사용자, 서비스 소개) |
| `/login` | 이메일 + 소셜 로그인 |
| `/signup` | 이메일 회원가입 |
| `/auth/callback` | OAuth 콜백 처리 |
| `/calendar` | 월간 일기 시각화 |
| `/create` | 일기 작성 |
| `/detailLog` | 일기 상세 조회 + TTS |
| `/profile` | 프로필 정보 / 북마크 / 내 문의 탭 (3탭) |
| `/inquiry` | 문의 작성 |
| `/inquiry/[id]` | 문의 상세 + 관리자 답변 |
| `/privacy-policy` | 개인정보처리방침 |

### API 엔드포인트 (`apps/api`)

- `daily-logs` — `GET /monthly`, `GET /:id`, `POST /`, `PATCH /:id/audio`, `PATCH /:id/line-audio`
- `users` — `GET /me`, `PATCH /me`, `DELETE /me`
- `auth` — `GET /me`
- `favorite-expressions` — `GET /`, `POST /`, `DELETE /:id`, `PATCH /:id/audio`
- `inquiries` — `POST /`, `GET /`, `GET /:id`
- `translate` — `POST /`
- `tts` — `POST /line`, `POST /batch`, `POST /favorite`
- `gif` — `GET /` (검색어 선택)
- `upload` — `POST /` (Supabase Storage `diary-images` 버킷)
- `notices` — `GET /active`
- `admin` — 사용자/문의/공지/통계 조회, 문의 답변, 공지 생성·비활성화·재발송 (총 10개 엔드포인트, `AdminGuard` 적용)

---

## 사용 흐름

1. 앱 실행 / 로그인
2. 사진 또는 GIF 첨부
3. 오늘의 이야기 작성 (한 줄에 한 문장씩, 모국어)
4. 번역 버튼 클릭 → 전체 줄을 한 번에 AI 번역 요청
5. 원문 · 번역문 줄 단위 대조 화면 표시
6. TTS 재생 버튼으로 발음 청취
7. 저장 → 캘린더/히스토리에 기록

번역은 문장이 끝날 때마다 요청하지 않고, 사용자가 일기 작성을 마친 뒤 한 번에 전체 줄을 LLM에 전달합니다. 문장 수와 무관하게 API 호출이 항상 1회로 고정되어 비용과 응답 속도가 예측 가능하고, 앞뒤 맥락을 반영한 자연스러운 번역이 가능합니다. 특정 줄만 수정했을 때는 전체를 재번역하지 않고 수정된 줄만 다시 번역해, 손대지 않은 번역이 예고 없이 바뀌는 일이 없도록 설계했습니다.

---

## 기술 스택

| 영역 | 기술 | 비고 |
|---|---|---|
| 프론트엔드 | Next.js 15, React 19, TypeScript | |
| 상태관리 | TanStack Query | 서버 상태 관리 |
| 스타일 | Tailwind CSS v4 | `@theme` 토큰 방식, 별도 config 없음 |
| 백엔드 | NestJS (TypeScript) | |
| DB | PostgreSQL (Supabase) + Drizzle ORM | 타입 안정성과 가벼운 런타임이 강점 |
| 인증 | Supabase Auth + JWT | 이메일/비밀번호, Google, Kakao |
| 스토리지 | Supabase Storage | |
| AI 번역 | Claude Haiku 4.5 (Anthropic) | 한↔영 방향 자동 감지, 직역이 아닌 자연스러운 의역 중심 프롬프트 설계, 토큰 사용량은 `aiUsageLogs` 테이블에 기록 |
| TTS | Google Cloud TTS | 번역 문장을 원어민 음성으로 변환 |
| GIF | Klipy API | |
| 패키지 매니저 | pnpm (monorepo) | |
| 모노레포 구조 | `apps/web` (Next.js), `apps/admin` (Next.js), `apps/api` (NestJS) | |

Supabase는 Postgres·Auth·Storage·Edge Functions(경량 서버리스 함수)를 제공하는 BaaS라 NestJS 같은 프레임워크 전체를 상시 구동하는 범용 서버 호스팅에는 적합하지 않습니다. 그래서 DB·인증·스토리지처럼 "직접 구축해도 차별화로 이어지지 않는 영역"은 Supabase로 시간을 아끼고, 번역 재시도·TTS 파이프라인 같은 자체 도메인 로직이 많은 API 서버는 AWS EC2에 직접 배포합니다. 프론트엔드는 Next.js 공식 플랫폼인 Vercel을 사용해 별도 설정 없이 배포합니다.

## 배포

- **프론트엔드**: Vercel — `dayditto.co.kr` (유저), `admin.dayditto.co.kr` (관리자)
- **API 서버**: AWS EC2 + Nginx + Let's Encrypt SSL — `api.dayditto.co.kr`
- **CI/CD**: GitHub Actions (Lint / Typecheck / Build / Test), `main` merge 시 Vercel 자동 배포
- **버전 관리**: [release-it](https://github.com/release-it/release-it) 기반 semantic versioning, 변경 이력은 [`CHANGELOG.md`](./CHANGELOG.md) 참고

### 릴리즈 프로세스

기능 단위로 묶어서, main 배포와 실제 동작 확인이 끝난 시점에 한 번씩 버전을 태깅합니다.

```
develop에서 기능 개발 → commit → push
  ↓
GitHub PR (develop → main), CI(Lint/Typecheck/Build/Test) 통과 후 merge
  ↓
Vercel 자동 배포 + (API 변경 시) EC2 수동 업데이트
  ↓
실서비스에서 정상 동작 확인
  ↓
release-it 실행 → 버전 bump(semantic versioning) + CHANGELOG 자동 생성 + Git 태그
```

Conventional Commits 메시지를 기준으로 patch/minor/major 버전을 자동 판단하며, 모노레포 내 `apps/web`, `apps/api`의 버전도 루트 버전에 동기화됩니다.

---

## 로드맵

| Phase | 상태 | 범위 |
|---|---|---|
| Phase 1 · MVP | ✅ 완료 | 일기 작성, 양방향 AI 번역, TTS 발음 재생 |
| Phase 2 | ✅ 완료 | 히스토리/캘린더, 표현 즐겨찾기, GIF 삽입, 공지사항, 문의, 관리자 페이지 |
| Phase 3 | ⏳ 검토 중 | 발음 녹음 비교, 모바일 앱 확장, 소셜 공유 기능 |

## 수익 모델 (검토 중)

핵심 경험(일기 작성 → 번역 → TTS 발음 재생)은 언제나 무료로 제공하는 것을 원칙으로 하며, 매월 5회를 넘는 작성부터 유료로 전환되는 프리미엄 구독형(Freemium) 구조를 검토하고 있습니다. 수익화는 MVP 단계에서 바로 도입하기보다, 꾸준히 쓰는 사용자가 실제로 확인된 이후에 붙이는 것을 목표로 합니다.

---

## 만든 사람

윤숙희 (Zoe) · Product Owner / Developer

<div align="center">

DayDitto — 하루를, 다른 언어로, 다시 쓰다.

</div>
