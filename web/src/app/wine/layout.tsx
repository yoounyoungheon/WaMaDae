import type { ReactNode } from "react";
import { WineListSelectionProvider } from "@/app/feature/wine-list-select/model/wine-list-selection-provider";

/**
 * 와인 추천 다단계 플로우(`/wine/*`) 세그먼트 layout.
 *
 * 선택 draft store(세션 ID + 선택 wine ID)를 전역 Providers가 아니라 이 layout에서 제공한다.
 * App Router는 같은 layout을 공유하는 형제 페이지 이동 시 layout 인스턴스를 유지하므로
 * 단계 간 선택값이 보존된다. 플로우를 벗어나면 layout이 언마운트되며 draft가 초기화된다.
 *
 * 페이지 이동/리로드 handoff는 이 store가 아니라 versioned sessionStorage snapshot이
 * 담당한다(`entity/wine-pairing-workflow`). 서버 응답(추출/추천 결과)은 store에 복제하지 않는다.
 */
export default function WineFlowLayout({ children }: { children: ReactNode }) {
  return <WineListSelectionProvider>{children}</WineListSelectionProvider>;
}
