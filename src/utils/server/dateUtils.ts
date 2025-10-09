import { HistoryItem } from "@/src/types/BaseType";
import { format, isToday, isYesterday, isThisWeek, parseISO } from "date-fns";

// This function will categorize a date string into human-readable groups.
export const formatDateGroup = (dateStr: string): string => {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  // For dates within the last 7 days (but not today/yesterday), show the day name.
  if (isThisWeek(date, { weekStartsOn: 1 /* Monday */ })) {
    return format(date, "eeee"); // e.g., "Friday"
  }
  // For older dates, show the full date.
  return format(date, "MMM d"); // Sep 15
};

// This function takes the raw history array and groups it into an object.
export const groupHistoryByDate = (history: HistoryItem[]) => {
  if (!history) return {};

  return history.reduce((acc: { [key: string]: HistoryItem[] }, item) => {
    const group = formatDateGroup(item.created_at);
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {});
};
