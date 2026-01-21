import { GdeltArticleWithCoords } from "./gdeltApi";
import { PolymarketEvent, Market } from "./polymarketApi";

declare global {
  interface Window {
    ai?: {
      languageModel: {
        create: (options?: AIModelOptions) => Promise<AILanguageModel>;
        capabilities: () => Promise<AICapabilities>;
      };
    };
  }
}

interface AIModelOptions {
  systemPrompt?: string;
  temperature?: number;
  topK?: number;
}

interface AILanguageModel {
  prompt: (input: string) => Promise<string>;
  promptStreaming: (input: string) => ReadableStream<string>;
  destroy: () => void;
}

interface AICapabilities {
  available: "readily" | "after-download" | "no";
}

export const COUNTRY_COORDINATES: Record<
  string,
  { name: string; coords: [number, number] }
> = {
  US: { name: "United States", coords: [-98.5795, 39.8283] },
  GB: { name: "United Kingdom", coords: [-3.436, 55.3781] },
  UA: { name: "Ukraine", coords: [31.1656, 48.3794] },
  RU: { name: "Russia", coords: [105.3188, 61.524] },
  CN: { name: "China", coords: [104.1954, 35.8617] },
  DE: { name: "Germany", coords: [10.4515, 51.1657] },
  FR: { name: "France", coords: [2.2137, 46.2276] },
  JP: { name: "Japan", coords: [138.2529, 36.2048] },
  IN: { name: "India", coords: [78.9629, 20.5937] },
  BR: { name: "Brazil", coords: [-51.9253, -14.235] },
  AU: { name: "Australia", coords: [133.7751, -25.2744] },
  CA: { name: "Canada", coords: [-106.3468, 56.1304] },
  KR: { name: "South Korea", coords: [127.7669, 35.9078] },
  IL: { name: "Israel", coords: [34.8516, 31.0461] },
  IR: { name: "Iran", coords: [53.688, 32.4279] },
  SA: { name: "Saudi Arabia", coords: [45.0792, 23.8859] },
  TR: { name: "Turkey", coords: [35.2433, 38.9637] },
  MX: { name: "Mexico", coords: [-102.5528, 23.6345] },
  AR: { name: "Argentina", coords: [-63.6167, -38.4161] },
  VE: { name: "Venezuela", coords: [-66.5897, 6.4238] },
  PL: { name: "Poland", coords: [19.1451, 51.9194] },
  IT: { name: "Italy", coords: [12.5674, 41.8719] },
  ES: { name: "Spain", coords: [-3.7492, 40.4637] },
  NL: { name: "Netherlands", coords: [5.2913, 52.1326] },
  BE: { name: "Belgium", coords: [4.4699, 50.5039] },
  SE: { name: "Sweden", coords: [18.6435, 60.1282] },
  NO: { name: "Norway", coords: [8.4689, 60.472] },
  FI: { name: "Finland", coords: [25.7482, 61.9241] },
  DK: { name: "Denmark", coords: [9.5018, 56.2639] },
  CH: { name: "Switzerland", coords: [8.2275, 46.8182] },
  AT: { name: "Austria", coords: [14.5501, 47.5162] },
  GR: { name: "Greece", coords: [21.8243, 39.0742] },
  PT: { name: "Portugal", coords: [-8.2245, 39.3999] },
  CZ: { name: "Czech Republic", coords: [15.473, 49.8175] },
  RO: { name: "Romania", coords: [24.9668, 45.9432] },
  HU: { name: "Hungary", coords: [19.5033, 47.1625] },
  BG: { name: "Bulgaria", coords: [25.4858, 42.7339] },
  SK: { name: "Slovakia", coords: [19.699, 48.669] },
  HR: { name: "Croatia", coords: [15.2, 45.1] },
  RS: { name: "Serbia", coords: [21.0059, 44.0165] },
  BY: { name: "Belarus", coords: [27.9534, 53.7098] },
  KZ: { name: "Kazakhstan", coords: [66.9237, 48.0196] },
  UZ: { name: "Uzbekistan", coords: [64.5853, 41.3775] },
  TH: { name: "Thailand", coords: [100.9925, 15.87] },
  VN: { name: "Vietnam", coords: [108.2772, 14.0583] },
  PH: { name: "Philippines", coords: [121.774, 12.8797] },
  MY: { name: "Malaysia", coords: [101.9758, 4.2105] },
  ID: { name: "Indonesia", coords: [113.9213, -0.7893] },
  SG: { name: "Singapore", coords: [103.8198, 1.3521] },
  PK: { name: "Pakistan", coords: [69.3451, 30.3753] },
  BD: { name: "Bangladesh", coords: [90.3563, 23.685] },
  EG: { name: "Egypt", coords: [30.8025, 26.8206] },
  ZA: { name: "South Africa", coords: [22.9375, -30.5595] },
  NG: { name: "Nigeria", coords: [8.6753, 9.082] },
  KE: { name: "Kenya", coords: [37.9062, -0.0236] },
  MA: { name: "Morocco", coords: [-7.0926, 31.7917] },
  AE: { name: "UAE", coords: [53.8478, 23.4241] },
  QA: { name: "Qatar", coords: [51.1839, 25.3548] },
  KW: { name: "Kuwait", coords: [47.4818, 29.3117] },
  IQ: { name: "Iraq", coords: [43.6793, 33.2232] },
  SY: { name: "Syria", coords: [38.9968, 34.8021] },
  LB: { name: "Lebanon", coords: [35.8623, 33.8547] },
  JO: { name: "Jordan", coords: [36.2384, 30.5852] },
  PS: { name: "Palestine", coords: [35.2332, 31.9522] },
  TW: { name: "Taiwan", coords: [120.9605, 23.6978] },
  HK: { name: "Hong Kong", coords: [114.1694, 22.3193] },
  NZ: { name: "New Zealand", coords: [174.886, -40.9006] },
  IE: { name: "Ireland", coords: [-8.2439, 53.4129] },
  CL: { name: "Chile", coords: [-71.543, -35.6751] },
  CO: { name: "Colombia", coords: [-74.2973, 4.5709] },
  PE: { name: "Peru", coords: [-75.0152, -9.19] },
  EC: { name: "Ecuador", coords: [-78.1834, -1.8312] },
  CR: { name: "Costa Rica", coords: [-84.0907, 9.9281] },
  PA: { name: "Panama", coords: [-79.5199, 8.9824] },
  GT: { name: "Guatemala", coords: [-90.5069, 14.6349] },
  HN: { name: "Honduras", coords: [-87.2068, 14.0723] },
  SV: { name: "El Salvador", coords: [-89.1872, 13.6929] },
  NI: { name: "Nicaragua", coords: [-85.2072, 12.8654] },
  CU: { name: "Cuba", coords: [-77.7812, 21.5218] },
  DO: { name: "Dominican Republic", coords: [-70.1627, 18.7357] },
  PR: { name: "Puerto Rico", coords: [-66.5901, 18.2208] },
};

