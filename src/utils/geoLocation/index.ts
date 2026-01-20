/**
 * Модуль геолокации с использованием NLP (compromise.js)
 * Определяет страны и города из текста новостей и маркетов
 */

import nlp from "compromise";

// ============================================
// ТИПЫ
// ============================================

export interface GeoLocation {
  country: string;
  city: string;
  coordinates: [number, number];
  confidence: number; // 0-1, насколько уверены в определении
}

export interface DetectionResult {
  countries: string[];
  cities: string[];
  regions: string[];
  keywords: string[];
}

// ============================================
// БАЗА ДАННЫХ КООРДИНАТ
// ============================================

// Координаты стран (столицы или основные города)
export const COUNTRY_COORDINATES: Record<
  string,
  { name: string; city: string; coordinates: [number, number] }
> = {
  // Северная Америка
  "united states": {
    name: "United States",
    city: "Washington DC",
    coordinates: [-77.0369, 38.9072],
  },
  usa: {
    name: "United States",
    city: "Washington DC",
    coordinates: [-77.0369, 38.9072],
  },
  "u.s.": {
    name: "United States",
    city: "Washington DC",
    coordinates: [-77.0369, 38.9072],
  },
  "u.s.a.": {
    name: "United States",
    city: "Washington DC",
    coordinates: [-77.0369, 38.9072],
  },
  america: {
    name: "United States",
    city: "Washington DC",
    coordinates: [-77.0369, 38.9072],
  },
  canada: {
    name: "Canada",
    city: "Ottawa",
    coordinates: [-75.6972, 45.4215],
  },
  mexico: {
    name: "Mexico",
    city: "Mexico City",
    coordinates: [-99.1332, 19.4326],
  },

  // Европа
  "united kingdom": {
    name: "United Kingdom",
    city: "London",
    coordinates: [-0.1276, 51.5074],
  },
  uk: {
    name: "United Kingdom",
    city: "London",
    coordinates: [-0.1276, 51.5074],
  },
  britain: {
    name: "United Kingdom",
    city: "London",
    coordinates: [-0.1276, 51.5074],
  },
  england: {
    name: "United Kingdom",
    city: "London",
    coordinates: [-0.1276, 51.5074],
  },
  france: { name: "France", city: "Paris", coordinates: [2.3522, 48.8566] },
  germany: { name: "Germany", city: "Berlin", coordinates: [13.405, 52.52] },
  italy: { name: "Italy", city: "Rome", coordinates: [12.4964, 41.9028] },
  spain: { name: "Spain", city: "Madrid", coordinates: [-3.7038, 40.4168] },
  portugal: {
    name: "Portugal",
    city: "Lisbon",
    coordinates: [-9.1393, 38.7223],
  },
  netherlands: {
    name: "Netherlands",
    city: "Amsterdam",
    coordinates: [4.9041, 52.3676],
  },
  belgium: {
    name: "Belgium",
    city: "Brussels",
    coordinates: [4.3517, 50.8503],
  },
  switzerland: {
    name: "Switzerland",
    city: "Zurich",
    coordinates: [8.5417, 47.3769],
  },
  austria: {
    name: "Austria",
    city: "Vienna",
    coordinates: [16.3738, 48.2082],
  },
  poland: { name: "Poland", city: "Warsaw", coordinates: [21.0122, 52.2297] },
  sweden: {
    name: "Sweden",
    city: "Stockholm",
    coordinates: [18.0686, 59.3293],
  },
  norway: { name: "Norway", city: "Oslo", coordinates: [10.7522, 59.9139] },
  denmark: {
    name: "Denmark",
    city: "Copenhagen",
    coordinates: [12.5683, 55.6761],
  },
  finland: {
    name: "Finland",
    city: "Helsinki",
    coordinates: [24.9384, 60.1699],
  },
  ireland: {
    name: "Ireland",
    city: "Dublin",
    coordinates: [-6.2603, 53.3498],
  },
  greece: { name: "Greece", city: "Athens", coordinates: [23.7275, 37.9838] },
  czech: {
    name: "Czech Republic",
    city: "Prague",
    coordinates: [14.4378, 50.0755],
  },
  "czech republic": {
    name: "Czech Republic",
    city: "Prague",
    coordinates: [14.4378, 50.0755],
  },
  hungary: {
    name: "Hungary",
    city: "Budapest",
    coordinates: [19.0402, 47.4979],
  },
  romania: {
    name: "Romania",
    city: "Bucharest",
    coordinates: [26.1025, 44.4268],
  },
  bulgaria: {
    name: "Bulgaria",
    city: "Sofia",
    coordinates: [23.3219, 42.6977],
  },
  croatia: { name: "Croatia", city: "Zagreb", coordinates: [15.9819, 45.815] },
  serbia: {
    name: "Serbia",
    city: "Belgrade",
    coordinates: [20.4651, 44.8176],
  },
  ukraine: { name: "Ukraine", city: "Kyiv", coordinates: [30.5234, 50.4501] },
  russia: { name: "Russia", city: "Moscow", coordinates: [37.6173, 55.7558] },
  belarus: { name: "Belarus", city: "Minsk", coordinates: [27.5615, 53.9006] },
  moldova: {
    name: "Moldova",
    city: "Chișinău",
    coordinates: [28.8353, 47.0105],
  },

  // Азия
  china: { name: "China", city: "Beijing", coordinates: [116.4074, 39.9042] },
  japan: { name: "Japan", city: "Tokyo", coordinates: [139.6917, 35.6895] },
  "south korea": {
    name: "South Korea",
    city: "Seoul",
    coordinates: [126.978, 37.5665],
  },
  korea: {
    name: "South Korea",
    city: "Seoul",
    coordinates: [126.978, 37.5665],
  },
  "north korea": {
    name: "North Korea",
    city: "Pyongyang",
    coordinates: [125.7625, 39.0392],
  },
  india: {
    name: "India",
    city: "New Delhi",
    coordinates: [77.209, 28.6139],
  },
  pakistan: {
    name: "Pakistan",
    city: "Islamabad",
    coordinates: [73.0479, 33.6844],
  },
  indonesia: {
    name: "Indonesia",
    city: "Jakarta",
    coordinates: [106.8456, -6.2088],
  },
  malaysia: {
    name: "Malaysia",
    city: "Kuala Lumpur",
    coordinates: [101.6869, 3.139],
  },
  singapore: {
    name: "Singapore",
    city: "Singapore",
    coordinates: [103.8198, 1.3521],
  },
  thailand: {
    name: "Thailand",
    city: "Bangkok",
    coordinates: [100.5018, 13.7563],
  },
  vietnam: {
    name: "Vietnam",
    city: "Hanoi",
    coordinates: [105.8342, 21.0278],
  },
  philippines: {
    name: "Philippines",
    city: "Manila",
    coordinates: [120.9842, 14.5995],
  },
  taiwan: { name: "Taiwan", city: "Taipei", coordinates: [121.5654, 25.033] },
  "hong kong": {
    name: "Hong Kong",
    city: "Hong Kong",
    coordinates: [114.1694, 22.3193],
  },

  // Ближний Восток
  israel: {
    name: "Israel",
    city: "Tel Aviv",
    coordinates: [34.7818, 32.0853],
  },
  palestine: {
    name: "Palestine",
    city: "Gaza",
    coordinates: [34.4668, 31.5017],
  },
  iran: { name: "Iran", city: "Tehran", coordinates: [51.3891, 35.6892] },
  iraq: { name: "Iraq", city: "Baghdad", coordinates: [44.3661, 33.3152] },
  syria: { name: "Syria", city: "Damascus", coordinates: [36.2765, 33.5138] },
  lebanon: { name: "Lebanon", city: "Beirut", coordinates: [35.5018, 33.8938] },
  jordan: { name: "Jordan", city: "Amman", coordinates: [35.9106, 31.9454] },
  "saudi arabia": {
    name: "Saudi Arabia",
    city: "Riyadh",
    coordinates: [46.6753, 24.7136],
  },
  uae: { name: "UAE", city: "Dubai", coordinates: [55.2708, 25.2048] },
  "united arab emirates": {
    name: "UAE",
    city: "Dubai",
    coordinates: [55.2708, 25.2048],
  },
  qatar: { name: "Qatar", city: "Doha", coordinates: [51.5074, 25.2867] },
  kuwait: {
    name: "Kuwait",
    city: "Kuwait City",
    coordinates: [47.9783, 29.3759],
  },
  yemen: { name: "Yemen", city: "Sanaa", coordinates: [44.2067, 15.3694] },
  turkey: {
    name: "Turkey",
    city: "Istanbul",
    coordinates: [28.9784, 41.0082],
  },
  egypt: { name: "Egypt", city: "Cairo", coordinates: [31.2357, 30.0444] },

  // Африка
  "south africa": {
    name: "South Africa",
    city: "Cape Town",
    coordinates: [18.4241, -33.9249],
  },
  nigeria: { name: "Nigeria", city: "Lagos", coordinates: [3.3792, 6.5244] },
  kenya: { name: "Kenya", city: "Nairobi", coordinates: [36.8219, -1.2921] },
  ethiopia: {
    name: "Ethiopia",
    city: "Addis Ababa",
    coordinates: [38.7578, 9.0192],
  },
  morocco: {
    name: "Morocco",
    city: "Casablanca",
    coordinates: [-7.5898, 33.5731],
  },
  algeria: {
    name: "Algeria",
    city: "Algiers",
    coordinates: [3.0588, 36.7538],
  },
  tunisia: { name: "Tunisia", city: "Tunis", coordinates: [10.1658, 36.8065] },
  libya: { name: "Libya", city: "Tripoli", coordinates: [13.1875, 32.8872] },
  sudan: { name: "Sudan", city: "Khartoum", coordinates: [32.5599, 15.5007] },

  // Южная Америка
  brazil: {
    name: "Brazil",
    city: "Brasília",
    coordinates: [-47.8825, -15.7942],
  },
  argentina: {
    name: "Argentina",
    city: "Buenos Aires",
    coordinates: [-58.3816, -34.6037],
  },
  colombia: {
    name: "Colombia",
    city: "Bogotá",
    coordinates: [-74.0721, 4.711],
  },
  venezuela: {
    name: "Venezuela",
    city: "Caracas",
    coordinates: [-66.9036, 10.4806],
  },
  chile: {
    name: "Chile",
    city: "Santiago",
    coordinates: [-70.6693, -33.4489],
  },
  peru: { name: "Peru", city: "Lima", coordinates: [-77.0428, -12.0464] },
  cuba: { name: "Cuba", city: "Havana", coordinates: [-82.3666, 23.1136] },

  // Океания
  australia: {
    name: "Australia",
    city: "Sydney",
    coordinates: [151.2093, -33.8688],
  },
  "new zealand": {
    name: "New Zealand",
    city: "Auckland",
    coordinates: [174.7633, -36.8485],
  },
};

