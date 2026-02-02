import { Button } from "@/components/ui";

export type TimeFilter = "1h" | "6h" | "24h";

interface TimeFiltersProps {
  activeFilter?: TimeFilter;
  onFilterChange?: (filter: TimeFilter) => void;
}

function TimeFilters({
  activeFilter = "24h",
  onFilterChange,
}: TimeFiltersProps) {
  const filters: TimeFilter[] = ["1h", "6h", "24h"];

  const handleFilterClick = (filter: TimeFilter) => {
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <div className="flex gap-2 items-center pointer-events-auto">
      {filters.map((filter) => (
        <Button
          variant="navigation"
          key={filter}
          onClick={() => handleFilterClick(filter)}
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
