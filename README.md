# 월드킹 보물찾기 (키즈카페 PWA)

QR 20개를 매장에 숨기고, 손님이 PWA로 스캔하며 보물(코인)을 모으는 행사용 웹앱입니다.  
**DB는 PostgreSQL(Supabase)**, **호스팅은 Vercel**을 기준으로 구성했습니다.

---

## Supabase + Vercel로 배포하기 (bottari와 동일 스택)

### 1. Supabase 프로젝트

1. [Supabase](https://supabase.com/)에서 새 프로젝트 생성 (리전은 **Seoul** 권장).
2. **Project Settings → Database**로 이동.
3. 아래 두 문자열을 복사해 둡니다.
   - **Transaction pooler** (포트 **6543**, `?pgbouncer=true` 포함) → **`DATABASE_URL`**
   - **Session mode** 또는 **Direct connection** (포트 **5432**) → **`DIRECT_URL`**  
     (마이그레이션용. 없으면 일단 `DATABASE_URL`과 동일한 직접 연결 URI를 넣어도 됩니다.)

### 2. Vercel에 올리기 (저장소 연결 → 배포까지)

“업로드”는 보통 **ZIP 업로드**가 아니라 **GitHub 등 Git 저장소를 Vercel에 연결**하는 방식입니다.

#### 2-1. GitHub에 코드 올리기 (아직 없다면)

1. [GitHub](https://github.com/)에서 **New repository**로 새 저장소를 만듭니다. (이름 예: `worldking`)
2. 터미널에서 이 프로젝트 폴더로 이동한 뒤:

```bash
git remote add origin https://github.com/<본인계정>/<저장소이름>.git
git branch -M main
git add .
git commit -m "chore: worldking treasure PWA"
git push -u origin main
```

(이미 `origin`이 있으면 `git remote -v`로 확인하고, 필요하면 `git remote set-url origin ...` 만 수정합니다.)

#### 2-2. Vercel에서 프로젝트 만들기

1. [Vercel](https://vercel.com/)에 로그인합니다.
2. **Add New… → Project** 를 누릅니다.
3. **Import Git Repository** 목록에서 방금 만든 GitHub 저장소를 고릅니다. (안 보이면 **Adjust GitHub App Permissions** 로 저장소 접근을 허용합니다.)
4. **Framework Preset**이 **Next.js**로 잡히는지 확인합니다. **Root Directory**는 보통 그대로 `./` 입니다.
5. **Environment Variables** 펼친 뒤, 아래 두 줄을 **로컬 `.env`와 동일한 값**으로 추가합니다. (이름·대소문자 그대로.)
   - `DATABASE_URL` = Transaction pooler (포트 **6543**, 가능하면 `?pgbouncer=true&connection_limit=1` 포함)  
   - `DIRECT_URL` = **Session pooler (포트 5432, `pooler.supabase.com`)** — 로컬에서 `db.xxx.supabase.co` 가 P1001 났다면 Vercel 빌드에서도 실패할 수 있으니 **맥에서 성공한 DIRECT_URL 그대로** 복사하는 것이 안전합니다.  
6. **Production** 체크는 기본 켜짐. Preview 배포도 쓰려면 같은 변수를 **Preview**에도 추가합니다.
7. **Deploy** 를 누릅니다.

#### 2-3. 빌드가 하는 일

`npm run build` 안에는 **`prisma migrate deploy`** 가 포함되어 있어, **배포 빌드 시점에** Supabase에 테이블이 만들어집니다.  
그래서 **위 2-2의 5번(환경 변수)을 Deploy 전에 넣는 것**이 중요합니다. 빌드가 실패하면 **Deployments → 해당 빌드 → Logs**에서 `prisma` / `DATABASE` 관련 메시지를 확인합니다.

#### 2-4. 환경 변수를 나중에 고친 경우

**Settings → Environment Variables**에서 값을 바꾼 뒤에는 반드시 **Deployments → … 메뉴 → Redeploy** 로 다시 빌드해야 적용됩니다.

#### 2-5. Vercel에서 `Command "npm run build" exited with 1` 일 때

1. **Deployments** → 실패한 배포 클릭 → **Building** 로그를 펼칩니다.  
2. **맨 위가 아니라 `Error:` / `ELIFECYCLE` / `prisma` 가 처음 나오는 줄**을 찾습니다. (그 줄이 원인입니다.)
3. 아래를 순서대로 확인합니다.

| 로그에 나오는 느낌 | 할 일 |
|-------------------|--------|
| `Environment variable not found: DIRECT_URL` (또는 DATABASE_URL) | Vercel **Settings → Environment Variables**에 두 변수 모두 있는지, **Production**(및 Preview)에 체크됐는지 확인 후 **Redeploy**. |
| `Can't reach database server` / `P1001` | Supabase 프로젝트 **Paused** 여부, `DIRECT_URL`을 **Session pooler(5432)** 로 맞췄는지 확인. Supabase **Network / IP 제한**을 켠 경우 Vercel IP 허용이 필요할 수 있습니다. |
| `Migration ... failed` | Supabase **SQL Editor**에서 테이블 상태를 보고, 로컬에서 `npx prisma migrate status` 결과와 비교. |
| `Type error` / `Failed to compile` | 로컬에서 `npm run build` 를 한 번 돌려 같은 오류가 나는지 확인. |

로컬(`npm run build`)은 되는데 Vercel만 안 되면 **거의 항상 1번(환경 변수)** 또는 **2번(빌드 환경에서 DB 접속)** 입니다.

### 3. 보물 코드 20개 시드 (최초 1회)

DB는 생겼지만 `TreasureQr` 행은 비어 있습니다. 아래 중 하나로 **한 번만** 실행하세요.

**방법 A — 로컬에서 프로덕션 DB에 시드 (가장 간단)**

```bash
cp .env.example .env
# .env 안의 DATABASE_URL / DIRECT_URL 을 Supabase 값으로 채운 뒤:
npx prisma db seed
```

**방법 B — Vercel에서 일회성 실행**

로컬에 Vercel CLI와 프로젝트 링크 후, Production `DATABASE_URL`이 담긴 환경에서:

```bash
npx vercel env pull .env.production.local
# 필요 시 .env.production.local 을 DATABASE_URL 등으로 맞춘 뒤
npx dotenv -e .env.production.local -- npx prisma db seed
```

(또는 Supabase **SQL Editor**에 시드용 `INSERT`를 직접 넣어도 됩니다. 시드 내용은 `prisma/seed.ts` 참고.)

### 4. 배포 후 확인

- 앱 URL: `https://<프로젝트>.vercel.app`
- **HTTPS**이므로 폰 카메라 QR 스캔 가능.
- 인쇄용 한 파일: `https://<프로젝트>.vercel.app/print/treasure-qr-sheet.html`
- 직원용 그리드: `https://<프로젝트>.vercel.app/staff/print-qr`

Vercel 리전은 [`vercel.json`](vercel.json)에서 **Seoul 근접(icn1)** 으로 두었습니다. 필요 시 Vercel 대시보드에서 변경 가능합니다.

---

## 로컬 개발

```bash
cp .env.example .env
# Supabase DATABASE_URL / DIRECT_URL 입력 (로컬 DB 없이 Supabase만 써도 됨)
npm install
npm run setup:local
npm run dev
```

- `setup:local` = `prisma migrate deploy` + 시드 + QR PNG + 인쇄용 HTML.
- 카메라 스캔: **localhost** 또는 **HTTPS**에서 테스트.

### 스크립트 요약

| 명령 | 설명 |
|------|------|
| `npm run dev` | 로컬 개발 서버 |
| `npm run build` | `migrate deploy` + Next 프로덕션 빌드 |
| `npm run db:migrate:dev` | 스키마 변경 시 로컬에서 새 마이그레이션 생성 |
| `npm run qr:generate` | `public/qr-print/*.png` |
| `npm run print:sheet` | `public/print/treasure-qr-sheet.html` |
| `npm run setup:local` | migrate deploy + seed + assets |

---

## 인쇄용 파일 (QR 20개 한 장)

- **파일**: `public/print/treasure-qr-sheet.html` (QR Base64 내장)
- 앱 실행 후: **http://localhost:3000/print/treasure-qr-sheet.html** → 「인쇄 / PDF로 저장」

---

## QR 페이로드

`worldking:WK01` … `worldking:WK20` — 자세한 규칙은 `plan.md`.

---

## 인증키를 받으면 해줄 일 (체크리스트)

아래 값을 알려주시면, 연결 문자열 형식 검증·빌드 로그 이슈·시드 재실행 여부까지 맞춰 드릴 수 있습니다.

1. **Supabase `DATABASE_URL`** (Transaction / Pooler, 비밀번호 마스킹 가능, 형식만 맞으면 됨)  
2. **Supabase `DIRECT_URL`** (Session 또는 Direct)  
3. **Vercel 프로젝트 이름** 또는 배포 URL  
4. (선택) **GitHub 저장소**가 Vercel에 이미 연결됐는지 여부  

비밀번호는 채팅에 **전체를 붙이지 말고**, Vercel/Supabase 대시보드에 직접 넣으신 뒤 `연결됐는지` / `에러 메시지`만 공유해 주셔도 됩니다.
