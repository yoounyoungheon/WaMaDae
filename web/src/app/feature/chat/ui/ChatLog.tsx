import clsx from "clsx";
import { ChatType } from "../types/chat.types";

type ChatLogProps = {
  chats: ChatType[];
};

export const ChatLog = ({ chats }: ChatLogProps) => {
  return (
    <div className="flex flex-col gap-3 h-full">
      {chats.map((chat) => (
        <div
          key={chat.chatId}
          className={clsx(
            "flex",
            chat.isMine ? "justify-end" : "justify-start"
          )}
        >
          <div>
            {chat.message && (
              <div
                className={clsx(
                  "w-full rounded-2xl px-3 py-2 text-sm shadow",
                  chat.isMine
                    ? "border border-mysom-secondary"
                    : "border border-mysom-secondary",
                  chat.actionButton && "mb-2"
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {chat.message}
                </p>
              </div>
            )}
            {chat.actionButton ? <div>{chat.actionButton}</div> : null}
          </div>
        </div>
      ))}
    </div>
  );
};
