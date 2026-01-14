import { Market, PolymarketEvent } from "../../../store/services/polymarketApi";

export interface MapMarker {
  id: string;
  title: string;
  description: string;
  category: string;
  volume: number;
  liquidity: number;
  image: string;
  outcomes: string[];
  outcomePrices: number[];
  coordinates: [number, number];
  eventTitle?: string;
  slug: string;
  active: boolean;
}

const CATEGORY_CITY_MAP: Record<
  string,
  { name: string; coordinates: [number, number] }
> = {
  politics: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  "us-politics": { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  elections: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  "world-politics": { name: "Brussels", coordinates: [4.3517, 50.8503] },

  crypto: { name: "Singapore", coordinates: [103.8198, 1.3521] },
  cryptocurrency: { name: "Singapore", coordinates: [103.8198, 1.3521] },
  finance: { name: "New York", coordinates: [-74.006, 40.7128] },
  economics: { name: "London", coordinates: [-0.1276, 51.5074] },
  business: { name: "Hong Kong", coordinates: [114.1694, 22.3193] },

  sports: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  football: { name: "London", coordinates: [-0.1276, 51.5074] },
  basketball: { name: "Chicago", coordinates: [-87.6298, 41.8781] },
  soccer: { name: "Madrid", coordinates: [-3.7038, 40.4168] },
  baseball: { name: "Boston", coordinates: [-71.0589, 42.3601] },
  mma: { name: "Las Vegas", coordinates: [-115.1398, 36.1699] },
  tennis: { name: "Paris", coordinates: [2.3522, 48.8566] },

  tech: { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
  technology: { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
  ai: { name: "San Francisco", coordinates: [-122.4194, 37.7749] },

  entertainment: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  "pop-culture": { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  culture: { name: "Tokyo", coordinates: [139.6917, 35.6895] },
  music: { name: "Nashville", coordinates: [-86.7816, 36.1627] },

  science: { name: "Geneva", coordinates: [6.1432, 46.2044] },
  space: { name: "Houston", coordinates: [-95.3698, 29.7604] },
  health: { name: "Boston", coordinates: [-71.0589, 42.3601] },

  global: { name: "New York", coordinates: [-74.006, 40.7128] },
  world: { name: "London", coordinates: [-0.1276, 51.5074] },
  climate: { name: "Copenhagen", coordinates: [12.5683, 55.6761] },

  default: { name: "New York", coordinates: [-74.006, 40.7128] },
};

const KEYWORD_CITY_MAP: {
  keyword: string;
  city: { name: string; coordinates: [number, number] };
}[] = [
  {
    keyword: "trump",
    city: { name: "Mar-a-Lago", coordinates: [-80.0364, 26.6774] },
  },
  {
    keyword: "biden",
    city: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  },
  {
    keyword: "elon",
    city: { name: "Austin", coordinates: [-97.7431, 30.2672] },
  },
  {
    keyword: "tesla",
    city: { name: "Austin", coordinates: [-97.7431, 30.2672] },
  },
  {
    keyword: "bitcoin",
    city: { name: "Miami", coordinates: [-80.1918, 25.7617] },
  },
  { keyword: "ethereum", city: { name: "Zug", coordinates: [8.5156, 47.166] } },
  {
    keyword: "china",
    city: { name: "Beijing", coordinates: [116.4074, 39.9042] },
  },
  {
    keyword: "russia",
    city: { name: "Moscow", coordinates: [37.6173, 55.7558] },
  },
  {
    keyword: "ukraine",
    city: { name: "Kyiv", coordinates: [30.5234, 50.4501] },
  },
  {
    keyword: "israel",
    city: { name: "Tel Aviv", coordinates: [34.7818, 32.0853] },
  },
  {
    keyword: "india",
    city: { name: "New Delhi", coordinates: [77.209, 28.6139] },
  },
  {
    keyword: "brazil",
    city: { name: "Brasília", coordinates: [-47.8825, -15.7942] },
  },
  {
    keyword: "germany",
    city: { name: "Berlin", coordinates: [13.405, 52.52] },
  },
  {
    keyword: "france",
    city: { name: "Paris", coordinates: [2.3522, 48.8566] },
  },
  { keyword: "uk", city: { name: "London", coordinates: [-0.1276, 51.5074] } },
  {
    keyword: "japan",
    city: { name: "Tokyo", coordinates: [139.6917, 35.6895] },
  },
  {
    keyword: "korea",
    city: { name: "Seoul", coordinates: [126.978, 37.5665] },
  },
  {
    keyword: "australia",
    city: { name: "Sydney", coordinates: [151.2093, -33.8688] },
  },
  {
    keyword: "canada",
    city: { name: "Ottawa", coordinates: [-75.6972, 45.4215] },
  },
  {
    keyword: "mexico",
    city: { name: "Mexico City", coordinates: [-99.1332, 19.4326] },
  },
  {
    keyword: "super bowl",
    city: { name: "Las Vegas", coordinates: [-115.1398, 36.1699] },
  },
  {
    keyword: "nba",
    city: { name: "New York", coordinates: [-74.006, 40.7128] },
  },
  {
    keyword: "nfl",
    city: { name: "New York", coordinates: [-74.006, 40.7128] },
  },
  {
    keyword: "world cup",
    city: { name: "Zurich", coordinates: [8.5417, 47.3769] },
  },
  {
    keyword: "olympics",
    city: { name: "Lausanne", coordinates: [6.6323, 46.5197] },
  },
  {
    keyword: "fed",
    city: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  },
  {
    keyword: "interest rate",
    city: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  },
  {
    keyword: "openai",
    city: { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
  },
  {
    keyword: "google",
    city: { name: "Mountain View", coordinates: [-122.0838, 37.3861] },
  },
  {
    keyword: "apple",
    city: { name: "Cupertino", coordinates: [-122.0322, 37.323] },
  },
  {
    keyword: "amazon",
    city: { name: "Seattle", coordinates: [-122.3321, 47.6062] },
  },
  {
    keyword: "microsoft",
    city: { name: "Redmond", coordinates: [-122.1215, 47.674] },
  },
  {
    keyword: "spacex",
    city: { name: "Boca Chica", coordinates: [-97.1631, 25.997] },
  },
  {
    keyword: "nasa",
    city: { name: "Cape Canaveral", coordinates: [-80.6077, 28.3922] },
  },
];

function getCoordinatesForMarket(market: Market): [number, number] {
  const question = market.question.toLowerCase();
  const category = market.category?.toLowerCase() || "";

  for (const item of KEYWORD_CITY_MAP) {
    if (question.includes(item.keyword)) {
      const offset = [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2];
      return [
        item.city.coordinates[0] + offset[0],
        item.city.coordinates[1] + offset[1],
      ];
    }
  }

  const cityData = CATEGORY_CITY_MAP[category] || CATEGORY_CITY_MAP["default"];

  const offset = [(Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3];

  return [
    cityData.coordinates[0] + offset[0],
    cityData.coordinates[1] + offset[1],
  ];
}

function parseOutcomes(outcomes: string): string[] {
  try {
    return JSON.parse(outcomes);
  } catch {
    return outcomes.split(",").map((s) => s.trim());
  }
}

function parseOutcomePrices(prices: string): number[] {
  try {
    return JSON.parse(prices).map(Number);
  } catch {
    return prices.split(",").map((s) => parseFloat(s.trim()) || 0);
  }
}

export function convertMarketsToMapMarkers(markets: Market[]): MapMarker[] {
  console.log(
    "🔍 Converting markets, first market fields:",
    markets[0]
      ? {
          active: markets[0].active,
          closed: markets[0].closed,
          archived: markets[0].archived,
          question: markets[0].question?.substring(0, 50),
        }
      : "no markets"
  );

  return markets
    .filter((market) => {
      const hasQuestion = !!market.question;
      return hasQuestion;
    })
    .map((market) => {
      const coordinates = getCoordinatesForMarket(market);
      const eventTitle = market.events?.[0]?.title;

      return {
        id: market.id,
        title: market.question,
        description: market.description || "",
        category: market.category || "general",
        volume: market.volumeNum || parseFloat(market.volume) || 0,
        liquidity: market.liquidityNum || parseFloat(market.liquidity) || 0,
        image: market.imageOptimized?.imageUrlOptimized || market.image || "",
        outcomes: parseOutcomes(market.outcomes || "[]"),
        outcomePrices: parseOutcomePrices(market.outcomePrices || "[]"),
        coordinates,
        eventTitle,
        slug: market.slug,
        active: market.active,
      };
    });
}

export function convertEventsToMapMarkers(
  events: PolymarketEvent[]
): MapMarker[] {
  return events
    .filter((event) => event.active && !event.closed)
    .map((event) => {
      const category = event.category?.toLowerCase() || "default";
      const cityData =
        CATEGORY_CITY_MAP[category] || CATEGORY_CITY_MAP["default"];

      const offset = [(Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2];

      return {
        id: event.id,
        title: event.title,
        description: event.description || event.subtitle || "",
        category: event.category || "general",
        volume: event.volume || 0,
        liquidity: event.liquidity || 0,
        image: event.imageOptimized?.imageUrlOptimized || event.image || "",
        outcomes: [],
        outcomePrices: [],
        coordinates: [
          cityData.coordinates[0] + offset[0],
          cityData.coordinates[1] + offset[1],
        ] as [number, number],
        eventTitle: event.title,
        slug: event.slug,
        active: event.active,
      };
    });
}

export function createGeoJSONFromMarkers(
  markers: MapMarker[]
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: markers.map((marker) => ({
      type: "Feature" as const,
      id: marker.id,
      properties: {
        id: marker.id,
        title: marker.title,
        description: marker.description,
        category: marker.category,
        volume: marker.volume,
        liquidity: marker.liquidity,
        image: marker.image,
        outcomes: JSON.stringify(marker.outcomes),
        outcomePrices: JSON.stringify(marker.outcomePrices),
        eventTitle: marker.eventTitle,
        slug: marker.slug,
      },
      geometry: {
        type: "Point" as const,
        coordinates: marker.coordinates,
      },
    })),
  };
}
