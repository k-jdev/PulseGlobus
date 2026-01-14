import { useEffect } from "react";
import { useGetMarketsQuery } from "../../store/services/polymarketApi";

export const TestPolymarketComponent = () => {
  const {
    data: markets,
    isLoading: marketsLoading,
    error: marketsError,
  } = useGetMarketsQuery({ limit: 10, active: true });

  useEffect(() => {
    console.log("=== POLYMARKET API TEST ===");

    if (marketsLoading) {
      console.log("");
    } else if (marketsError) {
      console.error("❌ Ошибка загрузки рынков:", marketsError);
    } else if (markets) {
      console.log("✅ Рынки загружены:", markets);
      console.log(`📈 Количество рынков: ${markets.length}`);
      if (markets.length > 0) {
        console.log("📊 Первый рынок:", markets[0]);
      }
    }

    console.log("=========================");
  }, [markets, marketsLoading, marketsError]);

  return (
    <div className="fixed bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">🧪 Polymarket API Test</h3>

      <div className="space-y-2 text-xs">
        <div>
          <div className="font-semibold">Рынки:</div>
          {marketsLoading && <div className="text-blue-600">Загрузка...</div>}
          {marketsError && <div className="text-red-600">Ошибка загрузки</div>}
          {markets && (
            <div className="text-green-600">✓ Загружено: {markets.length}</div>
          )}
        </div>

        <div className="text-gray-500 mt-2">Проверь консоль для деталей</div>
      </div>
    </div>
  );
};
