# shared/ui shadcn-ui 기반 전환 계획

## 목표

`web/src/app/shared/ui` 아래의 모든 atom/molecule 컴포넌트를 shadcn-ui 스타일의 primitive wrapper 구조로 정리한다. 기존 공개 props 인터페이스, export 경로, Storybook 사용 방식, Tailwind class 결과는 유지한다.

## 전제

- 대상 경로: `web/src/app/shared/ui`
- 기존 컴포넌트의 공개 API는 breaking change 없이 유지한다.
- 기존 Tailwind class 문자열과 시각 결과는 보존한다. shadcn 기본 스타일로 덮어쓰지 않는다.
- 새 컴포넌트 위치를 `components/ui`로 옮기지 않고 현재 `shared/ui` 경로를 유지한다.
- `cn`은 기존 `@/app/utils/style/helper`를 계속 사용한다.
- Storybook story는 컴포넌트 옆에 유지한다.

## 공통 작업 순서

1. 현재 shared UI의 공개 API 스냅샷을 만든다.
   - 각 컴포넌트의 exported name, default export, props interface, ref type을 기록한다.
   - story에서 사용하는 args와 render 구조를 기준으로 외부 사용 계약을 확인한다.

2. shadcn-ui primitive 기준을 정한다.
   - Button: shadcn `button` 패턴, `Slot`, `cva`, `VariantProps`.
   - TextInput: shadcn `input` primitive wrapper.
   - TextArea: shadcn `textarea` primitive wrapper.
   - Card: shadcn `card` primitive family.
   - Dialog: shadcn `dialog` primitive family over `@radix-ui/react-dialog`.
   - FormSelect: shadcn `select` 패턴을 참고하되, 기존 `FormSelect.Item` children API와 hidden native select 동작을 보존해야 하므로 Radix Select로 바로 교체하기 전에 호환 레이어를 둔다.

3. 컴포넌트별로 내부 구현만 정리한다.
   - props 이름과 타입은 유지한다.
   - className merge 순서는 기존 결과가 유지되도록 `base -> variant -> state -> consumer className` 순서를 명확히 한다.
   - ref 전달 동작은 기존과 동일하게 유지한다.

4. Storybook으로 회귀 확인한다.
   - 기존 story의 Default, 상태별 story가 변경 없이 동작해야 한다.
   - 필요한 경우 story를 추가하되 기존 story를 삭제하지 않는다.

5. 검증한다.
   - `npx tsc --noEmit`
   - Node 버전을 `20.19+` 또는 `22.12+`로 올린 뒤 `npm run build-storybook`
   - 가능하면 `npm run storybook`에서 주요 컴포넌트 시각 확인

## 컴포넌트별 계획

### `atom/button.tsx`

현재 상태:
- 이미 shadcn button 패턴에 가깝다.
- `Slot`, `cva`, `VariantProps`, `cn`을 사용한다.

유지할 API:
- default export `Button`
- named export `buttonVariants`
- `ButtonProps`
- props: `variant`, `type`, `size`, `radius`, `asChild`, `htmlType`, `disabled`, 기존 button HTML attributes
- `type` prop은 디자인 variant 의미로 유지하고, HTML button type은 `htmlType`으로 유지한다.

수정 방향:
- shadcn button primitive 구조와 displayName, `asChild` 처리 방식을 유지한다.
- React 19 방향에 맞춰 `ref` prop을 포함한 props 전달 구조를 우선한다.
- 기존 `buttonVariants`의 variant/type/size/radius 값과 compoundVariants class를 변경하지 않는다.
- disabled 상태 class override를 `buttonVariants`와 분리한 현재 동작 그대로 유지한다.
- `className`이 최종적으로 적용되어 기존 외부 커스터마이징이 깨지지 않게 한다.

검증 포인트:
- `Variants`, `Types`, `Sizes`, `Radius`, `Disabled`, `AsChildLink` story가 기존처럼 보인다.
- `htmlType`이 실제 `<button type>`에 들어간다.
- `asChild`일 때 `type`, `disabled`가 DOM에 잘못 전달되지 않는다.

### `atom/text-input.tsx`

