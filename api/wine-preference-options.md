# 와인 추천 선택 옵션 조회 API

## Endpoint

```http
GET /api/wine-preference-options
```

## Request

요청 파라미터와 요청 본문은 없다.

## Response DTO

```ts
type PreferenceOptionDto = {
  label: string;
  value: string;
  iconPath?: string;
};

type PairingFoodCategoryDto = {
  label: string;
  value: string;
  options: PreferenceOptionDto[];
};

type GetWinePreferenceOptionsResponseDto = {
  data: {
    mood: PreferenceOptionDto[];
    alcohol: PreferenceOptionDto[];
    pairingFood: PairingFoodCategoryDto[];
  };
};
```

## 성공 응답

Status: `200 OK`

```json
{
  "data": {
    "mood": [
      {
        "label": "설레는",
        "value": "excited",
        "iconPath": "/images/wine-preferences/excited.svg"
      }
    ],
    "alcohol": [
      {
        "label": "낮음 (8–11%)",
        "value": "low"
      }
    ],
    "pairingFood": [
      {
        "label": "육류",
        "value": "meat",
        "options": [
          {
            "label": "소고기 스테이크",
            "value": "beefSteak"
          }
        ]
      }
    ]
  }
}
```

## 필드 설명

### `PreferenceOptionDto`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `label` | `string` | 화면에 표시하는 선택지 이름 |
| `value` | `string` | 선택지 식별 및 요청 전송에 사용하는 값 |
| `iconPath` | `string \| undefined` | 선택지 label 앞에 표시할 선택적 아이콘 경로 |

### `PairingFoodCategoryDto`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `label` | `string` | 화면에 표시하는 음식 카테고리 이름 |
| `value` | `string` | 음식 카테고리를 식별하는 값 |
| `options` | `PreferenceOptionDto[]` | 카테고리에 포함된 음식 선택지 |

### `GetWinePreferenceOptionsResponseDto.data`

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `mood` | `PreferenceOptionDto[]` | 오늘의 기분 선택지 |
| `alcohol` | `PreferenceOptionDto[]` | 도수 선택지 |
| `pairingFood` | `PairingFoodCategoryDto[]` | 페어링 음식 카테고리와 선택지 |
