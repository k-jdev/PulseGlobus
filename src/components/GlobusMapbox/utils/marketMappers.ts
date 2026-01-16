import { Market, PolymarketEvent } from "../../../store/services/polymarketApi";
import { GdeltArticle } from "../../../store/services/gdeltApi";

export interface OutcomeData {
  name: string;
  percentage: number;
  price: number;
  volume?: number;
  marketSlug?: string;
}

export type MarkerType = "market" | "news";

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

  eventOutcomes?: OutcomeData[];
  isMultiMarket?: boolean;
  coordinates: [number, number];
  eventTitle?: string;
  slug: string;
  eventSlug?: string;
  active: boolean;
  volume24hr: number;
  volume1wk: number;
  volume1mo: number;
  endDate: string;

  // News-specific fields
  type: MarkerType;
  url?: string;
  domain?: string;
  language?: string;
  sourcecountry?: string;
  seendate?: string;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getOffset(id: string, index: number): [number, number] {
  const hash = hashCode(id + index.toString());
  const angle = (hash % 360) * (Math.PI / 180);
  // Маленькое смещение - около 0.05-0.1 градуса (5-10 км), чтобы точки не выходили в воду
  const distance = 0.02 + (hash % 100) / 1500;
  return [Math.cos(angle) * distance, Math.sin(angle) * distance];
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
    keyword: "desantis",
    city: { name: "Tallahassee", coordinates: [-84.2807, 30.4383] },
  },
  {
    keyword: "newsom",
    city: { name: "Sacramento", coordinates: [-121.4944, 38.5816] },
  },
  {
    keyword: "congress",
    city: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  },
  {
    keyword: "senate",
    city: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  },
  {
    keyword: "white house",
    city: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  },
  {
    keyword: "republican",
    city: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  },
  {
    keyword: "democrat",
    city: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  },

  {
    keyword: "california",
    city: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  },
  {
    keyword: "texas",
    city: { name: "Austin", coordinates: [-97.7431, 30.2672] },
  },
  {
    keyword: "florida",
    city: { name: "Miami", coordinates: [-80.1918, 25.7617] },
  },
  {
    keyword: "new york",
    city: { name: "New York", coordinates: [-74.006, 40.7128] },
  },
  {
    keyword: "georgia",
    city: { name: "Atlanta", coordinates: [-84.388, 33.749] },
  },
  {
    keyword: "pennsylvania",
    city: { name: "Philadelphia", coordinates: [-75.1652, 39.9526] },
  },
  {
    keyword: "arizona",
    city: { name: "Phoenix", coordinates: [-112.074, 33.4484] },
  },
  {
    keyword: "michigan",
    city: { name: "Detroit", coordinates: [-83.0458, 42.3314] },
  },
  {
    keyword: "wisconsin",
    city: { name: "Milwaukee", coordinates: [-87.9065, 43.0389] },
  },
  {
    keyword: "nevada",
    city: { name: "Las Vegas", coordinates: [-115.1398, 36.1699] },
  },
  {
    keyword: "ohio",
    city: { name: "Columbus", coordinates: [-82.9988, 39.9612] },
  },
  {
    keyword: "illinois",
    city: { name: "Chicago", coordinates: [-87.6298, 41.8781] },
  },

  { keyword: "uk", city: { name: "London", coordinates: [-0.1276, 51.5074] } },
  {
    keyword: "britain",
    city: { name: "London", coordinates: [-0.1276, 51.5074] },
  },
  {
    keyword: "england",
    city: { name: "London", coordinates: [-0.1276, 51.5074] },
  },
  {
    keyword: "starmer",
    city: { name: "London", coordinates: [-0.1276, 51.5074] },
  },
  {
    keyword: "sunak",
    city: { name: "London", coordinates: [-0.1276, 51.5074] },
  },
  {
    keyword: "france",
    city: { name: "Paris", coordinates: [2.3522, 48.8566] },
  },
  {
    keyword: "macron",
    city: { name: "Paris", coordinates: [2.3522, 48.8566] },
  },
  {
    keyword: "germany",
    city: { name: "Berlin", coordinates: [13.405, 52.52] },
  },
  { keyword: "scholz", city: { name: "Berlin", coordinates: [13.405, 52.52] } },
  { keyword: "merkel", city: { name: "Berlin", coordinates: [13.405, 52.52] } },
  { keyword: "italy", city: { name: "Rome", coordinates: [12.4964, 41.9028] } },
  {
    keyword: "meloni",
    city: { name: "Rome", coordinates: [12.4964, 41.9028] },
  },
  {
    keyword: "spain",
    city: { name: "Madrid", coordinates: [-3.7038, 40.4168] },
  },
  {
    keyword: "portugal",
    city: { name: "Lisbon", coordinates: [-9.1393, 38.7223] },
  },
  {
    keyword: "netherlands",
    city: { name: "Amsterdam", coordinates: [4.9041, 52.3676] },
  },
  {
    keyword: "dutch",
    city: { name: "Amsterdam", coordinates: [4.9041, 52.3676] },
  },
  {
    keyword: "belgium",
    city: { name: "Brussels", coordinates: [4.3517, 50.8503] },
  },
  {
    keyword: "switzerland",
    city: { name: "Zurich", coordinates: [8.5417, 47.3769] },
  },
  {
    keyword: "swiss",
    city: { name: "Zurich", coordinates: [8.5417, 47.3769] },
  },
  {
    keyword: "austria",
    city: { name: "Vienna", coordinates: [16.3738, 48.2082] },
  },
  {
    keyword: "poland",
    city: { name: "Warsaw", coordinates: [21.0122, 52.2297] },
  },
  {
    keyword: "sweden",
    city: { name: "Stockholm", coordinates: [18.0686, 59.3293] },
  },
  {
    keyword: "norway",
    city: { name: "Oslo", coordinates: [10.7522, 59.9139] },
  },
  {
    keyword: "finland",
    city: { name: "Helsinki", coordinates: [24.9384, 60.1699] },
  },
  {
    keyword: "denmark",
    city: { name: "Copenhagen", coordinates: [12.5683, 55.6761] },
  },
  {
    keyword: "greece",
    city: { name: "Athens", coordinates: [23.7275, 37.9838] },
  },
  {
    keyword: "ireland",
    city: { name: "Dublin", coordinates: [-6.2603, 53.3498] },
  },
  {
    keyword: "czech",
    city: { name: "Prague", coordinates: [14.4378, 50.0755] },
  },
  {
    keyword: "hungary",
    city: { name: "Budapest", coordinates: [19.0402, 47.4979] },
  },
  {
    keyword: "orban",
    city: { name: "Budapest", coordinates: [19.0402, 47.4979] },
  },
  {
    keyword: "romania",
    city: { name: "Bucharest", coordinates: [26.1025, 44.4268] },
  },
  {
    keyword: "eu ",
    city: { name: "Brussels", coordinates: [4.3517, 50.8503] },
  },
  {
    keyword: "european",
    city: { name: "Brussels", coordinates: [4.3517, 50.8503] },
  },
  {
    keyword: "nato",
    city: { name: "Brussels", coordinates: [4.3517, 50.8503] },
  },

  // === Восточная Европа и СНГ ===
  {
    keyword: "russia",
    city: { name: "Moscow", coordinates: [37.6173, 55.7558] },
  },
  {
    keyword: "putin",
    city: { name: "Moscow", coordinates: [37.6173, 55.7558] },
  },
  {
    keyword: "kremlin",
    city: { name: "Moscow", coordinates: [37.6173, 55.7558] },
  },
  {
    keyword: "ukraine",
    city: { name: "Kyiv", coordinates: [30.5234, 50.4501] },
  },
  {
    keyword: "zelensky",
    city: { name: "Kyiv", coordinates: [30.5234, 50.4501] },
  },
  {
    keyword: "belarus",
    city: { name: "Minsk", coordinates: [27.5615, 53.9006] },
  },
  {
    keyword: "kazakhstan",
    city: { name: "Astana", coordinates: [71.4704, 51.1605] },
  },
  {
    keyword: "georgia",
    city: { name: "Tbilisi", coordinates: [44.827, 41.7151] },
  },
  {
    keyword: "armenia",
    city: { name: "Yerevan", coordinates: [44.5126, 40.1792] },
  },
  {
    keyword: "azerbaijan",
    city: { name: "Baku", coordinates: [49.8671, 40.4093] },
  },

  // === Азия ===
  {
    keyword: "china",
    city: { name: "Beijing", coordinates: [116.4074, 39.9042] },
  },
  {
    keyword: "chinese",
    city: { name: "Beijing", coordinates: [116.4074, 39.9042] },
  },
  {
    keyword: "xi jinping",
    city: { name: "Beijing", coordinates: [116.4074, 39.9042] },
  },
  {
    keyword: "shanghai",
    city: { name: "Shanghai", coordinates: [121.4737, 31.2304] },
  },
  {
    keyword: "hong kong",
    city: { name: "Hong Kong", coordinates: [114.1694, 22.3193] },
  },
  {
    keyword: "taiwan",
    city: { name: "Taipei", coordinates: [121.5654, 25.033] },
  },
  {
    keyword: "japan",
    city: { name: "Tokyo", coordinates: [139.6917, 35.6895] },
  },
  {
    keyword: "japanese",
    city: { name: "Tokyo", coordinates: [139.6917, 35.6895] },
  },
  {
    keyword: "korea",
    city: { name: "Seoul", coordinates: [126.978, 37.5665] },
  },
  {
    keyword: "korean",
    city: { name: "Seoul", coordinates: [126.978, 37.5665] },
  },
  {
    keyword: "north korea",
    city: { name: "Pyongyang", coordinates: [125.7625, 39.0392] },
  },
  {
    keyword: "kim jong",
    city: { name: "Pyongyang", coordinates: [125.7625, 39.0392] },
  },
  {
    keyword: "india",
    city: { name: "New Delhi", coordinates: [77.209, 28.6139] },
  },
  {
    keyword: "modi",
    city: { name: "New Delhi", coordinates: [77.209, 28.6139] },
  },
  {
    keyword: "mumbai",
    city: { name: "Mumbai", coordinates: [72.8777, 19.076] },
  },
  {
    keyword: "pakistan",
    city: { name: "Islamabad", coordinates: [73.0479, 33.6844] },
  },
  {
    keyword: "bangladesh",
    city: { name: "Dhaka", coordinates: [90.4125, 23.8103] },
  },
  {
    keyword: "indonesia",
    city: { name: "Jakarta", coordinates: [106.8456, -6.2088] },
  },
  {
    keyword: "malaysia",
    city: { name: "Kuala Lumpur", coordinates: [101.6869, 3.139] },
  },
  {
    keyword: "singapore",
    city: { name: "Singapore", coordinates: [103.8198, 1.3521] },
  },
  {
    keyword: "thailand",
    city: { name: "Bangkok", coordinates: [100.5018, 13.7563] },
  },
  {
    keyword: "vietnam",
    city: { name: "Hanoi", coordinates: [105.8342, 21.0278] },
  },
  {
    keyword: "philippines",
    city: { name: "Manila", coordinates: [120.9842, 14.5995] },
  },

  // === Ближний Восток ===
  {
    keyword: "israel",
    city: { name: "Tel Aviv", coordinates: [34.7818, 32.0853] },
  },
  {
    keyword: "netanyahu",
    city: { name: "Tel Aviv", coordinates: [34.7818, 32.0853] },
  },
  {
    keyword: "palestine",
    city: { name: "Gaza", coordinates: [34.4668, 31.5017] },
  },
  { keyword: "gaza", city: { name: "Gaza", coordinates: [34.4668, 31.5017] } },
  { keyword: "hamas", city: { name: "Gaza", coordinates: [34.4668, 31.5017] } },
  {
    keyword: "iran",
    city: { name: "Tehran", coordinates: [51.3891, 35.6892] },
  },
  {
    keyword: "saudi",
    city: { name: "Riyadh", coordinates: [46.6753, 24.7136] },
  },
  { keyword: "uae", city: { name: "Dubai", coordinates: [55.2708, 25.2048] } },
  {
    keyword: "dubai",
    city: { name: "Dubai", coordinates: [55.2708, 25.2048] },
  },
  { keyword: "qatar", city: { name: "Doha", coordinates: [51.5074, 25.2867] } },
  {
    keyword: "kuwait",
    city: { name: "Kuwait City", coordinates: [47.9783, 29.3759] },
  },
  {
    keyword: "iraq",
    city: { name: "Baghdad", coordinates: [44.3661, 33.3152] },
  },
  {
    keyword: "syria",
    city: { name: "Damascus", coordinates: [36.2765, 33.5138] },
  },
  {
    keyword: "lebanon",
    city: { name: "Beirut", coordinates: [35.5018, 33.8938] },
  },
  {
    keyword: "jordan",
    city: { name: "Amman", coordinates: [35.9106, 31.9454] },
  },
  {
    keyword: "turkey",
    city: { name: "Istanbul", coordinates: [28.9784, 41.0082] },
  },
  {
    keyword: "erdogan",
    city: { name: "Ankara", coordinates: [32.8597, 39.9334] },
  },
  {
    keyword: "turkish",
    city: { name: "Istanbul", coordinates: [28.9784, 41.0082] },
  },

  // === Африка ===
  {
    keyword: "africa",
    city: { name: "Johannesburg", coordinates: [28.0473, -26.2041] },
  },
  {
    keyword: "south africa",
    city: { name: "Cape Town", coordinates: [18.4241, -33.9249] },
  },
  {
    keyword: "nigeria",
    city: { name: "Lagos", coordinates: [3.3792, 6.5244] },
  },
  {
    keyword: "egypt",
    city: { name: "Cairo", coordinates: [31.2357, 30.0444] },
  },
  {
    keyword: "kenya",
    city: { name: "Nairobi", coordinates: [36.8219, -1.2921] },
  },
  {
    keyword: "ethiopia",
    city: { name: "Addis Ababa", coordinates: [38.7578, 9.0192] },
  },
  {
    keyword: "morocco",
    city: { name: "Casablanca", coordinates: [-7.5898, 33.5731] },
  },
  {
    keyword: "algeria",
    city: { name: "Algiers", coordinates: [3.0588, 36.7538] },
  },
  {
    keyword: "tunisia",
    city: { name: "Tunis", coordinates: [10.1658, 36.8065] },
  },
  {
    keyword: "libya",
    city: { name: "Tripoli", coordinates: [13.1875, 32.8872] },
  },
  {
    keyword: "sudan",
    city: { name: "Khartoum", coordinates: [32.5599, 15.5007] },
  },
  { keyword: "ghana", city: { name: "Accra", coordinates: [-0.187, 5.6037] } },

  // === Латинская Америка ===
  {
    keyword: "brazil",
    city: { name: "Brasília", coordinates: [-47.8825, -15.7942] },
  },
  {
    keyword: "lula",
    city: { name: "Brasília", coordinates: [-47.8825, -15.7942] },
  },
  {
    keyword: "bolsonaro",
    city: { name: "Rio de Janeiro", coordinates: [-43.1729, -22.9068] },
  },
  {
    keyword: "mexico",
    city: { name: "Mexico City", coordinates: [-99.1332, 19.4326] },
  },
  {
    keyword: "mexican",
    city: { name: "Mexico City", coordinates: [-99.1332, 19.4326] },
  },
  {
    keyword: "argentina",
    city: { name: "Buenos Aires", coordinates: [-58.3816, -34.6037] },
  },
  {
    keyword: "milei",
    city: { name: "Buenos Aires", coordinates: [-58.3816, -34.6037] },
  },
  {
    keyword: "colombia",
    city: { name: "Bogotá", coordinates: [-74.0721, 4.711] },
  },
  {
    keyword: "venezuela",
    city: { name: "Caracas", coordinates: [-66.9036, 10.4806] },
  },
  {
    keyword: "maduro",
    city: { name: "Caracas", coordinates: [-66.9036, 10.4806] },
  },
  {
    keyword: "chile",
    city: { name: "Santiago", coordinates: [-70.6693, -33.4489] },
  },
  {
    keyword: "peru",
    city: { name: "Lima", coordinates: [-77.0428, -12.0464] },
  },
  {
    keyword: "ecuador",
    city: { name: "Quito", coordinates: [-78.4678, -0.1807] },
  },
  {
    keyword: "cuba",
    city: { name: "Havana", coordinates: [-82.3666, 23.1136] },
  },
  {
    keyword: "puerto rico",
    city: { name: "San Juan", coordinates: [-66.1057, 18.4655] },
  },

  // === Океания ===
  {
    keyword: "australia",
    city: { name: "Sydney", coordinates: [151.2093, -33.8688] },
  },
  {
    keyword: "australian",
    city: { name: "Sydney", coordinates: [151.2093, -33.8688] },
  },
  {
    keyword: "new zealand",
    city: { name: "Auckland", coordinates: [174.7633, -36.8485] },
  },

  // === Канада ===
  {
    keyword: "canada",
    city: { name: "Ottawa", coordinates: [-75.6972, 45.4215] },
  },
  {
    keyword: "canadian",
    city: { name: "Ottawa", coordinates: [-75.6972, 45.4215] },
  },
  {
    keyword: "trudeau",
    city: { name: "Ottawa", coordinates: [-75.6972, 45.4215] },
  },
  {
    keyword: "toronto",
    city: { name: "Toronto", coordinates: [-79.3832, 43.6532] },
  },
  {
    keyword: "vancouver",
    city: { name: "Vancouver", coordinates: [-123.1207, 49.2827] },
  },
  {
    keyword: "quebec",
    city: { name: "Montreal", coordinates: [-73.5673, 45.5017] },
  },

  // === Технологии ===
  {
    keyword: "elon",
    city: { name: "Austin", coordinates: [-97.7431, 30.2672] },
  },
  {
    keyword: "musk",
    city: { name: "Austin", coordinates: [-97.7431, 30.2672] },
  },
  {
    keyword: "tesla",
    city: { name: "Austin", coordinates: [-97.7431, 30.2672] },
  },
  {
    keyword: "spacex",
    city: { name: "Boca Chica", coordinates: [-97.1631, 25.997] },
  },
  {
    keyword: "openai",
    city: { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
  },
  {
    keyword: "chatgpt",
    city: { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
  },
  {
    keyword: "gpt",
    city: { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
  },
  {
    keyword: "anthropic",
    city: { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
  },
  {
    keyword: "google",
    city: { name: "Mountain View", coordinates: [-122.0838, 37.3861] },
  },
  {
    keyword: "alphabet",
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
    keyword: "meta",
    city: { name: "Menlo Park", coordinates: [-122.1817, 37.4529] },
  },
  {
    keyword: "facebook",
    city: { name: "Menlo Park", coordinates: [-122.1817, 37.4529] },
  },
  {
    keyword: "zuckerberg",
    city: { name: "Menlo Park", coordinates: [-122.1817, 37.4529] },
  },
  {
    keyword: "nvidia",
    city: { name: "Santa Clara", coordinates: [-121.9552, 37.3541] },
  },
  {
    keyword: "twitter",
    city: { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
  },
  {
    keyword: "netflix",
    city: { name: "Los Gatos", coordinates: [-121.9624, 37.2358] },
  },
  {
    keyword: "uber",
    city: { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
  },
  {
    keyword: "airbnb",
    city: { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
  },
  {
    keyword: "tiktok",
    city: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  },
  {
    keyword: "bytedance",
    city: { name: "Beijing", coordinates: [116.4074, 39.9042] },
  },
  {
    keyword: "alibaba",
    city: { name: "Hangzhou", coordinates: [120.1551, 30.2741] },
  },
  {
    keyword: "tencent",
    city: { name: "Shenzhen", coordinates: [114.0579, 22.5431] },
  },
  {
    keyword: "huawei",
    city: { name: "Shenzhen", coordinates: [114.0579, 22.5431] },
  },
  {
    keyword: "samsung",
    city: { name: "Seoul", coordinates: [126.978, 37.5665] },
  },
  {
    keyword: "sony",
    city: { name: "Tokyo", coordinates: [139.6917, 35.6895] },
  },
  {
    keyword: "nintendo",
    city: { name: "Kyoto", coordinates: [135.7681, 35.0116] },
  },

  // === Криптовалюта ===
  {
    keyword: "bitcoin",
    city: { name: "Miami", coordinates: [-80.1918, 25.7617] },
  },
  { keyword: "btc", city: { name: "Miami", coordinates: [-80.1918, 25.7617] } },
  { keyword: "ethereum", city: { name: "Zug", coordinates: [8.5156, 47.166] } },
  { keyword: "eth", city: { name: "Zug", coordinates: [8.5156, 47.166] } },
  {
    keyword: "solana",
    city: { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
  },
  {
    keyword: "binance",
    city: { name: "Dubai", coordinates: [55.2708, 25.2048] },
  },
  {
    keyword: "coinbase",
    city: { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
  },
  { keyword: "ftx", city: { name: "Nassau", coordinates: [-77.351, 25.0443] } },
  { keyword: "sbf", city: { name: "Nassau", coordinates: [-77.351, 25.0443] } },
  {
    keyword: "defi",
    city: { name: "Singapore", coordinates: [103.8198, 1.3521] },
  },
  {
    keyword: "nft",
    city: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  },

  // === Спорт ===
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
    keyword: "mlb",
    city: { name: "New York", coordinates: [-74.006, 40.7128] },
  },
  {
    keyword: "nhl",
    city: { name: "New York", coordinates: [-74.006, 40.7128] },
  },
  {
    keyword: "world cup",
    city: { name: "Zurich", coordinates: [8.5417, 47.3769] },
  },
  { keyword: "fifa", city: { name: "Zurich", coordinates: [8.5417, 47.3769] } },
  {
    keyword: "olympics",
    city: { name: "Lausanne", coordinates: [6.6323, 46.5197] },
  },
  {
    keyword: "premier league",
    city: { name: "London", coordinates: [-0.1276, 51.5074] },
  },
  {
    keyword: "champions league",
    city: { name: "Nyon", coordinates: [6.2387, 46.3833] },
  },
  { keyword: "uefa", city: { name: "Nyon", coordinates: [6.2387, 46.3833] } },
  {
    keyword: "la liga",
    city: { name: "Madrid", coordinates: [-3.7038, 40.4168] },
  },
  { keyword: "serie a", city: { name: "Milan", coordinates: [9.19, 45.4642] } },
  {
    keyword: "bundesliga",
    city: { name: "Frankfurt", coordinates: [8.6821, 50.1109] },
  },
  {
    keyword: "ufc",
    city: { name: "Las Vegas", coordinates: [-115.1398, 36.1699] },
  },
  {
    keyword: "boxing",
    city: { name: "Las Vegas", coordinates: [-115.1398, 36.1699] },
  },
  { keyword: "f1", city: { name: "Monaco", coordinates: [7.4167, 43.7333] } },
  {
    keyword: "formula 1",
    city: { name: "Monaco", coordinates: [7.4167, 43.7333] },
  },
  {
    keyword: "tennis",
    city: { name: "London", coordinates: [-0.1276, 51.5074] },
  },
  {
    keyword: "wimbledon",
    city: { name: "London", coordinates: [-0.1276, 51.5074] },
  },
  {
    keyword: "us open",
    city: { name: "New York", coordinates: [-74.006, 40.7128] },
  },
  {
    keyword: "australian open",
    city: { name: "Melbourne", coordinates: [144.9631, -37.8136] },
  },
  {
    keyword: "french open",
    city: { name: "Paris", coordinates: [2.3522, 48.8566] },
  },
  {
    keyword: "roland garros",
    city: { name: "Paris", coordinates: [2.3522, 48.8566] },
  },
  {
    keyword: "golf",
    city: { name: "Augusta", coordinates: [-82.0105, 33.4735] },
  },
  {
    keyword: "pga",
    city: { name: "Ponte Vedra Beach", coordinates: [-81.3856, 30.2394] },
  },
  {
    keyword: "masters",
    city: { name: "Augusta", coordinates: [-82.0105, 33.4735] },
  },

  // === Экономика и финансы ===
  {
    keyword: "fed",
    city: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  },
  {
    keyword: "federal reserve",
    city: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  },
  {
    keyword: "interest rate",
    city: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  },
  {
    keyword: "powell",
    city: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  },
  {
    keyword: "wall street",
    city: { name: "New York", coordinates: [-74.006, 40.7128] },
  },
  {
    keyword: "stock",
    city: { name: "New York", coordinates: [-74.006, 40.7128] },
  },
  {
    keyword: "nasdaq",
    city: { name: "New York", coordinates: [-74.006, 40.7128] },
  },
  {
    keyword: "s&p",
    city: { name: "New York", coordinates: [-74.006, 40.7128] },
  },
  {
    keyword: "dow jones",
    city: { name: "New York", coordinates: [-74.006, 40.7128] },
  },
  {
    keyword: "ecb",
    city: { name: "Frankfurt", coordinates: [8.6821, 50.1109] },
  },
  {
    keyword: "bank of england",
    city: { name: "London", coordinates: [-0.1276, 51.5074] },
  },
  {
    keyword: "imf",
    city: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  },
  {
    keyword: "world bank",
    city: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  },
  {
    keyword: "opec",
    city: { name: "Vienna", coordinates: [16.3738, 48.2082] },
  },
  {
    keyword: "oil",
    city: { name: "Houston", coordinates: [-95.3698, 29.7604] },
  },
  {
    keyword: "gold",
    city: { name: "London", coordinates: [-0.1276, 51.5074] },
  },

  // === Космос ===
  {
    keyword: "nasa",
    city: { name: "Cape Canaveral", coordinates: [-80.6077, 28.3922] },
  },
  {
    keyword: "rocket",
    city: { name: "Cape Canaveral", coordinates: [-80.6077, 28.3922] },
  },
  {
    keyword: "launch",
    city: { name: "Cape Canaveral", coordinates: [-80.6077, 28.3922] },
  },
  {
    keyword: "mars",
    city: { name: "Pasadena", coordinates: [-118.1445, 34.1478] },
  },
  {
    keyword: "moon",
    city: { name: "Houston", coordinates: [-95.3698, 29.7604] },
  },
  {
    keyword: "iss",
    city: { name: "Houston", coordinates: [-95.3698, 29.7604] },
  },
  {
    keyword: "space station",
    city: { name: "Houston", coordinates: [-95.3698, 29.7604] },
  },
  {
    keyword: "starship",
    city: { name: "Boca Chica", coordinates: [-97.1631, 25.997] },
  },
  {
    keyword: "blue origin",
    city: { name: "Kent", coordinates: [-122.2348, 47.3809] },
  },
  {
    keyword: "bezos",
    city: { name: "Seattle", coordinates: [-122.3321, 47.6062] },
  },

  // === Развлечения ===
  {
    keyword: "hollywood",
    city: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  },
  {
    keyword: "oscar",
    city: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  },
  {
    keyword: "academy award",
    city: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  },
  {
    keyword: "grammy",
    city: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  },
  {
    keyword: "emmy",
    city: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  },
  {
    keyword: "golden globe",
    city: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  },
  {
    keyword: "broadway",
    city: { name: "New York", coordinates: [-74.006, 40.7128] },
  },
  {
    keyword: "taylor swift",
    city: { name: "Nashville", coordinates: [-86.7816, 36.1627] },
  },
  {
    keyword: "beyonce",
    city: { name: "Houston", coordinates: [-95.3698, 29.7604] },
  },
  {
    keyword: "drake",
    city: { name: "Toronto", coordinates: [-79.3832, 43.6532] },
  },
  {
    keyword: "disney",
    city: { name: "Burbank", coordinates: [-118.3287, 34.1808] },
  },
  {
    keyword: "marvel",
    city: { name: "Burbank", coordinates: [-118.3287, 34.1808] },
  },
  {
    keyword: "k-pop",
    city: { name: "Seoul", coordinates: [126.978, 37.5665] },
  },
  { keyword: "bts", city: { name: "Seoul", coordinates: [126.978, 37.5665] } },
  {
    keyword: "anime",
    city: { name: "Tokyo", coordinates: [139.6917, 35.6895] },
  },
  {
    keyword: "bollywood",
    city: { name: "Mumbai", coordinates: [72.8777, 19.076] },
  },

  // === Климат и энергетика ===
  {
    keyword: "climate",
    city: { name: "Copenhagen", coordinates: [12.5683, 55.6761] },
  },
  {
    keyword: "cop28",
    city: { name: "Dubai", coordinates: [55.2708, 25.2048] },
  },
  { keyword: "cop29", city: { name: "Baku", coordinates: [49.8671, 40.4093] } },
  {
    keyword: "paris agreement",
    city: { name: "Paris", coordinates: [2.3522, 48.8566] },
  },
  {
    keyword: "carbon",
    city: { name: "Brussels", coordinates: [4.3517, 50.8503] },
  },
  {
    keyword: "renewable",
    city: { name: "Copenhagen", coordinates: [12.5683, 55.6761] },
  },
  {
    keyword: "solar",
    city: { name: "Phoenix", coordinates: [-112.074, 33.4484] },
  },
  {
    keyword: "nuclear",
    city: { name: "Vienna", coordinates: [16.3738, 48.2082] },
  },
  {
    keyword: "ev ",
    city: { name: "Shanghai", coordinates: [121.4737, 31.2304] },
  },
  {
    keyword: "electric vehicle",
    city: { name: "Shanghai", coordinates: [121.4737, 31.2304] },
  },

  // === Здоровье ===
  {
    keyword: "covid",
    city: { name: "Geneva", coordinates: [6.1432, 46.2044] },
  },
  { keyword: "who", city: { name: "Geneva", coordinates: [6.1432, 46.2044] } },
  {
    keyword: "vaccine",
    city: { name: "Boston", coordinates: [-71.0589, 42.3601] },
  },
  {
    keyword: "pfizer",
    city: { name: "New York", coordinates: [-74.006, 40.7128] },
  },
  {
    keyword: "moderna",
    city: { name: "Cambridge", coordinates: [-71.1097, 42.3736] },
  },
  {
    keyword: "fda",
    city: { name: "Silver Spring", coordinates: [-77.019, 38.9907] },
  },
];

function getCoordinatesForMarket(
  market: Market,
  index: number = 0,
): [number, number] {
  const searchText = `${market.question} ${market.description || ""} ${
    market.events?.[0]?.title || ""
  }`.toLowerCase();
  const category = market.category?.toLowerCase() || "";

  for (const item of KEYWORD_CITY_MAP) {
    if (searchText.includes(item.keyword)) {
      const offset = getOffset(market.id, index);
      return [
        item.city.coordinates[0] + offset[0],
        item.city.coordinates[1] + offset[1],
      ];
    }
  }

  const cityData = CATEGORY_CITY_MAP[category] || CATEGORY_CITY_MAP["default"];
  const offset = getOffset(market.id, index);

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
  const now = new Date();

  console.log(
    "🔍 Converting markets, first market fields:",
    markets[0]
      ? {
          active: markets[0].active,
          closed: markets[0].closed,
          archived: markets[0].archived,
          endDate: markets[0].endDate,
          question: markets[0].question?.substring(0, 50),
        }
      : "no markets",
  );

  return markets
    .filter((market) => {
      const hasQuestion = !!market.question;
      const isActive = market.active === true;
      const isNotClosed = market.closed !== true;
      const isNotArchived = market.archived !== true;

      // Проверяем, что endDate в будущем или не установлен
      let isNotExpired = true;
      if (market.endDate) {
        const endDate = new Date(market.endDate);
        isNotExpired = endDate > now;
      }

      return (
        hasQuestion && isActive && isNotClosed && isNotArchived && isNotExpired
      );
    })
    .map((market, index) => {
      const coordinates = getCoordinatesForMarket(market, index);
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
        eventSlug: market.events?.[0]?.slug,
        active: market.active,
        volume24hr: market.volume24hr || 0,
        volume1wk: market.volume1wk || 0,
        volume1mo: market.volume1mo || 0,
        endDate: market.endDate || "",
        type: "market" as MarkerType,
      };
    });
}

export function convertEventsToMapMarkers(
  events: PolymarketEvent[],
): MapMarker[] {
  return events
    .filter((event) => event.active && !event.closed)
    .map((event, index) => {
      const searchText = `${event.title} ${event.description || ""} ${
        event.subtitle || ""
      }`.toLowerCase();
      const category = event.category?.toLowerCase() || "default";

      let coordinates: [number, number] | null = null;
      for (const item of KEYWORD_CITY_MAP) {
        if (searchText.includes(item.keyword)) {
          const offset = getOffset(event.id, index);
          coordinates = [
            item.city.coordinates[0] + offset[0],
            item.city.coordinates[1] + offset[1],
          ];
          break;
        }
      }

      if (!coordinates) {
        const cityData =
          CATEGORY_CITY_MAP[category] || CATEGORY_CITY_MAP["default"];
        const offset = getOffset(event.id, index);
        coordinates = [
          cityData.coordinates[0] + offset[0],
          cityData.coordinates[1] + offset[1],
        ];
      }

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
        coordinates,
        eventTitle: event.title,
        slug: event.slug,
        active: event.active,
        volume24hr: event.volume24hr || 0,
        volume1wk: event.volume1wk || 0,
        volume1mo: event.volume1mo || 0,
        endDate: event.endDate || "",
        type: "market" as MarkerType,
      };
    });
}
function parseMarketOutcomes(outcomes: string): string[] {
  try {
    return JSON.parse(outcomes);
  } catch {
    return outcomes.split(",").map((s) => s.trim());
  }
}

function parseMarketPrices(prices: string): number[] {
  try {
    return JSON.parse(prices).map(Number);
  } catch {
    return prices.split(",").map((s) => parseFloat(s.trim()) || 0);
  }
}

export function convertEventsWithMarketsToMapMarkers(
  events: PolymarketEvent[],
): MapMarker[] {
  const now = new Date();

  return events
    .filter((event) => {
      const isActive = event.active === true;
      const isNotClosed = event.closed !== true;
      const hasTitle = !!event.title;

      let isNotExpired = true;
      if (event.endDate) {
        const endDate = new Date(event.endDate);
        isNotExpired = endDate > now;
      }

      return hasTitle && isActive && isNotClosed && isNotExpired;
    })
    .map((event, index) => {
      const searchText = `${event.title} ${event.description || ""} ${
        event.subtitle || ""
      }`.toLowerCase();
      const category = event.category?.toLowerCase() || "default";

      let coordinates: [number, number] | null = null;
      for (const item of KEYWORD_CITY_MAP) {
        if (searchText.includes(item.keyword)) {
          const offset = getOffset(event.id, index);
          coordinates = [
            item.city.coordinates[0] + offset[0],
            item.city.coordinates[1] + offset[1],
          ];
          break;
        }
      }

      if (!coordinates) {
        const cityData =
          CATEGORY_CITY_MAP[category] || CATEGORY_CITY_MAP["default"];
        const offset = getOffset(event.id, index);
        coordinates = [
          cityData.coordinates[0] + offset[0],
          cityData.coordinates[1] + offset[1],
        ];
      }

      const markets = event.markets || [];
      const hasMultipleMarkets = markets.length > 1;
      const hasMarketsWithYesNo = markets.length === 1;

      let eventOutcomes: OutcomeData[] = [];
      let outcomes: string[] = [];
      let outcomePrices: number[] = [];

      if (hasMultipleMarkets) {
        const sortedMarkets = [...markets]
          .filter((m) => m.active && !m.closed)
          .sort((a, b) => {
            const priceA = parseMarketPrices(a.outcomePrices || "[]")[0] || 0;
            const priceB = parseMarketPrices(b.outcomePrices || "[]")[0] || 0;
            return priceB - priceA;
          });

        eventOutcomes = sortedMarkets.map((market) => {
          const prices = parseMarketPrices(market.outcomePrices || "[]");
          const yesPrice = prices[0] || 0;

          const outcomeName =
            market.groupItemTitle ||
            market.question?.replace(/^Will\s+/i, "").replace(/\?$/, "") ||
            "Unknown";

          return {
            name: outcomeName,
            percentage: Math.round(yesPrice * 100),
            price: yesPrice,
            volume: market.volumeNum || parseFloat(market.volume) || 0,
            marketSlug: market.slug,
          };
        });

        outcomes = eventOutcomes.map((o) => o.name);
        outcomePrices = eventOutcomes.map((o) => o.price);
      } else if (hasMarketsWithYesNo) {
        const market = markets[0];
        outcomes = parseMarketOutcomes(market.outcomes || '["Yes", "No"]');
        outcomePrices = parseMarketPrices(market.outcomePrices || "[]");

        eventOutcomes = outcomes.map((name, idx) => ({
          name,
          percentage: Math.round((outcomePrices[idx] || 0) * 100),
          price: outcomePrices[idx] || 0,
        }));
      }

      return {
        id: event.id,
        title: event.title,
        description: event.description || event.subtitle || "",
        category: event.category || "general",
        volume: event.volume || 0,
        liquidity: event.liquidity || 0,
        image: event.imageOptimized?.imageUrlOptimized || event.image || "",
        outcomes,
        outcomePrices,
        eventOutcomes,
        isMultiMarket: hasMultipleMarkets,
        coordinates,
        eventTitle: event.title,
        slug: event.slug,
        eventSlug: event.slug,
        active: event.active,
        volume24hr: event.volume24hr || 0,
        volume1wk: event.volume1wk || 0,
        volume1mo: event.volume1mo || 0,
        endDate: event.endDate || "",
        type: "market" as MarkerType,
      };
    });
}

// Multiple cities per country for better distribution
const COUNTRY_CITIES: Record<
  string,
  Array<{ name: string; coordinates: [number, number] }>
> = {
  "United States": [
    { name: "New York", coordinates: [-74.006, 40.7128] },
    { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
    { name: "Chicago", coordinates: [-87.6298, 41.8781] },
    { name: "Houston", coordinates: [-95.3698, 29.7604] },
    { name: "Miami", coordinates: [-80.1918, 25.7617] },
    { name: "Seattle", coordinates: [-122.3321, 47.6062] },
    { name: "Denver", coordinates: [-104.9903, 39.7392] },
    { name: "Atlanta", coordinates: [-84.388, 33.749] },
    { name: "Boston", coordinates: [-71.0589, 42.3601] },
    { name: "Phoenix", coordinates: [-112.074, 33.4484] },
  ],
  "United Kingdom": [
    { name: "London", coordinates: [-0.1276, 51.5074] },
    { name: "Manchester", coordinates: [-2.2426, 53.4808] },
    { name: "Birmingham", coordinates: [-1.8904, 52.4862] },
    { name: "Edinburgh", coordinates: [-3.1883, 55.9533] },
    { name: "Glasgow", coordinates: [-4.2518, 55.8642] },
  ],
  UK: [
    { name: "London", coordinates: [-0.1276, 51.5074] },
    { name: "Manchester", coordinates: [-2.2426, 53.4808] },
    { name: "Birmingham", coordinates: [-1.8904, 52.4862] },
    { name: "Edinburgh", coordinates: [-3.1883, 55.9533] },
  ],
  Russia: [
    { name: "Moscow", coordinates: [37.6173, 55.7558] },
    { name: "St Petersburg", coordinates: [30.3351, 59.9343] },
    { name: "Novosibirsk", coordinates: [82.9346, 55.0084] },
    { name: "Yekaterinburg", coordinates: [60.6122, 56.8389] },
    { name: "Vladivostok", coordinates: [131.8869, 43.1155] },
  ],
  China: [
    { name: "Beijing", coordinates: [116.4074, 39.9042] },
    { name: "Shanghai", coordinates: [121.4737, 31.2304] },
  ],
  Germany: [
    { name: "Berlin", coordinates: [13.405, 52.52] },
    { name: "Munich", coordinates: [11.582, 48.1351] },
    { name: "Hamburg", coordinates: [9.9937, 53.5511] },
    { name: "Frankfurt", coordinates: [8.6821, 50.1109] },
    { name: "Cologne", coordinates: [6.9603, 50.9375] },
  ],
  France: [
    { name: "Paris", coordinates: [2.3522, 48.8566] },
    { name: "Lyon", coordinates: [4.8357, 45.764] },
    { name: "Marseille", coordinates: [5.3698, 43.2965] },
    { name: "Toulouse", coordinates: [1.4442, 43.6047] },
    { name: "Nice", coordinates: [7.262, 43.7102] },
  ],
  Japan: [
    { name: "Tokyo", coordinates: [139.6917, 35.6895] },
    { name: "Osaka", coordinates: [135.5023, 34.6937] },
    { name: "Nagoya", coordinates: [136.9066, 35.1815] },
    { name: "Sapporo", coordinates: [141.3545, 43.0618] },
    { name: "Fukuoka", coordinates: [130.4017, 33.5904] },
  ],
  India: [
    { name: "New Delhi", coordinates: [77.209, 28.6139] },
    { name: "Mumbai", coordinates: [72.8777, 19.076] },
    { name: "Bangalore", coordinates: [77.5946, 12.9716] },
    { name: "Chennai", coordinates: [80.2707, 13.0827] },
    { name: "Kolkata", coordinates: [88.3639, 22.5726] },
    { name: "Hyderabad", coordinates: [78.4867, 17.385] },
  ],
  Brazil: [
    { name: "Sao Paulo", coordinates: [-46.6333, -23.5505] },
    { name: "Rio de Janeiro", coordinates: [-43.1729, -22.9068] },
    { name: "Brasilia", coordinates: [-47.8825, -15.7942] },
    { name: "Salvador", coordinates: [-38.5016, -12.9714] },
    { name: "Fortaleza", coordinates: [-38.5267, -3.7172] },
  ],
  Canada: [
    { name: "Toronto", coordinates: [-79.3832, 43.6532] },
    { name: "Vancouver", coordinates: [-123.1207, 49.2827] },
    { name: "Montreal", coordinates: [-73.5673, 45.5017] },
    { name: "Calgary", coordinates: [-114.0719, 51.0447] },
    { name: "Ottawa", coordinates: [-75.6972, 45.4215] },
  ],
  Australia: [
    { name: "Sydney", coordinates: [151.2093, -33.8688] },
    { name: "Melbourne", coordinates: [144.9631, -37.8136] },
    { name: "Brisbane", coordinates: [153.0251, -27.4698] },
    { name: "Perth", coordinates: [115.8605, -31.9505] },
    { name: "Adelaide", coordinates: [138.6007, -34.9285] },
  ],
  Italy: [
    { name: "Rome", coordinates: [12.4964, 41.9028] },
    { name: "Milan", coordinates: [9.19, 45.4642] },
    { name: "Naples", coordinates: [14.2681, 40.8518] },
    { name: "Turin", coordinates: [7.6869, 45.0703] },
    { name: "Florence", coordinates: [11.2558, 43.7696] },
  ],
  Spain: [
    { name: "Madrid", coordinates: [-3.7038, 40.4168] },
    { name: "Barcelona", coordinates: [2.1734, 41.3851] },
    { name: "Valencia", coordinates: [-0.3763, 39.4699] },
    { name: "Seville", coordinates: [-5.9845, 37.3891] },
    { name: "Bilbao", coordinates: [-2.9253, 43.263] },
  ],
  Mexico: [
    { name: "Mexico City", coordinates: [-99.1332, 19.4326] },
    { name: "Guadalajara", coordinates: [-103.3496, 20.6597] },
    { name: "Monterrey", coordinates: [-100.3161, 25.6866] },
    { name: "Cancun", coordinates: [-86.8515, 21.1619] },
    { name: "Tijuana", coordinates: [-117.0382, 32.5149] },
  ],
  "South Korea": [
    { name: "Seoul", coordinates: [126.978, 37.5665] },
    { name: "Busan", coordinates: [129.0756, 35.1796] },
    { name: "Incheon", coordinates: [126.7052, 37.4563] },
    { name: "Daegu", coordinates: [128.6014, 35.8714] },
  ],
  Netherlands: [
    { name: "Amsterdam", coordinates: [4.9041, 52.3676] },
    { name: "Rotterdam", coordinates: [4.4777, 51.9244] },
    { name: "The Hague", coordinates: [4.3007, 52.0705] },
  ],
  Turkey: [
    { name: "Istanbul", coordinates: [28.9784, 41.0082] },
    { name: "Ankara", coordinates: [32.8597, 39.9334] },
    { name: "Izmir", coordinates: [27.1428, 38.4237] },
    { name: "Antalya", coordinates: [30.7133, 36.8969] },
  ],
  Switzerland: [
    { name: "Zurich", coordinates: [8.5417, 47.3769] },
    { name: "Geneva", coordinates: [6.1432, 46.2044] },
    { name: "Bern", coordinates: [7.4474, 46.948] },
  ],
  Poland: [
    { name: "Warsaw", coordinates: [21.0122, 52.2297] },
    { name: "Krakow", coordinates: [19.945, 50.0647] },
    { name: "Gdansk", coordinates: [18.6466, 54.352] },
    { name: "Wroclaw", coordinates: [17.0385, 51.1079] },
  ],
  Belgium: [{ name: "Brussels", coordinates: [4.3517, 50.8503] }],
  Sweden: [
    { name: "Stockholm", coordinates: [18.0686, 59.3293] },
    { name: "Gothenburg", coordinates: [11.9746, 57.7089] },
    { name: "Malmo", coordinates: [13.0038, 55.6049] },
  ],
  Argentina: [
    { name: "Buenos Aires", coordinates: [-58.3816, -34.6037] },
    { name: "Cordoba", coordinates: [-64.1888, -31.4201] },
    { name: "Mendoza", coordinates: [-68.8272, -32.8908] },
  ],
  Austria: [
    { name: "Vienna", coordinates: [16.3738, 48.2082] },
    { name: "Salzburg", coordinates: [13.055, 47.8095] },
  ],
  Norway: [
    { name: "Oslo", coordinates: [10.7522, 59.9139] },
    { name: "Bergen", coordinates: [5.3221, 60.393] },
  ],
  "United Arab Emirates": [
    { name: "Dubai", coordinates: [55.2708, 25.2048] },
    { name: "Abu Dhabi", coordinates: [54.3773, 24.4539] },
  ],
  Israel: [
    { name: "Tel Aviv", coordinates: [34.7818, 32.0853] },
    { name: "Jerusalem", coordinates: [35.2137, 31.7683] },
  ],
  Ireland: [
    { name: "Dublin", coordinates: [-6.2603, 53.3498] },
    { name: "Cork", coordinates: [-8.4863, 51.8969] },
  ],
  Denmark: [{ name: "Copenhagen", coordinates: [12.5683, 55.6761] }],
  Singapore: [{ name: "Singapore", coordinates: [103.8198, 1.3521] }],
  "Hong Kong": [{ name: "Hong Kong", coordinates: [114.1694, 22.3193] }],
  "Saudi Arabia": [
    { name: "Riyadh", coordinates: [46.6753, 24.7136] },
    { name: "Jeddah", coordinates: [39.1925, 21.4858] },
  ],
  Malaysia: [
    { name: "Kuala Lumpur", coordinates: [101.6869, 3.139] },
    { name: "Penang", coordinates: [100.3288, 5.4141] },
  ],
  "South Africa": [
    { name: "Johannesburg", coordinates: [28.0473, -26.2041] },
    { name: "Cape Town", coordinates: [18.4241, -33.9249] },
    { name: "Durban", coordinates: [31.0218, -29.8587] },
  ],
  Thailand: [
    { name: "Bangkok", coordinates: [100.5018, 13.7563] },
    { name: "Chiang Mai", coordinates: [98.9853, 18.7883] },
    { name: "Phuket", coordinates: [98.3923, 7.8804] },
  ],
  Indonesia: [
    { name: "Jakarta", coordinates: [106.8456, -6.2088] },
    { name: "Bali", coordinates: [115.1889, -8.4095] },
    { name: "Surabaya", coordinates: [112.7508, -7.2575] },
  ],
  Egypt: [
    { name: "Cairo", coordinates: [31.2357, 30.0444] },
    { name: "Alexandria", coordinates: [29.9187, 31.2001] },
  ],
  Philippines: [
    { name: "Manila", coordinates: [120.9842, 14.5995] },
    { name: "Cebu", coordinates: [123.8854, 10.3157] },
  ],
  Finland: [
    { name: "Helsinki", coordinates: [24.9384, 60.1699] },
    { name: "Tampere", coordinates: [23.7871, 61.4978] },
  ],
  Chile: [
    { name: "Santiago", coordinates: [-70.6693, -33.4489] },
    { name: "Valparaiso", coordinates: [-71.6273, -33.0458] },
  ],
  Portugal: [
    { name: "Lisbon", coordinates: [-9.1393, 38.7223] },
    { name: "Porto", coordinates: [-8.6291, 41.1579] },
  ],
  Vietnam: [
    { name: "Hanoi", coordinates: [105.8342, 21.0278] },
    { name: "Ho Chi Minh City", coordinates: [106.6297, 10.8231] },
    { name: "Da Nang", coordinates: [108.2022, 16.0544] },
  ],
  Greece: [
    { name: "Athens", coordinates: [23.7275, 37.9838] },
    { name: "Thessaloniki", coordinates: [22.9444, 40.6401] },
  ],
  Czechia: [
    { name: "Prague", coordinates: [14.4378, 50.0755] },
    { name: "Brno", coordinates: [16.6068, 49.1951] },
  ],
  "Czech Republic": [{ name: "Prague", coordinates: [14.4378, 50.0755] }],
  Romania: [
    { name: "Bucharest", coordinates: [26.1025, 44.4268] },
    { name: "Cluj-Napoca", coordinates: [23.5906, 46.7712] },
  ],
  "New Zealand": [
    { name: "Auckland", coordinates: [174.7633, -36.8485] },
    { name: "Wellington", coordinates: [174.7762, -41.2865] },
  ],
  Iraq: [
    { name: "Baghdad", coordinates: [44.3661, 33.3152] },
    { name: "Erbil", coordinates: [44.0088, 36.1912] },
  ],
  Algeria: [{ name: "Algiers", coordinates: [3.0588, 36.7538] }],
  Qatar: [{ name: "Doha", coordinates: [51.5074, 25.2867] }],
  Kazakhstan: [
    { name: "Astana", coordinates: [71.4704, 51.1605] },
    { name: "Almaty", coordinates: [76.9286, 43.2551] },
  ],
  Hungary: [{ name: "Budapest", coordinates: [19.0402, 47.4979] }],
  Kuwait: [{ name: "Kuwait City", coordinates: [47.9783, 29.3759] }],
  Ukraine: [
    { name: "Kyiv", coordinates: [30.5234, 50.4501] },
    { name: "Lviv", coordinates: [24.0297, 49.8397] },
    { name: "Odesa", coordinates: [30.7233, 46.4825] },
  ],
  Morocco: [
    { name: "Casablanca", coordinates: [-7.5898, 33.5731] },
    { name: "Marrakech", coordinates: [-7.9811, 31.6295] },
  ],
  Ecuador: [
    { name: "Quito", coordinates: [-78.4678, -0.1807] },
    { name: "Guayaquil", coordinates: [-79.9224, -2.1894] },
  ],
  "Puerto Rico": [{ name: "San Juan", coordinates: [-66.1057, 18.4655] }],
  Colombia: [
    { name: "Bogota", coordinates: [-74.0721, 4.711] },
    { name: "Medellin", coordinates: [-75.5636, 6.2476] },
  ],
  Pakistan: [
    { name: "Islamabad", coordinates: [73.0479, 33.6844] },
    { name: "Karachi", coordinates: [67.0011, 24.8607] },
    { name: "Lahore", coordinates: [74.3587, 31.5204] },
  ],
  Peru: [
    { name: "Lima", coordinates: [-77.0428, -12.0464] },
    { name: "Cusco", coordinates: [-71.9675, -13.532] },
  ],
  Nigeria: [
    { name: "Lagos", coordinates: [3.3792, 6.5244] },
    { name: "Abuja", coordinates: [7.4951, 9.0765] },
  ],
  Bangladesh: [
    { name: "Dhaka", coordinates: [90.4125, 23.8103] },
    { name: "Chittagong", coordinates: [91.8349, 22.3569] },
  ],
  Iran: [
    { name: "Tehran", coordinates: [51.3891, 35.6892] },
    { name: "Isfahan", coordinates: [51.6675, 32.6546] },
  ],
  Taiwan: [
    { name: "Taipei", coordinates: [121.5654, 25.033] },
    { name: "Kaohsiung", coordinates: [120.3014, 22.6273] },
  ],
  Venezuela: [
    { name: "Caracas", coordinates: [-66.9036, 10.4806] },
    { name: "Maracaibo", coordinates: [-71.6125, 10.6544] },
  ],
};

// Country index tracker to cycle through cities
const countryIndexTracker: Record<string, number> = {};

function getCountryCoordinates(
  sourcecountry: string,
  articleId: string,
  index: number,
): [number, number] {
  const cities = COUNTRY_CITIES[sourcecountry];
  const offset = getOffset(articleId, index);

  if (cities && cities.length > 0) {
    // Get the current index for this country and increment it
    const currentIndex = countryIndexTracker[sourcecountry] || 0;
    countryIndexTracker[sourcecountry] = (currentIndex + 1) % cities.length;

    // Select city based on rotation
    const city = cities[currentIndex % cities.length];

    // Add larger offset for better spread within city area
    const spreadFactor = 0.5 + (hashCode(articleId) % 100) / 100;
    return [
      city.coordinates[0] + offset[0] * spreadFactor,
      city.coordinates[1] + offset[1] * spreadFactor,
    ];
  }

  // Default to random city in US if country not found
  const defaultCities = COUNTRY_CITIES["United States"];
  const cityIndex = hashCode(articleId) % defaultCities.length;
  const city = defaultCities[cityIndex];
  return [city.coordinates[0] + offset[0], city.coordinates[1] + offset[1]];
}

// Extract location from news title using keywords
function getLocationFromTitle(
  title: string,
  articleId: string,
  index: number,
): [number, number] | null {
  const lowerTitle = title.toLowerCase();
  const offset = getOffset(articleId, index);

  // Check keywords in title
  for (const { keyword, city } of KEYWORD_CITY_MAP) {
    if (lowerTitle.includes(keyword.toLowerCase())) {
      return [
        city.coordinates[0] + offset[0] * 0.5,
        city.coordinates[1] + offset[1] * 0.5,
      ];
    }
  }

  return null;
}

// Get coordinates for news based on content, not source
function getNewsCoordinates(
  title: string,
  sourcecountry: string,
  articleId: string,
  index: number,
): [number, number] {
  // 1. First try to extract location from title
  const titleLocation = getLocationFromTitle(title, articleId, index);
  if (titleLocation) {
    return titleLocation;
  }

  // 2. Fallback to source country with city distribution
  return getCountryCoordinates(sourcecountry, articleId, index);
}

export function convertGdeltArticlesToMapMarkers(
  articles: GdeltArticle[],
): MapMarker[] {
  // Reset country index tracker for fresh distribution
  Object.keys(countryIndexTracker).forEach((key) => {
    countryIndexTracker[key] = 0;
  });

  return articles.map((article, index) => {
    // Get coordinates based on news CONTENT, not source
    const coordinates = getNewsCoordinates(
      article.title,
      article.sourcecountry,
      article.url,
      index,
    );

    return {
      id: `gdelt-${index}-${hashCode(article.url)}`,
      title: article.title,
      description: "",
      category: "news",
      volume: 0,
      liquidity: 0,
      image: article.socialimage || "",
      outcomes: [],
      outcomePrices: [],
      coordinates,
      slug: article.url,
      eventSlug: article.domain,
      active: true,
      volume24hr: 0,
      volume1wk: 0,
      volume1mo: 0,
      endDate: article.seendate,
      type: "news" as MarkerType,
      url: article.url,
      domain: article.domain,
      language: article.language,
      sourcecountry: article.sourcecountry,
      seendate: article.seendate,
    };
  });
}

export function createGeoJSONFromMarkers(
  markers: MapMarker[],
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
        eventOutcomes: marker.eventOutcomes
          ? JSON.stringify(marker.eventOutcomes)
          : undefined,
        isMultiMarket: marker.isMultiMarket,
        eventTitle: marker.eventTitle,
        slug: marker.slug,
        eventSlug: marker.eventSlug,
        volume24hr: marker.volume24hr,
        volume1wk: marker.volume1wk,
        volume1mo: marker.volume1mo,
        endDate: marker.endDate,
        type: marker.type,
        url: marker.url,
        domain: marker.domain,
        language: marker.language,
        sourcecountry: marker.sourcecountry,
        seendate: marker.seendate,
      },
      geometry: {
        type: "Point" as const,
        coordinates: marker.coordinates,
      },
    })),
  };
}
