# CSS-Only State Pattern

## 목적

이 문서는 `radio + label + peer-checked` 조합을 활용해  
JavaScript 없이 컴포넌트 상태를 표현하는 방법을 정리한다.

적용 대상 예시:

- 토글 카드
- 선택형 필터
- 탭 전환
- 아코디언
- 선택된 항목의 상세 패널
- 버튼 클릭으로 열리는 설명 카드

---

## 핵심 아이디어

브라우저 기본 입력 요소의 상태를 활용한다.

- `input[type="radio"]`: 단일 선택 상태
- `input[type="checkbox"]`: on/off 상태
- `label`: 입력 상태를 변경하는 트리거
- `peer`, `peer-checked`, `group`, `has-*` 같은 CSS selector: 상태에 따른 UI 변경

즉, 상태 저장은 React state가 아니라  
브라우저 폼 상태가 맡고,  
표현은 CSS가 맡는다.

---

## 언제 쓰는가

다음 조건이면 CSS-only 상태 패턴이 유효하다.

- 상태가 단순하다
- 선택/열림/닫힘 정도면 충분하다
- 복잡한 비동기 처리나 계산이 없다
- 클라이언트 상태 훅을 늘리고 싶지 않다
- Server Component를 유지하고 싶다

다음 조건이면 CSS-only보다 Client Component가 낫다.

- 상태에 따라 데이터 fetch가 필요하다
- 여러 상태가 서로 복잡하게 연결된다
- 키보드 인터랙션을 세밀하게 제어해야 한다
- 애니메이션 타이밍이나 로직 분기가 복잡하다
- 상태를 URL, analytics, 외부 store와 동기화해야 한다

---

## 기본 구성

가장 기본적인 구조는 아래 네 요소다.

1. 숨겨진 입력 요소
2. 입력을 제어하는 `label`
3. 입력 상태를 기준으로 모양이 바뀌는 트리거
4. 입력 상태를 기준으로 나타나는 패널

예시:

```tsx
<div className="relative">
  <input id="item-a" type="radio" name="example" className="peer sr-only" />

  <label
    htmlFor="item-a"
    className="inline-flex cursor-pointer rounded-full bg-slate-200 px-4 py-2"
  >
    항목 A
  </label>

  <div
    className="
      pointer-events-none absolute left-0 top-full mt-2 w-56
      rounded-xl border border-slate-200 bg-white p-4 shadow-lg
      opacity-0 transition
      peer-checked:pointer-events-auto
      peer-checked:opacity-100
    "
  >
    상세 설명
  </div>
</div>
```

여기서 핵심은 `input`이 `peer`가 되고,  
뒤에 오는 요소들이 `peer-checked:*` 클래스로 상태를 읽는다는 점이다.

---

## radio 패턴

`radio`는 여러 항목 중 하나만 선택되어야 할 때 쓴다.

적합한 예시:

- 탭
- 카테고리 선택
- 하나의 카드만 열리는 상세 뷰
- 버튼 그룹 중 하나만 활성화되는 UI

패턴:

```tsx
<input id="tab-1" type="radio" name="tab" className="peer sr-only" />
<label htmlFor="tab-1">Tab 1</label>
<div className="hidden peer-checked:block">콘텐츠 1</div>
```

주의할 점:

- 같은 그룹은 반드시 같은 `name`을 가져야 한다
- `id`는 고유해야 한다
- 초기 상태가 필요하면 하나에 `defaultChecked`를 둔다

---

## checkbox 패턴

`checkbox`는 독립적인 on/off 상태에 적합하다.

적합한 예시:

- 아코디언 열기/닫기
- 필터 토글
- 상세 정보 펼치기
- 모달 비슷한 패널 열기/닫기

패턴:

```tsx
<input id="open" type="checkbox" className="peer sr-only" />
<label htmlFor="open">열기</label>
<div className="max-h-0 overflow-hidden peer-checked:max-h-40">
  내용
</div>
```

---

## 닫기 동작 만들기

CSS-only UI는 닫기 버튼도 입력 상태를 다시 바꾸는 방식으로 만든다.

### radio에서 닫기

보통 “비어 있는 상태”용 radio를 하나 둔다.

```tsx
<input
  id="empty"
  type="radio"
  name="panel"
  className="sr-only"
  defaultChecked
/>

<input id="item-a" type="radio" name="panel" className="peer sr-only" />

<label htmlFor="item-a">열기</label>
<label htmlFor="empty">닫기</label>
```

