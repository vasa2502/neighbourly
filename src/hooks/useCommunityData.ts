import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import * as api from "@/lib/api";

/* ─── Communities ─── */

export function useSearchCommunities(query: string, filters?: { city?: string; area?: string; type?: string }) {
  return useQuery({
    queryKey: ["communities", "search", query, filters],
    queryFn: () => api.searchCommunities(query, filters),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}

export function useCommunity(id: string) {
  return useQuery({
    queryKey: ["community", id],
    queryFn: () => api.getCommunityById(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateCommunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createCommunity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["communities"] });
    },
  });
}

/* ─── Memberships ─── */

export function useUserMemberships() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["memberships", user?.id],
    queryFn: () => api.getUserMemberships(user!.id),
    enabled: !!user,
  });
}

export function useJoinCommunity() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ communityId, role }: { communityId: string; role?: string }) =>
      api.joinCommunity(user!.id, communityId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memberships"] });
    },
  });
}

/* ─── Verification ─── */

export function useSubmitVerification() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ communityId, method, data }: { communityId: string; method: string; data: Record<string, string> }) =>
      api.submitVerification(user!.id, communityId, method, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memberships"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/* ─── Profile ─── */

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => api.getOrCreateProfile(user!.id),
    enabled: !!user,
    staleTime: 30_000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (updates: Parameters<typeof api.updateProfile>[1]) =>
      api.updateProfile(user!.id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
