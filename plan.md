# 키즈카페 보물찾기 PWA — 프로젝트 plan.md

## 보존 — 기존 QR보물찾기 (변경 금지)

| 항목 | URL |
|------|-----|
| 앱 홈 | https://worldking-t86b.vercel.app/ |
| QR 스캔 | https://worldking-t86b.vercel.app/scan |
| 보물지도 | https://worldking-t86b.vercel.app/map |
| QR 인쇄(20개) | https://worldking-t86b.vercel.app/print/treasure-qr-sheet.html |
| 직원 인쇄 | https://worldking-t86b.vercel.app/staff/print-qr |
| Git 보존 태그 | `treasure-hunt-v1` (2026-08-05 시점 스냅샷) |

## 신규 — 추석QR보물미션

| 항목 | URL |
|------|-----|
| 진입(게임설명+퀴즈1) | https://worldking-t86b.vercel.app/chuseok |
| QR 스캔 | https://worldking-t86b.vercel.app/chuseok/scan |
| 코인 수령 | https://worldking-t86b.vercel.app/chuseok/claim |
| 진입 QR 인쇄 | https://worldking-t86b.vercel.app/chuseok/entry-qr |
| 관리자 | https://worldking-t86b.vercel.app/chuseok/admin |

---

## 추석QR보물미션 개발 체크리스트

### 보존
- [x] Git tag `treasure-hunt-v1` 생성
- [x] plan.md 최상단 기존 QR보물찾기 URL 기록
- [ ] 기존 `/`, `/api/*` 코드 diff 없음 확인

### DB·API
- [ ] MissionStep / MissionProgress / MissionScan / MissionClaim migration
- [ ] 10개 위치 + 퀴즈 seed
- [ ] GET `/api/chuseok/me`
- [ ] POST `/api/chuseok/quiz`
- [ ] POST `/api/chuseok/scan` (순서 경고·무순서 전환)
- [ ] POST `/api/chuseok/claim` (하루 1회)

### UI
- [ ] `/chuseok` 게임 설명 + 퀴즈 1
- [ ] QuizInput 네모칸 (띄어쓰기 표현)
- [ ] 정답 시 위치 안내 문구
- [ ] `/chuseok/scan` + OrderWarningModal
- [ ] 진행바 (10칸) + 코인 예상 표시
- [ ] `/chuseok/claim` + `/chuseok/complete`
- [ ] 추석 테마 CSS

### QR·배포
- [ ] `/chuseok/entry-qr` 진입 QR 인쇄
- [ ] Vercel 배포 + Supabase seed
- [ ] 실기기 HTTPS 카메라 테스트

### 관리자 (2차)
- [ ] `/chuseok/admin` 비밀번호 인증
- [ ] 퀴즈·정답·위치 CRUD API + UI

### 퀴즈 콘텐츠
- [x] 퀴즈 1~10 초안 확정 (seed 반영)
- [x] 정답 띄어쓰기·칸 표현 확정
- [ ] seed 반영 (배포 시)

---

## 목표

- 키즈카페에 숨긴 QR 20개를 스캔해 보물(코인)을 모으는 PWA.
- 0~9개: 격려 문구 + QR 촬영. 중복 QR은 “이미 찾은 보물” 안내.
- 10~19개: 선물 받아가기 + 계속 찾기(QR).
- 20개: 축하(월드킹) 페이지.
- 선물 수령: 오늘 날짜(KST) + 찾은 개수 격려.
- 한 기기(토큰)당 하루 1회만 선물 수령 API 허용.

## 사용자 시나리오

1. 앱 접속 → 기기 UUID 로컬 저장 후 서버에 등록.
2. QR 촬영 → 유효하면 카운트+1, 중복이면 모달.
3. 10개 이상 → 선물 받기(확인) 또는 계속 스캔.
4. 20개 달성 → 축하 전용 화면.

## 화면 목록

- 홈: 진행도, 코인, 단계별 버튼.
- 스캔: 카메라 + 안내.
- 선물 완료: 날짜 + N개 찾았어요.
- 완주 축하: 20개 전용.
- 모달: 중복 QR, 에러.

## API·DB

- `GET /api/me` — 스캔 수, 오늘 수령 여부(KST).
- `POST /api/scan` — `deviceId`, `qrPayload`.
- `POST /api/claim` — `deviceId`, 10개 미만/당일 중복 거절.

## 개발 체크리스트

- [x] Next.js + Prisma + SQLite + 시드 20 QR
- [x] API (me, scan, claim) + Zod
- [x] 홈 분기 UI + 모달 + 선물/축하 페이지
- [x] QR 스캔(html5-qrcode) + 권한 안내
- [x] PWA manifest + 메타

## QR 인쇄 규격

- 각 QR에 넣을 텍스트 예: `worldking:WK01` … `worldking:WK20` (대소문자 무시, 문자열 안에 `WK01` 형식이 있으면 인식).
- **PNG 저장 위치**: `public/qr-print/WK01.png` … `WK20.png` — `npm run qr:generate` 로 재생성.
- **한 파일 인쇄용**: `public/print/treasure-qr-sheet.html` (QR Base64 내장) — `npm run print:sheet` 또는 `npm run setup:local`. 브라우저: `/print/treasure-qr-sheet.html`
- **직원 미리보기·인쇄**: `/staff/print-qr` (로봇 색인 비활성). 참가 앱 홈 하단에도 링크.

## 미결정 사항

- QR 페이로드에 HMAC 추가 여부.

## 배포 참고

- 카메라 스캔은 **HTTPS** 환경(또는 localhost)에서 동작합니다.
- **Supabase(Postgres)** + **Vercel** 기준: `DATABASE_URL` / `DIRECT_URL` 설정 후 `npm run build`(내부 `prisma migrate deploy`). 최초 1회 `npx prisma db seed`.
- 상세 절차: [README.md](README.md) 의 Supabase + Vercel 섹션.

## 변경 이력

- 2026-04-17: 초안 작성, 저장소에 PWA 스캐폴드 반영.
- 2026-04-17: `qrcode` 스크립트로 PNG 20개 생성, `/staff/print-qr` 운영 페이지, 홈 UI·폰트(Nunito)·진행 바 정리.
- 2026-04-17: 단일 인쇄 HTML `public/print/treasure-qr-sheet.html`, `npm run setup:local` / README 로컬·배포 안내.
- 2026-04-18: Prisma → PostgreSQL(Supabase), `prisma/migrations`, 빌드에 `migrate deploy`, Vercel `vercel.json`(icn1), README Supabase+Vercel 절차.
