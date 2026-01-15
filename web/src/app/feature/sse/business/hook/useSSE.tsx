import { useContext } from "react";
import { SSEContext } from "../context/sseContext";

export const useBreezeSSE = () => useContext(SSEContext);
