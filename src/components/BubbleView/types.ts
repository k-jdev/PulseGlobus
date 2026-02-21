export interface BubbleData {
  id: string;
  title: string;
  image: string;
  volume: number;
  volume24hr: number;
  category: string;
  slug: string;
  eventSlug?: string;
  outcomes: string[];
  outcomePrices: number[];
  description: string;
  endDate: string;
  liquidity: number;
}

export interface PositionedBubble extends BubbleData {
  x: number;
  y: number;
  radius: number;
}
