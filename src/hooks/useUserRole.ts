import { useQuery } from "convex/react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/contexts/CommunityContext";
import { api } from "../../convex/_generated/api";

export type CommunityRole = "resident" | "founder" | "admin" | "moderator" | "host";

interface UserRoleInfo {
  role: CommunityRole;
  verified: boolean;
  verificationStatus: "none" | "pending" | "approved" | "rejected";
}

/**
 * Fetches the current user's role in the active community from Convex.
 */
export function useUserRole() {
  const { user } = useAuth();
  const { communityId } = useCommunity();

  const membership = useQuery(
    api.memberships.getMembership,
    user && communityId ? { userId: user.id, communityId } : "skip"
  );

  if (!user || !communityId) {
    return { data: { role: "resident" as CommunityRole, verified: false, verificationStatus: "none" as const } };
  }

  if (membership === undefined) {
    return { data: { role: "resident" as CommunityRole, verified: false, verificationStatus: "none" as const }, isLoading: true };
  }

  return {
    data: {
      role: (membership?.role || "resident") as CommunityRole,
      verified: membership?.verified ?? false,
      verificationStatus: (membership?.verificationStatus || "none") as "none" | "pending" | "approved" | "rejected",
    },
    isLoading: false,
  };
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