// Координаты городов
export const CITY_COORDINATES: Record<
  string,
  { name: string; country: string; coordinates: [number, number] }
> = {
  // США
  "washington dc": {
    name: "Washington DC",
    country: "United States",
    coordinates: [-77.0369, 38.9072],
  },
  washington: {
    name: "Washington DC",
    country: "United States",
    coordinates: [-77.0369, 38.9072],
  },
  "new york": {
    name: "New York",
    country: "United States",
    coordinates: [-74.006, 40.7128],
  },
  "new york city": {
    name: "New York",
    country: "United States",
    coordinates: [-74.006, 40.7128],
  },
  nyc: {
    name: "New York",
    country: "United States",
    coordinates: [-74.006, 40.7128],
  },
  "los angeles": {
    name: "Los Angeles",
    country: "United States",
    coordinates: [-118.2437, 34.0522],
  },
  la: {
    name: "Los Angeles",
    country: "United States",
    coordinates: [-118.2437, 34.0522],
  },
  chicago: {
    name: "Chicago",
    country: "United States",
    coordinates: [-87.6298, 41.8781],
  },
  houston: {
    name: "Houston",
    country: "United States",
    coordinates: [-95.3698, 29.7604],
  },
  miami: {
    name: "Miami",
    country: "United States",
    coordinates: [-80.1918, 25.7617],
  },
  "san francisco": {
    name: "San Francisco",
    country: "United States",
    coordinates: [-122.4194, 37.7749],
  },
  seattle: {
    name: "Seattle",
    country: "United States",
    coordinates: [-122.3321, 47.6062],
  },
  boston: {
    name: "Boston",
    country: "United States",
    coordinates: [-71.0589, 42.3601],
  },
  austin: {
    name: "Austin",
    country: "United States",
    coordinates: [-97.7431, 30.2672],
  },
  "las vegas": {
    name: "Las Vegas",
    country: "United States",
    coordinates: [-115.1398, 36.1699],
  },
  atlanta: {
    name: "Atlanta",
    country: "United States",
    coordinates: [-84.388, 33.749],
  },
  denver: {
    name: "Denver",
    country: "United States",
    coordinates: [-104.9903, 39.7392],
  },
  phoenix: {
    name: "Phoenix",
    country: "United States",
    coordinates: [-112.074, 33.4484],
  },
  detroit: {
    name: "Detroit",
    country: "United States",
    coordinates: [-83.0458, 42.3314],
  },
  philadelphia: {
    name: "Philadelphia",
    country: "United States",
    coordinates: [-75.1652, 39.9526],
  },
  dallas: {
    name: "Dallas",
    country: "United States",
    coordinates: [-96.797, 32.7767],
  },
  // Дополнительные города США
  "san diego": {
    name: "San Diego",
    country: "United States",
    coordinates: [-117.1611, 32.7157],
  },
  "san antonio": {
    name: "San Antonio",
    country: "United States",
    coordinates: [-98.4936, 29.4241],
  },
  "san jose": {
    name: "San Jose",
    country: "United States",
    coordinates: [-121.8863, 37.3382],
  },
  "fort worth": {
    name: "Fort Worth",
    country: "United States",
    coordinates: [-97.3308, 32.7555],
  },
  jacksonville: {
    name: "Jacksonville",
    country: "United States",
    coordinates: [-81.6557, 30.3322],
  },
  columbus: {
    name: "Columbus",
    country: "United States",
    coordinates: [-82.9988, 39.9612],
  },
  charlotte: {
    name: "Charlotte",
    country: "United States",
    coordinates: [-80.8431, 35.2271],
  },
  indianapolis: {
    name: "Indianapolis",
    country: "United States",
    coordinates: [-86.1581, 39.7684],
  },
  "salt lake city": {
    name: "Salt Lake City",
    country: "United States",
    coordinates: [-111.891, 40.7608],
  },
  nashville: {
    name: "Nashville",
    country: "United States",
    coordinates: [-86.7816, 36.1627],
  },
  memphis: {
    name: "Memphis",
    country: "United States",
    coordinates: [-90.049, 35.1495],
  },
  "new orleans": {
    name: "New Orleans",
    country: "United States",
    coordinates: [-90.0715, 29.9511],
  },
  milwaukee: {
    name: "Milwaukee",
    country: "United States",
    coordinates: [-87.9065, 43.0389],
  },
  "kansas city": {
    name: "Kansas City",
    country: "United States",
    coordinates: [-94.5786, 39.0997],
  },
  portland: {
    name: "Portland",
    country: "United States",
    coordinates: [-122.6765, 45.5152],
  },
  sacramento: {
    name: "Sacramento",
    country: "United States",
    coordinates: [-121.4944, 38.5816],
  },
  "oklahoma city": {
    name: "Oklahoma City",
    country: "United States",
    coordinates: [-97.5164, 35.4676],
  },
  raleigh: {
    name: "Raleigh",
    country: "United States",
    coordinates: [-78.6382, 35.7796],
  },
  minneapolis: {
    name: "Minneapolis",
    country: "United States",
    coordinates: [-93.265, 44.9778],
  },
  tampa: {
    name: "Tampa",
    country: "United States",
    coordinates: [-82.4572, 27.9506],
  },
  orlando: {
    name: "Orlando",
    country: "United States",
    coordinates: [-81.3792, 28.5383],
  },
  pittsburgh: {
    name: "Pittsburgh",
    country: "United States",
    coordinates: [-79.9959, 40.4406],
  },
  cleveland: {
    name: "Cleveland",
    country: "United States",
    coordinates: [-81.6944, 41.4993],
  },
  baltimore: {
    name: "Baltimore",
    country: "United States",
    coordinates: [-76.6122, 39.2904],
  },
  "st. louis": {
    name: "St. Louis",
    country: "United States",
    coordinates: [-90.1994, 38.627],
  },
  "saint louis": {
    name: "St. Louis",
    country: "United States",
    coordinates: [-90.1994, 38.627],
  },
  "las cruces": {
    name: "Las Cruces",
    country: "United States",
    coordinates: [-106.7452, 32.3199],
  },
  tucson: {
    name: "Tucson",
    country: "United States",
    coordinates: [-110.9265, 32.2226],
  },
  albuquerque: {
    name: "Albuquerque",
    country: "United States",
    coordinates: [-106.6504, 35.0844],
  },
  cincinnati: {
    name: "Cincinnati",
    country: "United States",
    coordinates: [-84.512, 39.1031],
  },
  honolulu: {
    name: "Honolulu",
    country: "United States",
    coordinates: [-157.8583, 21.3069],
  },
  anchorage: {
    name: "Anchorage",
    country: "United States",
    coordinates: [-149.9003, 61.2181],
  },

  // Канада
  toronto: {
    name: "Toronto",
    country: "Canada",
    coordinates: [-79.3832, 43.6532],
  },
  vancouver: {
    name: "Vancouver",
    country: "Canada",
    coordinates: [-123.1207, 49.2827],
  },
  montreal: {
    name: "Montreal",
    country: "Canada",
    coordinates: [-73.5673, 45.5017],
  },
  ottawa: {
    name: "Ottawa",
    country: "Canada",
    coordinates: [-75.6972, 45.4215],
  },

  // Европа
  london: {
    name: "London",
    country: "United Kingdom",
    coordinates: [-0.1276, 51.5074],
  },
  paris: { name: "Paris", country: "France", coordinates: [2.3522, 48.8566] },
  berlin: { name: "Berlin", country: "Germany", coordinates: [13.405, 52.52] },
  rome: { name: "Rome", country: "Italy", coordinates: [12.4964, 41.9028] },
  madrid: { name: "Madrid", country: "Spain", coordinates: [-3.7038, 40.4168] },
  barcelona: {
    name: "Barcelona",
    country: "Spain",
    coordinates: [2.1734, 41.3851],
  },
  amsterdam: {
    name: "Amsterdam",
    country: "Netherlands",
    coordinates: [4.9041, 52.3676],
  },
  brussels: {
    name: "Brussels",
    country: "Belgium",
    coordinates: [4.3517, 50.8503],
  },
  vienna: {
    name: "Vienna",
    country: "Austria",
    coordinates: [16.3738, 48.2082],
  },
  zurich: {
    name: "Zurich",
    country: "Switzerland",
    coordinates: [8.5417, 47.3769],
  },
  geneva: {
    name: "Geneva",
    country: "Switzerland",
    coordinates: [6.1432, 46.2044],
  },
  stockholm: {
    name: "Stockholm",
    country: "Sweden",
    coordinates: [18.0686, 59.3293],
  },
  oslo: { name: "Oslo", country: "Norway", coordinates: [10.7522, 59.9139] },
  copenhagen: {
    name: "Copenhagen",
    country: "Denmark",
    coordinates: [12.5683, 55.6761],
  },
  helsinki: {
    name: "Helsinki",
    country: "Finland",
    coordinates: [24.9384, 60.1699],
  },
  dublin: {
    name: "Dublin",
    country: "Ireland",
    coordinates: [-6.2603, 53.3498],
  },
  athens: {
    name: "Athens",
    country: "Greece",
    coordinates: [23.7275, 37.9838],
  },
  lisbon: {
    name: "Lisbon",
    country: "Portugal",
    coordinates: [-9.1393, 38.7223],
  },
  warsaw: {
    name: "Warsaw",
    country: "Poland",
    coordinates: [21.0122, 52.2297],
  },
  prague: {
    name: "Prague",
    country: "Czech Republic",
    coordinates: [14.4378, 50.0755],
  },
  budapest: {
    name: "Budapest",
    country: "Hungary",
    coordinates: [19.0402, 47.4979],
  },
  munich: {
    name: "Munich",
    country: "Germany",
    coordinates: [11.582, 48.1351],
  },
  frankfurt: {
    name: "Frankfurt",
    country: "Germany",
    coordinates: [8.6821, 50.1109],
  },
  milan: { name: "Milan", country: "Italy", coordinates: [9.19, 45.4642] },

  // Восточная Европа
  kyiv: { name: "Kyiv", country: "Ukraine", coordinates: [30.5234, 50.4501] },
  kiev: { name: "Kyiv", country: "Ukraine", coordinates: [30.5234, 50.4501] },
  kharkiv: {
    name: "Kharkiv",
    country: "Ukraine",
    coordinates: [36.2304, 49.9935],
  },
  odessa: {
    name: "Odessa",
    country: "Ukraine",
    coordinates: [30.7233, 46.4825],
  },
  moscow: {
    name: "Moscow",
    country: "Russia",
    coordinates: [37.6173, 55.7558],
  },
  "st. petersburg": {
    name: "St. Petersburg",
    country: "Russia",
    coordinates: [30.3351, 59.9343],
  },
  "saint petersburg": {
    name: "St. Petersburg",
    country: "Russia",
    coordinates: [30.3351, 59.9343],
  },
  minsk: {
    name: "Minsk",
    country: "Belarus",
    coordinates: [27.5615, 53.9006],
  },

  // Азия
  beijing: {
    name: "Beijing",
    country: "China",
    coordinates: [116.4074, 39.9042],
  },
  shanghai: {
    name: "Shanghai",
    country: "China",
    coordinates: [121.4737, 31.2304],
  },
  shenzhen: {
    name: "Shenzhen",
    country: "China",
    coordinates: [114.0579, 22.5431],
  },
  guangzhou: {
    name: "Guangzhou",
    country: "China",
    coordinates: [113.2644, 23.1291],
  },
  "hong kong": {
    name: "Hong Kong",
    country: "China",
    coordinates: [114.1694, 22.3193],
  },
  taipei: {
    name: "Taipei",
    country: "Taiwan",
    coordinates: [121.5654, 25.033],
  },
  tokyo: { name: "Tokyo", country: "Japan", coordinates: [139.6917, 35.6895] },
  osaka: { name: "Osaka", country: "Japan", coordinates: [135.5023, 34.6937] },
  seoul: {
    name: "Seoul",
    country: "South Korea",
    coordinates: [126.978, 37.5665],
  },
  pyongyang: {
    name: "Pyongyang",
    country: "North Korea",
    coordinates: [125.7625, 39.0392],
  },
  "new delhi": {
    name: "New Delhi",
    country: "India",
    coordinates: [77.209, 28.6139],
  },
  delhi: {
    name: "New Delhi",
    country: "India",
    coordinates: [77.209, 28.6139],
  },
  mumbai: { name: "Mumbai", country: "India", coordinates: [72.8777, 19.076] },
  singapore: {
    name: "Singapore",
    country: "Singapore",
    coordinates: [103.8198, 1.3521],
  },
  bangkok: {
    name: "Bangkok",
    country: "Thailand",
    coordinates: [100.5018, 13.7563],
  },
  jakarta: {
    name: "Jakarta",
    country: "Indonesia",
    coordinates: [106.8456, -6.2088],
  },
  "kuala lumpur": {
    name: "Kuala Lumpur",
    country: "Malaysia",
    coordinates: [101.6869, 3.139],
  },
  manila: {
    name: "Manila",
    country: "Philippines",
    coordinates: [120.9842, 14.5995],
  },
  hanoi: {
    name: "Hanoi",
    country: "Vietnam",
    coordinates: [105.8342, 21.0278],
  },

  // Ближний Восток
  "tel aviv": {
    name: "Tel Aviv",
    country: "Israel",
    coordinates: [34.7818, 32.0853],
  },
  jerusalem: {
    name: "Jerusalem",
    country: "Israel",
    coordinates: [35.2137, 31.7683],
  },
  gaza: {
    name: "Gaza",
    country: "Palestine",
    coordinates: [34.4668, 31.5017],
  },
  beirut: {
    name: "Beirut",
    country: "Lebanon",
    coordinates: [35.5018, 33.8938],
  },
  damascus: {
    name: "Damascus",
    country: "Syria",
    coordinates: [36.2765, 33.5138],
  },
  tehran: { name: "Tehran", country: "Iran", coordinates: [51.3891, 35.6892] },
  baghdad: {
    name: "Baghdad",
    country: "Iraq",
    coordinates: [44.3661, 33.3152],
  },
  riyadh: {
    name: "Riyadh",
    country: "Saudi Arabia",
    coordinates: [46.6753, 24.7136],
  },
  dubai: { name: "Dubai", country: "UAE", coordinates: [55.2708, 25.2048] },
  "abu dhabi": {
    name: "Abu Dhabi",
    country: "UAE",
    coordinates: [54.3773, 24.4539],
  },
  doha: { name: "Doha", country: "Qatar", coordinates: [51.5074, 25.2867] },
  amman: { name: "Amman", country: "Jordan", coordinates: [35.9106, 31.9454] },
  istanbul: {
    name: "Istanbul",
    country: "Turkey",
    coordinates: [28.9784, 41.0082],
  },
  ankara: {
    name: "Ankara",
    country: "Turkey",
    coordinates: [32.8597, 39.9334],
  },

  // Африка
  cairo: { name: "Cairo", country: "Egypt", coordinates: [31.2357, 30.0444] },
  lagos: { name: "Lagos", country: "Nigeria", coordinates: [3.3792, 6.5244] },
  nairobi: {
    name: "Nairobi",
    country: "Kenya",
    coordinates: [36.8219, -1.2921],
  },
  johannesburg: {
    name: "Johannesburg",
    country: "South Africa",
    coordinates: [28.0473, -26.2041],
  },
  "cape town": {
    name: "Cape Town",
    country: "South Africa",
    coordinates: [18.4241, -33.9249],
  },
  casablanca: {
    name: "Casablanca",
    country: "Morocco",
    coordinates: [-7.5898, 33.5731],
  },

  // Южная Америка
  "são paulo": {
    name: "São Paulo",
    country: "Brazil",
    coordinates: [-46.6333, -23.5505],
  },
  "sao paulo": {
    name: "São Paulo",
    country: "Brazil",
    coordinates: [-46.6333, -23.5505],
  },
  "rio de janeiro": {
    name: "Rio de Janeiro",
    country: "Brazil",
    coordinates: [-43.1729, -22.9068],
  },
  rio: {
    name: "Rio de Janeiro",
    country: "Brazil",
    coordinates: [-43.1729, -22.9068],
  },
  "buenos aires": {
    name: "Buenos Aires",
    country: "Argentina",
    coordinates: [-58.3816, -34.6037],
  },
  bogota: {
    name: "Bogotá",
    country: "Colombia",
    coordinates: [-74.0721, 4.711],
  },
  bogotá: {
    name: "Bogotá",
    country: "Colombia",
    coordinates: [-74.0721, 4.711],
  },
  caracas: {
    name: "Caracas",
    country: "Venezuela",
    coordinates: [-66.9036, 10.4806],
  },
  santiago: {
    name: "Santiago",
    country: "Chile",
    coordinates: [-70.6693, -33.4489],
  },
  lima: { name: "Lima", country: "Peru", coordinates: [-77.0428, -12.0464] },
  "mexico city": {
    name: "Mexico City",
    country: "Mexico",
    coordinates: [-99.1332, 19.4326],
  },
  havana: { name: "Havana", country: "Cuba", coordinates: [-82.3666, 23.1136] },

  // Океания
  sydney: {
    name: "Sydney",
    country: "Australia",
    coordinates: [151.2093, -33.8688],
  },
  melbourne: {
    name: "Melbourne",
    country: "Australia",
    coordinates: [144.9631, -37.8136],
  },
  auckland: {
    name: "Auckland",
    country: "New Zealand",
    coordinates: [174.7633, -36.8485],
  },
};

