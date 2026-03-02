export type SSEProviderType = {
  open: (url: string, handlers: SSEHandler[], autoDisconnect?: boolean) => void;
  close: () => void;
  sseState: SSEState;
  errorMessage?: string;
};

export type SSEHandler = {
  eventName: string;
  handle: (event: MessageEvent) => void;
};

export type SSEState = "NONE_CONNECTION" | "CONNECTING" | "OPEN" | "CLOSED";
