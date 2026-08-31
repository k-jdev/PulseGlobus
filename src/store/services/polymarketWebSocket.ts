const WS_URL = "wss://ws-live-data.polymarket.com";
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 3000;

export interface LiveTradeMessage {
  asset: string;
  conditionId: string;
  eventSlug: string;
  icon: string;
  name: string;
  outcome: string;
  outcomeIndex: number;
  bio?: string;
  price?: string;
  side?: string;
  size?: string;
  timestamp?: number;
  market?: string;
  question?: string;
  transactionHash?: string;
  txHash?: string;
  hash?: string;
}

export interface WebSocketMessage {
  connection_id?: string;
  payload?: LiveTradeMessage;
  type?: string;
}

type TradeCallback = (trade: LiveTradeMessage) => void;
type ConnectionCallback = (connected: boolean) => void;
type Unsubscribe = () => void;

class PolymarketWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private tradeCallbacks = new Set<TradeCallback>();
  private connectionCallbacks = new Set<ConnectionCallback>();
  private isConnecting = false;

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) return;

    this.isConnecting = true;

    try {
      this.socket = new WebSocket(WS_URL);
    } catch {
      this.isConnecting = false;
      return;
    }

    this.socket.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.notifyConnectionChange(true);
      this.subscribe();
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        if (message.payload) {
          this.tradeCallbacks.forEach((callback) => callback(message.payload!));
        }
      } catch {
        // A malformed frame should not tear down the stream.
      }
    };

    this.socket.onclose = () => {
      this.isConnecting = false;
      this.notifyConnectionChange(false);
      this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      this.isConnecting = false;
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    // Drop the close handler first so teardown does not trigger a reconnect.
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
  }

  onTrade(callback: TradeCallback): Unsubscribe {
    this.tradeCallbacks.add(callback);
    return () => this.tradeCallbacks.delete(callback);
  }

  onConnectionChange(callback: ConnectionCallback): Unsubscribe {
    this.connectionCallbacks.add(callback);
    return () => this.connectionCallbacks.delete(callback);
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private subscribe(): void {
    if (this.socket?.readyState !== WebSocket.OPEN) return;
    this.socket.send(
      JSON.stringify({
        action: "subscribe",
        subscriptions: [{ topic: "activity", type: "trades" }],
      }),
    );
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;

    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, RECONNECT_DELAY_MS);
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionCallbacks.forEach((callback) => callback(connected));
  }
}

export const polymarketWS = new PolymarketWebSocketService();
