import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCommunity } from "@/contexts/CommunityContext";

export type CommunityRole = "resident" | "founder" | "admin" | "moderator" | "host";

interface UserRoleInfo {
  role: CommunityRole;
  verified: boolean;
  verificationStatus: "none" | "pending" | "approved" | "rejected";
}

/**
 * Fetches the current user's role in the active community.
 * Returns the role info from community_memberships table.
 */
export function useUserRole() {
  const { user } = useAuth();
  const { communityId } = useCommunity();

  return useQuery<UserRoleInfo>({
    queryKey: ["userRole", user?.id, communityId],
    queryFn: async () => {
      if (!user || !communityId) return { role: "resident", verified: false, verificationStatus: "none" };

      try {
        const { data, error } = await supabase
          .from("community_memberships" as any)
          .select("role, verified, verification_status")
          .eq("user_id", user.id)
          .eq("community_id", communityId)
          .single();

        if (error || !data) return { role: "resident", verified: false, verificationStatus: "none" };

        return {
          role: (data as any).role as CommunityRole,
          verified: (data as any).verified ?? false,
          verificationStatus: (data as any).verification_status ?? "none",
        };
      } catch {
        return { role: "resident", verified: false, verificationStatus: "none" };
      }
    },
    enabled: !!user && !!communityId,
    staleTime: 60_000,
  });
}

/**
 * Simple boolean checks for role-based rendering.
 */
export function useIsAdmin() {
  const { data } = useUserRole();
  return data?.role === "admin";
}

export function useIsFounder() {
  const { data } = useUserRole();
  return data?.role === "founder";
}

export function useIsModerator() {
  const { data } = useUserRole();
  return data?.role === "moderator" || data?.role === "admin";
}

export function useIsHost() {
  const { data } = useUserRole();
  return data?.role === "host" || data?.role === "admin" || data?.role === "founder";
}
