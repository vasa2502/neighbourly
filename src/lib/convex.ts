import { ConvexReactClient } from "convex/react";

const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string;

// In production/preview, if VITE_CONVEX_URL is not set, Convex queries won't work
// but the app should still render with demo data
const CONVEX_CONFIGURED = !!CONVEX_URL && CONVEX_URL !== "http://127.0.0.1:3210";

if (!CONVEX_CONFIGURED) {
  console.warn(
    "[JOINN] Convex is not fully configured. Set VITE_CONVEX_URL to a deployed Convex instance. The app will render with demo data."
  );
}

// Create Convex client safely - if the URL is invalid, the app still renders
let convex: ConvexReactClient;
try {
  convex = new ConvexReactClient(
    CONVEX_URL || "https://placeholder-convex.convex.cloud"
  );
} catch (err) {
  console.error("[JOINN] Failed to create Convex client:", err);
  // Fallback: create with a dummy URL so the app doesn't crash
  convex = new ConvexReactClient("https://placeholder.convex.cloud");
}

export { convex };
