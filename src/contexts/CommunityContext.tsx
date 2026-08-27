import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserMemberships } from "@/hooks/useCommunityData";

interface CommunityContextValue {
  communityId: string | null;
  setCommunityId: (id: string | null) => void;
  communities: any[];
  isLoading: boolean;
}

const CommunityContext = createContext<CommunityContextValue>({
  communityId: null,
  setCommunityId: () => {},
  communities: [],
  isLoading: false,
});

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: memberships = [], isLoading } = useUserMemberships();
  const [communityId, setCommunityIdState] = useState<string | null>(null);

  const communities = memberships.map((m: any) => m.communities).filter(Boolean);

  // Auto-select first community if none selected
  useEffect(() => {
    if (!communityId && communities.length > 0) {
      setCommunityIdState(communities[0].id);
    }
  }, [communities, communityId]);

  // Restore from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("joinn_community_id");
    if (saved && !communityId) {
      setCommunityIdState(saved);
    }
  }, []);

  const setCommunityId = (id: string | null) => {
    setCommunityIdState(id);
    if (id) localStorage.setItem("joinn_community_id", id);
    else localStorage.removeItem("joinn_community_id");
  };

  return (
    <CommunityContext.Provider value={{ communityId, setCommunityId, communities, isLoading }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  return useContext(CommunityContext);
}