현재 상태:
- label, icon, helper message까지 포함한 composite input이다.
- shadcn primitive `Input`으로 바로 대체하면 wrapper 구조가 사라지므로 내부 input 요소만 shadcn input primitive 기준으로 정리해야 한다.

유지할 API:
- default export `TextInput`
- `TextInputProps`
- props: `type`, `withIcon`, `status`, `helperMessages`, `disabled`, `label`, `onIconClick`, `onValueChange`, 기존 input HTML attributes
- status 값: `"default" | "error" | "success"`

수정 방향:
- 내부 `<input>`을 shadcn `Input` primitive 스타일로 정리한다.
- ref가 필요한 사용처는 React 19의 `ref` prop 호환 방식으로 유지한다.
- label, icon button, helper message wrapper는 기존 구조와 class를 유지한다.
- 기존 Tailwind class를 그대로 보존한다.
  - input base: `w-full rounded-3xl border text-text-03 p-1.5 resize-none focus:outline-none`
  - status border/focus class
  - number spinner 제거 class
  - icon padding class
  - disabled placeholder/text class
- 현재 `onChange`에서 `props.onChange`가 호출되지 않는 동작은 버그 가능성이 있으므로, 전환 시 보존 여부를 결정해야 한다. API 보존 원칙상 `onChange?.(e)`를 호출하는 방향이 맞지만, 동작 변화이므로 별도 체크 후 반영한다.

검증 포인트:
- label 색상이 status별로 유지된다.
- icon 위치와 `onIconClick` disabled 동작이 유지된다.
- `onValueChange`가 입력값을 전달한다.
- 기존 story의 type/status/disabled/helper message 표시가 유지된다.

### `atom/text-area.tsx`

현재 상태:
- auto resize 기능이 포함된 textarea primitive wrapper다.
- shadcn textarea 패턴에 auto resize 로직이 추가된 형태로 유지하면 된다.

유지할 API:
- default export `TextArea`
- `TextAreaProps`
- props: `autoResize`, `maxRows`, `onValueChange`, 기존 textarea HTML attributes
- ref type: `HTMLTextAreaElement`

수정 방향:
- shadcn `Textarea` primitive와 같은 props 전달 구조로 유지한다.
- ref merge 로직은 React 19의 `ref` prop 호환 방식으로 대체한다.
- auto resize 로직은 유지한다.
- 기존 Tailwind class를 그대로 유지한다.
  - `w-full flex-1 resize-none rounded-lg bg-transparent px-3 py-2 text-sm outline-none`
  - scrollbar hidden class
  - disabled/text color class
- ref 연결이 필요한 경우 기존 ref 동작을 유지한다.

검증 포인트:
- `autoResize=false`일 때 높이 자동 조절이 꺼진다.
- `maxRows` 이상으로 커지지 않는다.
- `onChange`와 `onValueChange`가 모두 호출된다.
- disabled 색상과 placeholder 색상이 유지된다.

### `molecule/card.tsx`

현재 상태:
- 이미 shadcn card family와 거의 동일한 구조다.
- class만 프로젝트 스타일로 일부 다르다.

유지할 API:
- named exports: `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`
- 각 컴포넌트의 HTML attribute props와 ref type

수정 방향:
- shadcn card primitive family 구조로 유지한다.
- 기존 class를 변경하지 않는다.
  - Card: `rounded-xl border border-slate-200 bg-white text-slate-950 shadow-lg`
  - Header: `flex flex-col space-y-1.5 p-6`
  - Title: `font-semibold leading-none tracking-tight`
  - Description: `text-sm text-slate-500`
  - Content: `p-6 pt-0`
  - Footer: `flex items-center p-6 pt-0`
- `CardTitle`의 element가 현재 `h3`인데 TypeScript generic은 `HTMLDivElement`로 되어 있다. shadcn 기준으로는 `HTMLHeadingElement`가 맞으므로 타입 수정 후보로 표시한다. 런타임 DOM은 변경하지 않는다.

검증 포인트:
- 기존 card stories가 시각적으로 동일하다.
- `className`으로 width, footer alignment 등 외부 class override가 유지된다.

### `molecule/dialog.tsx`

현재 상태:
- `@radix-ui/react-dialog`를 직접 감싼 구조다.
- shadcn dialog에 있는 Overlay, Content, Header, Footer, Title, Description, Close 분리 구조는 아직 없다.