// ============================================
// КЛЮЧЕВЫЕ СЛОВА ДЛЯ РАСШИРЕННОГО ПОИСКА
// ============================================

// Политические лидеры и их локации
export const POLITICAL_KEYWORDS: Record<
  string,
  { country: string; city: string; coordinates: [number, number] }
> = {
  // США
  trump: {
    country: "United States",
    city: "Mar-a-Lago",
    coordinates: [-80.0364, 26.6774],
  },
  biden: {
    country: "United States",
    city: "Washington DC",
    coordinates: [-77.0369, 38.9072],
  },
  "white house": {
    country: "United States",
    city: "Washington DC",
    coordinates: [-77.0369, 38.9072],
  },
  congress: {
    country: "United States",
    city: "Washington DC",
    coordinates: [-77.0369, 38.9072],
  },
  senate: {
    country: "United States",
    city: "Washington DC",
    coordinates: [-77.0369, 38.9072],
  },
  pentagon: {
    country: "United States",
    city: "Washington DC",
    coordinates: [-77.0569, 38.8719],
  },

  // Россия
  putin: {
    country: "Russia",
    city: "Moscow",
    coordinates: [37.6173, 55.7558],
  },
  kremlin: {
    country: "Russia",
    city: "Moscow",
    coordinates: [37.6173, 55.7558],
  },

  // Украина
  zelensky: {
    country: "Ukraine",
    city: "Kyiv",
    coordinates: [30.5234, 50.4501],
  },
  zelenskyy: {
    country: "Ukraine",
    city: "Kyiv",
    coordinates: [30.5234, 50.4501],
  },

  // Китай
  "xi jinping": {
    country: "China",
    city: "Beijing",
    coordinates: [116.4074, 39.9042],
  },
  xi: { country: "China", city: "Beijing", coordinates: [116.4074, 39.9042] },

  // Европа
  macron: {
    country: "France",
    city: "Paris",
    coordinates: [2.3522, 48.8566],
  },
  scholz: { country: "Germany", city: "Berlin", coordinates: [13.405, 52.52] },
  starmer: {
    country: "United Kingdom",
    city: "London",
    coordinates: [-0.1276, 51.5074],
  },
  sunak: {
    country: "United Kingdom",
    city: "London",
    coordinates: [-0.1276, 51.5074],
  },
  meloni: { country: "Italy", city: "Rome", coordinates: [12.4964, 41.9028] },
  orban: {
    country: "Hungary",
    city: "Budapest",
    coordinates: [19.0402, 47.4979],
  },

  // Ближний Восток
  netanyahu: {
    country: "Israel",
    city: "Tel Aviv",
    coordinates: [34.7818, 32.0853],
  },
  hamas: {
    country: "Palestine",
    city: "Gaza",
    coordinates: [34.4668, 31.5017],
  },
  hezbollah: {
    country: "Lebanon",
    city: "Beirut",
    coordinates: [35.5018, 33.8938],
  },
  erdogan: {
    country: "Turkey",
    city: "Ankara",
    coordinates: [32.8597, 39.9334],
  },

  // Латинская Америка
  milei: {
    country: "Argentina",
    city: "Buenos Aires",
    coordinates: [-58.3816, -34.6037],
  },
  lula: {
    country: "Brazil",
    city: "Brasília",
    coordinates: [-47.8825, -15.7942],
  },
  maduro: {
    country: "Venezuela",
    city: "Caracas",
    coordinates: [-66.9036, 10.4806],
  },

  // Канада
  trudeau: {
    country: "Canada",
    city: "Ottawa",
    coordinates: [-75.6972, 45.4215],
  },

  // Индия
  modi: {
    country: "India",
    city: "New Delhi",
    coordinates: [77.209, 28.6139],
  },

  // Северная Корея
  "kim jong": {
    country: "North Korea",
    city: "Pyongyang",
    coordinates: [125.7625, 39.0392],
  },
};

