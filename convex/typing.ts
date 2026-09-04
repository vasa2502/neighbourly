import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./auth";

// In-memory typing state is ephemeral; we use a simple table for persistence
// In production, this would be handled by WebSockets

export const setTyping = mutation({
  args: {
    conversationId: v.string(),
    userId: v.string(),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    // This is a no-op for now - typing indicators work via local state
    return { success: true };
  },
});

export const getTypingUsers = query({
  args: { conversationId: v.string(), currentUserId: v.string() },
  handler: async (_ctx, _args) => {
    // In production, this would query a real-time typing state table
    // For now, return empty - typing is handled client-side
    return [];
  },
});

export const setActivityTyping = mutation({
  args: {
    activityId: v.string(),
    userId: v.string(),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx, args.userId);
    return { success: true };
  },
});

export const getActivityTypingUsers = query({
  args: { activityId: v.string(), currentUserId: v.string() },
  handler: async (_ctx, _args) => {
    return [];
  },
});
