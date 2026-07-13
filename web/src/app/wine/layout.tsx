import type { ReactNode } from "react";
import { WineListSelectionProvider } from "@/app/feature/wine-list-select/model/wine-list-selection-provider";

/**
 * 와인 추천 다단계 플로우(`/wine/*`) 세그먼트 layout.
 *
 * 선택 draft store를 전역 Providers가 아니라 이 layout에서 제공한다.
 * App Router는 같은 layout을 공유하는 형제 페이지(`/wine/list` ↔ `/wine/keywords`)
 * 이동 시 layout 인스턴스를 유지하므로, 단계 간 선택값이 보존된다.
 * 플로우를 벗어나면 layout이 언마운트되며 draft가 자연스럽게 초기화된다.
 *
 * `/wine/keywords`는 추천 작업 ID(URL searchParams)를 source of truth로 사용하므로
 * 별도 선택 draft store가 필요하지 않다. 새로운 단계가 draft를 공유해야 하면
 * 전역 Providers 대신 이 파일에 Provider를 더한다.
 */
export default function WineFlowLayout({ children }: { children: ReactNode }) {
  return <WineListSelectionProvider>{children}</WineListSelectionProvider>;
}