// Организации и их локации
export const ORGANIZATION_KEYWORDS: Record<
  string,
  { country: string; city: string; coordinates: [number, number] }
> = {
  // Международные организации
  nato: {
    country: "Belgium",
    city: "Brussels",
    coordinates: [4.3517, 50.8503],
  },
  "european union": {
    country: "Belgium",
    city: "Brussels",
    coordinates: [4.3517, 50.8503],
  },
  eu: { country: "Belgium", city: "Brussels", coordinates: [4.3517, 50.8503] },
  "united nations": {
    country: "United States",
    city: "New York",
    coordinates: [-74.006, 40.7128],
  },
  un: {
    country: "United States",
    city: "New York",
    coordinates: [-74.006, 40.7128],
  },
  who: {
    country: "Switzerland",
    city: "Geneva",
    coordinates: [6.1432, 46.2044],
  },
  imf: {
    country: "United States",
    city: "Washington DC",
    coordinates: [-77.0369, 38.9072],
  },
  "world bank": {
    country: "United States",
    city: "Washington DC",
    coordinates: [-77.0369, 38.9072],
  },
  opec: {
    country: "Austria",
    city: "Vienna",
    coordinates: [16.3738, 48.2082],
  },
  fifa: {
    country: "Switzerland",
    city: "Zurich",
    coordinates: [8.5417, 47.3769],
  },
  ioc: {
    country: "Switzerland",
    city: "Lausanne",
    coordinates: [6.6323, 46.5197],
  },
  olympics: {
    country: "Switzerland",
    city: "Lausanne",
    coordinates: [6.6323, 46.5197],
  },

  // Финансы
  "federal reserve": {
    country: "United States",
    city: "Washington DC",
    coordinates: [-77.0369, 38.9072],
  },
  fed: {
    country: "United States",
    city: "Washington DC",
    coordinates: [-77.0369, 38.9072],
  },
  "wall street": {
    country: "United States",
    city: "New York",
    coordinates: [-74.006, 40.7128],
  },
  ecb: {
    country: "Germany",
    city: "Frankfurt",
    coordinates: [8.6821, 50.1109],
  },
  "bank of england": {
    country: "United Kingdom",
    city: "London",
    coordinates: [-0.1276, 51.5074],
  },

  // Технологии
  openai: {
    country: "United States",
    city: "San Francisco",
    coordinates: [-122.4194, 37.7749],
  },
  google: {
    country: "United States",
    city: "Mountain View",
    coordinates: [-122.0838, 37.3861],
  },
  apple: {
    country: "United States",
    city: "Cupertino",
    coordinates: [-122.0322, 37.323],
  },
  microsoft: {
    country: "United States",
    city: "Redmond",
    coordinates: [-122.1215, 47.674],
  },
  amazon: {
    country: "United States",
    city: "Seattle",
    coordinates: [-122.3321, 47.6062],
  },
  meta: {
    country: "United States",
    city: "Menlo Park",
    coordinates: [-122.1817, 37.4529],
  },
  facebook: {
    country: "United States",
    city: "Menlo Park",
    coordinates: [-122.1817, 37.4529],
  },
  tesla: {
    country: "United States",
    city: "Austin",
    coordinates: [-97.7431, 30.2672],
  },
  spacex: {
    country: "United States",
    city: "Boca Chica",
    coordinates: [-97.1631, 25.997],
  },
  nvidia: {
    country: "United States",
    city: "Santa Clara",
    coordinates: [-121.9552, 37.3541],
  },

  // Космос
  nasa: {
    country: "United States",
    city: "Cape Canaveral",
    coordinates: [-80.6077, 28.3922],
  },
};

