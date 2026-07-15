import { PushNotificationStats } from '@/components/PushNotificationStats';

export default function PushNotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">푸시 알림</h1>
      <PushNotificationStats />
    </div>
  );
}
