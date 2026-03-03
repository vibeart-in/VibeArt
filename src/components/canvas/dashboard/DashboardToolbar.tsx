import { Search, Globe, Workflow } from "lucide-react";
import { Input } from "../../ui/input";

type TabType = "My Workflows" | "Community";

interface DashboardToolbarProps {
  activeTab: TabType;
  searchQuery: string;
  onTabChange: (tab: TabType) => void;
  onSearchChange: (query: string) => void;
}

export function DashboardToolbar({
  activeTab,
  searchQuery,
  onTabChange,
  onSearchChange,
}: DashboardToolbarProps) {
  const tabs: TabType[] = ["My Workflows", "Community"];

  return (
    <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
      <div className="flex w-full items-center gap-1 rounded-2xl border border-white/10 bg-black/40 p-1.5 backdrop-blur-xl md:w-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex items-center gap-2 rounded-xl px-6 py-2.5 font-satoshi font-bold transition-all duration-150 ${
              tab === activeTab
                ? "bg-white/90 text-black shadow-lg"
                : "text-neutral-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {tab === "My Workflows" && <Workflow className="size-4" />}
            {tab === "Community" && <Globe className="size-4" />}
            {tab}
          </button>
        ))}
      </div>

      <div className="flex w-full items-center gap-4 md:w-auto">
        <div className="group relative flex-1 md:w-80">
          <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-neutral-500 transition-colors duration-150 group-focus-within:text-accent" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={
              activeTab === "My Workflows" ? "Search workflows..." : "Search community..."
            }
            className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pr-11 text-sm text-neutral-200 transition-all duration-150 placeholder:text-neutral-500 focus:border-accent/50 focus:bg-black/60 focus:outline-none focus:ring-4 focus:ring-accent/10"
          />
        </div>
      </div>
    </div>
  );
}
