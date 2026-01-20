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

  relatedNewsId?: string;
  relatedNewsIds?: string[];
  relatedMarketIds?: string[];
  relationScore?: number;
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

interface RegionBounds {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

const CITY_BOUNDS: Record<string, RegionBounds> = {
  // США - восточное побережье (расширенные границы, строго на суше)
  "Washington DC": { minLng: -80.0, maxLng: -75.5, minLat: 36.5, maxLat: 41.0 },
  "New York": { minLng: -77.0, maxLng: -73.5, minLat: 39.5, maxLat: 43.0 },
  Boston: { minLng: -74.0, maxLng: -70.5, minLat: 41.0, maxLat: 44.0 },
  Miami: { minLng: -82.5, maxLng: -80.2, minLat: 25.0, maxLat: 27.0 },
  // Mar-a-Lago (West Palm Beach area) - расширенная зона Флориды
  "Mar-a-Lago": { minLng: -82.5, maxLng: -80.2, minLat: 25.5, maxLat: 28.5 },

  // США - центр и запад (расширенные границы)
  Chicago: { minLng: -91.0, maxLng: -85.0, minLat: 40.0, maxLat: 44.0 },
  Houston: { minLng: -98.0, maxLng: -93.5, minLat: 28.0, maxLat: 32.0 },
  "Los Angeles": { minLng: -120.5, maxLng: -116.5, minLat: 32.5, maxLat: 36.0 },
  "San Francisco": {
    minLng: -124.0,
    maxLng: -120.0,
    minLat: 36.0,
    maxLat: 40.0,
  },
  "Las Vegas": { minLng: -118.0, maxLng: -113.0, minLat: 34.5, maxLat: 38.5 },
  Nashville: { minLng: -90.0, maxLng: -84.0, minLat: 34.5, maxLat: 38.0 },
  Tallahassee: { minLng: -87.0, maxLng: -82.5, minLat: 28.5, maxLat: 32.5 },
  Sacramento: { minLng: -124.0, maxLng: -119.0, minLat: 37.0, maxLat: 41.0 },

  // Европа (расширенные границы)
  London: { minLng: -3.5, maxLng: 2.5, minLat: 50.0, maxLat: 54.0 },
  Paris: { minLng: -1.0, maxLng: 6.0, minLat: 46.0, maxLat: 50.5 },
  Brussels: { minLng: 2.0, maxLng: 8.0, minLat: 49.0, maxLat: 53.0 },
  Madrid: { minLng: -7.0, maxLng: -1.0, minLat: 37.5, maxLat: 43.0 },
  Geneva: { minLng: 4.0, maxLng: 9.5, minLat: 44.5, maxLat: 48.5 },
  Copenhagen: { minLng: 9.0, maxLng: 16.0, minLat: 53.5, maxLat: 58.0 },
  Berlin: { minLng: 10.0, maxLng: 16.0, minLat: 50.5, maxLat: 54.5 },
  Rome: { minLng: 10.5, maxLng: 15.5, minLat: 40.0, maxLat: 44.0 },
  Vienna: { minLng: 13.5, maxLng: 18.5, minLat: 46.0, maxLat: 50.0 },
  Amsterdam: { minLng: 3.5, maxLng: 7.5, minLat: 51.0, maxLat: 54.0 },
  Warsaw: { minLng: 18.5, maxLng: 23.0, minLat: 50.5, maxLat: 54.0 },
  Kyiv: { minLng: 28.0, maxLng: 34.0, minLat: 48.5, maxLat: 52.5 },
  Moscow: { minLng: 34.0, maxLng: 41.0, minLat: 53.5, maxLat: 58.0 },

  // Ближний Восток - расширенные границы, строго на суше
  "Tel Aviv": { minLng: 34.3, maxLng: 36.0, minLat: 31.0, maxLat: 33.5 },
  Jerusalem: { minLng: 34.5, maxLng: 36.5, minLat: 30.5, maxLat: 33.0 },
  Gaza: { minLng: 34.0, maxLng: 35.5, minLat: 30.5, maxLat: 32.5 },
  Beirut: { minLng: 35.0, maxLng: 37.0, minLat: 33.0, maxLat: 35.0 },
  Damascus: { minLng: 35.5, maxLng: 38.0, minLat: 32.5, maxLat: 35.0 },
  Amman: { minLng: 35.0, maxLng: 38.0, minLat: 30.5, maxLat: 33.5 },
  Baghdad: { minLng: 42.5, maxLng: 46.0, minLat: 31.5, maxLat: 35.0 },
  Tehran: { minLng: 49.5, maxLng: 54.0, minLat: 34.0, maxLat: 37.5 },
  Riyadh: { minLng: 44.0, maxLng: 50.0, minLat: 22.0, maxLat: 27.0 },
  Dubai: { minLng: 53.5, maxLng: 57.0, minLat: 23.5, maxLat: 27.0 },
  Cairo: { minLng: 29.5, maxLng: 33.0, minLat: 28.5, maxLat: 32.0 },
  Ankara: { minLng: 30.5, maxLng: 35.0, minLat: 38.0, maxLat: 42.0 },
  Istanbul: { minLng: 27.0, maxLng: 31.0, minLat: 39.5, maxLat: 43.0 },

  // Азия (расширенные границы)
  Tokyo: { minLng: 137.5, maxLng: 141.5, minLat: 34.0, maxLat: 37.5 },
  Singapore: { minLng: 103.0, maxLng: 104.5, minLat: 1.0, maxLat: 2.0 },
  "Hong Kong": { minLng: 113.5, maxLng: 115.0, minLat: 21.8, maxLat: 23.0 },
  Beijing: { minLng: 114.5, maxLng: 118.5, minLat: 38.5, maxLat: 42.0 },
  Shanghai: { minLng: 119.5, maxLng: 123.0, minLat: 29.5, maxLat: 33.0 },
  Seoul: { minLng: 125.5, maxLng: 128.5, minLat: 36.0, maxLat: 39.0 },
  Mumbai: { minLng: 72.0, maxLng: 74.5, minLat: 17.5, maxLat: 21.0 },
  Delhi: { minLng: 75.5, maxLng: 79.0, minLat: 27.0, maxLat: 30.5 },
  Bangkok: { minLng: 99.0, maxLng: 102.0, minLat: 12.5, maxLat: 15.5 },

  // Австралия (расширенные границы)
  Sydney: { minLng: 149.5, maxLng: 152.5, minLat: -35.5, maxLat: -32.0 },
  Melbourne: { minLng: 143.5, maxLng: 147.0, minLat: -39.5, maxLat: -36.0 },

  // Южная Америка (расширенные границы)
  "São Paulo": { minLng: -48.5, maxLng: -44.5, minLat: -25.5, maxLat: -21.5 },
  "Buenos Aires": {
    minLng: -60.0,
    maxLng: -56.5,
    minLat: -36.5,
    maxLat: -33.0,
  },
  "Mexico City": { minLng: -101.0, maxLng: -97.5, minLat: 18.0, maxLat: 21.5 },

  // Африка (расширенные границы)
  Lagos: { minLng: 2.5, maxLng: 5.0, minLat: 5.5, maxLat: 8.0 },
  Johannesburg: { minLng: 26.5, maxLng: 30.0, minLat: -28.0, maxLat: -24.5 },
  Nairobi: { minLng: 35.5, maxLng: 38.5, minLat: -2.5, maxLat: 0.0 },
};

function getOffsetWithBounds(
  id: string,
  index: number,
  centerCoords: [number, number],
  cityName: string,
): [number, number] {
  const hash = hashCode(id + index.toString());
  const hash2 = hashCode(id + index.toString() + "salt");

  const bounds = CITY_BOUNDS[cityName];

  if (!bounds) {
    // Если нет границ для города, используем средний разброс вокруг центра
    const lngOffset = ((hash % 100) - 50) / 50; // -1.0 до +1.0 градуса
    const latOffset = ((hash2 % 100) - 50) / 50; // -1.0 до +1.0 градуса
    return [lngOffset, latOffset];
  }

  // Генерируем случайную точку ВНУТРИ границ с отступом от краёв
  const lngRange = bounds.maxLng - bounds.minLng;
  const latRange = bounds.maxLat - bounds.minLat;

  // Используем hash для равномерного распределения внутри границ
  // Добавляем отступ 5% от краёв чтобы точки не были прямо на границе
  const lngPercent = 0.05 + (hash % 90) / 100; // 5-95%
  const latPercent = 0.05 + (hash2 % 90) / 100; // 5-95%

  // Вычисляем абсолютные координаты внутри границ
  const targetLng = bounds.minLng + lngRange * lngPercent;
  const targetLat = bounds.minLat + latRange * latPercent;

  // Возвращаем смещение от центра до целевой точки
  return [targetLng - centerCoords[0], targetLat - centerCoords[1]];
}

// Функция для получения смещения с учётом города (если известен)
function getOffset(
  id: string,
  index: number,
  centerCoords?: [number, number],
  cityName?: string,
): [number, number] {
  // Если есть координаты и название города - используем bounds
  if (centerCoords && cityName) {
    return getOffsetWithBounds(id, index, centerCoords, cityName);
  }

  // Иначе используем средний разброс вокруг центра
  const hash = hashCode(id + index.toString());
  const hash2 = hashCode(id + index.toString() + "salt");
  const lngOffset = ((hash % 100) - 50) / 50; // -1.0 до +1.0 градуса
  const latOffset = ((hash2 % 100) - 50) / 50; // -1.0 до +1.0 градуса
  return [lngOffset, latOffset];
}

const CATEGORY_CITY_MAP: Record<
  string,
  { name: string; coordinates: [number, number] }
> = {
  politics: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  "us-politics": { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
  elections: { name: "Brussels", coordinates: [4.3517, 50.8503] },
  "world-politics": { name: "Brussels", coordinates: [4.3517, 50.8503] },
  Politics: { name: "Washington DC", coordinates: [-77.0369, 38.9072] },

  crypto: { name: "Singapore", coordinates: [103.8198, 1.3521] },
  cryptocurrency: { name: "Singapore", coordinates: [103.8198, 1.3521] },
  Crypto: { name: "Singapore", coordinates: [103.8198, 1.3521] },
  finance: { name: "New York", coordinates: [-74.006, 40.7128] },
  economics: { name: "London", coordinates: [-0.1276, 51.5074] },
  business: { name: "Hong Kong", coordinates: [114.1694, 22.3193] },

  sports: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  Sports: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
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
  "Pop Culture": { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  culture: { name: "Tokyo", coordinates: [139.6917, 35.6895] },
  music: { name: "Nashville", coordinates: [-86.7816, 36.1627] },

  science: { name: "Geneva", coordinates: [6.1432, 46.2044] },
  space: { name: "Houston", coordinates: [-95.3698, 29.7604] },
  health: { name: "Boston", coordinates: [-71.0589, 42.3601] },

  global: { name: "New York", coordinates: [-74.006, 40.7128] },
  world: { name: "London", coordinates: [-0.1276, 51.5074] },
  climate: { name: "Copenhagen", coordinates: [12.5683, 55.6761] },

  // Default should be a neutral location
  default: { name: "London", coordinates: [-0.1276, 51.5074] },
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
    keyword: "french",
    city: { name: "Paris", coordinates: [2.3522, 48.8566] },
  },
  {
    keyword: "macron",
    city: { name: "Paris", coordinates: [2.3522, 48.8566] },
  },
  {
    keyword: "le pen",
    city: { name: "Paris", coordinates: [2.3522, 48.8566] },
  },
  {
    keyword: "bardella",
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
    keyword: "spanish",
    city: { name: "Madrid", coordinates: [-3.7038, 40.4168] },
  },
  {
    keyword: "portugal",
    city: { name: "Lisbon", coordinates: [-9.1393, 38.7223] },
  },
  {
    keyword: "portuguese",
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
    keyword: "hungarian",
    city: { name: "Budapest", coordinates: [19.0402, 47.4979] },
  },
  {
    keyword: "romania",
    city: { name: "Bucharest", coordinates: [26.1025, 44.4268] },
  },
  {
    keyword: "romanian",
    city: { name: "Bucharest", coordinates: [26.1025, 44.4268] },
  },
  {
    keyword: "bulgaria",
    city: { name: "Sofia", coordinates: [23.3219, 42.6977] },
  },
  {
    keyword: "bulgarian",
    city: { name: "Sofia", coordinates: [23.3219, 42.6977] },
  },
  {
    keyword: "croatia",
    city: { name: "Zagreb", coordinates: [15.9819, 45.815] },
  },
  {
    keyword: "croatian",
    city: { name: "Zagreb", coordinates: [15.9819, 45.815] },
  },
  {
    keyword: "serbia",
    city: { name: "Belgrade", coordinates: [20.4651, 44.8176] },
  },
  {
    keyword: "serbian",
    city: { name: "Belgrade", coordinates: [20.4651, 44.8176] },
  },
  {
    keyword: "slovenia",
    city: { name: "Ljubljana", coordinates: [14.5058, 46.0569] },
  },
  {
    keyword: "slovakia",
    city: { name: "Bratislava", coordinates: [17.1077, 48.1486] },
  },
  {
    keyword: "slovak",
    city: { name: "Bratislava", coordinates: [17.1077, 48.1486] },
  },
  {
    keyword: "bosnia",
    city: { name: "Sarajevo", coordinates: [18.4131, 43.8563] },
  },
  {
    keyword: "albania",
    city: { name: "Tirana", coordinates: [19.8187, 41.3275] },
  },
  {
    keyword: "albanian",
    city: { name: "Tirana", coordinates: [19.8187, 41.3275] },
  },
  {
    keyword: "kosovo",
    city: { name: "Pristina", coordinates: [21.1655, 42.6629] },
  },
  {
    keyword: "montenegro",
    city: { name: "Podgorica", coordinates: [19.2636, 42.4304] },
  },
  {
    keyword: "north macedonia",
    city: { name: "Skopje", coordinates: [21.4254, 41.9981] },
  },
  {
    keyword: "macedon",
    city: { name: "Skopje", coordinates: [21.4254, 41.9981] },
  },
  {
    keyword: "baltic",
    city: { name: "Riga", coordinates: [24.1052, 56.9496] },
  },
  {
    keyword: "estonia",
    city: { name: "Tallinn", coordinates: [24.7536, 59.4369] },
  },
  {
    keyword: "estonian",
    city: { name: "Tallinn", coordinates: [24.7536, 59.4369] },
  },
  {
    keyword: "latvia",
    city: { name: "Riga", coordinates: [24.1052, 56.9496] },
  },
  {
    keyword: "latvian",
    city: { name: "Riga", coordinates: [24.1052, 56.9496] },
  },
  {
    keyword: "lithuania",
    city: { name: "Vilnius", coordinates: [25.2797, 54.6872] },
  },
  {
    keyword: "lithuanian",
    city: { name: "Vilnius", coordinates: [25.2797, 54.6872] },
  },
  {
    keyword: "greek",
    city: { name: "Athens", coordinates: [23.7275, 37.9838] },
  },
  {
    keyword: "irish",
    city: { name: "Dublin", coordinates: [-6.2603, 53.3498] },
  },
  {
    keyword: "scottish",
    city: { name: "Edinburgh", coordinates: [-3.1883, 55.9533] },
  },
  {
    keyword: "scotland",
    city: { name: "Edinburgh", coordinates: [-3.1883, 55.9533] },
  },
  {
    keyword: "welsh",
    city: { name: "Cardiff", coordinates: [-3.1791, 51.4816] },
  },
  {
    keyword: "wales",
    city: { name: "Cardiff", coordinates: [-3.1791, 51.4816] },
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

  // === Украина (проверяется первой для новостей о войне) ===
  {
    keyword: "ukraine",
    city: { name: "Kyiv", coordinates: [30.5234, 50.4501] },
  },
  {
    keyword: "ukrainian",
    city: { name: "Kyiv", coordinates: [30.5234, 50.4501] },
  },
  {
    keyword: "zelensky",
    city: { name: "Kyiv", coordinates: [30.5234, 50.4501] },
  },
  {
    keyword: "kyiv",
    city: { name: "Kyiv", coordinates: [30.5234, 50.4501] },
  },
  {
    keyword: "kiev",
    city: { name: "Kyiv", coordinates: [30.5234, 50.4501] },
  },
  {
    keyword: "kharkiv",
    city: { name: "Kharkiv", coordinates: [36.2304, 49.9935] },
  },
  {
    keyword: "odessa",
    city: { name: "Odessa", coordinates: [30.7233, 46.4825] },
  },
  {
    keyword: "donbas",
    city: { name: "Donetsk", coordinates: [37.8028, 48.0159] },
  },
  {
    keyword: "donetsk",
    city: { name: "Donetsk", coordinates: [37.8028, 48.0159] },
  },
  {
    keyword: "luhansk",
    city: { name: "Luhansk", coordinates: [39.3078, 48.574] },
  },
  {
    keyword: "crimea",
    city: { name: "Simferopol", coordinates: [34.1008, 44.9521] },
  },
  {
    keyword: "mariupol",
    city: { name: "Mariupol", coordinates: [37.5494, 47.0971] },
  },
  {
    keyword: "zaporizhzhia",
    city: { name: "Zaporizhzhia", coordinates: [35.1396, 47.8388] },
  },
  {
    keyword: "lviv",
    city: { name: "Lviv", coordinates: [24.0297, 49.8397] },
  },

  // === Россия ===
  {
    keyword: "russia",
    city: { name: "Moscow", coordinates: [37.6173, 55.7558] },
  },
  {
    keyword: "russian",
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
    keyword: "medvedev",
    city: { name: "Moscow", coordinates: [37.6173, 55.7558] },
  },

  // === Беларусь ===
  {
    keyword: "belarus",
    city: { name: "Minsk", coordinates: [27.5615, 53.9006] },
  },
  {
    keyword: "kazakhstan",
    city: { name: "Astana", coordinates: [71.4704, 51.1605] },
  },
  {
    keyword: "kazakh",
    city: { name: "Astana", coordinates: [71.4704, 51.1605] },
  },
  {
    keyword: "uzbekistan",
    city: { name: "Tashkent", coordinates: [69.2401, 41.2995] },
  },
  {
    keyword: "uzbek",
    city: { name: "Tashkent", coordinates: [69.2401, 41.2995] },
  },
  {
    keyword: "turkmenistan",
    city: { name: "Ashgabat", coordinates: [58.3794, 37.9601] },
  },
  {
    keyword: "tajikistan",
    city: { name: "Dushanbe", coordinates: [68.7738, 38.5598] },
  },
  {
    keyword: "kyrgyzstan",
    city: { name: "Bishkek", coordinates: [74.5698, 42.8746] },
  },
  {
    keyword: "georgia",
    city: { name: "Tbilisi", coordinates: [44.827, 41.7151] },
  },
  {
    keyword: "georgian",
    city: { name: "Tbilisi", coordinates: [44.827, 41.7151] },
  },
  {
    keyword: "armenia",
    city: { name: "Yerevan", coordinates: [44.5126, 40.1792] },
  },
  {
    keyword: "armenian",
    city: { name: "Yerevan", coordinates: [44.5126, 40.1792] },
  },
  {
    keyword: "azerbaijan",
    city: { name: "Baku", coordinates: [49.8671, 40.4093] },
  },
  {
    keyword: "azeri",
    city: { name: "Baku", coordinates: [49.8671, 40.4093] },
  },
  {
    keyword: "nagorno",
    city: { name: "Stepanakert", coordinates: [46.7559, 39.8266] },
  },
  {
    keyword: "karabakh",
    city: { name: "Stepanakert", coordinates: [46.7559, 39.8266] },
  },
  {
    keyword: "moldova",
    city: { name: "Chișinău", coordinates: [28.8353, 47.0105] },
  },
  {
    keyword: "moldovan",
    city: { name: "Chișinău", coordinates: [28.8353, 47.0105] },
  },
  {
    keyword: "transnistria",
    city: { name: "Tiraspol", coordinates: [29.9, 46.85] },
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
    keyword: "beijing",
    city: { name: "Beijing", coordinates: [116.4074, 39.9042] },
  },
  {
    keyword: "shanghai",
    city: { name: "Shanghai", coordinates: [121.4737, 31.2304] },
  },
  {
    keyword: "shenzhen",
    city: { name: "Shenzhen", coordinates: [114.0579, 22.5431] },
  },
  {
    keyword: "guangzhou",
    city: { name: "Guangzhou", coordinates: [113.2644, 23.1291] },
  },
  {
    keyword: "hong kong",
    city: { name: "Hong Kong", coordinates: [114.1694, 22.3193] },
  },
  {
    keyword: "macau",
    city: { name: "Macau", coordinates: [113.5439, 22.1987] },
  },
  {
    keyword: "taiwan",
    city: { name: "Taipei", coordinates: [121.5654, 25.033] },
  },
  {
    keyword: "taiwanese",
    city: { name: "Taipei", coordinates: [121.5654, 25.033] },
  },
  {
    keyword: "taipei",
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
    keyword: "pakistani",
    city: { name: "Islamabad", coordinates: [73.0479, 33.6844] },
  },
  {
    keyword: "bangladesh",
    city: { name: "Dhaka", coordinates: [90.4125, 23.8103] },
  },
  {
    keyword: "bangladeshi",
    city: { name: "Dhaka", coordinates: [90.4125, 23.8103] },
  },
  {
    keyword: "indonesia",
    city: { name: "Jakarta", coordinates: [106.8456, -6.2088] },
  },
  {
    keyword: "indonesian",
    city: { name: "Jakarta", coordinates: [106.8456, -6.2088] },
  },
  {
    keyword: "malaysia",
    city: { name: "Kuala Lumpur", coordinates: [101.6869, 3.139] },
  },
  {
    keyword: "malaysian",
    city: { name: "Kuala Lumpur", coordinates: [101.6869, 3.139] },
  },
  {
    keyword: "singapore",
    city: { name: "Singapore", coordinates: [103.8198, 1.3521] },
  },
  {
    keyword: "singaporean",
    city: { name: "Singapore", coordinates: [103.8198, 1.3521] },
  },
  {
    keyword: "thailand",
    city: { name: "Bangkok", coordinates: [100.5018, 13.7563] },
  },
  {
    keyword: "thai",
    city: { name: "Bangkok", coordinates: [100.5018, 13.7563] },
  },
  {
    keyword: "vietnam",
    city: { name: "Hanoi", coordinates: [105.8342, 21.0278] },
  },
  {
    keyword: "vietnamese",
    city: { name: "Hanoi", coordinates: [105.8342, 21.0278] },
  },
  {
    keyword: "philippines",
    city: { name: "Manila", coordinates: [120.9842, 14.5995] },
  },
  {
    keyword: "filipino",
    city: { name: "Manila", coordinates: [120.9842, 14.5995] },
  },
  {
    keyword: "myanmar",
    city: { name: "Naypyidaw", coordinates: [96.1297, 19.7633] },
  },
  {
    keyword: "burma",
    city: { name: "Naypyidaw", coordinates: [96.1297, 19.7633] },
  },
  {
    keyword: "cambodia",
    city: { name: "Phnom Penh", coordinates: [104.9282, 11.5564] },
  },
  {
    keyword: "laos",
    city: { name: "Vientiane", coordinates: [102.6331, 17.9757] },
  },
  {
    keyword: "nepal",
    city: { name: "Kathmandu", coordinates: [85.324, 27.7172] },
  },
  {
    keyword: "sri lanka",
    city: { name: "Colombo", coordinates: [79.8612, 6.9271] },
  },
  {
    keyword: "mongolia",
    city: { name: "Ulaanbaatar", coordinates: [106.9057, 47.8864] },
  },
  {
    keyword: "afghan",
    city: { name: "Kabul", coordinates: [69.1723, 34.5553] },
  },
  {
    keyword: "afghanistan",
    city: { name: "Kabul", coordinates: [69.1723, 34.5553] },
  },
  {
    keyword: "taliban",
    city: { name: "Kabul", coordinates: [69.1723, 34.5553] },
  },

  // === Ближний Восток ===
  {
    keyword: "israel",
    city: { name: "Tel Aviv", coordinates: [34.7818, 32.0853] },
  },
  {
    keyword: "israeli",
    city: { name: "Tel Aviv", coordinates: [34.7818, 32.0853] },
  },
  {
    keyword: "netanyahu",
    city: { name: "Tel Aviv", coordinates: [34.7818, 32.0853] },
  },
  {
    keyword: "jerusalem",
    city: { name: "Jerusalem", coordinates: [35.2137, 31.7683] },
  },
  {
    keyword: "palestine",
    city: { name: "Gaza", coordinates: [34.4668, 31.5017] },
  },
  {
    keyword: "palestinian",
    city: { name: "Gaza", coordinates: [34.4668, 31.5017] },
  },
  {
    keyword: "west bank",
    city: { name: "Ramallah", coordinates: [35.2038, 31.9038] },
  },
  { keyword: "gaza", city: { name: "Gaza", coordinates: [34.4668, 31.5017] } },
  { keyword: "hamas", city: { name: "Gaza", coordinates: [34.4668, 31.5017] } },
  {
    keyword: "hezbollah",
    city: { name: "Beirut", coordinates: [35.5018, 33.8938] },
  },
  {
    keyword: "lebanon",
    city: { name: "Beirut", coordinates: [35.5018, 33.8938] },
  },
  {
    keyword: "lebanese",
    city: { name: "Beirut", coordinates: [35.5018, 33.8938] },
  },
  {
    keyword: "iran",
    city: { name: "Tehran", coordinates: [51.3891, 35.6892] },
  },
  {
    keyword: "iranian",
    city: { name: "Tehran", coordinates: [51.3891, 35.6892] },
  },
  {
    keyword: "persian",
    city: { name: "Tehran", coordinates: [51.3891, 35.6892] },
  },
  {
    keyword: "saudi",
    city: { name: "Riyadh", coordinates: [46.6753, 24.7136] },
  },
  {
    keyword: "arabia",
    city: { name: "Riyadh", coordinates: [46.6753, 24.7136] },
  },
  { keyword: "uae", city: { name: "Dubai", coordinates: [55.2708, 25.2048] } },
  {
    keyword: "emirates",
    city: { name: "Dubai", coordinates: [55.2708, 25.2048] },
  },
  {
    keyword: "dubai",
    city: { name: "Dubai", coordinates: [55.2708, 25.2048] },
  },
  {
    keyword: "abu dhabi",
    city: { name: "Abu Dhabi", coordinates: [54.3773, 24.4539] },
  },
  { keyword: "qatar", city: { name: "Doha", coordinates: [51.5074, 25.2867] } },
  {
    keyword: "qatari",
    city: { name: "Doha", coordinates: [51.5074, 25.2867] },
  },
  {
    keyword: "bahrain",
    city: { name: "Manama", coordinates: [50.5876, 26.2285] },
  },
  {
    keyword: "oman",
    city: { name: "Muscat", coordinates: [58.4059, 23.588] },
  },
  {
    keyword: "yemen",
    city: { name: "Sanaa", coordinates: [44.2067, 15.3694] },
  },
  {
    keyword: "houthi",
    city: { name: "Sanaa", coordinates: [44.2067, 15.3694] },
  },
  {
    keyword: "kuwait",
    city: { name: "Kuwait City", coordinates: [47.9783, 29.3759] },
  },
  {
    keyword: "iraq",
    city: { name: "Baghdad", coordinates: [44.3661, 33.3152] },
  },
  {
    keyword: "iraqi",
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
  {
    keyword: "nigerian",
    city: { name: "Lagos", coordinates: [3.3792, 6.5244] },
  },
  {
    keyword: "egyptian",
    city: { name: "Cairo", coordinates: [31.2357, 30.0444] },
  },
  {
    keyword: "moroccan",
    city: { name: "Casablanca", coordinates: [-7.5898, 33.5731] },
  },
  {
    keyword: "congo",
    city: { name: "Kinshasa", coordinates: [15.2663, -4.4419] },
  },
  {
    keyword: "angola",
    city: { name: "Luanda", coordinates: [13.2343, -8.839] },
  },
  {
    keyword: "tanzania",
    city: { name: "Dar es Salaam", coordinates: [39.2083, -6.7924] },
  },
  {
    keyword: "uganda",
    city: { name: "Kampala", coordinates: [32.5825, 0.3476] },
  },
  {
    keyword: "rwanda",
    city: { name: "Kigali", coordinates: [30.0619, -1.9403] },
  },
  {
    keyword: "zambia",
    city: { name: "Lusaka", coordinates: [28.2871, -15.3875] },
  },
  {
    keyword: "zimbabwe",
    city: { name: "Harare", coordinates: [31.0522, -17.8292] },
  },
  {
    keyword: "botswana",
    city: { name: "Gaborone", coordinates: [25.9201, -24.6282] },
  },
  {
    keyword: "namibia",
    city: { name: "Windhoek", coordinates: [17.0658, -22.5609] },
  },
  {
    keyword: "mozambique",
    city: { name: "Maputo", coordinates: [32.5732, -25.9692] },
  },
  {
    keyword: "senegal",
    city: { name: "Dakar", coordinates: [-17.4677, 14.7167] },
  },
  {
    keyword: "ivory coast",
    city: { name: "Abidjan", coordinates: [-4.0083, 5.3599] },
  },
  {
    keyword: "cameroon",
    city: { name: "Yaoundé", coordinates: [11.5021, 3.848] },
  },

  // === Латинская Америка ===
  {
    keyword: "brazil",
    city: { name: "Brasília", coordinates: [-47.8825, -15.7942] },
  },
  {
    keyword: "brazilian",
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
    keyword: "argentine",
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
    keyword: "colombian",
    city: { name: "Bogotá", coordinates: [-74.0721, 4.711] },
  },
  {
    keyword: "venezuela",
    city: { name: "Caracas", coordinates: [-66.9036, 10.4806] },
  },
  {
    keyword: "venezuelan",
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
    keyword: "cuban",
    city: { name: "Havana", coordinates: [-82.3666, 23.1136] },
  },
  {
    keyword: "puerto rico",
    city: { name: "San Juan", coordinates: [-66.1057, 18.4655] },
  },
  {
    keyword: "chilean",
    city: { name: "Santiago", coordinates: [-70.6693, -33.4489] },
  },
  {
    keyword: "peruvian",
    city: { name: "Lima", coordinates: [-77.0428, -12.0464] },
  },
  {
    keyword: "paraguay",
    city: { name: "Asunción", coordinates: [-57.5759, -25.2637] },
  },
  {
    keyword: "uruguay",
    city: { name: "Montevideo", coordinates: [-56.1645, -34.9011] },
  },
  {
    keyword: "bolivia",
    city: { name: "La Paz", coordinates: [-68.1193, -16.4897] },
  },
  {
    keyword: "guatemala",
    city: { name: "Guatemala City", coordinates: [-90.5069, 14.6349] },
  },
  {
    keyword: "honduras",
    city: { name: "Tegucigalpa", coordinates: [-87.2068, 14.0723] },
  },
  {
    keyword: "nicaragua",
    city: { name: "Managua", coordinates: [-86.2362, 12.1364] },
  },
  {
    keyword: "costa rica",
    city: { name: "San José", coordinates: [-84.0907, 9.9281] },
  },
  {
    keyword: "panama",
    city: { name: "Panama City", coordinates: [-79.5199, 8.9824] },
  },
  {
    keyword: "el salvador",
    city: { name: "San Salvador", coordinates: [-89.1914, 13.6929] },
  },
  {
    keyword: "jamaica",
    city: { name: "Kingston", coordinates: [-76.7936, 18.0179] },
  },
  {
    keyword: "dominican",
    city: { name: "Santo Domingo", coordinates: [-69.9312, 18.4861] },
  },
  {
    keyword: "haiti",
    city: { name: "Port-au-Prince", coordinates: [-72.3388, 18.5944] },
  },
  {
    keyword: "bahamas",
    city: { name: "Nassau", coordinates: [-77.351, 25.0443] },
  },
  {
    keyword: "trinidad",
    city: { name: "Port of Spain", coordinates: [-61.5125, 10.6596] },
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
    keyword: "melbourne",
    city: { name: "Melbourne", coordinates: [144.9631, -37.8136] },
  },
  {
    keyword: "sydney",
    city: { name: "Sydney", coordinates: [151.2093, -33.8688] },
  },
  {
    keyword: "new zealand",
    city: { name: "Auckland", coordinates: [174.7633, -36.8485] },
  },
  {
    keyword: "kiwi",
    city: { name: "Auckland", coordinates: [174.7633, -36.8485] },
  },
  {
    keyword: "fiji",
    city: { name: "Suva", coordinates: [178.441, -18.1416] },
  },
  {
    keyword: "papua",
    city: { name: "Port Moresby", coordinates: [147.1803, -9.4438] },
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

  // Find the LONGEST matching keyword (more specific = better match)
  let bestMatch: {
    keyword: string;
    city: { name: string; coordinates: [number, number] };
  } | null = null;
  let bestMatchLength = 0;

  for (const item of KEYWORD_CITY_MAP) {
    if (searchText.includes(item.keyword)) {
      if (item.keyword.length > bestMatchLength) {
        bestMatch = item;
        bestMatchLength = item.keyword.length;
      }
    }
  }

  if (bestMatch) {
    const offset = getOffset(
      market.id,
      index,
      bestMatch.city.coordinates,
      bestMatch.city.name,
    );
    return [
      bestMatch.city.coordinates[0] + offset[0],
      bestMatch.city.coordinates[1] + offset[1],
    ];
  }

  const cityData = CATEGORY_CITY_MAP[category] || CATEGORY_CITY_MAP["default"];
  const offset = getOffset(
    market.id,
    index,
    cityData.coordinates,
    cityData.name,
  );

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

      // Find the LONGEST matching keyword
      let bestMatch: {
        keyword: string;
        city: { name: string; coordinates: [number, number] };
      } | null = null;
      let bestMatchLength = 0;

      for (const item of KEYWORD_CITY_MAP) {
        if (searchText.includes(item.keyword)) {
          if (item.keyword.length > bestMatchLength) {
            bestMatch = item;
            bestMatchLength = item.keyword.length;
          }
        }
      }

      if (bestMatch) {
        const offset = getOffset(
          event.id,
          index,
          bestMatch.city.coordinates,
          bestMatch.city.name,
        );
        coordinates = [
          bestMatch.city.coordinates[0] + offset[0],
          bestMatch.city.coordinates[1] + offset[1],
        ];
      }

      if (!coordinates) {
        const cityData =
          CATEGORY_CITY_MAP[category] || CATEGORY_CITY_MAP["default"];
        const offset = getOffset(
          event.id,
          index,
          cityData.coordinates,
          cityData.name,
        );
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

      // Find the LONGEST matching keyword (more specific = better match)
      let bestMatch: {
        keyword: string;
        city: { name: string; coordinates: [number, number] };
      } | null = null;
      let bestMatchLength = 0;

      for (const item of KEYWORD_CITY_MAP) {
        if (searchText.includes(item.keyword)) {
          // Prioritize longer keywords (more specific)
          if (item.keyword.length > bestMatchLength) {
            bestMatch = item;
            bestMatchLength = item.keyword.length;
          }
        }
      }

      // DEBUG: Log what's happening
      if (
        event.title.toLowerCase().includes("french") ||
        event.title.toLowerCase().includes("portugal") ||
        event.title.toLowerCase().includes("colombia")
      ) {
        console.log("🔍 DEBUG MARKET:", {
          title: event.title,
          searchText: searchText.substring(0, 100),
          bestMatch: bestMatch
            ? { keyword: bestMatch.keyword, city: bestMatch.city.name }
            : null,
          category,
        });
      }

      if (bestMatch) {
        const offset = getOffset(
          event.id,
          index,
          bestMatch.city.coordinates,
          bestMatch.city.name,
        );
        coordinates = [
          bestMatch.city.coordinates[0] + offset[0],
          bestMatch.city.coordinates[1] + offset[1],
        ];
      }

      if (!coordinates) {
        const cityData =
          CATEGORY_CITY_MAP[category] || CATEGORY_CITY_MAP["default"];
        const offset = getOffset(
          event.id,
          index,
          cityData.coordinates,
          cityData.name,
        );
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

// Keywords to match news with markets
const NEWS_MARKET_KEYWORDS: Record<string, string[]> = {
  ukraine: [
    "ukraine",
    "kyiv",
    "kiev",
    "zelensky",
    "ukrainian",
    "donbas",
    "crimea",
    "kharkiv",
    "odessa",
  ],
  russia: ["russia", "russian", "putin", "moscow", "kremlin", "medvedev"],
  war: [
    "war",
    "military",
    "troops",
    "invasion",
    "conflict",
    "battle",
    "attack",
    "offensive",
    "defense",
  ],
  trump: ["trump", "donald trump", "maga", "mar-a-lago"],
  biden: ["biden", "joe biden", "white house"],
  china: ["china", "chinese", "beijing", "xi jinping", "ccp"],
  taiwan: ["taiwan", "taiwanese", "taipei"],
  crypto: [
    "bitcoin",
    "crypto",
    "ethereum",
    "btc",
    "cryptocurrency",
    "blockchain",
    "defi",
  ],
  ai: [
    "artificial intelligence",
    " ai ",
    "openai",
    "chatgpt",
    "machine learning",
    "gpt",
  ],
  us_election: [
    "republican",
    "democrat",
    "gop",
    "dnc",
    "rnc",
    "congress",
    "senate",
    "house of representatives",
    "electoral college",
    "swing state",
    "primary",
    "caucus",
    "nominee",
    "presidential",
  ],
  us_politicians: [
    "j.d. vance",
    "jd vance",
    "vance",
    "marco rubio",
    "rubio",
    "desantis",
    "ron desantis",
    "nikki haley",
    "haley",
    "vivek ramaswamy",
    "ramaswamy",
    "tim scott",
    "pence",
    "mike pence",
    "kamala harris",
    "harris",
    "pete buttigieg",
    "buttigieg",
    "aoc",
    "ocasio-cortez",
    "bernie sanders",
    "sanders",
    "elizabeth warren",
    "warren",
    "newsom",
    "gavin newsom",
    "mitch mcconnell",
    "mcconnell",
    "kevin mccarthy",
    "mccarthy",
    "mike johnson",
    "schumer",
    "pelosi",
  ],
  economy: [
    "economy",
    "inflation",
    "fed",
    "interest rate",
    "recession",
    "gdp",
    "unemployment",
  ],
  israel: [
    "israel",
    "israeli",
    "gaza",
    "hamas",
    "palestinian",
    "netanyahu",
    "tel aviv",
    "idf",
  ],
  iran: ["iran", "iranian", "tehran", "khamenei"],
  oil: ["oil", "opec", "crude", "petroleum", "barrel"],
  nato: ["nato", "alliance", "article 5"],
  earthquake: ["earthquake", "seismic", "tremor", "magnitude"],
  disaster: [
    "disaster",
    "hurricane",
    "tsunami",
    "flood",
    "wildfire",
    "cyclone",
  ],
  coup: ["coup", "overthrow", "revolution", "uprising", "military takeover"],
  sanctions: ["sanctions", "embargo", "tariff", "trade war"],
  nuclear: ["nuclear", "atomic", "uranium", "missile"],
  sports: [
    "super bowl",
    "nfl",
    "nba",
    "mlb",
    "world series",
    "stanley cup",
    "nhl",
    "world cup",
    "fifa",
    "olympics",
    "championship",
    "playoffs",
    "finals",
    "mvp",
  ],
  entertainment: [
    "oscars",
    "academy awards",
    "grammy",
    "emmy",
    "golden globe",
    "box office",
    "netflix",
    "disney",
    "streaming",
  ],
  tech_companies: [
    "apple",
    "google",
    "microsoft",
    "amazon",
    "meta",
    "facebook",
    "tesla",
    "nvidia",
    "spacex",
    "elon musk",
    "musk",
    "tim cook",
    "satya nadella",
    "zuckerberg",
  ],
  north_korea: [
    "north korea",
    "dprk",
    "pyongyang",
    "kim jong un",
    "kim jong-un",
  ],
  india: ["india", "indian", "modi", "narendra modi", "delhi", "mumbai"],
  europe: [
    "european union",
    " eu ",
    "brussels",
    "macron",
    "scholz",
    "starmer",
    "sunak",
    "germany",
    "france",
    "uk",
    "britain",
    "british",
  ],
  middle_east: [
    "saudi",
    "saudi arabia",
    "uae",
    "qatar",
    "dubai",
    "lebanon",
    "hezbollah",
    "syria",
    "assad",
    "iraq",
    "yemen",
    "houthi",
  ],
  asia: [
    "asean",
    "myanmar",
    "burma",
    "thailand",
    "vietnam",
    "indonesia",
    "philippines",
    "malaysia",
    "singapore",
    "japan",
    "south korea",
    "korea",
  ],
  africa: [
    "africa",
    "nigeria",
    "south africa",
    "kenya",
    "ethiopia",
    "egypt",
    "morocco",
    "sudan",
  ],
  latin_america: [
    "brazil",
    "mexico",
    "argentina",
    "venezuela",
    "colombia",
    "chile",
    "peru",
    "lula",
    "milei",
  ],
};

// Geographic context mapping - which topics are related to which regions
const GEOGRAPHIC_CONTEXT: Record<string, string[]> = {
  us_election: [
    "us",
    "usa",
    "united states",
    "america",
    "american",
    "washington",
  ],
  us_politicians: [
    "us",
    "usa",
    "united states",
    "america",
    "american",
    "washington",
  ],
  trump: ["us", "usa", "united states", "america", "american"],
  biden: ["us", "usa", "united states", "america", "american", "washington"],
  ukraine: ["ukraine", "ukrainian", "europe", "eastern europe"],
  russia: ["russia", "russian", "moscow"],
  china: ["china", "chinese", "asia", "asian"],
  taiwan: ["taiwan", "taiwanese", "asia", "china"],
  israel: ["israel", "israeli", "middle east", "gaza"],
  iran: ["iran", "iranian", "middle east", "persian"],
  north_korea: ["north korea", "korea", "asia"],
  india: ["india", "indian", "south asia"],
  europe: ["europe", "european", "eu"],
  middle_east: ["middle east", "gulf", "arab"],
  asia: ["asia", "asian", "southeast asia"],
  africa: ["africa", "african"],
  latin_america: ["latin america", "south america", "central america"],
};

// Conflicting geographic contexts - topics that should NOT be matched together
const CONFLICTING_CONTEXTS: [string, string][] = [
  ["us_election", "asia"],
  ["us_election", "middle_east"],
  ["us_election", "africa"],
  ["us_election", "latin_america"],
  ["us_election", "europe"],
  ["us_politicians", "asia"],
  ["us_politicians", "middle_east"],
  ["us_politicians", "africa"],
  ["trump", "asia"],
  ["biden", "asia"],
  ["israel", "asia"],
  ["iran", "asia"],
  ["ukraine", "asia"],
  ["russia", "latin_america"],
  ["china", "latin_america"],
  ["north_korea", "europe"],
  ["north_korea", "latin_america"],
];

// Find matching keywords between news and market
function findMatchingKeywords(text1: string, text2: string): string[] {
  const lower1 = text1.toLowerCase();
  const lower2 = text2.toLowerCase();
  const matches: string[] = [];

  for (const [topic, keywords] of Object.entries(NEWS_MARKET_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower1.includes(keyword) && lower2.includes(keyword)) {
        matches.push(topic);
        break;
      }
    }
  }

  return matches;
}

// Check if texts have conflicting geographic contexts
function hasConflictingContext(text1: string, text2: string): boolean {
  const lower1 = text1.toLowerCase();
  const lower2 = text2.toLowerCase();

  // Find which topics each text belongs to
  const topics1: string[] = [];
  const topics2: string[] = [];

  for (const [topic, keywords] of Object.entries(NEWS_MARKET_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower1.includes(keyword) && !topics1.includes(topic)) {
        topics1.push(topic);
      }
      if (lower2.includes(keyword) && !topics2.includes(topic)) {
        topics2.push(topic);
      }
    }
  }

  // Check for conflicting contexts
  for (const [ctx1, ctx2] of CONFLICTING_CONTEXTS) {
    if (
      (topics1.includes(ctx1) && topics2.includes(ctx2)) ||
      (topics1.includes(ctx2) && topics2.includes(ctx1))
    ) {
      return true;
    }
  }

  return false;
}

// Check if both texts share the same geographic region
function hasMatchingGeographicContext(text1: string, text2: string): boolean {
  const lower1 = text1.toLowerCase();
  const lower2 = text2.toLowerCase();

  // Check each geographic context
  for (const [topic, regions] of Object.entries(GEOGRAPHIC_CONTEXT)) {
    // Check if text1 is about this topic
    const text1HasTopic = NEWS_MARKET_KEYWORDS[topic]?.some((kw) =>
      lower1.includes(kw),
    );
    if (!text1HasTopic) continue;

    // If text1 is about this topic, check if text2 mentions the related region
    const text2HasRegion = regions.some((region) => lower2.includes(region));
    if (text2HasRegion) return true;

    // Also check if text2 has the same topic keywords
    const text2HasTopic = NEWS_MARKET_KEYWORDS[topic]?.some((kw) =>
      lower2.includes(kw),
    );
    if (text2HasTopic) return true;
  }

  return false;
}

// Get person names mentioned in text for precise matching
function extractPersonNames(text: string): string[] {
  const lower = text.toLowerCase();
  const names: string[] = [];

  const politicianNames = NEWS_MARKET_KEYWORDS.us_politicians || [];
  const otherNames = [
    "putin",
    "zelensky",
    "xi jinping",
    "netanyahu",
    "khamenei",
    "kim jong un",
    "modi",
    "macron",
    "scholz",
    "starmer",
    "sunak",
    "lula",
    "milei",
    "assad",
    "musk",
    "zuckerberg",
  ];

  const allNames = [...politicianNames, ...otherNames];

  for (const name of allNames) {
    if (lower.includes(name)) {
      names.push(name);
    }
  }

  return names;
}

// Извлечь значимые слова из текста (убираем стоп-слова)
function extractSignificantWords(text: string): string[] {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "shall",
    "can",
    "need",
    "dare",
    "ought",
    "used",
    "to",
    "of",
    "in",
    "for",
    "on",
    "with",
    "at",
    "by",
    "from",
    "as",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "and",
    "but",
    "or",
    "nor",
    "so",
    "yet",
    "both",
    "either",
    "neither",
    "not",
    "only",
    "own",
    "same",
    "than",
    "too",
    "very",
    "just",
    "also",
    "now",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "each",
    "every",
    "both",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "any",
    "no",
    "this",
    "that",
    "these",
    "those",
    "what",
    "which",
    "who",
    "whom",
    "it",
    "its",
    "he",
    "she",
    "they",
    "them",
    "his",
    "her",
    "their",
    "my",
    "your",
    "our",
    "we",
    "you",
    "i",
    "me",
    "us",
    "him",
    "up",
    "out",
    "if",
    "about",
    "over",
    "under",
    "again",
    "then",
    "once",
    "says",
    "said",
    "new",
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

// Вычислить score связи между двумя текстами
function calculateRelationScore(text1: string, text2: string): number {
  const words1 = extractSignificantWords(text1);
  const words2 = extractSignificantWords(text2);

  if (words1.length === 0 || words2.length === 0) return 0;

  // PENALTY: Check for conflicting geographic contexts FIRST
  if (hasConflictingContext(text1, text2)) {
    return 0; // Immediately reject if contexts conflict
  }

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  // Считаем совпадающие слова
  let matchCount = 0;
  for (const word of set1) {
    if (set2.has(word)) {
      matchCount++;
    }
  }

  // Бонус за совпадение по ключевым темам
  const keywordMatches = findMatchingKeywords(text1, text2);
  const keywordBonus = keywordMatches.length * 12; // Reduced from 15

  // BONUS: Extra points for matching person names (very specific)
  const names1 = extractPersonNames(text1);
  const names2 = extractPersonNames(text2);
  const matchingNames = names1.filter((n) => names2.includes(n));
  const nameBonus = matchingNames.length * 25; // High bonus for name matches

  // BONUS: Extra points for matching geographic context
  const geoBonus = hasMatchingGeographicContext(text1, text2) ? 15 : 0;

  // Нормализуем score (0-100)
  const baseScore = (matchCount / Math.min(set1.size, set2.size)) * 40; // Reduced from 60
  const totalScore = Math.min(
    100,
    baseScore + keywordBonus + nameBonus + geoBonus,
  );

  return Math.round(totalScore);
}

// Topic to location mapping for markets
// const TOPIC_LOCATION_MAP: Record<string, [number, number]> = {
//   ukraine: [30.5234, 50.4501], // Kyiv
//   russia: [37.6173, 55.7558], // Moscow
//   china: [116.4074, 39.9042], // Beijing
//   taiwan: [121.5654, 25.033], // Taipei
//   israel: [35.2137, 31.7683], // Jerusalem
//   iran: [51.389, 35.6892], // Tehran
//   trump: [-80.0364, 26.6774], // Mar-a-Lago
//   biden: [-77.0369, 38.9072], // Washington DC
//   election: [-77.0369, 38.9072], // Washington DC
//   crypto: [103.8198, 1.3521], // Singapore
//   nato: [4.3517, 50.8503], // Brussels
// };

// Get location for market based on its content
// function getMarketLocation(title: string): [number, number] | null {
//   const lowerTitle = title.toLowerCase();

//   // === STEP 1: Check KEYWORD_CITY_MAP FIRST (specific countries/regions) ===
//   // This ensures "US strikes Iran" goes to IRAN, not somewhere else
//   for (const { keyword, city } of KEYWORD_CITY_MAP) {
//     if (lowerTitle.includes(keyword)) {
//       return city.coordinates;
//     }
//   }

//   // === STEP 2: Special conflict logic (only if no specific country found) ===

//   // Ukraine war/conflict - only if explicitly about Ukraine
//   const isAboutUkraine =
//     lowerTitle.includes("ukraine") ||
//     lowerTitle.includes("ukrainian") ||
//     lowerTitle.includes("kyiv") ||
//     lowerTitle.includes("kiev") ||
//     lowerTitle.includes("zelensky");

//   if (isAboutUkraine) {
//     const ukraineCities: [number, number][] = [
//       [30.5234, 50.4501], // Kyiv
//       [36.2304, 49.9935], // Kharkiv
//       [30.7233, 46.4825], // Odessa
//       [24.0297, 49.8397], // Lviv
//       [35.1396, 47.8388], // Zaporizhzhia
//     ];
//     return ukraineCities[Math.floor(Math.random() * ukraineCities.length)];
//   }

//   // === STEP 3: Check topic keywords ===
//   for (const [topic, keywords] of Object.entries(NEWS_MARKET_KEYWORDS)) {
//     for (const keyword of keywords) {
//       if (lowerTitle.includes(keyword) && TOPIC_LOCATION_MAP[topic]) {
//         return TOPIC_LOCATION_MAP[topic];
//       }
//     }
//   }

//   return null;
// }

// Link markets to nearby news and adjust their positions
export function linkMarketsToNews(
  marketMarkers: MapMarker[],
  newsMarkers: MapMarker[],
): { markets: MapMarker[]; news: MapMarker[] } {
  // Минимальный score для установления связи (increased from 20)
  const MIN_RELATION_SCORE = 30;

  // Создаём копии для модификации
  const linkedMarkets = marketMarkers.map((market) => ({ ...market }));
  const linkedNews = newsMarkers.map((news) => ({
    ...news,
    relatedMarketIds: [] as string[],
  }));

  // Для каждого маркета находим связанные новости
  for (const market of linkedMarkets) {
    const relatedNews: { newsId: string; score: number }[] = [];

    for (const news of linkedNews) {
      const score = calculateRelationScore(
        `${market.title} ${market.description || ""}`,
        `${news.title} ${news.description || ""}`,
      );

      if (score >= MIN_RELATION_SCORE) {
        relatedNews.push({ newsId: news.id, score });
      }
    }

    // Сортируем по score и берём топ-5
    relatedNews.sort((a, b) => b.score - a.score);
    const topRelated = relatedNews.slice(0, 5);

    if (topRelated.length > 0) {
      market.relatedNewsId = topRelated[0].newsId;
      market.relatedNewsIds = topRelated.map((r) => r.newsId);
      market.relationScore = topRelated[0].score;

      // Добавляем обратную связь к новостям
      for (const related of topRelated) {
        const newsItem = linkedNews.find((n) => n.id === related.newsId);
        if (newsItem && !newsItem.relatedMarketIds?.includes(market.id)) {
          newsItem.relatedMarketIds = newsItem.relatedMarketIds || [];
          newsItem.relatedMarketIds.push(market.id);
        }
      }
    }
  }

  // Устанавливаем максимальный score для каждой новости
  for (const news of linkedNews) {
    if (news.relatedMarketIds && news.relatedMarketIds.length > 0) {
      const maxScore = Math.max(
        ...news.relatedMarketIds.map((marketId) => {
          const market = linkedMarkets.find((m) => m.id === marketId);
          return market?.relationScore || 0;
        }),
      );
      news.relationScore = maxScore;
    }
  }

  return { markets: linkedMarkets, news: linkedNews };
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
        // Связи между маркетами и новостями
        relatedNewsId: marker.relatedNewsId,
        relatedNewsIds: marker.relatedNewsIds
          ? JSON.stringify(marker.relatedNewsIds)
          : undefined,
        relatedMarketIds: marker.relatedMarketIds
          ? JSON.stringify(marker.relatedMarketIds)
          : undefined,
        relationScore: marker.relationScore,
      },
      geometry: {
        type: "Point" as const,
        coordinates: marker.coordinates,
      },
    })),
  };
}
