import { SERVER_URL } from '@extension/shared';
import type { WebSocketMessage, ChromeMessage } from '@extension/shared/types/messages';

let ws: WebSocket | null = null;
let lastSentState: WebSocketMessage | null = null;

export function setupWebSocket() {
  if (ws?.readyState === WebSocket.OPEN) {
    console.log('[Background] WebSocket already connected');
    return;
  }

  console.log('[Background] Attempting WebSocket connection...');
  ws = new WebSocket(SERVER_URL);

  ws.onopen = () => {
    console.log('[Background] WebSocket connected successfully');
    // Resend last known state after reconnection
    if (lastSentState) {
      console.log('[Background] Restoring last known state');
      sendWebSocketMessage(lastSentState);
    }
  };

  ws.onmessage = event => {
    // Broadcast to all content scripts
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs
            .sendMessage(tab.id, {
              type: 'WS_MESSAGE',
              data: JSON.parse(event.data) as WebSocketMessage,
            } as ChromeMessage)
            .catch(err => {
              console.log('[Background] Failed to send to tab', tab.id, ':', err);
            });
        }
      });
    });
  };

  ws.onclose = () => {
    console.log('[Background] WebSocket closed, attempting reconnect in 2s');
    ws = null;
    setTimeout(() => {
      console.log('[Background] Attempting reconnection...');
      setupWebSocket();
    }, 2000);
  };

  ws.onerror = error => {
    console.log('[Background] WebSocket error:', error);
  };
}

export function sendWebSocketMessage(data: WebSocketMessage) {
  if (ws?.readyState === WebSocket.OPEN) {
    lastSentState = data;
    ws.send(JSON.stringify(data));
  } else {
    console.warn('[Background] Cannot send message - WebSocket not connected (State:', ws?.readyState, ')');
  }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message: ChromeMessage) => {
  if (message.type === 'WS_SEND') {
    sendWebSocketMessage(message.data);
  }
});
