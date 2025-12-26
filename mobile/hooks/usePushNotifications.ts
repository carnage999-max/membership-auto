import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { pushNotificationService } from '@/services/notifications/push-notifications';
import { showToast } from '@/utils/toast';

export function usePushNotifications() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Register for push notifications
    pushNotificationService.registerForPushNotifications().catch((error) => {
      console.error('Failed to register for push notifications:', error);
    });

    // Listen for notifications received while app is foregrounded
    notificationListener.current = pushNotificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);

        // Show toast for foreground notifications
        const { title, body } = notification.request.content;
        if (title) {
          showToast('info', title, body);
        }
      }
    );

    // Listen for user interactions with notifications
    responseListener.current = pushNotificationService.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);

        const data = response.notification.request.content.data;

        // Handle deep linking based on notification data
        if (data?.deepLink) {
          router.push(data.deepLink as any);
        } else if (data?.type) {
          handleNotificationType(data.type, data);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);

  const handleNotificationType = (type: string, data: any) => {
    switch (type) {
      case 'appointment':
        if (data.appointmentId) {
          router.push('/(authenticated)/appointments' as any);
        }
        break;
      case 'service_due':
        router.push('/(authenticated)/service-schedule' as any);
        break;
      case 'offer':
        router.push('/(authenticated)/offers' as any);
        break;
      case 'chat':
        router.push('/(authenticated)/chat' as any);
        break;
      case 'referral':
        router.push('/(authenticated)/referrals' as any);
        break;
      default:
        router.push('/(authenticated)/(tabs)' as any);
    }
  };
}
