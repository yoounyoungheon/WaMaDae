"use client";

import { ReactNode, createContext, useCallback, useState } from "react";
import {
  AddChat,
  Chat,
  ChattingRoom,
  ReceiveMessage,
  SendMessage,
  UpdateChat,
  ChatProviderType,
} from "../../types/view.model";

const defaultProvider: ChatProviderType = {
  chattingRoom: { id: "", chats: [] },
  sendMessage: () => undefined,
  receiveMessage: () => undefined,
  updateChat: () => undefined,
};

const ChatContext = createContext(defaultProvider);

type Props = {
  children: ReactNode;
};

const ChatProvider = ({ children }: Props) => {
  const [chattingRoom, setChattingRoom] = useState<ChattingRoom>({
    id: "",
    chats: [],
  });

  /**
   * chattingRoom의 chats 상태에 단건 데이터를 add
   */
  const addChat = useCallback(
    ({ message, chatId, isMine, isloading, copy, infoPanel }: AddChat) => {
      setChattingRoom((prev) => {
        const newChat: Chat = {
          chatId: chatId,
          message,
          time: new Date(),
          isMine: isMine,
          isloading,
          copy,
          infoPanel,
        };

        return {
          ...prev,
          chats: [...prev.chats, newChat],
        };
      });
    },
    []
  );

  /**
   * 메세지 전송 함수
   */
  const sendMessage = useCallback(
    ({ chatId, message, infoPanel, copy }: SendMessage) => {
      addChat({ chatId, message, isMine: true, copy, infoPanel });
    },
    [addChat]
  );

  /**
   * 메세지 수신 함수
   */
  const receiveMessage = useCallback(
    ({ chatId, message, isloading, copy, infoPanel }: ReceiveMessage) => {
      addChat({
        chatId,
        message,
        isMine: false,
        copy,
        infoPanel,
        isloading,
      });
    },
    [addChat]
  );

  /**
   * 채팅 단건의 id를 찾아서 내용을 업데이트하는 함수
   *
   * 사용 예시
   * 1. 하나의 chat에 SSE로 받은 내용을 계속 업데이트하는 경우
   */
  const updateChat = useCallback(
    ({ message, chatId, isloading, stream, infoPanel }: UpdateChat) => {
      setChattingRoom((prev) => {
        const updatedChats = prev.chats.map((chat) => {
          if (chat.chatId === chatId) {
            return {
              ...chat,
              message: stream ? chat.message + message : message,
              isloading: isloading ?? chat.isloading,
              infoPanel,
            };
          }

          return chat;
        });

        return {
          ...prev,
          chats: updatedChats,
        };
      });
    },
    []
  );

  const value: ChatProviderType = {
    chattingRoom,
    sendMessage,
    receiveMessage,
    updateChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export { ChatContext, ChatProvider };
