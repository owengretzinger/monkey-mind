import WebSocket from "ws";

export interface Position {
  x: number;
  y: number;
}

export interface User {
  id: string;
  displayName: string;
}

export interface MonkeyData {
  position: Position;
  currentAction: string;
  color: {
    hue: number;
    isDark: boolean;
  };
  hatId: string;
  user: User | null;
  currentUrl?: string;
}

export type WebSocketMessage = {
  type: "update" | "disconnect";
  data: MonkeyData | { userId: string };
};

// For type safety in the server
export interface ConnectedClient {
  ws: WebSocket;
  monkeyData: MonkeyData;
  lastSeen: number;
}
