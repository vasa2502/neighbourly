import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, requireRole } from "./auth";

// ─── List announcements ───
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
      .query("announcements")
      .withIndex("by_community", (q: any) => q.eq("communityId", args.communityId))
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .collect();

    all.sort((a: any, b: any) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.createdAt - a.createdAt);

    const total = all.length;
    const paginated = all.slice(cursor, cursor + limit);

    const enriched = [];
    for (const a of paginated) {
      const author = await ctx.db
        .query("user_profiles")
        .filter((q: any) => q.eq(q.field("_id"), a.authorId))
        .first();
      enriched.push({
        ...a,
        user_profiles: author ? { name: author.name, avatar: author.avatar } : null,
      });
    }
    return { data: enriched, total, hasMore: cursor + limit < total, nextCursor: cursor + limit < total ? cursor + limit : null };
  },
});

// ─── Get announcement ───
export const get = query({
  args: { announcementId: v.string() },
  handler: async (ctx, args) => {
    const announcement = await ctx.db
      .query("announcements")
      .filter((q) => q.eq(q.field("_id"), args.announcementId))
      .first();
    if (!announcement) return null;

    const author = await ctx.db
      .query("user_profiles")
      .filter((q: any) => q.eq(q.field("_id"), announcement.authorId))
      .first();

    return {
      ...announcement,
      user_profiles: author ? { name: author.name, avatar: author.avatar } : null,
    };
  },
});

// ─── Create announcement ───
export const create = mutation({
  args: {
    communityId: v.string(),
    authorId: v.string(),
    title: v.string(),
    body: v.string(),
    pinned: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.authorId);

    if (!args.title.trim()) throw new Error("Title is required");
    if (!args.body.trim()) throw new Error("Body is required");
    if (args.title.length > 200) throw new Error("Title too long (max 200 characters)");
    if (args.body.length > 5000) throw new Error("Body too long (max 5000 characters)");

    await requireRole(ctx, args.authorId, args.communityId, ["admin", "moderator"]);

    return await ctx.db.insert("announcements", {
      communityId: args.communityId,
      authorId: args.authorId,
      title: args.title.trim(),
      body: args.body.trim(),
      pinned: args.pinned,
      status: "active",
      createdAt: Date.now(),
    });
  },
});
