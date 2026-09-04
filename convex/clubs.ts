import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, requireRole } from "./auth";

export const list = query({
  args: {
    communityId: v.string(),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const cursor = args.cursor || 0;

    const all = await ctx.db
      .query("clubs")
      .withIndex("by_community", (q: any) => q.eq("communityId", args.communityId))
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .collect();

    const total = all.length;
    const paginated = all.slice(cursor, cursor + limit);
    return { data: paginated, total, hasMore: cursor + limit < total, nextCursor: cursor + limit < total ? cursor + limit : null };
  },
});

export const get = query({
  args: { clubId: v.string() },
  handler: async (ctx, args) => {
    const club = await ctx.db
      .query("clubs")
      .filter((q) => q.eq(q.field("_id"), args.clubId))
      .first();
    if (!club) return null;

    const creator = await ctx.db
      .query("user_profiles")
      .filter((q: any) => q.eq(q.field("_id"), club.createdBy))
      .first();

    return {
      ...club,
      user_profiles: creator ? { name: creator.name, avatar: creator.avatar } : null,
    };
  },
});

export const create = mutation({
  args: {
    communityId: v.string(),
    name: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.createdBy);

    if (!args.name.trim()) throw new Error("Club name is required");
    if (!args.category) throw new Error("Category is required");
    if (args.name.length > 100) throw new Error("Name too long (max 100 characters)");

    await requireRole(ctx, args.createdBy, args.communityId, ["admin", "moderator", "host", "resident"]);

    const now = Date.now();
    const clubId = await ctx.db.insert("clubs", {
      communityId: args.communityId,
      name: args.name.trim(),
      category: args.category,
      description: args.description,
      memberCount: 1,
      createdBy: args.createdBy,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Auto-join creator
    await ctx.db.insert("club_members", {
      clubId,
      userId: args.createdBy,
      role: "admin",
      joinedAt: now,
    });

    return clubId;
  },
});

export const join = mutation({
  args: { clubId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    const existing = await ctx.db
      .query("club_members")
      .withIndex("by_club_user", (q: any) =>
        q.eq("clubId", args.clubId).eq("userId", args.userId)
      )
      .first();
    if (existing) throw new Error("Already a member");

    await ctx.db.insert("club_members", {
      clubId: args.clubId,
      userId: args.userId,
      joinedAt: Date.now(),
    });

    const club = await ctx.db.query("clubs").filter((q: any) => q.eq(q.field("_id"), args.clubId)).first();
    if (club) {
      await ctx.db.patch(club._id, { memberCount: club.memberCount + 1 });
    }
  },
});

export const members = query({
  args: { clubId: v.string() },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("club_members")
      .withIndex("by_club", (q: any) => q.eq("clubId", args.clubId))
      .collect();

    const enriched = [];
    for (const m of members) {
      const profile = await ctx.db
        .query("user_profiles")
        .filter((q: any) => q.eq(q.field("_id"), m.userId))
        .first();
      if (profile) {
        enriched.push({
          ...profile,
          role: m.role,
          joinedAt: m.joinedAt,
        });
      }
    }
    return enriched;
  },
});
