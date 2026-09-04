import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./auth";

// ─── Get user memberships ───
export const getUserMemberships = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("community_memberships")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .collect();

    const result = [];
    for (const m of memberships) {
      const community = await ctx.db
        .query("communities")
        .filter((q: any) => q.eq(q.field("_id"), m.communityId))
        .first();
      result.push({ ...m, communities: community });
    }
    return result;
  },
});

// ─── Get membership for user in community ───
export const getMembership = query({
  args: { userId: v.string(), communityId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("community_memberships")
      .withIndex("by_user_community", (q: any) =>
        q.eq("userId", args.userId).eq("communityId", args.communityId)
      )
      .first();
  },
});

// ─── Join community ───
export const join = mutation({
  args: {
    userId: v.string(),
    communityId: v.string(),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    const existing = await ctx.db
      .query("community_memberships")
      .withIndex("by_user_community", (q: any) =>
        q.eq("userId", args.userId).eq("communityId", args.communityId)
      )
      .first();
    if (existing) throw new Error("Already a member");

    const now = Date.now();
    await ctx.db.insert("community_memberships", {
      userId: args.userId,
      communityId: args.communityId,
      role: args.role || "resident",
      verified: false,
      verificationStatus: "none",
      joinedAt: now,
      status: "active",
    });

    // Increment resident count
    const community = await ctx.db
      .query("communities")
      .filter((q: any) => q.eq(q.field("_id"), args.communityId))
      .first();
    if (community) {
      await ctx.db.patch(community._id, {
        residentCount: community.residentCount + 1,
      });
    }

    return { success: true };
  },
});

// ─── Get community members (People Directory) ───
export const getCommunityMembers = query({
  args: {
    communityId: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const cursor = args.cursor || 0;

    const memberships = await ctx.db
      .query("community_memberships")
      .withIndex("by_community", (q: any) => q.eq("communityId", args.communityId))
      .collect();

    const activeMembers = memberships.filter((m: any) => m.status === "active");
    const total = activeMembers.length;
    const paginated = activeMembers.slice(cursor, cursor + limit);

    const result = [];
    for (const m of paginated) {
      const profile = await ctx.db
        .query("user_profiles")
        .filter((q: any) => q.eq(q.field("_id"), m.userId))
        .first();
      if (profile) {
        result.push({
          ...profile,
          membershipId: m._id,
          role: m.role,
          verified: m.verified,
          joinedAt: m.joinedAt,
        });
      }
    }
    return { data: result, total, hasMore: cursor + limit < total, nextCursor: cursor + limit < total ? cursor + limit : null };
  },
});
