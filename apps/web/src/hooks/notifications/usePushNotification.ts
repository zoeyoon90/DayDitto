'use client';

import { useCallback } from 'react';
import { savePushSubscription, deletePushSubscription } from '@/api/pushSubscriptions.api';

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function usePushNotification() {
  const subscribe = useCallback(async () => {
    if (!isStandaloneMode()) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      await savePushSubscription(existing.toJSON());
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });
    await savePushSubscription(subscription.toJSON());
  }, []);

  const unsubscribe = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;
    await deletePushSubscription(subscription.endpoint);
    await subscription.unsubscribe();
  }, []);

  const isSubscribed = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    const subscription = await registration?.pushManager.getSubscription();
    return !!subscription;
  }, []);

  return { subscribe, unsubscribe, isSubscribed };
}
