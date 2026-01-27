import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Crown, FileText, TrendingUp, Activity, Zap } from "lucide-react";

interface UserStats {
  totalUsers: number;
  freeUsers: number;
  basicUsers: number;
  proUsers: number;
  enterpriseUsers: number;
  premiumUsers: number;
  totalWordsUsed: number;
}

export default function AdminOverview() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id || !user?.email) return;

      try {
        const { data, error } = await supabase.functions.invoke('admin-operations', {
          body: {
            action: 'get-user-stats',
            userId: user.id,
            userEmail: user.email
          }
        });

        if (!error && data?.stats) {
          setUserStats(data.stats);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
      setLoading(false);
    };

    loadStats();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with PeakDraft.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{userStats?.totalUsers || 0}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Premium Users</p>
                <p className="text-3xl font-bold">{userStats?.premiumUsers || 0}</p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Crown className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Words Generated</p>
                <p className="text-3xl font-bold">{userStats?.totalWordsUsed?.toLocaleString() || 0}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <FileText className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold">
                  {userStats?.totalUsers 
                    ? Math.round((userStats.premiumUsers / userStats.totalUsers) * 100) 
                    : 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Subscription Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Free Users</span>
                  <span className="text-sm text-muted-foreground">{userStats?.freeUsers || 0}</span>
                </div>
                <Progress 
                  value={userStats?.totalUsers ? (userStats.freeUsers / userStats.totalUsers) * 100 : 0} 
                  className="h-2" 
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Basic</span>
                  <span className="text-sm text-muted-foreground">{userStats?.basicUsers || 0}</span>
                </div>
                <Progress 
                  value={userStats?.totalUsers ? (userStats.basicUsers / userStats.totalUsers) * 100 : 0} 
                  className="h-2 [&>div]:bg-blue-500" 
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Pro</span>
                  <span className="text-sm text-muted-foreground">{userStats?.proUsers || 0}</span>
                </div>
                <Progress 
                  value={userStats?.totalUsers ? (userStats.proUsers / userStats.totalUsers) * 100 : 0} 
                  className="h-2 [&>div]:bg-purple-500" 
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Enterprise</span>
                  <span className="text-sm text-muted-foreground">{userStats?.enterpriseUsers || 0}</span>
                </div>
                <Progress 
                  value={userStats?.totalUsers ? (userStats.enterpriseUsers / userStats.totalUsers) * 100 : 0} 
                  className="h-2 [&>div]:bg-amber-500" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <a href="/admin/users" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <Users className="h-5 w-5 mb-2 text-primary" />
                <p className="font-medium text-sm">Manage Users</p>
              </a>
              <a href="/admin/promotions" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <Activity className="h-5 w-5 mb-2 text-primary" />
                <p className="font-medium text-sm">Promotions</p>
              </a>
              <a href="/admin/notifications" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <FileText className="h-5 w-5 mb-2 text-primary" />
                <p className="font-medium text-sm">Notifications</p>
              </a>
              <a href="/admin/templates" className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <Crown className="h-5 w-5 mb-2 text-primary" />
                <p className="font-medium text-sm">Templates</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
