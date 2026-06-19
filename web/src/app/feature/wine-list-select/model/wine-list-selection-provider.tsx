"use client";

import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import type { WineId } from "@/app/entity/wine/model/wine.type";
import {
  createWineListSelectionStore,
  type WineListSelectionState,
  type WineListSelectionStore,
} from "./wine-list-selection.store";

const WineListSelectionStoreContext =
  createContext<WineListSelectionStore | null>(null);

export interface WineListSelectionProviderProps {
  children: ReactNode;
  initialSelectedWineIds?: WineId[];
}

export function WineListSelectionProvider({
  children,
  initialSelectedWineIds = [],
}: WineListSelectionProviderProps) {
  const storeRef = useRef<WineListSelectionStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createWineListSelectionStore(initialSelectedWineIds);
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
