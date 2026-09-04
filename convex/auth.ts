import { getAuthUserId } from "@convex-dev/auth/server";
import type { GenericQueryCtx, GenericMutationCtx } from "convex/server";
import type { DataModel } from "./_generated/dataModel";

type QueryCtx = GenericQueryCtx<DataModel>;
type MutationCtx = GenericMutationCtx<DataModel>;

/**
 * Get the authenticated user's Convex userId.
 * Returns null if auth is not configured or user is not signed in.
 */
export async function getAuthedUserId(
  ctx: QueryCtx | MutationCtx
): Promise<string | null> {
  try {
    const userId = await getAuthUserId(ctx);
    return userId ?? null;
  } catch {
    // Auth not configured or not initialized
    return null;
  }
}

/**
 * Require an authenticated userId. In mutations, verifies the caller
 * is operating on their own data. In demo mode (no auth configured),
 * falls back to the client-supplied userId.
 *
 * @param ctx - Convex context
 * @param clientUserId - The userId the client claims to be
 * @returns The validated userId
 */
export async function requireUserId(
  ctx: MutationCtx,
  clientUserId: string
): Promise<string> {
  const authedUserId = await getAuthedUserId(ctx);

  if (authedUserId) {
    // Auth is configured — verify the caller matches
    if (authedUserId !== clientUserId) {
      throw new Error("Unauthorized: userId does not match authenticated user");
    }
    return authedUserId;
  }

  // Demo mode — no auth configured, accept client userId
  return clientUserId;
}

/**
 * Require the user to be authenticated (no fallback).
 * Use this for sensitive operations that must have a real auth session.
 */
export async function requireAuth(ctx: MutationCtx): Promise<string> {
  const authedUserId = await getAuthedUserId(ctx);
  if (!authedUserId) {
    throw new Error("Authentication required");
  }
  return authedUserId;
}

/**
 * Require the user to have a specific role in the community.
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  communityId: string,
  allowedRoles: string[]
): Promise<void> {
  const membership = await ctx.db
    .query("community_memberships")
    .withIndex("by_user_community", (q: any) =>
      q.eq("userId", userId).eq("communityId", communityId)
    )
    .first();

  if (!membership || !allowedRoles.includes(membership.role)) {
    throw new Error("Insufficient permissions");
  }
}
