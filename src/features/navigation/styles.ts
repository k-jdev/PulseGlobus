import { cn } from "@/utils/cn";

/** Shared pill/chip class recipes for the sub-navigation bar. */
const PILL_BASE =
  "flex-shrink-0 rounded-full font-medium transition-all whitespace-nowrap";
const OUTLINED = "bg-white border border-[rgba(0,0,0,0.12)]";

export const categoryChip = (isActive: boolean, isMobile = false) =>
  cn(
    PILL_BASE,
    isMobile ? "h-10 px-4 text-[13px]" : "h-12 px-6 py-3 text-[15px]",
    "tracking-[-0.3px]",
    isActive
      ? "bg-[#1452f0] text-white shadow-[0px_2px_8px_0px_rgba(20,82,240,0.2)]"
      : cn(OUTLINED, "text-[#808080]"),
  );

export const timeFilterChip = (isActive: boolean, isMobile = false) =>
  cn(
    PILL_BASE,
    isMobile ? "h-10 px-4 text-[13px]" : "h-12 px-6 py-3 text-[15px]",
    OUTLINED,
    isActive ? "text-[#1452f0]" : "text-[#bbbdc1]",
  );

export const iconButton = (isMobile = false) =>
  cn(
    "flex-shrink-0 flex items-center justify-center rounded-full transition-all",
    isMobile ? "w-10 h-10" : "w-12 h-12",
    OUTLINED,
  );
