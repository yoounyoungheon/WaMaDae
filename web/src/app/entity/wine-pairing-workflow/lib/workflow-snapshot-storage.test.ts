import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearDownstreamWorkflowSnapshots,
  isWinePairingConsumed,
  loadWinePairingSnapshot,
  loadWineSelectionSnapshot,
  markWinePairingConsumed,
  saveWinePairingSnapshot,
  saveWineSelectionSnapshot,
} from "./workflow-snapshot-storage";
import { WORKFLOW_SNAPSHOT_VERSION } from "../model/workflow-snapshot.type";

const SESSION_ID = "0198b013-f4a7-7a91-a232-20f4fe638b38";
const WINE_ID = "e501190d-ad82-460a-9d3d-b78999d49841";

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => Array.from(map.keys())[index] ?? null,
    removeItem: (key) => map.delete(key),
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

beforeEach(() => {
  (globalThis as { window?: unknown }).window = {
    sessionStorage: createMemoryStorage(),
  };
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe("wine selection snapshot", () => {
  it("versioned snapshot을 저장하고 정규화해 읽는다", () => {
    saveWineSelectionSnapshot({
      version: WORKFLOW_SNAPSHOT_VERSION,
      sessionId: SESSION_ID,
      pairingWineIds: [WINE_ID, WINE_ID],
    });

    expect(loadWineSelectionSnapshot()).toEqual({
      version: WORKFLOW_SNAPSHOT_VERSION,
      sessionId: SESSION_ID,
      pairingWineIds: [WINE_ID],
    });
  });

  it("version이 없는 legacy shape은 invalid 처리한다", () => {
    window.sessionStorage.setItem(
      "wamadae:wine-workflow:selection",
      JSON.stringify({ sessionId: SESSION_ID, pairingWineIds: [WINE_ID] })
    );

    expect(loadWineSelectionSnapshot()).toBeNull();
  });

  it("sessionId가 UUID가 아니면 invalid 처리한다", () => {
    window.sessionStorage.setItem(
      "wamadae:wine-workflow:selection",
      JSON.stringify({
        version: WORKFLOW_SNAPSHOT_VERSION,
        sessionId: "not-a-uuid",
        pairingWineIds: [WINE_ID],
      })
    );

    expect(loadWineSelectionSnapshot()).toBeNull();
  });
});

describe("wine pairing snapshot", () => {
  it("wineIds와 menuNames를 검증해 읽는다", () => {
    saveWinePairingSnapshot({
      version: WORKFLOW_SNAPSHOT_VERSION,
      sessionId: SESSION_ID,
      wineIds: [WINE_ID],
      menuNames: ["해산물 파전", "해산물 파전", "바지락 오일 파스타"],
    });

    expect(loadWinePairingSnapshot()).toEqual({
      version: WORKFLOW_SNAPSHOT_VERSION,
      sessionId: SESSION_ID,
      wineIds: [WINE_ID],
      menuNames: ["해산물 파전", "바지락 오일 파스타"],
    });
  });

  it("menuNames가 비면 invalid 처리한다", () => {
    window.sessionStorage.setItem(
      "wamadae:wine-workflow:pairing",
      JSON.stringify({
        version: WORKFLOW_SNAPSHOT_VERSION,
        sessionId: SESSION_ID,
        wineIds: [WINE_ID],
        menuNames: [],
      })
    );

    expect(loadWinePairingSnapshot()).toBeNull();
  });
});

describe("pairing consumed marker", () => {
  it("소비된 세션을 표시하고 확인한다", () => {
    expect(isWinePairingConsumed(SESSION_ID)).toBe(false);
    markWinePairingConsumed(SESSION_ID);
    expect(isWinePairingConsumed(SESSION_ID)).toBe(true);
    expect(isWinePairingConsumed("00000000-0000-4000-8000-000000000000")).toBe(
      false
    );
  });

  it("clearDownstreamWorkflowSnapshots가 selection/pairing/consumed를 모두 비운다", () => {
    saveWineSelectionSnapshot({
      version: WORKFLOW_SNAPSHOT_VERSION,
      sessionId: SESSION_ID,
      pairingWineIds: [WINE_ID],
    });
    markWinePairingConsumed(SESSION_ID);

    clearDownstreamWorkflowSnapshots();

    expect(loadWineSelectionSnapshot()).toBeNull();
    expect(loadWinePairingSnapshot()).toBeNull();
    expect(isWinePairingConsumed(SESSION_ID)).toBe(false);
  });
});
