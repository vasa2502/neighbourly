import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!isSupported || !user) return;

    // Check existing subscription
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    });
  }, [isSupported, user]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !user || !VAPID_PUBLIC_KEY) return false;

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== "granted") return false;

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      // Store subscription in Supabase
      const subscriptionJson = subscription.toJSON();
      await supabase.from("push_subscriptions" as any).upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: (subscriptionJson as any).keys?.p256dh ?? "",
        auth: (subscriptionJson as any).keys?.auth ?? "",
        user_agent: navigator.userAgent,
      }, { onConflict: "endpoint" });

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      return false;
    }
  }, [isSupported, user]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        // Remove from Supabase
        if (user) {
          await supabase.from("push_subscriptions" as any)
            .delete()
            .eq("endpoint", sub.endpoint)
            .eq("user_id", user.id);
        }
        await sub.unsubscribe();
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    }
  }, [isSupported, user]);

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe,
  };
}
