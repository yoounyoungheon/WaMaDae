"use client";
import { ChatProvider } from "@/app/feature/chat/context/chat.context";
import { useChat } from "@/app/feature/chat/hook/useChat";
import { ChatLog } from "@/app/feature/chat/ui/ChatLog";
import { SendMessageForm } from "@/app/feature/chat/ui/SendMessageForm";
import uuid from "react-uuid";
import Image from "next/image";

const ChatView = () => {
  const { chattingRoom, sendMessage } = useChat();

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-1.5 px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ChatLog chats={chattingRoom.chats} />
      </div>
      <div className="w-full shrink-0 p-1.5">
        <SendMessageForm
          onSend={({ message, imageUrl }) =>
            sendMessage({
              message,
              chatId: uuid(),
              actionButton: imageUrl ? (
                <Image
                  src={imageUrl}
                  height={28}
                  width={28}
                  alt="전송한 이미지"
                  className="h-28 w-28 rounded object-cover"
                />
              ) : undefined,
            })
          }
        />
      </div>
    </div>
  );
};

const ChatUI = () => {
  return (
    <ChatProvider>
      <ChatView />
    </ChatProvider>
  );
};

export default ChatUI;
