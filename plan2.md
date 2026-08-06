# 할로윈 QR 퀴즈미션 — plan2.md

## 보존 — 기존 앱 (변경 금지)

| 항목 | URL |
|------|-----|
| 기존 QR보물찾기 | https://worldking-t86b.vercel.app/ |
| 추석 QR 보물미션 | https://worldking-t86b.vercel.app/chuseok |
| 추석 관리자 | https://worldking-t86b.vercel.app/chuseok/admin |

## 신규 — 할로윈 QR 퀴즈미션

| 항목 | URL |
|------|-----|
| 진입 | https://worldking-t86b.vercel.app/halloween |
| QR 스캔 | https://worldking-t86b.vercel.app/halloween/scan |
| 코인 수령 | https://worldking-t86b.vercel.app/halloween/claim |
| 진입 QR 인쇄 | https://worldking-t86b.vercel.app/halloween/entry-qr |
| 관리자 | https://worldking-t86b.vercel.app/admin2 |

## 규칙 요약

- 물리 QR: **WK11~WK20** (기존 보물 11~20번)
- DB·기기 ID: 추석과 **완전 분리**
- 보상: 순서+퀴즈 10완주 **20코인** / 무순서 10개 **10코인** / 5개↑ 부분수령 / **하루 1회**
- 순서 포기 시: 퀴즈 중단, QR만 / x2 찬스 소멸
- 직원 확인 PIN: **1001** (`HALLOWEEN_STAFF_PIN` 또는 `CHUSEOK_STAFF_PIN`)
- 관리자 `/admin2`: 오픈형(링크 아는 사람만)

## 퀴즈 초안 (시드)

| # | 정답 | QR | 위치(추석과 동일, 관리자 수정) |
|---|------|-----|------|
| 1 | 호박 | WK11 | 레이스장 |
| 2 | 유령 | WK12 | 정수기 근처 구급함 |
| 3 | 박쥐 | WK13 | 화장실 앞 |
| 4 | 마녀 | WK14 | 공룡게임기 |
| 5 | 뱀파이어 | WK15 | 2층 이용안내 |
| 6 | 좀비 | WK16 | 119기둥 |
| 7 | 늑대인간 | WK17 | Toy창틀 |
| 8 | 미라 | WK18 | photo앞 |
| 9 | 해골 | WK19 | AI사진관 근처 |
| 10 | 프랑켄슈타인 | WK20 | 2층 엘레베이터 앞 |

## 개발 체크리스트

### 문서
- [x] plan2.md 작성

### DB·API
- [x] HalloweenStep / Progress / Scan / Claim migration
- [x] 10개 퀴즈 seed
- [x] GET `/api/halloween/me`
- [x] POST `/api/halloween/quiz`
- [x] POST `/api/halloween/scan`
- [x] POST `/api/halloween/claim`
- [x] GET/PUT `/api/halloween/admin/steps`

### UI
- [x] `/halloween` 홈·퀴즈·인트로
- [x] `/halloween/scan` + 순서 경고·무순서
- [x] `/halloween/claim` + 직원 PIN
- [x] `/halloween/gift` · `/complete` · `/entry-qr`
- [x] 할로윈 테마 (주황·보라·검정, 호박/박쥐/유령)

### 관리자
- [x] `/admin2` 퀴즈·위치 편집

### 배포
- [x] migrate + seed
- [x] 진입 QR PNG (`public/print/halloween-entry-qr.png`)
- [ ] Vercel prod 배포
