"use client";
import { ChatProvider } from "@/app/feature/chat/context/chat.context";
import { useChat } from "@/app/feature/chat/hook/useChat";
import { ChatLog } from "@/app/feature/chat/ui/ChatLog";
import { SendMessageForm } from "@/app/feature/chat/ui/SendMessageForm";
import uuid from "react-uuid";
import { WineRecommendView } from "./WineRecommendView";

const RenderChatUI = () => {
  const { chattingRoom, sendMessage, receiveMessage, updateChat } = useChat();

  const handleSendMessage = ({ message }: { message: string }) => {
    sendMessage({ message, chatId: uuid() });

    requestMessage(message);
  };

  // TODO: sse handler 로직 구현 예정 (현재 mocking)
  const requestMessage = (message: string) => {
    const chatId = uuid();
    receiveMessage({ chatId, message: "", isloading: true });

    const messageArr: string[] = `${message}에 대한 결과입니다.`.split("");
    messageArr.forEach((delta, index) => {
      setTimeout(() => {
        const isLast = index === messageArr.length - 1;
        updateChat({
          chatId,
          message: delta,
          isloading: false,
          stream: true,
          ...(isLast && { infoPanel: <WineRecommendView /> }),
        });
      }, index * 50);
    });

    return { chatId, messageArr };
  };

  return (
    <div className="flex h-full flex-col">
      <ChatLog chats={chattingRoom.chats} />
      <div className="w-full shrink-0 p-1.5">
        <SendMessageForm onSend={handleSendMessage} />
      </div>
    </div>
  );
};

const ChatUI = () => {
  return (
    <ChatProvider>
      <RenderChatUI />
    </ChatProvider>
  );
};

export default ChatUI;
