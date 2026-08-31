import { type GdeltArticle } from "@/store/services/gdeltApi";
import { type PolymarketEvent } from "@/store/services/polymarketApi";
import { resolveCategoryFromTags } from "@/utils/categoryResolver";

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

const MARKET_COUNTRY_KEYWORDS: Record<string, string[]> = {
  "United States": [
    "trump",
    "biden",
    "usa",
    "america",
    "congress",
    "senate",
    "white house",
    "fed",
    "federal reserve",
    "democrat",
    "republican",
    "gop",
    "maga",
    "california",
    "texas",
    "florida",
    "new york",
  ],
  Ukraine: [
    "ukraine",
    "ukrainian",
    "kyiv",
    "kiev",
    "zelensky",
    "donbas",
    "crimea",
    "kharkiv",
  ],
  Russia: ["russia", "russian", "putin", "moscow", "kremlin"],
  China: [
    "china",
    "chinese",
    "beijing",
    "xi jinping",
    "ccp",
    "taiwan",
    "hong kong",
  ],
  Israel: [
    "israel",
    "israeli",
    "tel aviv",
    "jerusalem",
    "netanyahu",
    "gaza",
    "hamas",
    "idf",
  ],
  "United Kingdom": [
    "uk",
    "britain",
    "british",
    "london",
    "england",
    "scotland",
    "wales",
    "premier league",
    "english premier",
    "arsenal",
    "chelsea",
    "manchester united",
    "manchester city",
    "liverpool fc",
    "tottenham",
  ],
  Germany: [
    "germany",
    "german",
    "berlin",
    "merkel",
    "scholz",
    "bundesbank",
    "bundesliga",
  ],
  France: ["france", "french", "paris", "macron", "ligue 1"],
  Japan: ["japan", "japanese", "tokyo", "yen", "boj"],
  "South Korea": ["korea", "korean", "seoul", "kim jong"],
  India: ["india", "indian", "modi", "mumbai", "delhi"],
  Brazil: ["brazil", "brazilian", "lula", "bolsonaro", "serie a brazil"],
  Canada: ["canada", "canadian", "trudeau", "ottawa"],
  Australia: ["australia", "australian", "sydney", "melbourne"],
  Iran: ["iran", "iranian", "tehran", "ayatollah"],
  "Saudi Arabia": ["saudi", "arabia", "riyadh", "mbs"],
  Turkey: ["turkey", "turkish", "erdogan", "ankara", "istanbul"],
  Mexico: ["mexico", "mexican", "liga mx"],
  Argentina: ["argentina", "milei", "buenos aires"],
  Poland: ["poland", "polish", "warsaw"],
  Netherlands: ["netherlands", "dutch", "amsterdam", "eredivisie"],
  Switzerland: ["switzerland", "swiss", "zurich", "geneva"],
  Singapore: ["singapore"],
  "United Arab Emirates": ["uae", "dubai", "abu dhabi", "emirates"],
  "Costa Rica": ["costa rica", "costa rican", "san jose costa", "ticos"],
  Colombia: ["colombia", "colombian", "bogota", "medellin"],
  Chile: ["chile", "chilean", "santiago"],
  Peru: ["peru", "peruvian", "lima"],
  Ecuador: ["ecuador", "ecuadorian", "quito"],
  Venezuela: ["venezuela", "venezuelan", "caracas", "maduro"],
  Panama: ["panama", "panamanian", "panama city"],
  Guatemala: ["guatemala", "guatemalan"],
  Honduras: ["honduras", "honduran"],
  El_Salvador: ["el salvador", "salvadoran", "bukele"],
  Spain: ["spain", "spanish", "madrid", "barcelona", "la liga"],
  Italy: ["italy", "italian", "rome", "milan", "serie a", "juventus"],
  Portugal: ["portugal", "portuguese", "lisbon"],
};

function detectMarketCountry(title: string, description: string): string {
  const searchText = `${title} ${description}`.toLowerCase();

  for (const [country, keywords] of Object.entries(MARKET_COUNTRY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) {
        return country;
      }
    }
  }

  return "United States";
}

const marketCountryCityIndex: Record<string, number> = {};

