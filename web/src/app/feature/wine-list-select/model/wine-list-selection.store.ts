import { createStore } from "zustand/vanilla";
import type { WineId } from "@/app/entity/wine/model/wine.type";

/**
 * `/wine/*` 플로우 동안 유지되는 선택 draft 상태(공유 클라이언트 UI 상태).
 *
 * 서버 응답(추출 와인 목록)은 여기 저장하지 않고, 세션 ID와 선택된 wine ID만 담는다.
 * layout 인스턴스가 유지되는 동안 형제 라우트 간 이동에도 선택이 보존된다.
 */
export type WineListSelectionState = {
  /** 추출을 완료한 세션 UUID. 추출 성공 시에만 커밋된다. */
  sessionId: string | null;
  selectedWineIds: WineId[];
  /** 새 추출 세션을 시작한다. 이전 선택을 비운다. */
  startSession: (sessionId: string, initialWineIds?: WineId[]) => void;
  toggleWineId: (wineId: WineId) => void;
  removeWineId: (wineId: WineId) => void;
  reset: () => void;
};

export type WineListSelectionStore = ReturnType<
  typeof createWineListSelectionStore
>;

export function createWineListSelectionStore() {
  return createStore<WineListSelectionState>((set) => ({
    sessionId: null,
    selectedWineIds: [],
    startSession: (sessionId, initialWineIds = []) =>
      set({
        sessionId,
        selectedWineIds: [...new Set(initialWineIds)],
      }),
    toggleWineId: (wineId) =>
      set((state) =>
        state.selectedWineIds.includes(wineId)
          ? {
              selectedWineIds: state.selectedWineIds.filter(
                (id) => id !== wineId
              ),
            }
          : { selectedWineIds: [...state.selectedWineIds, wineId] }
      ),
    removeWineId: (wineId) =>
      set((state) => ({
        selectedWineIds: state.selectedWineIds.filter((id) => id !== wineId),
      })),
    reset: () => set({ sessionId: null, selectedWineIds: [] }),
  }));
}
