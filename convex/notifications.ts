import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./auth";

export const list = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

export const markRead = mutation({
  args: { notificationId: v.string(), userId: v.string() },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    const notification = await ctx.db.query("notifications").filter((q: any) => q.eq(q.field("_id"), args.notificationId)).first();
    if (!notification) throw new Error("Notification not found");
    if (notification.userId !== args.userId) throw new Error("Not your notification");
    await ctx.db.patch(notification._id, { read: true });
    return { success: true };
  },
});
