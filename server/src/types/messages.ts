import { WebSocket } from 'ws';

export interface UserPresence {
    userId: string;
    url: string;
}

export interface WebSocketMessage {
    type: 'presence' | 'chat';
    data: UserPresence | any;
}

export interface ExtendedWebSocket extends WebSocket {
    isAlive?: boolean;
}