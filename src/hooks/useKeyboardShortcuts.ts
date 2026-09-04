import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface ShortcutMap {
  [key: string]: () => void;
}

/**
 * Global keyboard shortcuts for the app.
 * Activates when not in an input/textarea.
 */
export function useKeyboardShortcuts(shortcuts?: ShortcutMap) {
  const navigate = useNavigate();

  const defaultShortcuts: ShortcutMap = {
    // Navigation
    "g h": () => navigate("/dashboard"),
    "g d": () => navigate("/dashboard/discover"),
    "g a": () => navigate("/dashboard/activities"),
    "g c": () => navigate("/dashboard/clubs"),
    "g p": () => navigate("/dashboard/posts"),
    "g m": () => navigate("/dashboard/messages"),
    "g n": () => navigate("/dashboard/notifications"),
    "g s": () => navigate("/dashboard/settings"),
    // Quick actions
    "n a": () => navigate("/dashboard/activities/create"),
    "n p": () => navigate("/dashboard/posts/create"),
    "n c": () => navigate("/dashboard/clubs/create"),
  };

  const allShortcuts = { ...defaultShortcuts, ...shortcuts };
  const pendingKey = { current: "" as string };
  const timeoutRef = { current: null as ReturnType<typeof setTimeout> | null };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignore modifier combos (Ctrl, Cmd, Alt)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();

      // Build key combo
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      pendingKey.current = pendingKey.current ? `${pendingKey.current} ${key}` : key;

      timeoutRef.current = setTimeout(() => {
        pendingKey.current = "";
      }, 1000);

      const combo = pendingKey.current;

      // Check for match
      if (allShortcuts[combo]) {
        e.preventDefault();
        allShortcuts[combo]();
        pendingKey.current = "";
      }
    },
    [allShortcuts]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * List of available keyboard shortcuts (for help UI)
 */
export const SHORTCUT_LIST = [
  { keys: "G then H", action: "Go to Home" },
  { keys: "G then D", action: "Go to Discover" },
  { keys: "G then A", action: "Go to Activities" },
  { keys: "G then C", action: "Go to Clubs" },
  { keys: "G then P", action: "Go to Posts" },
  { keys: "G then M", action: "Go to Messages" },
  { keys: "G then N", action: "Go to Notifications" },
  { keys: "G then S", action: "Go to Settings" },
  { keys: "N then A", action: "New Activity" },
  { keys: "N then P", action: "New Post" },
  { keys: "N then C", action: "New Club" },
  { keys: "?", action: "Show shortcuts help" },
];