const COUNTRY_KEYWORDS: Record<string, string[]> = {
  US: [
    "trump",
    "biden",
    "washington",
    "congress",
    "senate",
    "white house",
    "fed",
    "federal reserve",
    "wall street",
    "nasdaq",
    "s&p",
    "dow jones",
    "new york",
    "california",
    "texas",
    "florida",
    "america",
    "american",
    "usa",
    "u.s.",
    "united states",
  ],
  UA: [
    "ukraine",
    "ukrainian",
    "kyiv",
    "kiev",
    "zelensky",
    "zelenskyy",
    "donbas",
    "crimea",
    "kharkiv",
    "odesa",
    "mariupol",
  ],
  RU: [
    "russia",
    "russian",
    "moscow",
    "kremlin",
    "putin",
    "medvedev",
    "lavrov",
    "st petersburg",
  ],
  CN: [
    "china",
    "chinese",
    "beijing",
    "shanghai",
    "xi jinping",
    "ccp",
    "prc",
    "communist party",
    "hong kong",
    "shenzhen",
  ],
  GB: [
    "uk",
    "britain",
    "british",
    "england",
    "london",
    "parliament",
    "downing",
    "sunak",
    "starmer",
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
    "epl",
  ],
  DE: [
    "germany",
    "german",
    "berlin",
    "scholz",
    "bundesbank",
    "frankfurt",
    "munich",
  ],
  FR: ["france", "french", "paris", "macron", "elysee", "le pen", "marseille"],
  JP: [
    "japan",
    "japanese",
    "tokyo",
    "kishida",
    "yen",
    "nikkei",
    "osaka",
    "kyoto",
  ],
  IL: [
    "israel",
    "israeli",
    "tel aviv",
    "jerusalem",
    "netanyahu",
    "idf",
    "knesset",
    "gaza",
    "hamas",
    "hezbollah",
  ],
  IR: ["iran", "iranian", "tehran", "khamenei", "raisi", "irgc", "persian"],
  SA: [
    "saudi",
    "arabia",
    "riyadh",
    "mbs",
    "bin salman",
    "opec",
    "aramco",
    "mecca",
  ],
  IN: [
    "india",
    "indian",
    "delhi",
    "mumbai",
    "modi",
    "rupee",
    "sensex",
    "bangalore",
  ],
  BR: [
    "brazil",
    "brazilian",
    "brasilia",
    "lula",
    "bolsonaro",
    "sao paulo",
    "rio",
  ],
  KR: ["korea", "korean", "seoul", "pyongyang", "kim jong", "samsung", "kospi"],
  TR: [
    "turkey",
    "turkish",
    "ankara",
    "istanbul",
    "erdogan",
    "lira",
    "bosphorus",
  ],
  AU: [
    "australia",
    "australian",
    "sydney",
    "melbourne",
    "canberra",
    "albanese",
  ],
  CA: ["canada", "canadian", "ottawa", "toronto", "trudeau", "quebec"],
  MX: [
    "mexico",
    "mexican",
    "mexico city",
    "amlo",
    "sheinbaum",
    "peso",
    "tijuana",
  ],
  PL: ["poland", "polish", "warsaw", "duda", "tusk", "zloty"],
  NL: ["netherlands", "dutch", "amsterdam", "rotterdam", "hague"],
  IT: ["italy", "italian", "rome", "milan", "meloni", "vatican"],
  ES: ["spain", "spanish", "madrid", "barcelona", "sanchez"],
  TW: ["taiwan", "taiwanese", "taipei", "tsmc"],
  SG: ["singapore", "singaporean"],
  AE: ["uae", "emirates", "dubai", "abu dhabi"],
  AR: ["argentina", "argentine", "buenos aires", "milei", "peso"],
  VE: ["venezuela", "venezuelan", "caracas", "maduro"],
  EG: ["egypt", "egyptian", "cairo", "suez", "sisi"],
  ZA: ["south africa", "johannesburg", "cape town", "pretoria"],
  NG: ["nigeria", "nigerian", "lagos", "abuja"],
  PK: ["pakistan", "pakistani", "islamabad", "karachi"],
  TH: ["thailand", "thai", "bangkok"],
  VN: ["vietnam", "vietnamese", "hanoi", "ho chi minh"],
  ID: ["indonesia", "indonesian", "jakarta"],
  MY: ["malaysia", "malaysian", "kuala lumpur"],
  PH: ["philippines", "filipino", "manila"],
  NZ: ["new zealand", "zealand", "wellington", "auckland"],
  IE: ["ireland", "irish", "dublin"],
  CH: ["switzerland", "swiss", "zurich", "geneva", "bern"],
  AT: ["austria", "austrian", "vienna"],
  SE: ["sweden", "swedish", "stockholm"],
  NO: ["norway", "norwegian", "oslo"],
  DK: ["denmark", "danish", "copenhagen"],
  FI: ["finland", "finnish", "helsinki"],
  GR: ["greece", "greek", "athens"],
  PT: ["portugal", "portuguese", "lisbon"],
  BE: ["belgium", "belgian", "brussels"],
  CZ: ["czech", "prague", "czechia"],
  RO: ["romania", "romanian", "bucharest"],
  HU: ["hungary", "hungarian", "budapest", "orban"],
  BY: ["belarus", "belarusian", "minsk", "lukashenko"],
  KZ: ["kazakhstan", "kazakh", "astana", "almaty"],
  SY: ["syria", "syrian", "damascus", "assad"],
  LB: ["lebanon", "lebanese", "beirut"],
  JO: ["jordan", "jordanian", "amman"],
  IQ: ["iraq", "iraqi", "baghdad"],
  QA: ["qatar", "qatari", "doha"],
  KW: ["kuwait", "kuwaiti"],
  PS: ["palestine", "palestinian", "west bank", "ramallah"],
  CR: ["costa rica", "costa rican", "san jose costa", "ticos"],
  PA: ["panama", "panamanian", "panama city", "panama canal"],
  GT: ["guatemala", "guatemalan"],
  HN: ["honduras", "honduran", "tegucigalpa"],
  SV: ["el salvador", "salvadoran", "bukele", "san salvador"],
  NI: ["nicaragua", "nicaraguan", "managua", "ortega"],
  CU: ["cuba", "cuban", "havana", "castro"],
  DO: ["dominican republic", "dominican", "santo domingo"],
  CL: ["chile", "chilean", "santiago"],
  CO: ["colombia", "colombian", "bogota", "medellin"],
  PE: ["peru", "peruvian", "lima"],
  EC: ["ecuador", "ecuadorian", "quito"],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  crypto: [
    "bitcoin",
    "btc",
    "ethereum",
    "eth",
    "crypto",
    "blockchain",
    "defi",
    "nft",
    "binance",
    "coinbase",
    "altcoin",
    "stablecoin",
    "usdt",
    "usdc",
    "solana",
    "cardano",
    "dogecoin",
  ],
  politics: [
    "election",
    "vote",
    "president",
    "minister",
    "congress",
    "parliament",
    "senate",
    "governor",
    "democrat",
    "republican",
    "party",
    "campaign",
    "poll",
    "ballot",
  ],
  economics: [
    "inflation",
    "gdp",
    "fed",
    "interest rate",
    "recession",
    "unemployment",
    "stock",
    "market",
    "trade",
    "tariff",
    "economy",
    "fiscal",
    "monetary",
    "central bank",
  ],
  war: [
    "war",
    "military",
    "army",
    "troops",
    "invasion",
    "attack",
    "missile",
    "drone",
    "conflict",
    "battle",
    "ceasefire",
    "peace",
    "nato",
    "defense",
  ],
  tech: [
    "ai",
    "artificial intelligence",
    "openai",
    "google",
    "apple",
    "microsoft",
    "tesla",
    "meta",
    "amazon",
    "nvidia",
    "chip",
    "semiconductor",
    "tech",
  ],
  sports: [
    "nfl",
    "nba",
    "mlb",
    "soccer",
    "football",
    "basketball",
    "tennis",
    "olympics",
    "world cup",
    "championship",
    "league",
    "match",
    "game",
  ],
};

