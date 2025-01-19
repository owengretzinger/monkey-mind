import { WebSocket } from 'ws';

export interface UserPresence {
    userId: string;
    url: string;
}

export interface MonkeyPosition {
    id: string;
    position: {
        x: number;
        y: number;
    };
    state: string;
    direction?: 'left' | 'right';
    url: string;
    ownerName: string;
    selectedHat?: string;
    isHiding?: boolean;
}

export interface WebSocketMessage {
    type: 'presence' | 'chat' | 'monkey_position' | 'monkey_left';
    data: UserPresence | MonkeyPosition | any;
}

export interface ExtendedWebSocket extends WebSocket {
    isAlive?: boolean;
}