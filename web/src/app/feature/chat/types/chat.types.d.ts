export type ReceiveMessageType = {
  message: string;
  chatId: string;
  isloading?: boolean;
  copy?: boolean;
  actionButton?: React.JSX.Element;
  onReceive?: () => void;
};

export type SendMessageType = {
  message: string;
  chatId: string;
  copy?: boolean;
  actionButton?: React.JSX.Element;
  onSend?: () => void;
};

export type UpdateChatType = {
  message: string;
  chatId: string;
  isloading?: boolean;
  stream?: boolean;
  actionButton?: React.JSX.Element;
};

export type AddChatType = {
  message: string;
  isMine: boolean;
  chatId: string;
  isloading?: boolean;
  copy?: boolean;
  actionButton?: React.JSX.Element;
};

export type ChatProviderType = {
  chattingRoom: ChattingRoomType;
  sendMessage: ({
    message,
    chatId,
    copy,
    actionButton,
    onSend,
  }: SendMessageType) => void;
  receiveMessage: ({
    message,
    chatId,
    copy,
    actionButton,
    isloading,
    onReceive,
  }: ReceiveMessageType) => void;
  updateChat: ({ message, chatId, isloading, stream }: UpdateChatType) => void;
};

export type ChattingHandlersType = {
  send: (message: string, senderId: number) => void;
  onReceive: (message: string, senderId: number) => void;
  connect?: () => void;
};

export type ChatContentType = {
  chattingRoom: ChattingRoomType | undefined;
  sendMsg: (message: string) => void;
  disabled?: boolean;
};

export type ChattingRoomType = {
  id: string;
  chats: ChatType[];
};

export type ChatType = {
  chatId: string;
  message: string;
  time: Date | string;
  isMine: boolean;
  isloading?: boolean;
  copy?: boolean;
  actionButton?: React.JSX.Element;
};

export type ChatResponseType = {
  conversationId: string;
  responseMessage: string;
  refinedRequirement: string;
  additionalQuestions: string;
  responseId: string;
  prevResponseId?: string;
};

export type ChatRequestType = {
  chatInput: string;
  featureName: string;
  featureDetailDefinition?: string;
  responseId?: string;
};
