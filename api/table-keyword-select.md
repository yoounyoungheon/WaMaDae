# 테이블 키워드 조회 API

## 공통

- Base path: `/api`
- 인증: 없음
- 성공 응답: `application/json`
- 오류 응답:

```json
{
  "message": "오류 메시지"
}
```

## DTO

### `TableKeywordDto`

```ts
type TableKeywordDto = {
  id: string;
  name: string;
  emojiPath: string;
  display_order: number;
};
```

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `string` | 키워드를 식별하는 고유하고 변경되지 않는 값 |
| `name` | `string` | 키워드 표시명 |
| `emojiPath` | `string` | 키워드를 나타내는 이모지 이미지 경로 |
| `display_order` | `number` | 오름차순 정렬에 사용하는 순서 값 |

## 테이블 키워드 목록 조회

### Endpoint

```http
GET /api/table-keywords
```

### Request parameters

없음.

### 성공 응답

Status: `200 OK`

```json
{
  "keywords": [
    {
      "id": "meat",
      "name": "고기",
      "emojiPath": "/images/table-keywords/meat.svg",
      "display_order": 1
    },
    {
      "id": "pizza",
      "name": "피자",
      "emojiPath": "/images/table-keywords/pizza.svg",
      "display_order": 2
    },
    {
      "id": "cheese",
      "name": "치즈",
      "emojiPath": "/images/table-keywords/cheese.svg",
      "display_order": 3
    },
    {
      "id": "pasta",
      "name": "파스타",
      "emojiPath": "/images/table-keywords/pasta.svg",
      "display_order": 4
    },
    {
      "id": "salad",
      "name": "샐러드",
      "emojiPath": "/images/table-keywords/salad.svg",
      "display_order": 5
    },
    {
      "id": "sushi",
      "name": "회/초밥",
      "emojiPath": "/images/table-keywords/sushi.svg",
      "display_order": 6
    },
    {
      "id": "noodles",
      "name": "면 요리",
      "emojiPath": "/images/table-keywords/noodles.svg",
      "display_order": 7
    },
    {
      "id": "stew-soup",
      "name": "찌개/국",
      "emojiPath": "/images/table-keywords/stew-soup.svg",
      "display_order": 8
    },
    {
      "id": "dessert",
      "name": "디저트",
      "emojiPath": "/images/table-keywords/dessert.svg",
      "display_order": 9
    },
    {
      "id": "burger",
      "name": "햄버거",
      "emojiPath": "/images/table-keywords/burger.svg",
      "display_order": 10
    },
    {
      "id": "seafood",
      "name": "해산물",
      "emojiPath": "/images/table-keywords/seafood.svg",
      "display_order": 11
    }
  ]
}
```

```ts
type GetTableKeywordsResponse = {
  keywords: TableKeywordDto[];
};
```

응답의 `keywords`는 `display_order` 오름차순으로 정렬한다.

키워드가 없으면 다음 응답을 반환한다.

```json
{
  "keywords": []
}
```

### 오류 응답

| Status | 조건 | 메시지 |
| --- | --- | --- |
| `500 Internal Server Error` | 키워드 목록을 조회하지 못함 | `테이블 키워드를 불러오지 못했습니다.` |
