// Polymarket WebSocket Live Trades Service
// WebSocket URL: wss://ws-live-data.polymarket.com

export interface LiveTradeMessage {
  asset: string;
  conditionId: string;
  eventSlug: string;
  icon: string;
  name: string; // Trader username
  outcome: string;
  outcomeIndex: number;
  bio?: string;
  price?: string;
  side?: string;
  size?: string;
  timestamp?: number; // Unix timestamp in seconds
  market?: string; // Market question/title
  question?: string; // Alternative field for market question
  transactionHash?: string; // Polygon transaction hash
  txHash?: string; // Alternative field for transaction hash
  hash?: string; // Another alternative
}

export interface WebSocketMessage {
  connection_id?: string;
  payload?: LiveTradeMessage;
  type?: string;
}

type TradeCallback = (trade: LiveTradeMessage) => void;
type ConnectionCallback = (connected: boolean) => void;

class PolymarketWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private tradeCallbacks: TradeCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private isConnecting = false;
  private eligibleSlugs: string[] = [];

  connect(slugs: string[] = []) {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.eligibleSlugs = slugs;
    this.isConnecting = true;

    try {
      this.ws = new WebSocket("wss://ws-live-data.polymarket.com");

      this.ws.onopen = () => {
        console.log(
          "[LIVE] WebSocket OPEN - wss://ws-live-data.polymarket.com"
        );
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyConnectionChange(true);
        this.subscribe();
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);

          if (data.payload) {
            const trade = data.payload;

            // Log received message
            console.log(`[LIVE] Message:`, trade);

            // Notify all callbacks
            this.tradeCallbacks.forEach((callback) => callback(trade));
          }
        } catch (error) {
          console.error("[LIVE] Error parsing message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("[LIVE] WebSocket closed");
        this.isConnecting = false;
        this.notifyConnectionChange(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("[LIVE] WebSocket error:", error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error("[LIVE] Failed to create WebSocket:", error);
      this.isConnecting = false;
    }
  }

  private subscribe() {
    if (this.ws?.readyState !== WebSocket.OPEN) return;

    // Subscribe to activity/trades topic
    const subscriptionMessage = {
      action: "subscribe",
      subscriptions: [{ topic: "activity", type: "trades" }],
    };

    this.ws.send(JSON.stringify(subscriptionMessage));
    console.log("[LIVE] Sending subscription:", subscriptionMessage);
    console.log("[LIVE] ✓ Subscription sent");
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[LIVE] Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `[LIVE] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      this.connect(this.eligibleSlugs);
    }, this.reconnectDelay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  onTrade(callback: TradeCallback) {
    this.tradeCallbacks.push(callback);
    return () => {
      this.tradeCallbacks = this.tradeCallbacks.filter((cb) => cb !== callback);
    };
  }

  onConnectionChange(callback: ConnectionCallback) {
    this.connectionCallbacks.push(callback);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  private notifyConnectionChange(connected: boolean) {
    this.connectionCallbacks.forEach((callback) => callback(connected));
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const polymarketWS = new PolymarketWebSocketService();
