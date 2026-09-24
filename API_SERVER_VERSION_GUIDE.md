# 버전별 API 서버 사용 가이드

이 문서는 mysom 웹(`web/`)이 붙는 **API 서버의 버전(브랜치)별 차이**와, 각 버전을 로컬에서
띄우고 웹과 연결하는 방법을 정리한다.

> 핵심 요약
> - **엔드포인트·URL·요청(Request) 스펙은 모든 버전이 동일**하다. 달라지는 것은 **응답(Response) 스키마**뿐이다.
> - 웹 프론트는 zod `.catch()`로 응답을 방어하므로, 필드가 빠져도 크래시 없이 기본값으로 처리한다.
> - 화면에 "몇 개가 보이는가"는 **API 서버 버전 × 웹 BFF의 `WINE_EXCLUDE_CATALOG` 설정** 조합으로 결정된다. (하단 매트릭스 참고)

---

## 1. API 서버 버전(브랜치) 개요

| 브랜치 | 성격 | AI 해석기 | 카탈로그 매칭 | 로컬 프로젝트 경로 |
|--------|------|-----------|:---:|--------------------|
| **feature/wine-sample** | OCR + 와인 DB(카탈로그) 매칭 | Vertex AI (Gemini) | ✅ | `/Users/yoon-yeongheon/dev/mysom-demo/mysom-api-demo` |
| **dev** | OCR 전용 | Vertex AI (Gemini) | ❌ | `/Users/yoon-yeongheon/dev/mysom-api` |
| **refact/wine-pairing** | OCR 전용 | **OpenAI** | ❌ | (브랜치 체크아웃 필요) |
| **feat_yh** | OCR 전용, 패키지 구조 상이 (`com.mysom.feature.*`) | - | ❌ | (브랜치 체크아웃 필요) |
| main | 초기 스캐폴드(설정만) | - | - | 실행 대상 아님 |

- **카탈로그 매칭**은 `feature/wine-sample`에만 있는 기능이다. 추출된 OCR 와인명을 내부 와인 DB와
  대조해, 매칭되면 한글명·와인병 이미지·바디/타닌 등 메타데이터로 보강(치환)한다.
- 나머지 버전은 **순수 OCR 추출 결과**만 반환한다.

---

## 2. 공통 API 계약 (모든 버전 동일)

- **Base URL**: 웹은 `http://localhost:8080`으로 호출한다.
  - 위치: `web/src/app/utils/http/api-query.ts` → `MYSOM_API_BASE_URL = "http://localhost:8080"`
- **주요 엔드포인트** (`/v1/wine-pairings` 프리픽스):
  - `POST /v1/wine-pairings/extract-wine-menu` — 와인 메뉴 이미지 OCR 추출 (multipart, 헤더 `X-Session-Id`)
  - `POST /v1/wine-pairings/recommend-menu` — 메뉴 카테고리 추천
  - `POST /v1/wine-pairings/pairing` — 페어링
  - `POST /v1/wine-pairings/chat` — 채팅
- 엔드포인트 경로, HTTP 메서드, `X-Session-Id` 헤더, 요청 형식은 **버전 간 차이가 없다.**

---

## 3. 버전별 응답 차이 (Response 스키마)

`feature/wine-sample`이 기준(최신)이며, **OCR 전용 버전(dev 등)에서는 아래 3가지가 달라진다.**
공용 `Wine` 모델과 이를 상속하는 추출 응답(`ExtractedWine`)·페어링 스트림 응답(`PairingWine`)에 걸쳐 있다.

| 필드 | feature/wine-sample | dev · refact (OCR 전용) | 웹 프론트 처리 |
|------|---------------------|--------------------------|----------------|
| `alcohol` | 문자열 `String` (예: `"12.5% ~ 13.0%"`) | **숫자** `BigDecimal` (예: `13.5`) | 웹 스키마는 `string` 기대 → 숫자가 오면 `.catch(null)`로 **null 처리** |
| `wineBottleImageUrl` | 있음 (URL) | **없음** | `.catch(null)` → null. 이미지 없으면 기본 placeholder 사용 (`entity/wine/lib/wine-image.ts`) |
| `isCatalogMatched` | 있음 (필수, boolean) | **없음** | `.catch(false)` → **항상 false**로 처리 |

- 웹의 검증 스키마: `web/src/app/entity/wine/model/wine.schema.ts` (모든 필드 `.catch()`로 방어)
- 결론: **OCR 전용 서버를 붙여도 프론트는 깨지지 않는다.** 다만 `alcohol`은 null로 보이고,
  와인병 이미지는 placeholder, `isCatalogMatched`는 false로 동작한다.

---

## 4. ⚠️ 웹 BFF의 `WINE_EXCLUDE_CATALOG` (가장 중요)

웹은 백엔드를 직접 호출하지 않고 **같은 오리진의 BFF Route Handler**를 통해 프록시한다:
`web/src/app/api/wine-pairings/extract-wine-menu/route.ts`

이 BFF에는 카탈로그 매칭 와인을 걸러내는 로직이 있다:

```ts
// WINE_EXCLUDE_CATALOG=false 가 아니면 카탈로그 매칭 항목(isCatalogMatched)을 제외하고
// 순수 OCR 추출 항목만 내려준다.
const excludeCatalog = process.env.WINE_EXCLUDE_CATALOG !== "false";
const wines = excludeCatalog
  ? parsed.data.wines.filter((wine) => !wine.isCatalogMatched)
  : parsed.data.wines;
```

- **기본값(환경변수 미설정) = `excludeCatalog = true`** → **카탈로그 매칭된 와인을 화면에서 숨긴다.**
- 즉 `feature/wine-sample` 서버(매칭 O) + 기본 BFF 설정이면, 매칭된 와인이 필터링되어
  **입력 사진의 와인 수보다 적게 보일 수 있다.**
  - 예) 8개 추출 → 매칭 6 + 미매칭 4 → BFF가 매칭 6개 제외 → **화면엔 4개만 표시.**
