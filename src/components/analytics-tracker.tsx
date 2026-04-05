"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view
    trackEvent('page_view', { page: pathname });
  }, [pathname]);

  return null;
}

export async function trackEvent(
  eventType: string,
  eventData?: Record<string, any>
) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: eventType,
        event_data: eventData,
        page_url: window.location.href,
      }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}
