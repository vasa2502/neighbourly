import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, requireRole } from "./auth";

export const list = query({
  args: { communityId: v.string(), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("moderation_reports")
      .withIndex("by_community", (q: any) => q.eq("communityId", args.communityId))
      .collect();
    if (args.status) results = results.filter((r: any) => r.status === args.status);

    const enriched = [];
    for (const r of results) {
      const reporter = await ctx.db.query("user_profiles").filter((q: any) => q.eq(q.field("_id"), r.reporterId)).first();
      enriched.push({ ...r, reporter: reporter ? { name: reporter.name, avatar: reporter.avatar } : null });
    }
    return enriched.sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
});

export const create = mutation({
  args: { communityId: v.string(), reporterId: v.string(), targetType: v.string(), targetId: v.string(), reason: v.string(), description: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.reporterId);
    if (!args.reason.trim()) throw new Error("Reason is required");
    return await ctx.db.insert("moderation_reports", {
      communityId: args.communityId,
      reporterId: args.reporterId,
      targetType: args.targetType,
      targetId: args.targetId,
      reason: args.reason.trim(),
      description: args.description,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const dismiss = mutation({
  args: { reportId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const report = await ctx.db.query("moderation_reports").filter((q: any) => q.eq(q.field("_id"), args.reportId)).first();
    if (!report) throw new Error("Report not found");
    await requireRole(ctx, args.userId, report.communityId, ["admin", "moderator"]);
    await ctx.db.patch(report._id, { status: "dismissed", reviewedAt: Date.now() });
    return { success: true };
  },
});

export const removeContent = mutation({
  args: { reportId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const report = await ctx.db.query("moderation_reports").filter((q: any) => q.eq(q.field("_id"), args.reportId)).first();
    if (!report) throw new Error("Report not found");
    await requireRole(ctx, args.userId, report.communityId, ["admin", "moderator"]);

    // Remove the reported content
    if (report.targetType === "post") {
      const post = await ctx.db.query("posts").filter((q: any) => q.eq(q.field("_id"), report.targetId)).first();
      if (post) await ctx.db.patch(post._id, { status: "removed" });
    } else if (report.targetType === "comment") {
      const comment = await ctx.db.query("post_comments").filter((q: any) => q.eq(q.field("_id"), report.targetId)).first();
      if (comment) await ctx.db.delete(comment._id);
    }

    await ctx.db.patch(report._id, { status: "resolved", reviewedAt: Date.now() });
    return { success: true };
  },
});

export const suspendUser = mutation({
  args: { reportId: v.string(), userId: v.string(), reason: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const report = await ctx.db.query("moderation_reports").filter((q: any) => q.eq(q.field("_id"), args.reportId)).first();
    if (!report) throw new Error("Report not found");
    await requireRole(ctx, args.userId, report.communityId, ["admin"]);

    // Find the target user and suspend their membership
    const membership = await ctx.db
      .query("community_memberships")
      .withIndex("by_user_community", (q: any) =>
        q.eq("userId", report.targetId).eq("communityId", report.communityId)
      )
      .first();
    if (membership) {
      await ctx.db.patch(membership._id, { status: "suspended", suspensionReason: args.reason });
    }

    await ctx.db.patch(report._id, { status: "resolved", reviewedAt: Date.now() });
    return { success: true };
  },
});