// ============================================
// СИСТЕМА РАСПРЕДЕЛЕНИЯ ПО ГОРОДАМ СТРАНЫ
// ============================================

// Множество городов для каждой страны для равномерного распределения маркеров
export const COUNTRY_CITIES: Record<
  string,
  Array<{ name: string; coordinates: [number, number] }>
> = {
  "United States": [
    { name: "Washington DC", coordinates: [-77.0369, 38.9072] },
    { name: "New York", coordinates: [-74.006, 40.7128] },
    { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
    { name: "Chicago", coordinates: [-87.6298, 41.8781] },
    { name: "Houston", coordinates: [-95.3698, 29.7604] },
    { name: "Phoenix", coordinates: [-112.074, 33.4484] },
    { name: "Philadelphia", coordinates: [-75.1652, 39.9526] },
    { name: "San Antonio", coordinates: [-98.4936, 29.4241] },
    { name: "San Diego", coordinates: [-117.1611, 32.7157] },
    { name: "Dallas", coordinates: [-96.797, 32.7767] },
    { name: "San Jose", coordinates: [-121.8863, 37.3382] },
    { name: "Austin", coordinates: [-97.7431, 30.2672] },
    { name: "Jacksonville", coordinates: [-81.6557, 30.3322] },
    { name: "San Francisco", coordinates: [-122.4194, 37.7749] },
    { name: "Columbus", coordinates: [-82.9988, 39.9612] },
    { name: "Indianapolis", coordinates: [-86.1581, 39.7684] },
    { name: "Charlotte", coordinates: [-80.8431, 35.2271] },
    { name: "Seattle", coordinates: [-122.3321, 47.6062] },
    { name: "Denver", coordinates: [-104.9903, 39.7392] },
    { name: "Boston", coordinates: [-71.0589, 42.3601] },
    { name: "Detroit", coordinates: [-83.0458, 42.3314] },
    { name: "Nashville", coordinates: [-86.7816, 36.1627] },
    { name: "Portland", coordinates: [-122.6765, 45.5152] },
    { name: "Memphis", coordinates: [-90.049, 35.1495] },
    { name: "Oklahoma City", coordinates: [-97.5164, 35.4676] },
    { name: "Las Vegas", coordinates: [-115.1398, 36.1699] },
    { name: "Louisville", coordinates: [-85.7585, 38.2527] },
    { name: "Baltimore", coordinates: [-76.6122, 39.2904] },
    { name: "Milwaukee", coordinates: [-87.9065, 43.0389] },
    { name: "Albuquerque", coordinates: [-106.6504, 35.0844] },
    { name: "Tucson", coordinates: [-110.9265, 32.2226] },
    { name: "Fresno", coordinates: [-119.7871, 36.7378] },
    { name: "Sacramento", coordinates: [-121.4944, 38.5816] },
    { name: "Atlanta", coordinates: [-84.388, 33.749] },
    { name: "Kansas City", coordinates: [-94.5786, 39.0997] },
    { name: "Miami", coordinates: [-80.1918, 25.7617] },
    { name: "Raleigh", coordinates: [-78.6382, 35.7796] },
    { name: "Minneapolis", coordinates: [-93.265, 44.9778] },
    { name: "Cleveland", coordinates: [-81.6944, 41.4993] },
    { name: "Tampa", coordinates: [-82.4572, 27.9506] },
  ],
  "United Kingdom": [
    { name: "London", coordinates: [-0.1276, 51.5074] },
    { name: "Birmingham", coordinates: [-1.8904, 52.4862] },
    { name: "Manchester", coordinates: [-2.2426, 53.4808] },
    { name: "Glasgow", coordinates: [-4.2518, 55.8642] },
    { name: "Liverpool", coordinates: [-2.9916, 53.4084] },
    { name: "Edinburgh", coordinates: [-3.1883, 55.9533] },
    { name: "Leeds", coordinates: [-1.5491, 53.8008] },
    { name: "Sheffield", coordinates: [-1.4701, 53.3811] },
    { name: "Bristol", coordinates: [-2.5879, 51.4545] },
    { name: "Newcastle", coordinates: [-1.6178, 54.9783] },
  ],
  Germany: [
    { name: "Berlin", coordinates: [13.405, 52.52] },
    { name: "Hamburg", coordinates: [9.9937, 53.5511] },
    { name: "Munich", coordinates: [11.582, 48.1351] },
    { name: "Cologne", coordinates: [6.9603, 50.9375] },
    { name: "Frankfurt", coordinates: [8.6821, 50.1109] },
    { name: "Stuttgart", coordinates: [9.1829, 48.7758] },
    { name: "Düsseldorf", coordinates: [6.7735, 51.2277] },
    { name: "Leipzig", coordinates: [12.3731, 51.3397] },
    { name: "Dortmund", coordinates: [7.4653, 51.5136] },
    { name: "Dresden", coordinates: [13.7373, 51.0504] },
  ],
  France: [
    { name: "Paris", coordinates: [2.3522, 48.8566] },
    { name: "Marseille", coordinates: [5.3698, 43.2965] },
    { name: "Lyon", coordinates: [4.8357, 45.764] },
    { name: "Toulouse", coordinates: [1.4442, 43.6047] },
    { name: "Nice", coordinates: [7.262, 43.7102] },
    { name: "Nantes", coordinates: [-1.5536, 47.2184] },
    { name: "Strasbourg", coordinates: [7.7521, 48.5734] },
    { name: "Montpellier", coordinates: [3.8767, 43.6108] },
    { name: "Bordeaux", coordinates: [-0.5792, 44.8378] },
    { name: "Lille", coordinates: [3.0573, 50.6292] },
  ],
  Russia: [
    { name: "Moscow", coordinates: [37.6173, 55.7558] },
    { name: "St. Petersburg", coordinates: [30.3351, 59.9343] },
    { name: "Novosibirsk", coordinates: [82.9346, 55.0084] },
    { name: "Yekaterinburg", coordinates: [60.6122, 56.8389] },
    { name: "Kazan", coordinates: [49.1221, 55.7887] },
    { name: "Nizhny Novgorod", coordinates: [43.9361, 56.2965] },
    { name: "Samara", coordinates: [50.1606, 53.1959] },
    { name: "Rostov-on-Don", coordinates: [39.7139, 47.2357] },
    { name: "Krasnodar", coordinates: [38.9769, 45.0355] },
    { name: "Vladivostok", coordinates: [131.8869, 43.1155] },
  ],
  China: [
    { name: "Beijing", coordinates: [116.4074, 39.9042] },
    { name: "Shanghai", coordinates: [121.4737, 31.2304] },
    { name: "Guangzhou", coordinates: [113.2644, 23.1291] },
    { name: "Shenzhen", coordinates: [114.0579, 22.5431] },
    { name: "Chengdu", coordinates: [104.0665, 30.5728] },
    { name: "Hangzhou", coordinates: [120.1551, 30.2741] },
    { name: "Wuhan", coordinates: [114.3054, 30.5931] },
    { name: "Xian", coordinates: [108.9402, 34.3416] },
    { name: "Nanjing", coordinates: [118.7969, 32.0603] },
    { name: "Tianjin", coordinates: [117.1902, 39.1256] },
  ],
  Japan: [
    { name: "Tokyo", coordinates: [139.6917, 35.6895] },
    { name: "Osaka", coordinates: [135.5023, 34.6937] },
    { name: "Nagoya", coordinates: [136.9066, 35.1815] },
    { name: "Sapporo", coordinates: [141.3545, 43.0618] },
    { name: "Fukuoka", coordinates: [130.4017, 33.5904] },
    { name: "Kobe", coordinates: [135.183, 34.6901] },
    { name: "Kyoto", coordinates: [135.7681, 35.0116] },
    { name: "Yokohama", coordinates: [139.6503, 35.4437] },
    { name: "Sendai", coordinates: [140.8721, 38.2682] },
    { name: "Hiroshima", coordinates: [132.4596, 34.3853] },
  ],
  India: [
    { name: "New Delhi", coordinates: [77.209, 28.6139] },
    { name: "Mumbai", coordinates: [72.8777, 19.076] },
    { name: "Bangalore", coordinates: [77.5946, 12.9716] },
    { name: "Hyderabad", coordinates: [78.4867, 17.385] },
    { name: "Chennai", coordinates: [80.2707, 13.0827] },
    { name: "Kolkata", coordinates: [88.3639, 22.5726] },
    { name: "Ahmedabad", coordinates: [72.5714, 23.0225] },
    { name: "Pune", coordinates: [73.8567, 18.5204] },
    { name: "Jaipur", coordinates: [75.7873, 26.9124] },
    { name: "Lucknow", coordinates: [80.9462, 26.8467] },
  ],
  Brazil: [
    { name: "São Paulo", coordinates: [-46.6333, -23.5505] },
    { name: "Rio de Janeiro", coordinates: [-43.1729, -22.9068] },
    { name: "Brasília", coordinates: [-47.8825, -15.7942] },
    { name: "Salvador", coordinates: [-38.5016, -12.9714] },
    { name: "Fortaleza", coordinates: [-38.5267, -3.7172] },
    { name: "Belo Horizonte", coordinates: [-43.9378, -19.9167] },
    { name: "Manaus", coordinates: [-60.0217, -3.119] },
    { name: "Curitiba", coordinates: [-49.2653, -25.4284] },
    { name: "Recife", coordinates: [-34.8813, -8.0476] },
    { name: "Porto Alegre", coordinates: [-51.2177, -30.0346] },
  ],
  Canada: [
    { name: "Toronto", coordinates: [-79.3832, 43.6532] },
    { name: "Montreal", coordinates: [-73.5673, 45.5017] },
    { name: "Vancouver", coordinates: [-123.1207, 49.2827] },
    { name: "Calgary", coordinates: [-114.0719, 51.0447] },
    { name: "Edmonton", coordinates: [-113.4938, 53.5461] },
    { name: "Ottawa", coordinates: [-75.6972, 45.4215] },
    { name: "Winnipeg", coordinates: [-97.1384, 49.8951] },
    { name: "Quebec City", coordinates: [-71.2082, 46.8139] },
    { name: "Hamilton", coordinates: [-79.8711, 43.2557] },
    { name: "Victoria", coordinates: [-123.3656, 48.4284] },
  ],
  Australia: [
    { name: "Sydney", coordinates: [151.2093, -33.8688] },
    { name: "Melbourne", coordinates: [144.9631, -37.8136] },
    { name: "Brisbane", coordinates: [153.0251, -27.4698] },
    { name: "Perth", coordinates: [115.8605, -31.9505] },
    { name: "Adelaide", coordinates: [138.6007, -34.9285] },
    { name: "Gold Coast", coordinates: [153.4, -28.0167] },
    { name: "Canberra", coordinates: [149.1287, -35.2809] },
    { name: "Newcastle", coordinates: [151.7789, -32.9283] },
    { name: "Hobart", coordinates: [147.3272, -42.8821] },
    { name: "Darwin", coordinates: [130.8456, -12.4634] },
  ],
  Italy: [
    { name: "Rome", coordinates: [12.4964, 41.9028] },
    { name: "Milan", coordinates: [9.19, 45.4642] },
    { name: "Naples", coordinates: [14.2681, 40.8518] },
    { name: "Turin", coordinates: [7.6869, 45.0703] },
    { name: "Palermo", coordinates: [13.3615, 38.1157] },
    { name: "Genoa", coordinates: [8.9463, 44.4056] },
    { name: "Bologna", coordinates: [11.3426, 44.4949] },
    { name: "Florence", coordinates: [11.2558, 43.7696] },
    { name: "Venice", coordinates: [12.3155, 45.4408] },
    { name: "Verona", coordinates: [10.9916, 45.4384] },
  ],
  Spain: [
    { name: "Madrid", coordinates: [-3.7038, 40.4168] },
    { name: "Barcelona", coordinates: [2.1734, 41.3851] },
    { name: "Valencia", coordinates: [-0.3763, 39.4699] },
    { name: "Seville", coordinates: [-5.9845, 37.3891] },
    { name: "Zaragoza", coordinates: [-0.8773, 41.6488] },
    { name: "Málaga", coordinates: [-4.4214, 36.7213] },
    { name: "Murcia", coordinates: [-1.1307, 37.9922] },
    { name: "Palma", coordinates: [2.6502, 39.5696] },
    { name: "Bilbao", coordinates: [-2.9253, 43.263] },
    { name: "Alicante", coordinates: [-0.4816, 38.3452] },
  ],
  Ukraine: [
    { name: "Kyiv", coordinates: [30.5234, 50.4501] },
    { name: "Kharkiv", coordinates: [36.2304, 49.9935] },
    { name: "Odessa", coordinates: [30.7233, 46.4825] },
    { name: "Dnipro", coordinates: [35.0462, 48.4647] },
    { name: "Lviv", coordinates: [24.0297, 49.8397] },
    { name: "Zaporizhzhia", coordinates: [35.1396, 47.8388] },
    { name: "Vinnytsia", coordinates: [28.4682, 49.2331] },
    { name: "Poltava", coordinates: [34.5514, 49.5883] },
    { name: "Chernihiv", coordinates: [31.2893, 51.4982] },
    { name: "Ivano-Frankivsk", coordinates: [24.7111, 48.9226] },
  ],
  Mexico: [
    { name: "Mexico City", coordinates: [-99.1332, 19.4326] },
    { name: "Guadalajara", coordinates: [-103.3496, 20.6597] },
    { name: "Monterrey", coordinates: [-100.3161, 25.6866] },
    { name: "Puebla", coordinates: [-98.2063, 19.0414] },
    { name: "Tijuana", coordinates: [-117.0382, 32.5149] },
    { name: "León", coordinates: [-101.6869, 21.1167] },
    { name: "Cancún", coordinates: [-86.8515, 21.1619] },
    { name: "Mérida", coordinates: [-89.5926, 20.9674] },
    { name: "Querétaro", coordinates: [-100.3899, 20.5888] },
    { name: "Toluca", coordinates: [-99.6567, 19.2826] },
  ],
  "South Korea": [
    { name: "Seoul", coordinates: [126.978, 37.5665] },
    { name: "Busan", coordinates: [129.0756, 35.1796] },
    { name: "Incheon", coordinates: [126.7052, 37.4563] },
    { name: "Daegu", coordinates: [128.6014, 35.8714] },
    { name: "Daejeon", coordinates: [127.3845, 36.3504] },
    { name: "Gwangju", coordinates: [126.8526, 35.1595] },
    { name: "Suwon", coordinates: [127.0286, 37.2636] },
    { name: "Ulsan", coordinates: [129.3114, 35.5384] },
  ],
  Israel: [
    { name: "Tel Aviv", coordinates: [34.7818, 32.0853] },
    { name: "Jerusalem", coordinates: [35.2137, 31.7683] },
    { name: "Haifa", coordinates: [34.9896, 32.794] },
    { name: "Rishon LeZion", coordinates: [34.7896, 31.9643] },
    { name: "Petah Tikva", coordinates: [34.8867, 32.0841] },
    { name: "Ashdod", coordinates: [34.6415, 31.8044] },
    { name: "Netanya", coordinates: [34.8577, 32.3328] },
    { name: "Beer Sheva", coordinates: [34.7913, 31.2518] },
  ],
  Turkey: [
    { name: "Istanbul", coordinates: [28.9784, 41.0082] },
    { name: "Ankara", coordinates: [32.8597, 39.9334] },
    { name: "Izmir", coordinates: [27.1428, 38.4237] },
    { name: "Bursa", coordinates: [29.0609, 40.1885] },
    { name: "Antalya", coordinates: [30.7133, 36.8969] },
    { name: "Adana", coordinates: [35.3213, 37.0] },
    { name: "Gaziantep", coordinates: [37.3781, 37.0662] },
    { name: "Konya", coordinates: [32.4846, 37.8746] },
  ],
  Poland: [
    { name: "Warsaw", coordinates: [21.0122, 52.2297] },
    { name: "Kraków", coordinates: [19.945, 50.0647] },
    { name: "Łódź", coordinates: [19.456, 51.7592] },
    { name: "Wrocław", coordinates: [17.0385, 51.1079] },
    { name: "Poznań", coordinates: [16.9252, 52.4064] },
    { name: "Gdańsk", coordinates: [18.6466, 54.352] },
    { name: "Szczecin", coordinates: [14.5528, 53.4285] },
    { name: "Bydgoszcz", coordinates: [18.0084, 53.1235] },
  ],
  Netherlands: [
    { name: "Amsterdam", coordinates: [4.9041, 52.3676] },
    { name: "Rotterdam", coordinates: [4.4777, 51.9244] },
    { name: "The Hague", coordinates: [4.3007, 52.0705] },
    { name: "Utrecht", coordinates: [5.1214, 52.0907] },
    { name: "Eindhoven", coordinates: [5.4697, 51.4416] },
    { name: "Groningen", coordinates: [6.5665, 53.2194] },
  ],
  Argentina: [
    { name: "Buenos Aires", coordinates: [-58.3816, -34.6037] },
    { name: "Córdoba", coordinates: [-64.1888, -31.4201] },
    { name: "Rosario", coordinates: [-60.6505, -32.9468] },
    { name: "Mendoza", coordinates: [-68.8272, -32.8908] },
    { name: "Tucumán", coordinates: [-65.2176, -26.8241] },
    { name: "Mar del Plata", coordinates: [-57.5575, -38.0023] },
  ],
};

// Счётчик для ротации городов внутри страны
const countryRotationIndex: Record<string, number> = {};

/**
 * Получает город из списка городов страны с ротацией
 */
export function getRotatedCityForCountry(
  country: string,
  id: string,
): { name: string; coordinates: [number, number] } | null {
  const cities = COUNTRY_CITIES[country];
  if (!cities || cities.length === 0) return null;

  // Используем хеш ID для детерминированного выбора + ротация
  const hash = hashCode(id);
  const rotationOffset = countryRotationIndex[country] || 0;
  const cityIndex = (hash + rotationOffset) % cities.length;

  // Увеличиваем счётчик ротации
  countryRotationIndex[country] = (rotationOffset + 1) % cities.length;

  return cities[cityIndex];
}

/**
 * Сбрасывает счётчики ротации (вызывать при новой загрузке данных)
 */
export function resetCityRotation(): void {
  Object.keys(countryRotationIndex).forEach((key) => {
    countryRotationIndex[key] = 0;
  });
}

// ============================================
// ОСНОВНЫЕ ФУНКЦИИ
// ============================================

/**
 * Извлекает страны и города из текста с помощью compromise.js
 */
export function extractLocationsWithNLP(text: string): DetectionResult {
  const doc = nlp(text);

  // Извлекаем места с помощью NLP
  const places = doc.places().out("array") as string[];
  const countries: string[] = [];
  const cities: string[] = [];
  const regions: string[] = [];
  const keywords: string[] = [];

  // Разделяем места на страны и города
  for (const place of places) {
    const placeLower = place.toLowerCase();

    if (COUNTRY_COORDINATES[placeLower]) {
      countries.push(COUNTRY_COORDINATES[placeLower].name);
    } else if (CITY_COORDINATES[placeLower]) {
      cities.push(CITY_COORDINATES[placeLower].name);
    } else {
      regions.push(place);
    }
  }

  return { countries, cities, regions, keywords };
}

/**
 * Ищет ключевые слова в тексте
 */
export function findKeywordsInText(text: string): {
  keyword: string;
  location: { country: string; city: string; coordinates: [number, number] };
}[] {
  const textLower = text.toLowerCase();
  const found: {
    keyword: string;
    location: { country: string; city: string; coordinates: [number, number] };
  }[] = [];

  // Поиск по политическим ключевым словам
  for (const [keyword, location] of Object.entries(POLITICAL_KEYWORDS)) {
    if (textLower.includes(keyword)) {
      found.push({ keyword, location });
    }
  }

  // Поиск по организациям
  for (const [keyword, location] of Object.entries(ORGANIZATION_KEYWORDS)) {
    if (textLower.includes(keyword)) {
      found.push({ keyword, location });
    }
  }

  // Поиск по странам
  for (const [keyword, location] of Object.entries(COUNTRY_COORDINATES)) {
    if (textLower.includes(keyword)) {
      found.push({
        keyword,
        location: {
          country: location.name,
          city: location.city,
          coordinates: location.coordinates,
        },
      });
    }
  }

  // Поиск по городам
  for (const [keyword, location] of Object.entries(CITY_COORDINATES)) {
    if (textLower.includes(keyword)) {
      found.push({
        keyword,
        location: {
          country: location.country,
          city: location.name,
          coordinates: location.coordinates,
        },
      });
    }
  }

  // Сортируем по длине ключевого слова (длинные = более точные)
  return found.sort((a, b) => b.keyword.length - a.keyword.length);
}

/**
 * Подсчитывает частоту упоминания стран
 */
export function countCountryMentions(
  text: string,
): Map<string, { count: number; coordinates: [number, number]; city: string }> {
  const textLower = text.toLowerCase();
  const countryMentions = new Map<
    string,
    { count: number; coordinates: [number, number]; city: string }
  >();

  // Считаем упоминания стран
  for (const [keyword, location] of Object.entries(COUNTRY_COORDINATES)) {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    const matches = textLower.match(regex);
    if (matches && matches.length > 0) {
      const existing = countryMentions.get(location.name);
      if (existing) {
        existing.count += matches.length;
      } else {
        countryMentions.set(location.name, {
          count: matches.length,
          coordinates: location.coordinates,
          city: location.city,
        });
      }
    }
  }

  // Считаем упоминания политиков и организаций
  for (const [keyword, location] of Object.entries(POLITICAL_KEYWORDS)) {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    const matches = textLower.match(regex);
    if (matches && matches.length > 0) {
      const existing = countryMentions.get(location.country);
      if (existing) {
        existing.count += matches.length;
      } else {
        countryMentions.set(location.country, {
          count: matches.length,
          coordinates: location.coordinates,
          city: location.city,
        });
      }
    }
  }

  return countryMentions;
}

/**
 * Определяет основную геолокацию текста
 * Приоритет: город > страна > ключевое слово > категория
 * При нахождении страны - использует ротацию по городам
 */
export function detectGeoLocation(
  text: string,
  sourcecountry?: string,
  category?: string,
  id?: string,
): GeoLocation | null {
  const textLower = text.toLowerCase();

  // 1. Сначала ищем конкретные города
  for (const [cityKey, cityData] of Object.entries(CITY_COORDINATES)) {
    if (textLower.includes(cityKey)) {
      return {
        country: cityData.country,
        city: cityData.name,
        coordinates: cityData.coordinates,
        confidence: 0.95,
      };
    }
  }

  // 2. Ищем политиков и организации (высокая точность)
  const keywordMatches = findKeywordsInText(text);
  if (keywordMatches.length > 0) {
    const best = keywordMatches[0];
    return {
      country: best.location.country,
      city: best.location.city,
      coordinates: best.location.coordinates,
      confidence: 0.9,
    };
  }

  // 3. Ищем страны и считаем частоту
  const countryMentions = countCountryMentions(text);
  if (countryMentions.size > 0) {
    // Берём страну с максимальным количеством упоминаний
    let maxCountry = "";
    let maxData = {
      count: 0,
      coordinates: [0, 0] as [number, number],
      city: "",
    };

    for (const [country, data] of countryMentions) {
      if (data.count > maxData.count) {
        maxCountry = country;
        maxData = data;
      }
    }

    if (maxCountry) {
      // Используем ротацию по городам если есть ID
      if (id) {
        const rotatedCity = getRotatedCityForCountry(maxCountry, id);
        if (rotatedCity) {
          return {
            country: maxCountry,
            city: rotatedCity.name,
            coordinates: rotatedCity.coordinates,
            confidence: 0.8,
          };
        }
      }

      return {
        country: maxCountry,
        city: maxData.city,
        coordinates: maxData.coordinates,
        confidence: 0.8,
      };
    }
  }

  // 4. Используем sourcecountry из метаданных новости
  if (sourcecountry) {
    const countryLower = sourcecountry.toLowerCase();
    for (const [key, data] of Object.entries(COUNTRY_COORDINATES)) {
      if (countryLower.includes(key) || key.includes(countryLower)) {
        // Используем ротацию по городам если есть ID
        if (id && COUNTRY_CITIES[data.name]) {
          const rotatedCity = getRotatedCityForCountry(data.name, id);
          if (rotatedCity) {
            return {
              country: data.name,
              city: rotatedCity.name,
              coordinates: rotatedCity.coordinates,
              confidence: 0.6,
            };
          }
        }

        return {
          country: data.name,
          city: data.city,
          coordinates: data.coordinates,
          confidence: 0.6,
        };
      }
    }
  }

  // 5. Используем категорию
  if (category) {
    const categoryLocations: Record<
      string,
      { country: string; city: string; coordinates: [number, number] }
    > = {
      politics: {
        country: "United States",
        city: "Washington DC",
        coordinates: [-77.0369, 38.9072],
      },
      crypto: {
        country: "Singapore",
        city: "Singapore",
        coordinates: [103.8198, 1.3521],
      },
      finance: {
        country: "United States",
        city: "New York",
        coordinates: [-74.006, 40.7128],
      },
      tech: {
        country: "United States",
        city: "San Francisco",
        coordinates: [-122.4194, 37.7749],
      },
      sports: {
        country: "United States",
        city: "Los Angeles",
        coordinates: [-118.2437, 34.0522],
      },
      entertainment: {
        country: "United States",
        city: "Los Angeles",
        coordinates: [-118.2437, 34.0522],
      },
    };

    const categoryLower = category.toLowerCase();
    if (categoryLocations[categoryLower]) {
      const loc = categoryLocations[categoryLower];
      return {
        country: loc.country,
        city: loc.city,
        coordinates: loc.coordinates,
        confidence: 0.4,
      };
    }
  }

  return null;
}

/**
 * Добавляет случайное смещение к координатам в пределах региона
 */
export function addRandomOffset(
  coordinates: [number, number],
  id: string,
  index: number = 0,
): [number, number] {
  // Используем хеш для детерминированного, но случайного смещения
  const hash = hashCode(id + index.toString());
  const hash2 = hashCode(id + index.toString() + "salt");

  // Смещение в пределах ~1 градуса (около 100 км)
  const lngOffset = ((hash % 200) - 100) / 100; // -1.0 до +1.0
  const latOffset = ((hash2 % 200) - 100) / 100; // -1.0 до +1.0

  return [coordinates[0] + lngOffset, coordinates[1] + latOffset];
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

// ============================================
// ЭКСПОРТ ОСНОВНОЙ ФУНКЦИИ
// ============================================

export interface GeoLocationInput {
  id: string;
  title: string;
  description?: string;
  category?: string;
  sourcecountry?: string;
  index?: number;
}

/**
 * Главная функция - определяет координаты для элемента (новости/маркета)
 */
export function getGeoCoordinates(input: GeoLocationInput): {
  coordinates: [number, number];
  location: GeoLocation | null;
} {
  const text = `${input.title} ${input.description || ""}`;

  const location = detectGeoLocation(
    text,
    input.sourcecountry,
    input.category,
    input.id,
  );

  if (location) {
    const coordinates = addRandomOffset(
      location.coordinates,
      input.id,
      input.index || 0,
    );
    return { coordinates, location };
  }

  // Fallback - Лондон как нейтральная глобальная точка
  const fallbackCoords: [number, number] = [-0.1276, 51.5074];
  return {
    coordinates: addRandomOffset(fallbackCoords, input.id, input.index || 0),
    location: null,
  };
}