const WASHINGTON_DC: { name: string; coordinates: [number, number] } = {
  name: "Washington DC",
  coordinates: [-77.0369, 38.9072],
};

function isTrumpMarket(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase();
  const trumpKeywords = [
    "trump",
    "donald trump",
    "trump's",
    "trumps",
    "trump administration",
    "president trump",
    "former president trump",
  ];
  return trumpKeywords.some((keyword) => text.includes(keyword));
}

function getMarketCoordinates(
  country: string,
  seed: number,
  title: string = "",
  description: string = "",
): [number, number] {
  if (isTrumpMarket(title, description)) {
    const random1 = Math.sin(seed * 12.9898) * 43758.5453;
    const random2 = Math.cos(seed * 78.233) * 43758.5453;
    const offsetLng = (random1 - Math.floor(random1) - 0.5) * 0.3;
    const offsetLat = (random2 - Math.floor(random2) - 0.5) * 0.2;

    return [
      WASHINGTON_DC.coordinates[0] + offsetLng,
      WASHINGTON_DC.coordinates[1] + offsetLat,
    ];
  }

  const cities =
    CITIES_BY_COUNTRY[country] || CITIES_BY_COUNTRY["United States"];

  const currentIndex = marketCountryCityIndex[country] || 0;
  marketCountryCityIndex[country] = currentIndex + 1;

  const city = cities[currentIndex % cities.length];

  const random1 = Math.sin(seed * 12.9898) * 43758.5453;
  const random2 = Math.cos(seed * 78.233) * 43758.5453;
  const offsetLng = (random1 - Math.floor(random1) - 0.5) * 0.5;
  const offsetLat = (random2 - Math.floor(random2) - 0.5) * 0.3;

  return [city.coordinates[0] + offsetLng, city.coordinates[1] + offsetLat];
}

