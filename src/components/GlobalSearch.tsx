import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGlobalSearch } from "@/hooks/useMessagingData";
import { Search, Users, Calendar, UsersRound, FileText, ArrowRight } from "lucide-react";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId?: string;
}

const SECTION_ICONS = {
  communities: Users,
  activities: Calendar,
  clubs: UsersRound,
  posts: FileText,
} as const;

const SECTION_LABELS: Record<string, string> = {
  communities: "Communities",
  activities: "Activities",
  clubs: "Clubs",
  posts: "Posts",
};

export function GlobalSearch({ open, onOpenChange, communityId }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data: results, isLoading } = useGlobalSearch(query, communityId);

  const handleSelect = useCallback(
    (section: string, id: string) => {
      onOpenChange(false);
      setQuery("");
      switch (section) {
        case "communities":
          navigate(`/community/${id}`);
          break;
        case "activities":
          navigate(`/dashboard/activities/${id}`);
          break;
        case "clubs":
          navigate(`/dashboard/clubs/${id}`);
          break;
        case "posts":
          navigate(`/dashboard/posts/${id}`);
          break;
      }
    },
    [navigate, onOpenChange]
  );

  const totalResults = results
    ? results.communities.length + results.activities.length + results.clubs.length + results.posts.length
    : 0;

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setQuery(""); }}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Search</DialogTitle>
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search communities, activities, clubs, people..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto text-base bg-transparent"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[400px]">
          {query.length < 2 ? (
            <div className="px-4 py-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Type at least 2 characters to search</p>
            </div>
          ) : isLoading ? (
            <div className="px-4 py-8 text-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="py-2">
              {(["communities", "activities", "clubs", "posts"] as const).map((section) => {
                const items = results?.[section] || [];
                if (items.length === 0) return null;
                const Icon = SECTION_ICONS[section];
                return (
                  <div key={section} className="mb-2">
                    <div className="px-4 py-1.5 flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {SECTION_LABELS[section]}
                      </span>
                      <Badge variant="secondary" className="ml-auto text-[10px] h-5 px-1.5">
                        {items.length}
                      </Badge>
                    </div>
                    {items.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(section, item.id)}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.name || item.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.area || item.city || item.description || item.category || ""}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
