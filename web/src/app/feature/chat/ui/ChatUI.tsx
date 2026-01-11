"use client";
import { ChatProvider } from "@/app/feature/chat/context/chat.context";
import { useChat } from "@/app/feature/chat/hook/useChat";
import { ChatLog } from "@/app/feature/chat/ui/ChatLog";
import { SendMessageForm } from "@/app/feature/chat/ui/SendMessageForm";
import uuid from "react-uuid";
import { WineRecommendView } from "./WineRecommendView";

const ChatView = () => {
  const { chattingRoom, sendMessage, receiveMessage } = useChat();

  const handleSendMessage = ({ message }: { message: string }) => {
    sendMessage({ message, chatId: uuid() });
    receiveMessage({
      chatId: uuid(),
      message: `${message}에 대한 결과입니다.`,
      infoPanel: <WineRecommendView />,
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-1.5 px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ChatLog chats={chattingRoom.chats} />
      </div>
      <div className="w-full shrink-0 p-1.5">
        <SendMessageForm onSend={handleSendMessage} />
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
