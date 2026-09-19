"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";
import {
  createWineListSelectionStore,
  type WineListSelectionState,
  type WineListSelectionStore,
} from "./wine-list-selection.store";

const WineListSelectionStoreContext =
  createContext<WineListSelectionStore | null>(null);

export interface WineListSelectionProviderProps {
  children: ReactNode;
}

export function WineListSelectionProvider({
  children,
}: WineListSelectionProviderProps) {
  const storeRef = useRef<WineListSelectionStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createWineListSelectionStore();
  }

  return (
    <WineListSelectionStoreContext.Provider value={storeRef.current}>
      {children}
    </WineListSelectionStoreContext.Provider>
  );
}

export function useWineListSelectionStore<T>(
  selector: (state: WineListSelectionState) => T
) {
  const store = useContext(WineListSelectionStoreContext);

  if (!store) {
    throw new Error(
      "useWineListSelectionStore must be used within WineListSelectionProvider"
    );
  }

  return useStore(store, selector);
}
