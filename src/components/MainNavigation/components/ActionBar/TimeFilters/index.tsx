import { useState } from "react";
import { Button } from "../../../../ui";
type TimeFilter = "1h" | "6h" | "24h";

function TimeFilters() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("24h");

  const filters: TimeFilter[] = ["1h", "6h", "24h"];

  return (
    <div className="flex gap-2 items-center pointer-events-auto">
      {filters.map((filter) => (
        <Button
          variant="navigation"
          key={filter}
          onClick={() => setActiveFilter(filter)}
          className={`px-6 py-3 rounded-full transition-all font-medium text-[16px] ${
            activeFilter === filter
              ? "bg-white text-[#1452F0]"
              : "bg-white text-[#BBBDC1] "
          }`}
        >
          {filter}
        </Button>
      ))}
    </div>
  );
}

export default TimeFilters;
