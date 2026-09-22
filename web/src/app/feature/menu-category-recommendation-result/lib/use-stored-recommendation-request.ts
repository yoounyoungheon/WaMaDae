"use client";

import { useEffect, useState } from "react";
import { loadWineSelectionSnapshot } from "@/app/entity/wine-pairing-workflow/lib/workflow-snapshot-storage";
import type { WineSelectionSnapshot } from "@/app/entity/wine-pairing-workflow/model/workflow-snapshot.type";

type StoredSelectionSnapshot = {
  snapshot: WineSelectionSnapshot | null;
  isHydrated: boolean;
};

/**
 * `/wine/list`가 저장한 선택 snapshot(sessionId + pairingWineIds)을 읽는다.
 *
 * 서버 렌더에는 window가 없으므로 hydration 이후 클라이언트에서 한 번 읽는다.
 * `isHydrated`로 최초 렌더의 mismatch와 빈 상태 깜빡임을 구분한다.
 */
export function useStoredWineSelectionSnapshot(): StoredSelectionSnapshot {
  const [state, setState] = useState<StoredSelectionSnapshot>({
    snapshot: null,
    isHydrated: false,
  });

  useEffect(() => {
    setState({ snapshot: loadWineSelectionSnapshot(), isHydrated: true });
  }, []);

  return state;
}