export interface ClassifiedItem {
  id: string;
  title: string;
  countryCode: string;
  countryName: string;
  coordinates: [number, number];
  confidence: number;
  category?: string;
  originalData: GdeltArticleWithCoords | PolymarketEvent | Market;
  type: "news" | "market";
}

interface AIServiceStatus {
  available: boolean;
  method: "browser-ai" | "keywords" | "none";
  message: string;
}

let aiSession: AILanguageModel | null = null;
let aiAvailable: boolean | null = null;

export async function checkBrowserAI(): Promise<AIServiceStatus> {
  if (aiAvailable !== null) {
    return {
      available: aiAvailable,
      method: aiAvailable ? "browser-ai" : "keywords",
      message: aiAvailable
        ? "Browser AI доступен"
        : "Используется keyword-based классификация",
    };
  }

  try {
    if (!window.ai?.languageModel) {
      aiAvailable = false;
      return {
        available: false,
        method: "keywords",
        message: "window.ai не поддерживается браузером",
      };
    }

    const capabilities = await window.ai.languageModel.capabilities();

    if (capabilities.available === "no") {
      aiAvailable = false;
      return {
        available: false,
        method: "keywords",
        message: "AI модель недоступна",
      };
    }

    if (capabilities.available === "after-download") {
      console.log("AI модель требует загрузки...");
    }

    aiAvailable = true;
    return {
      available: true,
      method: "browser-ai",
      message: "Browser AI готов к использованию",
    };
  } catch (error) {
    console.warn("Ошибка проверки Browser AI:", error);
    aiAvailable = false;
    return {
      available: false,
      method: "keywords",
      message: `Ошибка: ${error}`,
    };
  }
}

