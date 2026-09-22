import { normalizeUuid } from "@/app/shared/lib/validation/uuid";
import {
  WORKFLOW_SNAPSHOT_VERSION,
  type WinePairingSnapshot,
  type WineSelectionSnapshot,
} from "../model/workflow-snapshot.type";

/**
 * 워크플로 handoff snapshot을 sessionStorage에 유지하는 저장소.
 *
 * WebView는 리로드가 잦아 인메모리만으로는 다음 단계 화면이 쉽게 비워진다.
 * 워크플로 전체가 한 세션 동안만 유효한 draft이므로 localStorage가 아니라 sessionStorage를 쓴다.
 * 저장 값은 신뢰할 수 없으므로 읽을 때 version과 shape을 다시 검증한다.
 */
const SELECTION_KEY = "wamadae:wine-workflow:selection";
const PAIRING_KEY = "wamadae:wine-workflow:pairing";
/** pairing POST가 이미 소비된 세션. 리로드 시 중복 페어링 자동 재호출을 막는다. */
const PAIRING_CONSUMED_KEY = "wamadae:wine-workflow:pairing-consumed";

function setItem(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sessionStorage를 쓸 수 없는 환경(사생활 모드 등)에서는 인메모리 흐름에 맡긴다.
  }
}

function getRaw(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // 무시한다.
  }
}

function parseUuidArray(input: unknown): string[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;
  const parsed: string[] = [];
  for (const item of input) {
    const uuid = normalizeUuid(item);
    if (!uuid) return null;
    parsed.push(uuid);
  }
  return [...new Set(parsed)];
}

function parseNonEmptyStringArray(input: unknown): string[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;
  const parsed: string[] = [];
  for (const item of input) {
    if (typeof item !== "string" || item.trim().length === 0) return null;
    parsed.push(item);
  }
  return [...new Set(parsed)];
}

// ---- Selection snapshot (list -> keywords) --------------------------------

export function saveWineSelectionSnapshot(
  snapshot: WineSelectionSnapshot
): void {
  setItem(SELECTION_KEY, snapshot);
}

export function loadWineSelectionSnapshot(): WineSelectionSnapshot | null {
  const value = getRaw(SELECTION_KEY);
  if (typeof value !== "object" || value === null) return null;

  const { version, sessionId, pairingWineIds } = value as Record<
    string,
    unknown
  >;
  if (version !== WORKFLOW_SNAPSHOT_VERSION) return null;

  const normalizedSessionId = normalizeUuid(sessionId);
  const normalizedWineIds = parseUuidArray(pairingWineIds);
  if (!normalizedSessionId || !normalizedWineIds) return null;

  return {
    version: WORKFLOW_SNAPSHOT_VERSION,
    sessionId: normalizedSessionId,
    pairingWineIds: normalizedWineIds,
  };
}

export function clearWineSelectionSnapshot(): void {
  removeItem(SELECTION_KEY);
}

// ---- Pairing snapshot (keywords -> chat) ----------------------------------

export function saveWinePairingSnapshot(snapshot: WinePairingSnapshot): void {
  setItem(PAIRING_KEY, snapshot);
}

export function loadWinePairingSnapshot(): WinePairingSnapshot | null {
  const value = getRaw(PAIRING_KEY);
  if (typeof value !== "object" || value === null) return null;

  const { version, sessionId, wineIds, menuNames } = value as Record<
    string,
    unknown
  >;
  if (version !== WORKFLOW_SNAPSHOT_VERSION) return null;

  const normalizedSessionId = normalizeUuid(sessionId);
  const normalizedWineIds = parseUuidArray(wineIds);
  const normalizedMenuNames = parseNonEmptyStringArray(menuNames);
  if (!normalizedSessionId || !normalizedWineIds || !normalizedMenuNames) {
    return null;
  }

  return {
    version: WORKFLOW_SNAPSHOT_VERSION,
    sessionId: normalizedSessionId,
    wineIds: normalizedWineIds,
    menuNames: normalizedMenuNames,
  };
}

export function clearWinePairingSnapshot(): void {
  removeItem(PAIRING_KEY);
}

// ---- Pairing consumed marker ----------------------------------------------

/** 해당 세션의 pairing stream이 이미 시작됐음을 표시한다. */
export function markWinePairingConsumed(sessionId: string): void {
  setItem(PAIRING_CONSUMED_KEY, { sessionId });
}

/** 해당 세션의 pairing stream이 이미 소비됐는지 확인한다. */
export function isWinePairingConsumed(sessionId: string): boolean {
  const value = getRaw(PAIRING_CONSUMED_KEY);
  if (typeof value !== "object" || value === null) return false;
  return (value as { sessionId?: unknown }).sessionId === sessionId;
}

export function clearWinePairingConsumed(): void {
  removeItem(PAIRING_CONSUMED_KEY);
}

/** 새 분석 시작 시 하위 단계 snapshot을 모두 초기화한다(stale 세션 혼합 방지). */
export function clearDownstreamWorkflowSnapshots(): void {
  clearWineSelectionSnapshot();
  clearWinePairingSnapshot();
  clearWinePairingConsumed();
}
