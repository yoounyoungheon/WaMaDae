"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";
import {
  createWinePreferenceSelectionStore,
  type WinePreferenceSelectionInitialState,
  type WinePreferenceSelectionState,
  type WinePreferenceSelectionStore,
} from "./wine-preference-selection.store";

const WinePreferenceSelectionStoreContext =
  createContext<WinePreferenceSelectionStore | null>(null);

export interface WinePreferenceSelectionProviderProps {
  children: ReactNode;
  initialState?: Partial<WinePreferenceSelectionInitialState>;
}

export function WinePreferenceSelectionProvider({
  children,
  initialState,
}: WinePreferenceSelectionProviderProps) {
  const storeRef = useRef<WinePreferenceSelectionStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createWinePreferenceSelectionStore(initialState);
  }

  return (
    <WinePreferenceSelectionStoreContext.Provider value={storeRef.current}>
      {children}
    </WinePreferenceSelectionStoreContext.Provider>
  );
}

export function useWinePreferenceSelectionStore<T>(
  selector: (state: WinePreferenceSelectionState) => T
) {
  const store = useContext(WinePreferenceSelectionStoreContext);

  if (!store) {
    throw new Error(
      "useWinePreferenceSelectionStore must be used within WinePreferenceSelectionProvider"
    );
  }

  return useStore(store, selector);
}
