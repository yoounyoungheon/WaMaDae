import clsx from "clsx";
import { useEffect, useRef } from "react";
import { ChatType } from "../types/chat.types";

type ChatLogProps = {
  chats: ChatType[];
};

export const ChatLog = ({ chats }: ChatLogProps) => {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chats.length === 0) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chats]);

  return (
    <div className="flex flex-col gap-3 h-full">
      {chats.map((chat) => (
        <div key={chat.chatId}>
          {chat.message && (
            <div
              className={clsx(
                "flex",
                chat.isMine ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={clsx(
                  "flex rounded-2xl px-3 py-2 text-sm shadow",
                  "border border-mysom-secondary",
                  chat.infoPanel && "mb-3"
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {chat.message}
                </p>
              </div>
            </div>
          )}

          {chat.infoPanel && <>{chat.infoPanel}</>}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};
