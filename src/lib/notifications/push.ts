// Web Push notification service
// For browser push notifications

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export async function sendBrowserNotification(notification: PushNotification) {
  const permission = await requestNotificationPermission();

  if (permission !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }

  try {
    const notif = new Notification(notification.title, {
      body: notification.body,
      icon: notification.icon || '/icon-192x192.png',
      badge: notification.badge || '/badge-72x72.png',
      data: notification.data,
      tag: notification.data?.tag || 'default',
      requireInteraction: false,
    });

    notif.onclick = (event) => {
      event.preventDefault();
      window.focus();
      if (notification.data?.url) {
        window.location.href = notification.data.url;
      }
      notif.close();
    };

    return true;
  } catch (error) {
    console.error('Error sending browser notification:', error);
    return false;
  }
}

// Check if user has enabled push notifications in settings
export async function shouldSendPushNotification(userId: string): Promise<boolean> {
  // This would check the user's notification preferences from the database
  // For now, return true if permission is granted
  return Notification.permission === 'granted';
}
