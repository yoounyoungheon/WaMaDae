import { useContext } from "react";
import { SSEContext } from "../context/sseContext";

export const useSSE = () => useContext(SSEContext);