async function getAISession(): Promise<AILanguageModel | null> {
  if (aiSession) return aiSession;

  const status = await checkBrowserAI();
  if (!status.available) return null;

  try {
    aiSession = await window.ai!.languageModel.create({
      systemPrompt: `You are a geopolitical classifier. Given news or market data, determine:
1. The primary country (ISO 3166-1 alpha-2 code)
2. Category: crypto, politics, economics, war, tech, sports, other
3. Confidence score (0-100)

Respond ONLY with valid JSON: {"country": "XX", "category": "...", "confidence": 85}
If multiple countries, pick the most relevant one.`,
      temperature: 0.1,
      topK: 1,
    });
    return aiSession;
  } catch (error) {
    console.error("Ошибка создания AI сессии:", error);
    return null;
  }
}

export function classifyByKeywords(text: string): {
  country: string;
  category: string;
  confidence: number;
} {
  const lowerText = text.toLowerCase();

  let bestCountry = "US";
  let bestCountryScore = 0;

  for (const [code, keywords] of Object.entries(COUNTRY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score += keyword.length;
      }
    }
    if (score > bestCountryScore) {
      bestCountryScore = score;
      bestCountry = code;
    }
  }

  // Определяем категорию
  let bestCategory = "other";
  let bestCategoryScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score += keyword.length;
      }
    }
    if (score > bestCategoryScore) {
      bestCategoryScore = score;
      bestCategory = category;
    }
  }

  const confidence = Math.min(95, 40 + bestCountryScore * 2);

  return { country: bestCountry, category: bestCategory, confidence };
}

