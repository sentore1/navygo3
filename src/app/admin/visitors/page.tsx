"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../../supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Users, 
  Globe, 
  Monitor, 
  Smartphone, 
  Tablet,
  MapPin,
  Clock,
  Eye,
  TrendingUp,
  RefreshCw
} from "lucide-react";

interface Visitor {
  id: string;
  session_id: string;
  page_url: string;
  page_title: string;
  country: string;
  city: string;
  device_type: string;
  browser: string;
  os: string;
  time_on_page: number;
  created_at: string;
}

interface CountryStats {
  country: string;
  country_code: string;
  unique_visitors: number;
  page_views: number;
  avg_time_on_page: number;
}

interface PageStats {
  page_url: string;
  page_title: string;
  views: number;
  unique_visitors: number;
  avg_time_on_page: number;
}

export default function VisitorsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalPageViews: 0,
    avgTimeOnSite: 0,
    topCountry: "",
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userData?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);
      await loadAnalytics();
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Load recent visitors
      const { data: visitorsData } = await supabase
        .from("visitor_analytics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      setVisitors(visitorsData || []);

      // Load country stats
      const { data: countryData } = await supabase
        .from("visitors_by_country_view")
        .select("*")
        .limit(20);

      setCountryStats(countryData || []);

      // Load page stats
      const { data: pageData } = await supabase
        .from("popular_pages_view")
        .select("*")
        .limit(20);

      setPageStats(pageData || []);

      // Calculate overall stats
      if (visitorsData) {
        const uniqueSessions = new Set(visitorsData.map((v: Visitor) => v.session_id)).size;
        const avgTime = visitorsData.reduce((sum: number, v: Visitor) => sum + (v.time_on_page || 0), 0) / visitorsData.length;
        const topCountry = countryData?.[0]?.country || "N/A";

        setStats({
          totalVisitors: uniqueSessions,
          totalPageViews: visitorsData.length,
          avgTimeOnSite: Math.round(avgTime),
          topCountry,
        });
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile": return <Smartphone className="h-4 w-4" />;
      case "tablet": return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getCountryFlag = (countryCode: string) => {
    if (!countryCode) return "🌍";
    const codePoints = countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-4 w-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Visitor Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Track visitors, locations, and behavior
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={loadAnalytics}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisitors}</div>
            <p className="text-xs text-muted-foreground">Unique sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPageViews}</div>
            <p className="text-xs text-muted-foreground">Total views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time on Site</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(stats.avgTimeOnSite)}</div>
            <p className="text-xs text-muted-foreground">Per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Country</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topCountry}</div>
            <p className="text-xs text-muted-foreground">Most visitors</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Visitors</TabsTrigger>
          <TabsTrigger value="countries">By Country</TabsTrigger>
          <TabsTrigger value="pages">Popular Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Visitors</CardTitle>
              <CardDescription>Latest 100 page views with location data</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>Time on Page</TableHead>
                    <TableHead>Visited</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((visitor) => (
                    <TableRow key={visitor.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getCountryFlag(visitor.country)}</span>
                          <div>
                            <p className="font-medium">{visitor.city || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{visitor.country || "Unknown"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-xs">{visitor.page_title || visitor.page_url}</p>
                          <p className="text-xs text-muted-foreground">{visitor.page_url}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {getDeviceIcon(visitor.device_type)}
                          {visitor.device_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{visitor.browser}</p>
                          <p className="text-xs text-muted-foreground">{visitor.os}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatTime(visitor.time_on_page)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(visitor.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {visitors.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No visitor data yet. Add the VisitorTracker component to your pages.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="countries">
          <Card>
            <CardHeader>
              <CardTitle>Visitors by Country</CardTitle>
              <CardDescription>Geographic distribution of your visitors</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Unique Visitors</TableHead>
                    <TableHead>Page Views</TableHead>
                    <TableHead>Avg. Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countryStats.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getCountryFlag(stat.country_code)}</span>
                          <span className="font-medium">{stat.country}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{stat.unique_visitors}</TableCell>
                      <TableCell>{stat.page_views}</TableCell>
                      <TableCell>{formatTime(Math.round(stat.avg_time_on_page))}</TableCell>
                    </TableRow>
                  ))}
                  {countryStats.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No country data available yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Popular Pages</CardTitle>
              <CardDescription>Most visited pages on your site</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Unique Visitors</TableHead>
                    <TableHead>Avg. Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageStats.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{stat.page_title || stat.page_url}</p>
                          <p className="text-xs text-muted-foreground">{stat.page_url}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{stat.views}</TableCell>
                      <TableCell>{stat.unique_visitors}</TableCell>
                      <TableCell>{formatTime(Math.round(stat.avg_time_on_page))}</TableCell>
                    </TableRow>
                  ))}
                  {pageStats.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No page data available yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
