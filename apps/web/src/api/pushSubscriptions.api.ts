import { apiFetch } from './client';

export function savePushSubscription(subscription: PushSubscriptionJSON) {
  const { endpoint, keys } = subscription;
  return apiFetch('/push-subscriptions', {
    method: 'POST',
    body: JSON.stringify({ endpoint, p256dh: keys?.p256dh, auth: keys?.auth }),
  });
}

export function deletePushSubscription(endpoint: string) {
  return apiFetch('/push-subscriptions', {
    method: 'DELETE',
    body: JSON.stringify({ endpoint }),
  });
}
