/**
 * Convex handles realtime subscriptions natively via useQuery.
 * These hooks are kept as no-ops for backward compatibility.
 * Messages and notifications auto-update through Convex reactive queries.
 */
export function useRealtimeMessages(_conversationId: string | null) {
  // Convex useQuery is already reactive — no manual subscription needed
}

export function useRealtimeNotifications(_userId: string | null) {
  // Convex useQuery is already reactive — no manual subscription needed
}
