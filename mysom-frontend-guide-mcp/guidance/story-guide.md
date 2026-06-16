# Story Guide

이 문서는 현재 Storybook 설정인 `web/.storybook/main.ts`와 `web/src/**/*.stories.@(js|jsx|mjs|ts|tsx)` 파일 패턴을 기준으로 정리한 스토리 작성 가이드다.

## 재사용 컴포넌트 스토리 작성 규칙

- 재사용 컴포넌트 스토리는 `@storybook/nextjs-vite` 기반으로 작성한다.
- `Meta`와 `StoryObj` 타입은 `@storybook/nextjs-vite`에서 import한다.
- `title`은 `Components/<ComponentName>` 형식을 사용한다.
- `component`에는 실제 재사용 컴포넌트를 직접 연결한다.
- `tags`는 `["autodocs"]`를 기본값으로 둔다.
- `parameters.layout`은 특별한 이유가 없으면 `"centered"`를 사용한다.
- `Meta<typeof Component>`와 `StoryObj<typeof Component>` 패턴을 사용한다.
- `argTypes`는 재사용 컴포넌트의 공개 props를 직접 설명하는 용도로 작성한다.
- 선택 가능한 variant, size, type 같은 props는 `select` control을 우선 사용한다.
- 문자열, boolean, `className`은 `text`, `boolean` control을 사용한다.
- 이벤트 핸들러는 `action`으로 노출한다.
- React component, icon component처럼 control에 적합하지 않은 값은 `control: false`로 둔다.
- `args`에는 컴포넌트 API를 이해할 수 있는 기본값을 제공한다.
- `Default` 스토리는 반드시 포함한다.
- 재사용 컴포넌트 스토리는 도메인 시나리오보다 컴포넌트 API 조합을 보여주는 데 집중한다.
- `Variants`, `Types`, `Sizes`, `Disabled`, `WithIcon`처럼 prop 차이를 직접 비교하는 스토리를 우선 작성한다.
- 여러 상태를 한 번에 비교할 필요가 있으면 `render`에서 동일 컴포넌트를 반복 배치해 차이를 보여준다.
- 비교용 배치는 간단한 `div` wrapper와 최소한의 `style` 또는 class만 사용한다.
- 스토리 안에서 컴포넌트 사용 예시를 보여주되, feature 문맥을 과도하게 섞지 않는다.
- 재사용 컴포넌트의 합성 방식을 보여줘야 하면 하위 primitive를 함께 배치해 구조를 설명할 수 있다.

## 도메인 컴포넌트 스토리 작성 규칙

- 도메인 컴포넌트 스토리는 `@storybook/nextjs-vite` 기반으로 작성한다.
- `Meta`와 `StoryObj` 타입은 `@storybook/nextjs-vite`에서 import한다.
- `title`은 `Feature/<feature-name>/<ComponentName>` 형식을 사용한다.
- `component`에는 feature 또는 page 레이어의 도메인 컴포넌트를 연결한다.
- `tags`는 `["autodocs"]`를 기본값으로 둔다.
- `parameters.layout`은 특별한 이유가 없으면 `"centered"`를 사용한다.
- `Meta<typeof Component>`와 `StoryObj<typeof Component>` 패턴을 사용한다.
- `args`에는 실제 사용에 가까운 도메인 데이터를 넣는다.
- 배열, 객체, 도메인 엔티티는 `control: "object"`를 우선 사용한다.
- 문자열 기반 도메인 입력은 `control: "text"`를 사용하고, 설명은 feature 관점으로 작성한다.
- 이미지 객체나 실행 불가능한 값은 `control: false`로 둔다.
- `Default` 스토리는 반드시 포함한다.
- 도메인 컴포넌트 스토리는 디자인 시스템 API 설명보다 실제 사용자 화면에서의 사용 맥락을 보여주는 데 집중한다.
- `LongTitle`, `ShortReview`, `Empty`, `Selected`처럼 사용자에게 중요한 상태 변형을 추가한다.
- 상태 차이가 `args`만으로 표현 가능하면 기존 `render`를 재사용한다.
- `render`에서는 실제 사용 환경과 비슷한 폭, 높이, 패딩 문맥을 재현하는 최소 wrapper를 둔다.
- wrapper는 `w-[360px] max-w-full`, `h-[640px] w-[390px]`처럼 컴포넌트가 놓일 화면 조건을 보여주는 용도로만 사용한다.
- wrapper는 데모용 문맥만 제공하고, 컴포넌트 책임을 대체하지 않는다.
- 도메인 컴포넌트 공개 API와 데이터 의미가 드러나도록 `argTypes.description`을 작성한다.
- 재사용 컴포넌트의 내부 props를 그대로 나열하기보다, feature 데이터와 사용자 상태 중심으로 스토리를 구성한다.
