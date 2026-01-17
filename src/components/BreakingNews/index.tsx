import { useMemo, useState } from "react";
import { useGetNewsQuery, GdeltArticle } from "../../store/services/gdeltApi";

type TimeFilter = "1h" | "6h" | "24h";

interface NewsItem {
  id: string;
  image: string;
  title: string;
  source: string;
  date: string;
  country: string;
  url: string;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatCountry = (country: string): string => {
  if (!country) return "World";
  const countryMap: Record<string, string> = {
    US: "United States",
    UK: "United Kingdom",
    UA: "Ukraine",
    RU: "Russia",
    CN: "China",
    DE: "Germany",
    FR: "France",
    JP: "Japan",
    IN: "India",
    BR: "Brazil",
    AU: "Australia",
    CA: "Canada",
    KR: "South Korea",
    IL: "Israel",
    IR: "Iran",
    SA: "Saudi Arabia",
    TR: "Turkey",
    MX: "Mexico",
    AR: "Argentina",
    VE: "Venezuela",
  };
  return countryMap[country.toUpperCase()] || country;
};

const convertArticleToNews = (
  article: GdeltArticle,
  index: number,
): NewsItem => {
  return {
    id: `${article.url}-${index}`,
    image: article.socialimage || "",
    title: article.title,
    source: article.domain?.replace("www.", "") || "Unknown",
    date: formatDate(article.seendate),
    country: formatCountry(article.sourcecountry),
    url: article.url,
  };
};

interface BreakingNewsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BreakingNews = ({ isOpen }: BreakingNewsProps) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("24h");

  const timespanMap: Record<TimeFilter, string> = {
    "1h": "1h",
    "6h": "6h",
    "24h": "1d",
  };

  // Crypto-relevant news: geopolitics, economy, conflicts, disasters
  const breakingNewsQuery =
    "(war OR conflict OR earthquake OR election OR sanctions OR bitcoin OR crisis OR Ukraine OR Israel OR China)";

  const {
    data: articles,
    isLoading,
    isFetching,
  } = useGetNewsQuery({
    query: breakingNewsQuery,
    maxrecords: 150,
    timespan: timespanMap[timeFilter],
  });

  const news: NewsItem[] = useMemo(() => {
    if (!articles) return [];
    return articles
      .slice(0, 30)
      .map((article, index) => convertArticleToNews(article, index));
  }, [articles]);

  const showLoading = isLoading || isFetching;

  if (!isOpen) return null;

  return (
    <div className="absolute top-[144px] md:top-[160px] left-4 md:left-8 bg-white border-t-[6px] border-[#EE1616] rounded-[14px] w-[calc(100vw-32px)] md:w-[502px] max-h-[calc(100vh-180px)] md:max-h-[70vh] overflow-hidden z-50 shadow-[0px_22px_32px_0px_rgba(20,82,240,0.25)]">
      {/* Header */}
      <div className="px-6 pt-7 pb-4">
        <div className="flex flex-col gap-2 mb-4">
          <h2 className="text-[32px] font-bold text-black tracking-[-0.56px] leading-8">
            Breaking News
          </h2>
          <p className="text-[#808080] text-[16px] font-medium tracking-[-0.32px]">
            Global events affecting markets. Click on globe markers to see
            related predictions.
          </p>
        </div>

        {/* Time filters */}
        <div className="flex gap-2">
          {(["1h", "6h", "24h"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`h-12 px-6 py-3 rounded-full text-[15px] font-medium transition-colors border border-[rgba(0,0,0,0.12)] ${
                timeFilter === filter
                  ? "bg-[rgba(20,82,240,0.1)] text-[#1452F0]"
                  : "bg-white text-[#BBBDC1] hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-[#e4e4e4]" />

      {/* News List */}
      <div className="px-6 py-4 overflow-y-auto max-h-[calc(100vh-380px)] md:max-h-[calc(70vh-200px)]">
        {showLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1452F0]"></div>
            <span className="text-[14px] text-[#808080] font-medium">
              Loading news...
            </span>
          </div>
        ) : news.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <span className="text-[16px] text-[#808080] font-medium">
              No news found
            </span>
            <span className="text-[14px] text-[#BBBDC1]">
              Try a different time filter
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            {news.map((item) => (
              <NewsRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const NewsRow = ({ item }: { item: NewsItem }) => {
  const handleClick = () => {
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="flex items-start gap-4 py-4 border-b border-[#e4e4e4] last:border-b-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
      onClick={handleClick}
    >
      {/* Image */}
      {item.image ? (
        <div className="w-[72px] h-[72px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
          <img
            src={item.image}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="w-[72px] h-[72px] rounded-lg flex-shrink-0 bg-gradient-to-br from-[#EE1616] to-[#cc1010] flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className="text-[#1B2430] font-semibold text-[17px] leading-[24px] tracking-[-0.3px] mb-2 line-clamp-2">
          {item.title}
        </h3>

        {/* Meta info: Source • Date • Country */}
        <div className="flex items-center gap-2 text-[14px] text-[#808080] font-medium">
          <span className="truncate max-w-[120px]">{item.source}</span>
          <span className="text-[#BBBDC1]">•</span>
          <span>{item.date}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1452F0]"></span>
          <span className="text-[#1452F0]">{item.country}</span>
        </div>
      </div>

      {/* External link icon */}
      <div className="flex-shrink-0 text-[#1452F0]">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </div>
    </div>
  );
};

export default BreakingNews;
