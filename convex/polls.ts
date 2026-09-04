import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, requireRole } from "./auth";

// ─── List polls ───
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
      .query("polls")
      .withIndex("by_community", (q: any) => q.eq("communityId", args.communityId))
      .collect();

    // Enrich with vote counts
    const enriched = [];
    for (const poll of all) {
      const votes = await ctx.db
        .query("poll_votes")
        .withIndex("by_poll", (q: any) => q.eq("pollId", poll._id))
        .collect();

      const optionCounts = poll.options.map((_: string, i: number) =>
        votes.filter((v: any) => v.optionIndex === i).length
      );
      enriched.push({ ...poll, voteCounts: optionCounts, totalVotes: votes.length });
    }

    enriched.sort((a: any, b: any) => b.createdAt - a.createdAt);

    const total = enriched.length;
    const paginated = enriched.slice(cursor, cursor + limit);
    return { data: paginated, total, hasMore: cursor + limit < total, nextCursor: cursor + limit < total ? cursor + limit : null };
  },
});

// ─── Create poll ───
export const create = mutation({
  args: {
    communityId: v.string(),
    creatorId: v.string(),
    question: v.string(),
    options: v.array(v.string()),
    anonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.creatorId);

    if (!args.question.trim()) throw new Error("Poll question is required");
    if (args.options.length < 2) throw new Error("At least 2 options are required");
    if (args.options.length > 10) throw new Error("Maximum 10 options allowed");
    if (args.question.length > 500) throw new Error("Question too long (max 500 characters)");
    if (args.options.some((o: string) => !o.trim())) throw new Error("Options cannot be empty");

    await requireRole(ctx, args.creatorId, args.communityId, ["admin", "moderator", "host", "resident"]);

    return await ctx.db.insert("polls", {
      communityId: args.communityId,
      creatorId: args.creatorId,
      question: args.question.trim(),
      options: args.options.map((o: string) => o.trim()),
      anonymous: args.anonymous,
      status: "active",
      createdAt: Date.now(),
    });
  },
});

// ─── Vote ───
export const vote = mutation({
  args: {
    pollId: v.string(),
    userId: v.string(),
    optionIndex: v.number(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    const poll = await ctx.db
      .query("polls")
      .filter((q: any) => q.eq(q.field("_id"), args.pollId))
      .first();
    if (!poll) throw new Error("Poll not found");
    if (poll.status !== "active") throw new Error("Poll is closed");
    if (args.optionIndex < 0 || args.optionIndex >= poll.options.length) {
      throw new Error("Invalid option");
    }

    // Check if already voted
    const existing = await ctx.db
      .query("poll_votes")
      .withIndex("by_poll_user", (q: any) =>
        q.eq("pollId", args.pollId).eq("userId", args.userId)
      )
      .first();
    if (existing) throw new Error("Already voted");

    return await ctx.db.insert("poll_votes", {
      pollId: args.pollId,
      userId: args.userId,
      optionIndex: args.optionIndex,
      createdAt: Date.now(),
    });
  },
});

// ─── Close poll ───
export const close = mutation({
  args: { pollId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);

    const poll = await ctx.db
      .query("polls")
      .filter((q: any) => q.eq(q.field("_id"), args.pollId))
      .first();
    if (!poll) throw new Error("Poll not found");
    if (poll.creatorId !== args.userId) throw new Error("Only the poll creator can close it");

    await ctx.db.patch(poll._id, { status: "closed" });
    return { success: true };
  },
});

// ─── Results ───
export const results = query({
  args: { pollId: v.string() },
  handler: async (ctx, args) => {
    const poll = await ctx.db
      .query("polls")
      .filter((q: any) => q.eq(q.field("_id"), args.pollId))
      .first();
    if (!poll) return null;

    const votes = await ctx.db
      .query("poll_votes")
      .withIndex("by_poll", (q: any) => q.eq("pollId", args.pollId))
      .collect();

    const optionCounts = poll.options.map((_: string, i: number) =>
      votes.filter((v: any) => v.optionIndex === i).length
    );

    return {
      ...poll,
      voteCounts: optionCounts,
      totalVotes: votes.length,
    };
  },
});
