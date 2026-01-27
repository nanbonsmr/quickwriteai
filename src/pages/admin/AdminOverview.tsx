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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Welcome back! Here's what's happening with PeakDraft.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Users</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{userStats?.totalUsers || 0}</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg sm:rounded-xl shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Premium Users</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">{userStats?.premiumUsers || 0}</p>
              </div>
              <div className="p-2 sm:p-3 bg-amber-500/20 rounded-lg sm:rounded-xl shrink-0">
                <Crown className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Words Generated</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">{userStats?.totalWordsUsed?.toLocaleString() || 0}</p>
              </div>
              <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg sm:rounded-xl shrink-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Conversion Rate</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold">
                  {userStats?.totalUsers 
                    ? Math.round((userStats.premiumUsers / userStats.totalUsers) * 100) 
                    : 0}%
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg sm:rounded-xl shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
              Subscription Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="space-y-2 sm:space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-medium">Free Users</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{userStats?.freeUsers || 0}</span>
                </div>
                <Progress 
                  value={userStats?.totalUsers ? (userStats.freeUsers / userStats.totalUsers) * 100 : 0} 
                  className="h-1.5 sm:h-2" 
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-medium">Basic</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{userStats?.basicUsers || 0}</span>
                </div>
                <Progress 
                  value={userStats?.totalUsers ? (userStats.basicUsers / userStats.totalUsers) * 100 : 0} 
                  className="h-1.5 sm:h-2 [&>div]:bg-blue-500" 
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-medium">Pro</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{userStats?.proUsers || 0}</span>
                </div>
                <Progress 
                  value={userStats?.totalUsers ? (userStats.proUsers / userStats.totalUsers) * 100 : 0} 
                  className="h-1.5 sm:h-2 [&>div]:bg-purple-500" 
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-medium">Enterprise</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{userStats?.enterpriseUsers || 0}</span>
                </div>
                <Progress 
                  value={userStats?.totalUsers ? (userStats.enterpriseUsers / userStats.totalUsers) * 100 : 0} 
                  className="h-1.5 sm:h-2 [&>div]:bg-amber-500" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <a href="/admin/users" className="p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 mb-1.5 sm:mb-2 text-primary" />
                <p className="font-medium text-xs sm:text-sm">Manage Users</p>
              </a>
              <a href="/admin/promotions" className="p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 mb-1.5 sm:mb-2 text-primary" />
                <p className="font-medium text-xs sm:text-sm">Promotions</p>
              </a>
              <a href="/admin/notifications" className="p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 mb-1.5 sm:mb-2 text-primary" />
                <p className="font-medium text-xs sm:text-sm">Notifications</p>
              </a>
              <a href="/admin/templates" className="p-3 sm:p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <Crown className="h-4 w-4 sm:h-5 sm:w-5 mb-1.5 sm:mb-2 text-primary" />
                <p className="font-medium text-xs sm:text-sm">Templates</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