async function classifyItem(
  text: string,
  useAI: boolean = true,
): Promise<{ country: string; category: string; confidence: number }> {
  if (useAI) {
    const session = await getAISession();
    if (session) {
      try {
        const response = await session.prompt(
          `Classify: "${text.slice(0, 500)}"`,
        );
        const parsed = JSON.parse(response);
        if (parsed.country && COUNTRY_COORDINATES[parsed.country]) {
          return {
            country: parsed.country,
            category: parsed.category || "other",
            confidence: parsed.confidence || 70,
          };
        }
      } catch (error) {
        console.warn("AI classification failed, using keywords:", error);
      }
    }
  }

  return classifyByKeywords(text);
}

export async function classifyNews(
  articles: GdeltArticleWithCoords[],
  batchSize: number = 10,
): Promise<ClassifiedItem[]> {
  const results: ClassifiedItem[] = [];
  const status = await checkBrowserAI();
  const useAI = status.available;

  console.log(
    `Классификация ${articles.length} новостей. Метод: ${status.method}`,
  );

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (article, idx) => {
        if (article.coordinates && article.coordinates[0] !== 0) {
          const classification = await classifyItem(article.title, useAI);
          return {
            id: `news-${i + idx}-${Date.now()}`,
            title: article.title,
            countryCode: classification.country,
            countryName:
              COUNTRY_COORDINATES[classification.country]?.name ||
              article.sourcecountry ||
              "Unknown",
            coordinates: article.coordinates,
            confidence: classification.confidence,
            category: classification.category,
            originalData: article,
            type: "news" as const,
          };
        }

        const classification = await classifyItem(article.title, useAI);
        const countryData = COUNTRY_COORDINATES[classification.country];

        return {
          id: `news-${i + idx}-${Date.now()}`,
          title: article.title,
          countryCode: classification.country,
          countryName: countryData?.name || "Unknown",
          coordinates: countryData?.coords || [-98.5795, 39.8283],
          confidence: classification.confidence,
          category: classification.category,
          originalData: article,
          type: "news" as const,
        };
      }),
    );

    results.push(...batchResults);

    if (i + batchSize < articles.length) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  return results;
}

