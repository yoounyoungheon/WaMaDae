"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";
import { useStore } from "zustand";
import type { TableKeywordId } from "@/app/entity/table-keyword/model/table-keyword.type";
import {
  createTableKeywordSelectionStore,
  type TableKeywordSelectionState,
  type TableKeywordSelectionStore,
} from "./table-keyword-selection.store";

const TableKeywordSelectionStoreContext =
  createContext<TableKeywordSelectionStore | null>(null);

export interface TableKeywordSelectionProviderProps {
  children: ReactNode;
  initialSelectedKeywordIds?: TableKeywordId[];
}

export function TableKeywordSelectionProvider({
  children,
  initialSelectedKeywordIds = [],
}: TableKeywordSelectionProviderProps) {
  const storeRef = useRef<TableKeywordSelectionStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createTableKeywordSelectionStore(
      initialSelectedKeywordIds
    );
  }

  return (
    <TableKeywordSelectionStoreContext.Provider value={storeRef.current}>
      {children}
    </TableKeywordSelectionStoreContext.Provider>
  );
}

export function useTableKeywordSelectionStore<T>(
  selector: (state: TableKeywordSelectionState) => T
) {
  const store = useContext(TableKeywordSelectionStoreContext);

  if (!store) {
    throw new Error(
      "useTableKeywordSelectionStore must be used within TableKeywordSelectionProvider"
    );
  }

  return useStore(store, selector);
}