유지할 API:
- named exports: `Dialog`, `DialogTrigger`, `DialogContent`
- `DialogContent` 추가 props: `title`, `description`, `titleClassName`, `descriptionClassName`
- 기존 `DialogContent` children 사용 방식

수정 방향:
- 내부적으로 shadcn dialog primitive family 구조로 확장한다.
  - `DialogOverlay`
  - `DialogContentPrimitive`
  - `DialogTitle`
  - `DialogDescription`
  - 필요 시 `DialogClose`
- 단, 외부 API는 기존 `DialogContent` 하나로 계속 동작하게 유지한다.
- 기존 Tailwind class를 유지한다.
  - Overlay: `fixed inset-0 bg-black/50`
  - Content: `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md`
  - Title: `text-lg text-center font-bold mb-2`
  - Description: `text-sm mb-4`
  - Close: `absolute top-4 right-4`
- shadcn 기본 animation class는 이번 전환에서는 추가하지 않는다. 기존 시각/동작 보존이 우선이다.
- title/description이 없을 때도 Radix 접근성 경고를 막기 위한 빈 Title/Description 유지 여부를 확인한다.

검증 포인트:
- `DialogTrigger`로 열고 닫힌다.
- controlled `open/onOpenChange` 사용이 유지된다.
- `titleClassName`, `descriptionClassName`, `className`이 기존처럼 적용된다.

### `molecule/ActionErrorDialog.tsx`

현재 상태:
- `Dialog`, `DialogContent`, `Button`을 조합한 도메인에 가까운 shared molecule이다.

유지할 API:
- default export `ActionErrorDialog`
- props: `open`, `message`, `onOpenChange`, `title`
- 기본 title: `요청을 처리할 수 없습니다.`
- 기본 description: `잠시 후 다시 시도해주세요.`

수정 방향:
- 직접 shadcn primitive를 사용하지 않고, 전환된 shared `DialogContent`와 `Button`을 계속 사용한다.
- class 유지:
  - `descriptionClassName="text-center text-sm text-slate-600"`
  - `className="flex flex-col gap-4"`
  - Button `className="w-full"`
- 컴포넌트 props interface export 여부를 검토한다. 현재는 내부 interface라 외부 import 계약은 없다.

검증 포인트:
- open 상태에서 title, message, fallback message가 정상 표시된다.
- 확인 버튼 클릭 시 `onOpenChange(false)`가 호출된다.

### `molecule/dropdown/form-select-root.tsx`

현재 상태:
- `@headlessui/react` Listbox 기반 커스텀 select다.
- native `<select>`를 opacity 0으로 유지해 form 제출, required, focus 흐름을 지원한다.
- `FormSelect.Item` children에서 value/placeholder를 읽어 표시한다.

유지할 API:
- named export `FormSelectRoot`
- `FormSelectProps`
- props: `placeholder`, `defaultValue`, `name`, `icon`, `error`, `errorMessages`, `disabled`, `children`, `required`, `onValueChange`, HTML attributes
- ref type: 현재 `HTMLInputElement`로 선언되어 있으나 실제 Listbox root에 전달되고 있다. 타입 정합성 개선 후보지만 breaking 가능성을 검토한다.

수정 방향:
- shadcn Select는 Radix Select 기반이지만, 기존 children API와 hidden native select 동작을 그대로 보존해야 하므로 단계적으로 접근한다.
- 1차 전환은 Headless UI 제거보다 shadcn 스타일 구조 정렬을 우선한다.
  - `SelectRoot`, `SelectTrigger`, `SelectContent`, `SelectItem`에 해당하는 내부 섹션을 명확히 분리한다.
  - 기존 Tailwind class는 그대로 유지한다.
- 2차 전환에서 Radix Select 도입을 검토한다.
  - Radix Select로 바꿀 경우 hidden native select의 `required`, `name`, `id`, browser validation 동작을 별도 테스트해야 한다.
  - `FormSelect.Item` children 파싱 방식은 유지하거나 options normalization helper를 둔다.
- `twMerge`와 `cn` 중 하나로 통일한다면 repo 기준 `cn`을 우선하지만, class 결과가 달라지지 않는지 확인한다.

