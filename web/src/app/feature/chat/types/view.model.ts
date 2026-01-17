export type ReceiveMessage = {
  message: string;
  chatId: string;
  isloading?: boolean;
  copy?: boolean;
  infoPanel?: React.JSX.Element;
};

export type SendMessage = {
  message: string;
  chatId: string;
  copy?: boolean;
  infoPanel?: React.JSX.Element;
};

export type UpdateChat = {
  message: string;
  chatId: string;
  isloading?: boolean;
  stream?: boolean;
  infoPanel?: React.JSX.Element;
};

export type AddChat = {
  message: string;
  isMine: boolean;
  chatId: string;
  isloading?: boolean;
  copy?: boolean;
  infoPanel?: React.JSX.Element;
};

export type ChatProviderType = {
  chattingRoom: ChattingRoom;
  sendMessage: ({ message, chatId, copy, infoPanel }: SendMessage) => void;
  receiveMessage: ({
    message,
    chatId,
    copy,
    infoPanel,
    isloading,
  }: ReceiveMessage) => void;
  updateChat: ({ message, chatId, isloading, stream }: UpdateChat) => void;
};

export type ChatContent = {
  chattingRoom: ChattingRoom | undefined;
  sendMsg: (message: string) => void;
  disabled?: boolean;
};

export type ChattingRoom = {
  id: string;
  chats: Chat[];
};

export type Chat = {
  chatId: string;
  message: string;
  time: Date | string;
  isMine: boolean;
  isloading?: boolean;
  copy?: boolean;
  infoPanel?: React.JSX.Element;
};