- 카탈로그 매칭 결과까지 모두 보려면: **`WINE_EXCLUDE_CATALOG=false`** 로 설정.

---

## 5. 버전 × BFF 설정 → 화면 결과 매트릭스

| API 서버 버전 | `WINE_EXCLUDE_CATALOG` | 화면에 보이는 와인 |
|---------------|------------------------|--------------------|
| dev / refact (OCR 전용) | (아무값) | **추출된 전체** (모두 `isCatalogMatched=false`라 필터 영향 없음) |
| feature/wine-sample | 미설정 또는 `true` | **미매칭 항목만** (매칭된 와인은 숨겨짐) |
| feature/wine-sample | `false` | **전체** (OCR + 카탈로그 매칭/보강 포함) |

> "사진엔 와인이 N개인데 화면엔 더 적게 나온다"는 대부분 **feature 서버 + 기본 BFF(카탈로그 제외)** 조합 때문이다.

---

## 6. 각 버전 API 서버 실행 방법

모든 버전은 기본적으로 **8080 포트**를 사용하므로, **한 번에 하나의 백엔드만** 띄운다.
로컬 PostgreSQL은 도커 컨테이너(`mysom-api-demo-db-1`, `localhost:5432`)를 공유한다.

### 실행 전 공통
- 각 백엔드 프로젝트 루트의 `.env`가 필요하다 (`ACTIVE_PROFILE=local`, GCP 자격증명 등).
- GCP 인증은 ADC(Application Default Credentials) 사용.

### feature/wine-sample (카탈로그 매칭)
```bash
cd /Users/yoon-yeongheon/dev/mysom-demo/mysom-api-demo
set -a; . ./.env; set +a
./gradlew :apps:mysomm-api-app:bootRun
```
- DB: `mysomm` (Flyway `V1` + `V2__add_wine_catalog`). 와인 카탈로그 테이블 사용.

### dev (OCR 전용)
```bash
cd /Users/yoon-yeongheon/dev/mysom-api
set -a; . ./.env; set +a
# feature와 같은 DB(mysomm)를 쓰면 Flyway 충돌(V2 missing)이 나므로 별도 DB 사용 권장
export SPRING_R2DBC_URL="r2dbc:postgresql://localhost:5432/mysomm_dev"
export SPRING_R2DBC_NAME="mysomm_dev"
export SPRING_FLYWAY_URL="jdbc:postgresql://localhost:5432/mysomm_dev"
./gradlew :apps:mysomm-api-app:bootRun
```
- dev 브랜치는 마이그레이션이 `V1`만 있다. 현재 `mysomm` DB엔 feature의 `V2`가 적용돼 있어
  그대로 붙이면 Flyway가 "missing migration"으로 기동 실패한다.
- 위처럼 **별도 DB(`mysomm_dev`)** 를 만들어 연결하면 feature의 DB를 건드리지 않는다.
  - 최초 1회: `docker exec -e PGPASSWORD=mypassword mysom-api-demo-db-1 psql -U myuser -d mysomm -c "CREATE DATABASE mysomm_dev OWNER myuser;"`

### refact/wine-pairing (OCR 전용, OpenAI 해석기) / feat_yh
- 해당 브랜치를 체크아웃한 뒤 위 dev와 동일한 방식으로 실행한다.
- `refact/wine-pairing`은 해석기가 **OpenAI** 기반이므로 `.env`에 `OPENAI_API_KEY`가 필요하다.

---

## 7. 웹을 특정 버전 서버에 연결하기

1. **백엔드 선택**: 원하는 버전 서버를 8080에 띄운다 (§6).
2. **BFF 카탈로그 정책 선택** (웹 `.env` 또는 실행 환경):
   - 순수 OCR 결과만: `WINE_EXCLUDE_CATALOG` 미설정 (기본, 카탈로그 매칭 항목 제외)
   - 카탈로그 매칭까지 전부: `WINE_EXCLUDE_CATALOG=false`
3. **웹 실행**:
   ```bash
   cd /Users/yoon-yeongheon/dev/mysom-demo/mysom-web-demo/web
   # 예: 카탈로그 매칭 결과까지 모두 보기
   WINE_EXCLUDE_CATALOG=false npm run dev
   ```
- 백엔드 주소를 바꾸려면 `web/src/app/utils/http/api-query.ts`의 `MYSOM_API_BASE_URL`을 수정한다.
  (기본 `http://localhost:8080` 이므로, 보통은 원하는 버전을 8080에 띄우는 것으로 충분하다.)

---

## 8. 권장 조합

| 목적 | API 서버 | BFF 설정 |
|------|----------|----------|
| 순수 OCR 추출 결과 확인 | dev (또는 refact) | 기본 |
| OCR + 카탈로그 매칭(보강)까지 확인 | feature/wine-sample | `WINE_EXCLUDE_CATALOG=false` |
| feature 서버로 "OCR만" 보고 싶을 때 | feature/wine-sample | 기본 (매칭 항목 자동 제외) |

---

## 참고: 관련 파일 위치

- 웹 백엔드 Base URL: `web/src/app/utils/http/api-query.ts`
- 추출 BFF (카탈로그 필터): `web/src/app/api/wine-pairings/extract-wine-menu/route.ts`
- 와인 응답 타입: `web/src/app/entity/wine/model/wine.type.ts`
- 와인 응답 검증 스키마: `web/src/app/entity/wine/model/wine.schema.ts`
- 와인병 이미지 폴백: `web/src/app/entity/wine/lib/wine-image.ts`