export async function classifyMarkets(
  markets: (PolymarketEvent | Market)[],
  batchSize: number = 10,
): Promise<ClassifiedItem[]> {
  const results: ClassifiedItem[] = [];
  const status = await checkBrowserAI();
  const useAI = status.available;

  console.log(
    `Классификация ${markets.length} маркетов. Метод: ${status.method}`,
  );

  for (let i = 0; i < markets.length; i += batchSize) {
    const batch = markets.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (market, idx) => {
        const text =
          "question" in market
            ? `${market.question} ${market.description || ""}`
            : `${market.title} ${market.description || ""}`;

        const classification = await classifyItem(text, useAI);
        const countryData = COUNTRY_COORDINATES[classification.country];

        const jitter = () => (Math.random() - 0.5) * 2;
        const coords: [number, number] = countryData
          ? [countryData.coords[0] + jitter(), countryData.coords[1] + jitter()]
          : [-98.5795 + jitter(), 39.8283 + jitter()];

        return {
          id: market.id || `market-${i + idx}-${Date.now()}`,
          title: "question" in market ? market.question : market.title,
          countryCode: classification.country,
          countryName: countryData?.name || "Unknown",
          coordinates: coords,
          confidence: classification.confidence,
          category: classification.category,
          originalData: market,
          type: "market" as const,
        };
      }),
    );

    results.push(...batchResults);

    if (i + batchSize < markets.length) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  return results;
}

export function destroyAISession(): void {
  if (aiSession) {
    aiSession.destroy();
    aiSession = null;
  }
}

export function matchNewsToMarkets(
  news: ClassifiedItem[],
  markets: ClassifiedItem[],
): Map<string, ClassifiedItem[]> {
  const marketNewsMap = new Map<string, ClassifiedItem[]>();

  for (const market of markets) {
    const relatedNews = news.filter((n) => {
      const sameCountry = n.countryCode === market.countryCode;

      const sameCategory = n.category === market.category;

      const marketWords = market.title.toLowerCase().split(/\s+/);
      const newsWords = n.title.toLowerCase();
      const keywordMatch = marketWords.some(
        (word) => word.length > 4 && newsWords.includes(word),
      );

      return (sameCountry && sameCategory) || keywordMatch;
    });

    if (relatedNews.length > 0) {
      marketNewsMap.set(market.id, relatedNews.slice(0, 5));
    }
  }

  return marketNewsMap;
}

export default {
  checkBrowserAI,
  classifyNews,
  classifyMarkets,
  matchNewsToMarkets,
  destroyAISession,
  COUNTRY_COORDINATES,
};