이렇게 하면 특정 항목을 선택했다가  
`empty`를 다시 선택하면서 닫을 수 있다.

### checkbox에서 닫기

같은 `label`을 다시 클릭하게 만들면 된다.

---

## 위치 겹침 패널 만들기

버튼 옆이나 아래에 겹치는 카드를 띄우려면 wrapper를 `relative`로 두고,  
패널을 `absolute`로 배치한다.

예시:

```tsx
<div className="relative">
  <input id="item-a" type="radio" name="item" className="peer sr-only" />
  <label htmlFor="item-a">버튼</label>

  <div
    className="
      absolute bottom-0 right-full mr-4 w-64
      opacity-0 translate-y-2
      peer-checked:opacity-100
      peer-checked:translate-y-0
    "
  >
    카드
  </div>
</div>
```

자주 쓰는 위치 조합:

- `top-full mt-2`: 아래로 펼침
- `bottom-full mb-2`: 위로 펼침
- `right-full mr-3`: 왼쪽에 겹침
- `left-full ml-3`: 오른쪽에 겹침

---

## 스타일링 포인트

CSS-only 상태 UI는 아래 네 가지를 같이 설계해야 한다.

### 1. 보이기 / 숨기기

- `hidden/block`
- `opacity-0 / opacity-100`
- `invisible / visible`
- `pointer-events-none / pointer-events-auto`

실무에서는 `opacity + pointer-events` 조합이 가장 안정적이다.

### 2. 움직임

- `translate-y-1`
- `scale-95`
- `transition-all`
- `duration-150`, `duration-200`

### 3. 레이어

- `relative`
- `absolute`
- `z-10`, `z-20`

### 4. 선택 상태 강조

트리거 자체에도 `peer-checked:*` 스타일을 줄 수 있다.

```tsx
<label
  htmlFor="item-a"
  className="
    rounded-full border border-slate-200 px-4 py-2
    peer-checked:border-slate-900
    peer-checked:bg-slate-900
    peer-checked:text-white
  "
>
  선택
</label>
```

---

## 접근성 고려사항

CSS-only라고 해서 접근성을 무시하면 안 된다.

기본 원칙:

- `input`과 `label`은 반드시 연결한다
- `id`와 `htmlFor`를 정확히 맞춘다
- 숨김 처리에는 `sr-only`를 우선 고려한다
- 카드나 패널의 의미가 중요하면 적절한 시맨틱 요소를 사용한다

주의할 점:

- 진짜 모달 수준의 상호작용은 CSS-only로 충분하지 않다
- 포커스 트랩, ESC 닫기, aria-expanded 제어가 필요하면 Client Component가 낫다

즉, CSS-only 패턴은 “간단한 선택 상태 UI”에 적합하지,  
완전한 dialog 대체재는 아니다.

---

## Server Component와 잘 맞는 이유

이 패턴은 브라우저 기본 상태와 CSS selector만 쓰므로  
React state나 effect가 없다.

따라서 다음 장점이 있다.

- Server Component 유지 가능
- 클라이언트 번들 증가를 줄일 수 있음
- 단순한 상호작용을 위해 `"use client"`를 넓게 쓰지 않아도 됨

즉, “상태는 있지만 JavaScript 로직은 거의 없는 UI”에 적합하다.

---

## 설계 체크리스트

새 컴포넌트에 이 패턴을 적용할 때는 아래를 먼저 확인한다.

- 단일 선택인가, 다중 선택인가
- 닫기 상태가 필요한가
- 패널 위치는 어디인가
- 모바일에서도 의미 있는가
- 접근성 요구 수준이 어느 정도인가
- 진짜 모달/탭/아코디언 수준인지, 단순 상태 표현인지

추천 판단:

- 하나만 열려야 하면 `radio`
- 독립적으로 켜고 끄면 `checkbox`
- 단순 강조/토글이면 CSS-only 우선 검토
- 로직이 조금만 복잡해져도 Client Component로 전환

---

## 요약

`radio + label + peer-checked` 조합은  
JavaScript 없이도 “선택 상태”를 가진 UI를 만들 수 있는 실용적인 패턴이다.

핵심은 다음이다.

- 상태 저장은 `input`
- 상태 변경은 `label`
- 상태 표현은 `peer-checked`
- 위치 제어는 `relative/absolute`

이 방식은 Server Component를 유지하면서도  
작은 상호작용을 넣고 싶을 때 특히 유용하다.
