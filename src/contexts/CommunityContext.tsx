import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserMemberships, useHasSeedData, useSeedDemoCommunity, useEnsureUserProfile } from "@/hooks/useConvexData";

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
  useEnsureUserProfile();
  const { data: memberships = [], isLoading } = useUserMemberships();
  const { data: hasSeedData, isLoading: seedChecking } = useHasSeedData();
  const seedCommunity = useSeedDemoCommunity();
  const [communityId, setCommunityIdState] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  const communities = memberships.map((m: any) => m.communities).filter(Boolean);

  // Auto-seed demo data when no memberships and seed data doesn't exist
  useEffect(() => {
    if (!isLoading && !seedChecking && memberships.length === 0 && !hasSeedData && !seeded && user) {
      setSeeded(true);
      try {
        seedCommunity.mutateAsync({});
      } catch {
        // Seed failed — that's OK, user will see empty state
      }
    }
  }, [isLoading, seedChecking, memberships, hasSeedData, seeded, user, seedCommunity]);

  // Auto-select first community if none selected
  useEffect(() => {
    if (!communityId && communities.length > 0) {
      setCommunityIdState(communities[0]._id);
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
    <CommunityContext.Provider value={{ communityId, setCommunityId, communities, isLoading: isLoading || seedChecking }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  return useContext(CommunityContext);
}