export function convertEventsWithMarketsToMapMarkers(
  events: PolymarketEvent[],
): MapMarker[] {
  const now = new Date();

  Object.keys(marketCountryCityIndex).forEach((key) => {
    marketCountryCityIndex[key] = 0;
  });

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
      const country = detectMarketCountry(event.title, event.description || "");
      const seed = hashCode(event.id + event.title + index);
      const coordinates = getMarketCoordinates(
        country,
        seed,
        event.title,
        event.description || "",
      );

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
        category: resolveCategoryFromTags(event.tags, event.category),
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

const CITIES_BY_COUNTRY: Record<
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
    { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
    { name: "Dallas", coordinates: [-96.797, 32.7767] },
    { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
    { name: "Philadelphia", coordinates: [-75.1652, 39.9526] },
    { name: "Las Vegas", coordinates: [-115.1398, 36.1699] },
    { name: "Portland", coordinates: [-122.6765, 45.5152] },
    { name: "Minneapolis", coordinates: [-93.265, 44.9778] },
    { name: "Detroit", coordinates: [-83.0458, 42.3314] },
    { name: "Nashville", coordinates: [-86.7816, 36.1627] },
    { name: "Austin", coordinates: [-97.7431, 30.2672] },
  ],

  Canada: [
    { name: "Toronto", coordinates: [-79.3832, 43.6532] },
    { name: "Vancouver", coordinates: [-123.1207, 49.2827] },
    { name: "Montreal", coordinates: [-73.5673, 45.5017] },
    { name: "Calgary", coordinates: [-114.0719, 51.0447] },
    { name: "Ottawa", coordinates: [-75.6972, 45.4215] },
    { name: "Edmonton", coordinates: [-113.4909, 53.5461] },
    { name: "Winnipeg", coordinates: [-97.1384, 49.8951] },
    { name: "Quebec City", coordinates: [-71.2074, 46.8139] },
  ],

  "United Kingdom": [
    { name: "London", coordinates: [-0.1276, 51.5074] },
    { name: "Manchester", coordinates: [-2.2426, 53.4808] },
    { name: "Birmingham", coordinates: [-1.8904, 52.4862] },
    { name: "Edinburgh", coordinates: [-3.1883, 55.9533] },
    { name: "Glasgow", coordinates: [-4.2518, 55.8642] },
    { name: "Liverpool", coordinates: [-2.9916, 53.4084] },
    { name: "Bristol", coordinates: [-2.5879, 51.4545] },
    { name: "Leeds", coordinates: [-1.5491, 53.8008] },
  ],

  Germany: [
    { name: "Berlin", coordinates: [13.405, 52.52] },
    { name: "Munich", coordinates: [11.582, 48.1351] },
    { name: "Hamburg", coordinates: [9.9937, 53.5511] },
    { name: "Frankfurt", coordinates: [8.6821, 50.1109] },
    { name: "Cologne", coordinates: [6.9603, 50.9375] },
    { name: "Stuttgart", coordinates: [9.1829, 48.7758] },
    { name: "Dusseldorf", coordinates: [6.7735, 51.2277] },
    { name: "Leipzig", coordinates: [12.3731, 51.3397] },
  ],

  France: [
    { name: "Paris", coordinates: [2.3522, 48.8566] },
    { name: "Lyon", coordinates: [4.8357, 45.764] },
    { name: "Marseille", coordinates: [5.3698, 43.2965] },
    { name: "Toulouse", coordinates: [1.4442, 43.6047] },
    { name: "Nice", coordinates: [7.262, 43.7102] },
    { name: "Bordeaux", coordinates: [-0.5792, 44.8378] },
    { name: "Lille", coordinates: [3.0573, 50.6292] },
    { name: "Strasbourg", coordinates: [7.7521, 48.5734] },
  ],

  Russia: [
    { name: "Moscow", coordinates: [37.6173, 55.7558] },
    { name: "St Petersburg", coordinates: [30.3351, 59.9343] },
    { name: "Novosibirsk", coordinates: [82.9346, 55.0084] },
    { name: "Yekaterinburg", coordinates: [60.6122, 56.8389] },
    { name: "Kazan", coordinates: [49.1082, 55.8304] },
    { name: "Nizhny Novgorod", coordinates: [43.9361, 56.2965] },
    { name: "Vladivostok", coordinates: [131.8869, 43.1155] },
    { name: "Sochi", coordinates: [39.7233, 43.5992] },
  ],

  Ukraine: [
    { name: "Kyiv", coordinates: [30.5234, 50.4501] },
    { name: "Lviv", coordinates: [24.0297, 49.8397] },
    { name: "Odesa", coordinates: [30.7233, 46.4825] },
    { name: "Kharkiv", coordinates: [36.2304, 49.9935] },
    { name: "Dnipro", coordinates: [35.0462, 48.4647] },
  ],

  China: [
    { name: "Beijing", coordinates: [116.4074, 39.9042] },
    { name: "Shanghai", coordinates: [121.4737, 31.2304] },
    { name: "Guangzhou", coordinates: [113.2644, 23.1291] },
    { name: "Shenzhen", coordinates: [114.0579, 22.5431] },
    { name: "Chengdu", coordinates: [104.0665, 30.5723] },
    { name: "Hong Kong", coordinates: [114.1694, 22.3193] },
    { name: "Hangzhou", coordinates: [120.1551, 30.2741] },
    { name: "Xi'an", coordinates: [108.9402, 34.3416] },
  ],

  Japan: [
    { name: "Tokyo", coordinates: [139.6917, 35.6895] },
    { name: "Osaka", coordinates: [135.5023, 34.6937] },
    { name: "Nagoya", coordinates: [136.9066, 35.1815] },
    { name: "Sapporo", coordinates: [141.3545, 43.0618] },
    { name: "Fukuoka", coordinates: [130.4017, 33.5904] },
    { name: "Kyoto", coordinates: [135.7681, 35.0116] },
  ],

  India: [
    { name: "New Delhi", coordinates: [77.209, 28.6139] },
    { name: "Mumbai", coordinates: [72.8777, 19.076] },
    { name: "Bangalore", coordinates: [77.5946, 12.9716] },
    { name: "Chennai", coordinates: [80.2707, 13.0827] },
    { name: "Kolkata", coordinates: [88.3639, 22.5726] },
    { name: "Hyderabad", coordinates: [78.4867, 17.385] },
  ],

  Australia: [
    { name: "Sydney", coordinates: [151.2093, -33.8688] },
    { name: "Melbourne", coordinates: [144.9631, -37.8136] },
    { name: "Brisbane", coordinates: [153.0251, -27.4698] },
    { name: "Perth", coordinates: [115.8605, -31.9505] },
    { name: "Adelaide", coordinates: [138.6007, -34.9285] },
  ],

  Israel: [
    { name: "Tel Aviv", coordinates: [34.7818, 32.0853] },
    { name: "Jerusalem", coordinates: [35.2137, 31.7683] },
    { name: "Haifa", coordinates: [34.9896, 32.794] },
    { name: "Beer Sheva", coordinates: [34.7913, 31.2518] },
  ],

  Brazil: [
    { name: "Sao Paulo", coordinates: [-46.6333, -23.5505] },
    { name: "Rio de Janeiro", coordinates: [-43.1729, -22.9068] },
    { name: "Brasilia", coordinates: [-47.8825, -15.7942] },
    { name: "Salvador", coordinates: [-38.5016, -12.9714] },
    { name: "Fortaleza", coordinates: [-38.5267, -3.7172] },
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

  Netherlands: [
    { name: "Amsterdam", coordinates: [4.9041, 52.3676] },
    { name: "Rotterdam", coordinates: [4.4777, 51.9244] },
    { name: "The Hague", coordinates: [4.3007, 52.0705] },
    { name: "Utrecht", coordinates: [5.1214, 52.0907] },
  ],

  Poland: [
    { name: "Warsaw", coordinates: [21.0122, 52.2297] },
    { name: "Krakow", coordinates: [19.945, 50.0647] },
    { name: "Gdansk", coordinates: [18.6466, 54.352] },
    { name: "Wroclaw", coordinates: [17.0385, 51.1079] },
  ],

  Turkey: [
    { name: "Istanbul", coordinates: [28.9784, 41.0082] },
    { name: "Ankara", coordinates: [32.8597, 39.9334] },
    { name: "Izmir", coordinates: [27.1428, 38.4237] },
    { name: "Antalya", coordinates: [30.7133, 36.8969] },
  ],

  "United Arab Emirates": [
    { name: "Dubai", coordinates: [55.2708, 25.2048] },
    { name: "Abu Dhabi", coordinates: [54.3773, 24.4539] },
    { name: "Sharjah", coordinates: [55.4033, 25.3463] },
  ],

  "Saudi Arabia": [
    { name: "Riyadh", coordinates: [46.6753, 24.7136] },
    { name: "Jeddah", coordinates: [39.1925, 21.4858] },
    { name: "Mecca", coordinates: [39.8579, 21.3891] },
  ],

  "South Korea": [
    { name: "Seoul", coordinates: [126.978, 37.5665] },
    { name: "Busan", coordinates: [129.0756, 35.1796] },
    { name: "Incheon", coordinates: [126.7052, 37.4563] },
    { name: "Daegu", coordinates: [128.6014, 35.8714] },
  ],

  Mexico: [
    { name: "Mexico City", coordinates: [-99.1332, 19.4326] },
    { name: "Guadalajara", coordinates: [-103.3496, 20.6597] },
    { name: "Monterrey", coordinates: [-100.3161, 25.6866] },
    { name: "Cancun", coordinates: [-86.8515, 21.1619] },
  ],

  Iran: [
    { name: "Tehran", coordinates: [51.3891, 35.6892] },
    { name: "Isfahan", coordinates: [51.6675, 32.6546] },
    { name: "Shiraz", coordinates: [52.5311, 29.5918] },
  ],

  Egypt: [
    { name: "Cairo", coordinates: [31.2357, 30.0444] },
    { name: "Alexandria", coordinates: [29.9187, 31.2001] },
    { name: "Giza", coordinates: [31.2089, 30.0131] },
  ],

  "South Africa": [
    { name: "Johannesburg", coordinates: [28.0473, -26.2041] },
    { name: "Cape Town", coordinates: [18.4241, -33.9249] },
    { name: "Durban", coordinates: [31.0218, -29.8587] },
  ],

  Argentina: [
    { name: "Buenos Aires", coordinates: [-58.3816, -34.6037] },
    { name: "Cordoba", coordinates: [-64.1888, -31.4201] },
    { name: "Mendoza", coordinates: [-68.8272, -32.8908] },
  ],

  Switzerland: [
    { name: "Zurich", coordinates: [8.5417, 47.3769] },
    { name: "Geneva", coordinates: [6.1432, 46.2044] },
    { name: "Bern", coordinates: [7.4474, 46.948] },
  ],

  Ireland: [
    { name: "Dublin", coordinates: [-6.2603, 53.3498] },
    { name: "Cork", coordinates: [-8.4863, 51.8969] },
    { name: "Galway", coordinates: [-9.0568, 53.2707] },
  ],

  Singapore: [
    { name: "Singapore Central", coordinates: [103.8198, 1.3521] },
    { name: "Jurong", coordinates: [103.7436, 1.3329] },
    { name: "Changi", coordinates: [103.9915, 1.3644] },
  ],

  "Costa Rica": [
    { name: "San José", coordinates: [-84.0907, 9.9281] },
    { name: "Alajuela", coordinates: [-84.2115, 10.0162] },
    { name: "Cartago", coordinates: [-83.9193, 9.8644] },
    { name: "Heredia", coordinates: [-84.1165, 9.9985] },
    { name: "Limón", coordinates: [-83.0359, 9.9907] },
  ],

  Colombia: [
    { name: "Bogotá", coordinates: [-74.0721, 4.711] },
    { name: "Medellín", coordinates: [-75.5636, 6.2442] },
    { name: "Cali", coordinates: [-76.5225, 3.4516] },
    { name: "Barranquilla", coordinates: [-74.7889, 10.9639] },
  ],

  Chile: [
    { name: "Santiago", coordinates: [-70.6693, -33.4489] },
    { name: "Valparaíso", coordinates: [-71.6273, -33.0472] },
    { name: "Concepción", coordinates: [-73.0498, -36.8282] },
  ],

  Peru: [
    { name: "Lima", coordinates: [-77.0428, -12.0464] },
    { name: "Arequipa", coordinates: [-71.537, -16.409] },
    { name: "Cusco", coordinates: [-71.9675, -13.532] },
  ],

  Ecuador: [
    { name: "Quito", coordinates: [-78.4678, -0.1807] },
    { name: "Guayaquil", coordinates: [-79.8891, -2.1894] },
    { name: "Cuenca", coordinates: [-79.0053, -2.9001] },
  ],

  Venezuela: [
    { name: "Caracas", coordinates: [-66.9036, 10.4806] },
    { name: "Maracaibo", coordinates: [-71.6561, 10.6666] },
    { name: "Valencia", coordinates: [-68.0076, 10.1579] },
  ],

  Panama: [
    { name: "Panama City", coordinates: [-79.5199, 8.9824] },
    { name: "Colón", coordinates: [-79.9014, 9.3547] },
  ],

  El_Salvador: [
    { name: "San Salvador", coordinates: [-89.1872, 13.6929] },
    { name: "Santa Ana", coordinates: [-89.5569, 13.9942] },
  ],

  Guatemala: [
    { name: "Guatemala City", coordinates: [-90.5069, 14.6349] },
    { name: "Antigua", coordinates: [-90.7295, 14.5586] },
  ],

  Honduras: [
    { name: "Tegucigalpa", coordinates: [-87.2068, 14.0723] },
    { name: "San Pedro Sula", coordinates: [-88.0259, 15.504] },
  ],

  Portugal: [
    { name: "Lisbon", coordinates: [-9.1393, 38.7223] },
    { name: "Porto", coordinates: [-8.6291, 41.1579] },
    { name: "Faro", coordinates: [-7.9304, 37.0194] },
    { name: "Coimbra", coordinates: [-8.4103, 40.2033] },
    { name: "Braga", coordinates: [-8.42, 41.5454] },
  ],

  Greece: [
    { name: "Athens", coordinates: [23.7275, 37.9838] },
    { name: "Thessaloniki", coordinates: [22.9444, 40.6401] },
    { name: "Patras", coordinates: [21.7346, 38.2466] },
  ],

  Austria: [
    { name: "Vienna", coordinates: [16.3738, 48.2082] },
    { name: "Salzburg", coordinates: [13.055, 47.8095] },
    { name: "Graz", coordinates: [15.4395, 47.0707] },
  ],

  Belgium: [
    { name: "Brussels", coordinates: [4.3517, 50.8503] },
    { name: "Antwerp", coordinates: [4.4025, 51.2194] },
    { name: "Ghent", coordinates: [3.7174, 51.0543] },
  ],

  Sweden: [
    { name: "Stockholm", coordinates: [18.0686, 59.3293] },
    { name: "Gothenburg", coordinates: [11.9746, 57.7089] },
    { name: "Malmö", coordinates: [13.0038, 55.604] },
  ],

  Norway: [
    { name: "Oslo", coordinates: [10.7522, 59.9139] },
    { name: "Bergen", coordinates: [5.3221, 60.3913] },
    { name: "Trondheim", coordinates: [10.3951, 63.4305] },
  ],

  Denmark: [
    { name: "Copenhagen", coordinates: [12.5683, 55.6761] },
    { name: "Aarhus", coordinates: [10.2039, 56.1629] },
    { name: "Odense", coordinates: [10.3883, 55.4038] },
  ],

  Finland: [
    { name: "Helsinki", coordinates: [24.9384, 60.1699] },
    { name: "Tampere", coordinates: [23.7871, 61.4978] },
    { name: "Turku", coordinates: [22.2666, 60.4518] },
  ],
};

const COUNTRY_ALIASES: Record<string, string> = {
  us: "United States",
  usa: "United States",
  "united states": "United States",
  uk: "United Kingdom",
  britain: "United Kingdom",
  england: "United Kingdom",
  canada: "Canada",
  ca: "Canada",
  germany: "Germany",
  de: "Germany",
  deutschland: "Germany",
  france: "France",
  fr: "France",
  russia: "Russia",
  ru: "Russia",
  "russian federation": "Russia",
  ukraine: "Ukraine",
  ua: "Ukraine",
  china: "China",
  cn: "China",
  prc: "China",
  japan: "Japan",
  jp: "Japan",
  india: "India",
  in: "India",
  australia: "Australia",
  au: "Australia",
  israel: "Israel",
  il: "Israel",
  brazil: "Brazil",
  br: "Brazil",
  italy: "Italy",
  it: "Italy",
  spain: "Spain",
  es: "Spain",
  netherlands: "Netherlands",
  nl: "Netherlands",
  holland: "Netherlands",
  poland: "Poland",
  pl: "Poland",
  turkey: "Turkey",
  tr: "Turkey",
  turkiye: "Turkey",
  uae: "United Arab Emirates",
  "united arab emirates": "United Arab Emirates",
  "saudi arabia": "Saudi Arabia",
  sa: "Saudi Arabia",
  "south korea": "South Korea",
  korea: "South Korea",
  kr: "South Korea",
  mexico: "Mexico",
  mx: "Mexico",
  iran: "Iran",
  ir: "Iran",
  egypt: "Egypt",
  eg: "Egypt",
  "south africa": "South Africa",
  za: "South Africa",
  argentina: "Argentina",
  ar: "Argentina",
  switzerland: "Switzerland",
  ch: "Switzerland",
  ireland: "Ireland",
  ie: "Ireland",
  singapore: "Singapore",
  sg: "Singapore",
  "costa rica": "Costa Rica",
  cr: "Costa Rica",
  colombia: "Colombia",
  co: "Colombia",
  chile: "Chile",
  cl: "Chile",
  peru: "Peru",
  pe: "Peru",
  ecuador: "Ecuador",
  ec: "Ecuador",
  venezuela: "Venezuela",
  ve: "Venezuela",
  panama: "Panama",
  pa: "Panama",
  guatemala: "Guatemala",
  gt: "Guatemala",
  honduras: "Honduras",
  hn: "Honduras",
  "el salvador": "El_Salvador",
  sv: "El_Salvador",
  portugal: "Portugal",
  pt: "Portugal",
};

const DEFAULT_LOCATION: [number, number] = [-74.006, 40.7128];

const countryCityIndex: Record<string, number> = {};

function normalizeCountry(country: string): string {
  if (!country) return "United States";
  const lower = country.toLowerCase().trim();
  return COUNTRY_ALIASES[lower] || country;
}

function getNextCityInCountry(country: string, seed: number): [number, number] {
  const normalizedCountry = normalizeCountry(country);
  const cities = CITIES_BY_COUNTRY[normalizedCountry];

  if (!cities || cities.length === 0) {
    const random1 = Math.sin(seed * 12.9898) * 43758.5453;
    const random2 = Math.cos(seed * 78.233) * 43758.5453;
    return [
      DEFAULT_LOCATION[0] + (random1 - Math.floor(random1) - 0.5) * 10,
      DEFAULT_LOCATION[1] + (random2 - Math.floor(random2) - 0.5) * 5,
    ];
  }

  const currentIndex = countryCityIndex[normalizedCountry] || 0;
  countryCityIndex[normalizedCountry] = currentIndex + 1;

  const city = cities[currentIndex % cities.length];

  const random1 = Math.sin(seed * 12.9898) * 43758.5453;
  const random2 = Math.cos(seed * 78.233) * 43758.5453;
  const offsetLng = (random1 - Math.floor(random1) - 0.5) * 0.5;
  const offsetLat = (random2 - Math.floor(random2) - 0.5) * 0.3;

  return [city.coordinates[0] + offsetLng, city.coordinates[1] + offsetLat];
}

export function convertGdeltArticlesToMapMarkers(
  articles: GdeltArticle[],
): MapMarker[] {
  Object.keys(countryCityIndex).forEach((key) => {
    countryCityIndex[key] = 0;
  });

  return articles.map((article, index) => {
    const seed = hashCode(article.url + article.title + index);
    const coordinates = getNextCityInCountry(article.sourcecountry, seed);

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

function hasMatchingGeographicContext(text1: string, text2: string): boolean {
  const lower1 = text1.toLowerCase();
  const lower2 = text2.toLowerCase();

  for (const [topic, regions] of Object.entries(GEOGRAPHIC_CONTEXT)) {
    const text1HasTopic = NEWS_MARKET_KEYWORDS[topic]?.some((kw) =>
      lower1.includes(kw),
    );
    if (!text1HasTopic) continue;

    const text2HasRegion = regions.some((region) => lower2.includes(region));
    if (text2HasRegion) return true;

    const text2HasTopic = NEWS_MARKET_KEYWORDS[topic]?.some((kw) =>
      lower2.includes(kw),
    );
    if (text2HasTopic) return true;
  }

  return false;
}

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

function calculateRelationScore(text1: string, text2: string): number {
  const words1 = extractSignificantWords(text1);
  const words2 = extractSignificantWords(text2);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  let matchCount = 0;
  for (const word of set1) {
    if (set2.has(word)) {
      matchCount++;
    }
  }

  const keywordMatches = findMatchingKeywords(text1, text2);
  const keywordBonus = keywordMatches.length * 12;

  const names1 = extractPersonNames(text1);
  const names2 = extractPersonNames(text2);
  const matchingNames = names1.filter((n) => names2.includes(n));
  const nameBonus = matchingNames.length * 25;

  const geoBonus = hasMatchingGeographicContext(text1, text2) ? 15 : 0;

  const baseScore = (matchCount / Math.min(set1.size, set2.size)) * 40;
  const totalScore = Math.min(
    100,
    baseScore + keywordBonus + nameBonus + geoBonus,
  );

  return Math.round(totalScore);
}

export function linkMarketsToNews(
  marketMarkers: MapMarker[],
  newsMarkers: MapMarker[],
): { markets: MapMarker[]; news: MapMarker[] } {
  const MIN_RELATION_SCORE = 20;

  const linkedMarkets = marketMarkers.map((market) => ({ ...market }));
  const linkedNews = newsMarkers.map((news) => ({
    ...news,
    relatedMarketIds: [] as string[],
  }));

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

    relatedNews.sort((a, b) => b.score - a.score);
    const topRelated = relatedNews.slice(0, 5);

    if (topRelated.length > 0) {
      market.relatedNewsId = topRelated[0].newsId;
      market.relatedNewsIds = topRelated.map((r) => r.newsId);
      market.relationScore = topRelated[0].score;

      for (const related of topRelated) {
        const newsItem = linkedNews.find((n) => n.id === related.newsId);
        if (newsItem && !newsItem.relatedMarketIds?.includes(market.id)) {
          newsItem.relatedMarketIds = newsItem.relatedMarketIds || [];
          newsItem.relatedMarketIds.push(market.id);
        }
      }
    }
  }

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
