"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { SSEProviderType, SSEHandler } from "../../types/view.model";

type SSEState = "NONE_CONNECTION" | "CONNECTING" | "OPEN" | "CLOSED";

const defaultProvider: SSEProviderType = {
  open: () => undefined,
  close: () => undefined,
  sseState: "NONE_CONNECTION",
  errorMessage: undefined,
};

const SSEContext = createContext(defaultProvider);

type Props = {
  children: ReactNode;
};

const SSEProvider = ({ children }: Props) => {
  const eventSourceRef = useRef<EventSource | undefined>(undefined);

  const urlRef = useRef<string | undefined>(undefined);
  const handlersRef = useRef<SSEHandler[]>([]);
  const registeredHandlersRef = useRef<SSEHandler[]>([]);

  const [sseState, setSSEState] = useState<SSEState>("NONE_CONNECTION");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  /**
   * EventSource 객체 safe clean-up
   * - "실제로 붙여둔 리스너" 기준으로 제거 (중복 방지/정리 안전화)
   * - close()나 unmount cleanup에서만 호출됨
   */
  const cleanupSafely = useCallback((es?: EventSource) => {
    if (!es) return;

    for (const handler of registeredHandlersRef.current) {
      es.removeEventListener(handler.eventName, handler.handle);
    }
    registeredHandlersRef.current = [];

    es.onopen = null;
    es.onmessage = null;
    es.onerror = null;

    es.close();
  }, []);

  /**
   * 외부에서 명시적으로 호출하는 close
   */
  const close = useCallback(() => {
    const es = eventSourceRef.current;
    if (!es) return;

    cleanupSafely(es);

    eventSourceRef.current = undefined;
    urlRef.current = undefined;
    handlersRef.current = [];

    // 요청하신 4개 리터럴 상태 유지
    setSSEState("CLOSED");
  }, [cleanupSafely]);

  /**
   * SSE 연결 시작
   * - 이미 연결된 상태면 warn만 찍고 무시 (자동 close/재연결 없음)
   */
  const open = useCallback((url: string, handlers: SSEHandler[]) => {
    if (eventSourceRef.current) {
      console.warn(
        "[SSE] 이미 활성화된 SSE 연결이 존재합니다. close() 후 다시 open()을 호출하세요."
      );
      return;
    }

    urlRef.current = url;
    handlersRef.current = handlers ?? [];

    setErrorMessage(undefined);
    setSSEState("CONNECTING");

    const es = new EventSource(url);
    eventSourceRef.current = es;

    // open 이벤트가 발생하거나 heart beat 메세지를 받으면 OPEN 상태로 변경
    es.onopen = () => setSSEState("OPEN");
    es.onmessage = () => setSSEState("OPEN");

    // 재시도 로직은 브라우저 내부 정책을 따름
    es.onerror = (event) => {
      setSSEState("CONNECTING");

      const target = event.currentTarget as EventSource;
      setErrorMessage(
        `[SSE]: 서버에서 메세지를 수신하는 중 오류가 발생했습니다. url: ${
          target?.url ?? null
        }`
      );
    };

    const wrappedHandlers: SSEHandler[] = handlersRef.current.map((h) => ({
      ...h,
      handle: (e) => {
        setSSEState("OPEN");
        h.handle(e);
      },
    }));

    for (const h of wrappedHandlers) {
      es.addEventListener(h.eventName, h.handle);
    }

    registeredHandlersRef.current = wrappedHandlers;
  }, []);

  /**
   * 언마운트 시 cleanup (강제 정리)
   */
  useEffect(() => {
    const es = eventSourceRef.current;
    return () => {
      cleanupSafely(es);

      if (eventSourceRef.current === es) {
        eventSourceRef.current = undefined;
        urlRef.current = undefined;
        handlersRef.current = [];
      }

      setSSEState("NONE_CONNECTION");
    };
  }, [cleanupSafely]);

  const value: SSEProviderType = {
    open,
    close,
    sseState: sseState,
    errorMessage,
  };

  return <SSEContext.Provider value={value}>{children}</SSEContext.Provider>;
};

export { SSEContext, SSEProvider };
