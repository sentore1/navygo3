"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "../../supabase/client";

export default function VisitorTracker() {
  const pathname = usePathname();
  const supabase = createClient();
  const sessionId = useRef<string>("");
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    // Generate or retrieve session ID
    if (!sessionId.current) {
      const stored = sessionStorage.getItem("visitor_session_id");
      if (stored) {
        sessionId.current = stored;
      } else {
        sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem("visitor_session_id", sessionId.current);
      }
    }

    // Track page view
    trackPageView();

    // Track time on page when leaving
    return () => {
      const timeOnPage = Math.floor((Date.now() - startTime.current) / 1000);
      updateTimeOnPage(timeOnPage);
    };
  }, [pathname]);

  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return "mobile";
    }
    return "desktop";
  };

  const getBrowser = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    if (ua.includes("Opera")) return "Opera";
    return "Unknown";
  };

  const getOS = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Win")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iOS")) return "iOS";
    return "Unknown";
  };

  const getGeolocation = async () => {
    try {
      // Use a free IP geolocation API
      const response = await fetch("https://ipapi.co/json/");
      if (response.ok) {
        const data = await response.json();
        return {
          ip_address: data.ip,
          country: data.country_name,
          country_code: data.country_code,
          region: data.region,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
        };
      }
    } catch (error) {
      console.error("Error fetching geolocation:", error);
    }
    return null;
  };

  const trackPageView = async () => {
    try {
      startTime.current = Date.now();

      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();

      // Get geolocation data
      const geoData = await getGeolocation();

      // Insert tracking data
      const { error } = await supabase
        .from("visitor_analytics")
        .insert({
          session_id: sessionId.current,
          user_id: user?.id || null,
          page_url: pathname,
          page_title: document.title,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
          ...geoData,
        });

      if (error) {
        console.error("Error tracking page view:", error);
      }
    } catch (error) {
      console.error("Error in trackPageView:", error);
    }
  };

  const updateTimeOnPage = async (timeOnPage: number) => {
    try {
      // Update the most recent entry for this session and page
      const { error } = await supabase
        .from("visitor_analytics")
        .update({ time_on_page: timeOnPage, updated_at: new Date().toISOString() })
        .eq("session_id", sessionId.current)
        .eq("page_url", pathname)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error updating time on page:", error);
      }
    } catch (error) {
      console.error("Error in updateTimeOnPage:", error);
    }
  };

  // This component doesn't render anything
  return null;
}
