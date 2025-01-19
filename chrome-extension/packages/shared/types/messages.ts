import type { MonkeyData } from '@extension/storage';

export type WebSocketMessage = {
  type: 'update' | 'disconnect';
  data: MonkeyData | { userId: string };
};

export type ChromeMessage = {
  type: 'WS_SEND' | 'WS_MESSAGE';
  data: WebSocketMessage;
};
