"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { requestNotificationPermission } from '@/lib/notifications/push';

export default function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    setLoading(true);
    const result = await requestNotificationPermission();
    setPermission(result);
    setLoading(false);
  };

  if (!('Notification' in window)) {
    return null; // Browser doesn't support notifications
  }

  if (permission === 'granted') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Bell className="h-4 w-4 text-green-500" />
        <span>Browser notifications enabled</span>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <BellOff className="h-4 w-4 text-red-500" />
        <span>Browser notifications blocked. Enable in browser settings.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRequestPermission}
        disabled={loading}
      >
        <Bell className="h-4 w-4 mr-2" />
        Enable Browser Notifications
      </Button>
      <p className="text-xs text-muted-foreground">
        Get instant updates about your goals and achievements
      </p>
    </div>
  );
}