검증 포인트:
- `defaultValue`가 표시 텍스트에 반영된다.
- 선택 시 `selectedValue`, hidden select value, `onValueChange`가 모두 갱신된다.
- `name`, `required`, `id`, `disabled`가 hidden select에 유지된다.
- icon이 있을 때 `pl-10`, 없을 때 `pl-3`이 유지된다.
- dropdown 위치, max height, divide, shadow가 유지된다.
- error message가 기존 class로 표시된다.

### `molecule/dropdown/form-select-item.tsx`

현재 상태:
- Headless UI `Listbox.Option`을 감싼 item이다.

유지할 API:
- named export `FormSelectItem`
- props: `value`, `placeholder`, `onSelect`

수정 방향:
- 1차 전환에서는 `FormSelectRoot`와 맞춰 item wrapper 역할을 유지한다.
- 기존 Tailwind class를 유지한다.
  - `flex cursor-default items-center justify-start px-2.5 py-2.5 text-base`
  - `text-gray-700 ui-selected:bg-gray-200 hover:bg-gray-100`
  - label span: `truncate whitespace-nowrap`
- Radix Select로 2차 전환 시에도 `placeholder` prop 이름은 유지하고 내부에서 children/text로 매핑한다.

검증 포인트:
- 클릭 시 `onSelect`가 호출된다.
- 선택 상태 background와 hover background가 유지된다.
- 긴 텍스트가 truncate된다.

### `molecule/dropdown/form-select-index.tsx`

현재 상태:
- `Object.assign(FormSelectRoot, { Item: FormSelectItem })`로 compound component API를 제공한다.

유지할 API:
- default export `FormSelect`
- `FormSelect.Item`

수정 방향:
- compound component API를 그대로 유지한다.
- formatting만 정리한다.
- 필요하면 타입을 보강해서 `FormSelect.Item` 자동완성을 개선한다. 단, 외부 import 방식은 변경하지 않는다.

검증 포인트:
- story의 `<FormSelect><FormSelect.Item /></FormSelect>`가 변경 없이 컴파일된다.

## 의존성 계획

현재 사용 중:
- `@radix-ui/react-slot`: Button에 필요
- `@radix-ui/react-dialog`: Dialog에 필요
- `class-variance-authority`: Button variants에 필요
- `tailwind-merge`, `clsx`: 기존 `cn` 및 일부 dropdown에 필요
- `@headlessui/react`: 현재 FormSelect에 필요

전환 후 검토:
- FormSelect를 Radix Select로 완전히 전환하려면 `@radix-ui/react-select` 추가가 필요하다.
- Radix Select 전환 완료 전에는 `@headlessui/react`를 제거하지 않는다.
- shadcn CLI 자체는 런타임 의존성이 아니므로 package에 추가하지 않는다.

## 작업 순서 제안

1. `card.tsx`, `button.tsx`를 먼저 정리한다.
   - 이미 shadcn 구조에 가까워 리스크가 낮다.

2. `text-area.tsx`, `text-input.tsx`를 정리한다.
   - props와 class 보존 위주로 내부 primitive 구조만 다듬는다.
   - `TextInput`의 `onChange` 호출 누락 여부를 별도 확인한다.

3. `dialog.tsx`, `ActionErrorDialog.tsx`를 정리한다.
   - Radix primitive family를 shadcn 구조로 확장하되 기존 `DialogContent` API를 보존한다.

4. `form-select-*`를 마지막에 진행한다.
   - 기존 Headless UI 기반을 유지한 shadcn식 구조 정리부터 한다.
   - 별도 PR 또는 후속 작업으로 Radix Select 완전 전환을 검토한다.

## 완료 기준

- `web/src/app/shared/ui`의 모든 컴포넌트가 shadcn-ui primitive wrapper 패턴을 따른다.
- 기존 props interface, default/named exports, compound API가 유지된다.
- 기존 Storybook story가 수정 없이 통과하거나, API 변경 없이 보강만 된다.
- 기존 Tailwind class와 상태별 시각 결과가 보존된다.
- `npx tsc --noEmit`이 통과한다.
- Node 업그레이드 후 `npm run build-storybook`이 통과한다.
