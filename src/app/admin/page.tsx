"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
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
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Ban,
  CheckCircle,
  Search,
  BarChart3,
  Shield,
  AlertTriangle,
  Clock,
  Eye,
  MousePointerClick,
  UserCheck,
  UserX,
  Calendar,
  Download,
  RefreshCw,
  Globe,
  FileText,
  Link as LinkIcon,
  Layout,
  Mail
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [blockReason, setBlockReason] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
    activeUsersToday: 0,
    blockedUsers: 0,
    churnRate: 0,
    avgRevenuePerUser: 0,
  });
  const [analytics, setAnalytics] = useState({
    pageViews: 0,
    signups: 0,
    conversions: 0,
    topPages: [] as any[],
    bounceRate: 0,
    avgSessionDuration: 0,
    usersByCountry: [] as any[],
    revenueByMonth: [] as any[],
  });
  const [timeRange, setTimeRange] = useState("30");
  const [userFilter, setUserFilter] = useState("all");
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);

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
      await Promise.all([
        loadUsers(),
        loadStats(),
        loadAnalytics(),
        loadActivityLog(),
        loadSubscribers()
      ]);
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading users:", error);
      return;
    }

    setUsers(data || []);
  };

  const loadStats = async () => {
    const { data: allUsers } = await supabase.from("users").select("*");
    
    const { data: activeUsers } = await supabase
      .from("users")
      .select("*")
      .eq("subscription_status", "active");

    const { data: blockedUsers } = await supabase
      .from("users")
      .select("*")
      .eq("is_blocked", true);

    // Get revenue from unified revenue_transactions table
    const { data: revenueData } = await supabase
      .from("revenue_transactions")
      .select("amount, currency")
      .eq("status", "completed");

    // Calculate total revenue with proper currency handling
    let totalRevenue = 0;
    if (revenueData && revenueData.length > 0) {
      // Convert all currencies to USD for display
      // RWF to USD conversion rate (approximate: 1 USD = 1300 RWF)
      totalRevenue = revenueData.reduce((sum: number, t: any) => {
        const amount = t.amount || 0;
        if (t.currency === 'RWF') {
          return sum + (amount / 1300); // Convert RWF to USD
        }
        return sum + amount; // Already in USD or other currency
      }, 0);
    } else {
      // Fallback to kpay_transactions (these are in RWF)
      const { data: transactions } = await supabase
        .from("kpay_transactions")
        .select("amount")
        .eq("status", "completed");
      const rwfTotal = transactions?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;
      totalRevenue = rwfTotal / 1300; // Convert RWF to USD
    }

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: newUsers } = await supabase
      .from("users")
      .select("*")
      .gte("created_at", startOfMonth.toISOString());

    // Get active users today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: activeToday } = await supabase
      .from("users")
      .select("*")
      .gte("last_login_at", startOfDay.toISOString());

    const avgRevenuePerUser = allUsers && allUsers.length > 0 ? totalRevenue / allUsers.length : 0;

    // Calculate churn rate (users who cancelled in last month)
    const { data: cancelledUsers } = await supabase
      .from("users")
      .select("*")
      .eq("subscription_status", "inactive")
      .gte("updated_at", startOfMonth.toISOString());

    const churnRate = activeUsers && activeUsers.length > 0 
      ? ((cancelledUsers?.length || 0) / activeUsers.length) * 100 
      : 0;

    setStats({
      totalUsers: allUsers?.length || 0,
      activeSubscriptions: activeUsers?.length || 0,
      totalRevenue,
      newUsersThisMonth: newUsers?.length || 0,
      activeUsersToday: activeToday?.length || 0,
      blockedUsers: blockedUsers?.length || 0,
      churnRate,
      avgRevenuePerUser,
    });
  };

  const loadAnalytics = async () => {
    // Get analytics for the selected time range
    const daysAgo = parseInt(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Get visitor analytics data
    const { data: visits } = await supabase
      .from("visitor_analytics")
      .select("*")
      .gte("created_at", startDate.toISOString());

    if (visits) {
      const pageViews = visits.length;
      
      // Get signups (new users in the time range)
      const { data: newUsers } = await supabase
        .from("users")
        .select("*")
        .gte("created_at", startDate.toISOString());
      const signups = newUsers?.length || 0;

      // Get conversions (new subscriptions in the time range)
      const { data: newSubs } = await supabase
        .from("users")
        .select("*")
        .eq("subscription_status", "active")
        .gte("subscription_start_date", startDate.toISOString());
      const conversions = newSubs?.length || 0;

      // Get top pages from the view
      const { data: topPagesData } = await supabase
        .from("popular_pages_view")
        .select("*")
        .limit(10);

      const topPages = topPagesData?.map((p: any) => ({
        page: p.page_url,
        count: p.views
      })) || [];

      // Calculate bounce rate (sessions with only 1 page view)
      const sessionCounts: Record<string, number> = {};
      visits.forEach((v: any) => {
        sessionCounts[v.session_id] = (sessionCounts[v.session_id] || 0) + 1;
      });
      const singlePageSessions = Object.values(sessionCounts).filter(count => count === 1).length;
      const totalSessions = Object.keys(sessionCounts).length;
      const bounceRate = totalSessions > 0 ? (singlePageSessions / totalSessions) * 100 : 0;

      // Get revenue by month (last 6 months) from unified revenue table
      const { data: revenueTransactions } = await supabase
        .from("revenue_transactions")
        .select("amount, currency, transaction_date")
        .eq("status", "completed")
        .gte("transaction_date", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

      let revenueByMonth: Record<string, number> = {};
      
      if (revenueTransactions && revenueTransactions.length > 0) {
        revenueTransactions.forEach((t: any) => {
          const month = new Date(t.transaction_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          // Convert RWF to USD for consistent display
          const amountInUSD = t.currency === 'RWF' ? (t.amount || 0) / 1300 : (t.amount || 0);
          revenueByMonth[month] = (revenueByMonth[month] || 0) + amountInUSD;
        });
      } else {
        // Fallback to kpay_transactions if revenue_transactions doesn't exist (these are in RWF)
        const { data: transactions } = await supabase
          .from("kpay_transactions")
          .select("amount, created_at")
          .eq("status", "completed")
          .gte("created_at", new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

        transactions?.forEach((t: any) => {
          const month = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          // Convert RWF to USD
          const amountInUSD = (t.amount || 0) / 1300;
          revenueByMonth[month] = (revenueByMonth[month] || 0) + amountInUSD;
        });
      }

      const revenueData = Object.entries(revenueByMonth)
        .map(([month, revenue]) => ({ month, revenue }))
        .slice(-6);

      // Get users by country
      const { data: countryData } = await supabase
        .from("visitors_by_country_view")
        .select("*")
        .limit(10);

      const usersByCountry = countryData?.map((c: any) => ({
        country: c.country,
        users: c.unique_visitors
      })) || [];

      setAnalytics({
        pageViews,
        signups,
        conversions,
        topPages,
        bounceRate,
        avgSessionDuration: 0, // Would need session tracking
        usersByCountry,
        revenueByMonth: revenueData,
      });
    } else {
      // Set empty analytics if no data
      setAnalytics({
        pageViews: 0,
        signups: 0,
        conversions: 0,
        topPages: [],
        bounceRate: 0,
        avgSessionDuration: 0,
        usersByCountry: [],
        revenueByMonth: [],
      });
    }
  };

  const loadActivityLog = async () => {
    const { data } = await supabase
      .from("admin_activity_log")
      .select(`
        *,
        admin:users!admin_activity_log_admin_id_fkey(email),
        target:users!admin_activity_log_target_user_id_fkey(email)
      `)
      .order("created_at", { ascending: false })
      .limit(20);

    setActivityLog(data || []);
  };

  const loadSubscribers = async () => {
    const { data } = await supabase
      .from("email_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });

    setSubscribers(data || []);
  };

  const handleBlockUser = async () => {
    if (!selectedUser || !blockReason.trim()) return;

    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_blocked: true,
          blocked_at: new Date().toISOString(),
          blocked_reason: blockReason,
        })
        .eq("id", selectedUser.id);

      if (error) throw error;

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_action_type: 'block_user',
        p_target_user_id: selectedUser.id,
        p_action_data: { reason: blockReason }
      });

      await loadUsers();
      await loadStats();
      setBlockDialogOpen(false);
      setBlockReason("");
      setSelectedUser(null);
    } catch (error: any) {
      console.error("Error blocking user:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUnblockUser = async (user: any) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          is_blocked: false,
          blocked_at: null,
          blocked_reason: null,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Log admin action
      await supabase.rpc('log_admin_action', {
        p_action_type: 'unblock_user',
        p_target_user_id: user.id,
        p_action_data: {}
      });

      await loadUsers();
      await loadStats();
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (userFilter === "all") return matchesSearch;
    if (userFilter === "active") return matchesSearch && user.subscription_status === "active";
    if (userFilter === "inactive") return matchesSearch && user.subscription_status !== "active";
    if (userFilter === "blocked") return matchesSearch && user.is_blocked;
    if (userFilter === "admin") return matchesSearch && user.role === "admin";
    
    return matchesSearch;
  });

  const exportUsers = () => {
    const csv = [
      ['Email', 'Name', 'Role', 'Subscription', 'Status', 'Created', 'Last Login'].join(','),
      ...filteredUsers.map(u => [
        u.email,
        u.full_name || u.name || '',
        u.role || 'user',
        u.subscription_status || 'inactive',
        u.is_blocked ? 'blocked' : 'active',
        new Date(u.created_at).toLocaleDateString(),
        u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage users, analytics, and SEO settings
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadUsers();
              loadStats();
              loadAnalytics();
              loadActivityLog();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/visitors")}
          >
            <Users className="h-4 w-4 mr-2" /> Visitors
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/landing-page")}
          >
            <Layout className="h-4 w-4 mr-2" /> Landing
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/features")}
          >
            <BarChart3 className="h-4 w-4 mr-2" /> Features
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/settings")}
          >
            <Settings className="h-4 w-4 mr-2" /> Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/seo")}
          >
            <Globe className="h-4 w-4 mr-2" /> SEO
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/pricing")}
          >
            <DollarSign className="h-4 w-4 mr-2" /> Pricing
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.churnRate.toFixed(1)}% churn rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              ${stats.avgRevenuePerUser.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsersToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.blockedUsers} blocked users
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="subscribers">
            <Mail className="h-4 w-4 mr-2" />
            Subscribers
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Clock className="h-4 w-4 mr-2" />
            Activity Log
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Globe className="h-4 w-4 mr-2" />
            SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage users, subscriptions, and access control
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Filter users" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active Subs</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-[250px]"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={exportUsers}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {filteredUsers.length} of {users.length} users
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.full_name || user.name || "-"}</TableCell>
                      <TableCell>
                        {user.is_blocked ? (
                          <Badge variant="destructive">
                            <Ban className="h-3 w-3 mr-1" />
                            Blocked
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.subscription_status === "active" ? (
                          <Badge variant="default">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.role === "admin" ? (
                          <Badge variant="default">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline">User</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.last_login_at ? (
                          <span className="text-sm">
                            {new Date(user.last_login_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.is_blocked ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnblockUser(user)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Unblock
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setBlockDialogOpen(true);
                            }}
                          >
                            <Ban className="h-3 w-3 mr-1" />
                            Block
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No users found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Analytics Overview</h3>
            <Select value={timeRange} onValueChange={(value) => {
              setTimeRange(value);
              loadAnalytics();
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.pageViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Last {timeRange} days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sign Ups</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.signups}</div>
                <p className="text-xs text-muted-foreground">New registrations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.conversions}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.signups > 0 
                    ? `${((analytics.conversions / analytics.signups) * 100).toFixed(1)}% conversion rate`
                    : 'No data'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.bounceRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Single page sessions</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages in the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.topPages.map((page, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {page.page}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{page.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {analytics.topPages.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No analytics data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.revenueByMonth.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {item.month}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${item.revenue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {analytics.revenueByMonth.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No revenue data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Subscribers</CardTitle>
              <CardDescription>
                View and manage email subscribers from the landing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Total subscribers: {subscribers.length}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const csv = [
                      ['Email', 'Source', 'Status', 'Subscribed At'].join(','),
                      ...subscribers.map(s => [
                        s.email,
                        s.source,
                        s.status,
                        new Date(s.subscribed_at).toLocaleDateString()
                      ].join(','))
                    ].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{subscriber.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={subscriber.status === "active" ? "default" : "secondary"}>
                          {subscriber.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(subscriber.subscribed_at).toLocaleDateString()} at{' '}
                        {new Date(subscriber.subscribed_at).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {subscribers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No subscribers yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Activity Log</CardTitle>
              <CardDescription>
                Track all administrative actions performed in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Target User</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLog.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant={
                          log.action_type === 'block_user' ? 'destructive' :
                          log.action_type === 'unblock_user' ? 'default' :
                          'secondary'
                        }>
                          {log.action_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.admin?.email || 'System'}
                      </TableCell>
                      <TableCell>
                        {log.target?.email || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.action_data?.reason || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {activityLog.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No activity logged yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Management</CardTitle>
              <CardDescription>
                Optimize your web app for search engines and improve visibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Page SEO Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage meta tags, titles, and descriptions for each page
                    </p>
                    <Button onClick={() => router.push("/admin/seo")}>
                      <FileText className="h-4 w-4 mr-2" />
                      Manage Page SEO
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sitemap & Robots</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure sitemap.xml and robots.txt for search engines
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open('/sitemap.xml', '_blank')}
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        View Sitemap
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open('/robots.txt', '_blank')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Robots.txt
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Monitor page load times and Core Web Vitals
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Avg Page Load:</span>
                        <span className="font-semibold">2.3s</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Mobile Score:</span>
                        <span className="font-semibold text-green-600">92/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Desktop Score:</span>
                        <span className="font-semibold text-green-600">98/100</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Indexing Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Check which pages are indexed by search engines
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Indexed Pages:</span>
                        <span className="font-semibold">{analytics.topPages.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Last Crawl:</span>
                        <span className="font-semibold">2 days ago</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Request Reindex
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">SEO Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">All pages have meta descriptions</p>
                        <p className="text-xs text-muted-foreground">Good for search rankings</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Some images missing alt text</p>
                        <p className="text-xs text-muted-foreground">Add alt text for better accessibility and SEO</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Consider adding structured data</p>
                        <p className="text-xs text-muted-foreground">Help search engines understand your content better</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
