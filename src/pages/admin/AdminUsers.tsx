import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, RotateCcw, Crown, RefreshCw, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  subscription_plan: string;
  words_used: number;
  words_limit: number;
  created_at: string;
  subscription_end_date: string | null;
  role: string;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [planChangeDialog, setPlanChangeDialog] = useState<{
    open: boolean;
    user: UserProfile | null;
    newPlan: string;
  }>({ open: false, user: null, newPlan: "" });

  const loadUsers = async () => {
    if (!user?.id || !user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'get-users',
          userId: user.id,
          userEmail: user.email
        }
      });

      if (!error && data?.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
    toast({ title: "Users refreshed" });
  };

  const handlePlanChangeRequest = (userProfile: UserProfile, newPlan: string) => {
    if (newPlan === userProfile.subscription_plan) return;
    setPlanChangeDialog({ open: true, user: userProfile, newPlan });
  };

  const confirmPlanChange = async () => {
    if (!user?.id || !user?.email || !planChangeDialog.user) return;

    try {
      const { error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'update-user-plan',
          userId: user.id,
          userEmail: user.email,
          data: { targetUserId: planChangeDialog.user.user_id, newPlan: planChangeDialog.newPlan }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User plan updated to ${planChangeDialog.newPlan}`,
      });
      await loadUsers();
    } catch (error) {
      console.error('Error updating user plan:', error);
      toast({
        title: "Error",
        description: "Failed to update user plan",
        variant: "destructive",
      });
    } finally {
      setPlanChangeDialog({ open: false, user: null, newPlan: "" });
    }
  };

  const resetUserWords = async (targetUserId: string) => {
    if (!user?.id || !user?.email) return;

    try {
      const { error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'reset-user-words',
          userId: user.id,
          userEmail: user.email,
          data: { targetUserId }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User word count reset to 0",
      });
      await loadUsers();
    } catch (error) {
      console.error('Error resetting user words:', error);
      toast({
        title: "Error",
        description: "Failed to reset user words",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(u => 
    u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'pro': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'basic': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AlertDialog open={planChangeDialog.open} onOpenChange={(open) => !open && setPlanChangeDialog({ open: false, user: null, newPlan: "" })}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Plan Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change <span className="font-medium text-foreground">{planChangeDialog.user?.display_name || 'this user'}</span>'s plan from{' '}
              <Badge variant="secondary" className="mx-1">{planChangeDialog.user?.subscription_plan}</Badge> to{' '}
              <Badge variant="default" className="mx-1">{planChangeDialog.newPlan}</Badge>?
              {planChangeDialog.newPlan !== 'free' && (
                <span className="block mt-2 text-sm">This will set a 30-day subscription period.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPlanChange} className="w-full sm:w-auto">Confirm Change</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
            User Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">{users.length} total users</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing} size="sm" className="w-full sm:w-auto">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-3 sm:pt-6 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users - Mobile Cards / Desktop Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">All Users</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Manage user subscriptions and word limits</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <ScrollArea className="h-[500px] lg:h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Words Used</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userProfile) => (
                    <TableRow key={userProfile.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {userProfile.display_name || 'Unknown'}
                            {userProfile.role === 'admin' && (
                              <Crown className="h-4 w-4 text-amber-500" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {userProfile.user_id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={userProfile.subscription_plan}
                          onValueChange={(value) => handlePlanChangeRequest(userProfile, value)}
                        >
                          <SelectTrigger className={`w-28 ${getPlanBadgeColor(userProfile.subscription_plan)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{userProfile.words_used?.toLocaleString() || 0}</span>
                          <span className="text-muted-foreground"> / {userProfile.words_limit?.toLocaleString() || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(userProfile.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {userProfile.subscription_end_date 
                          ? format(new Date(userProfile.subscription_end_date), 'MMM d, yyyy')
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetUserWords(userProfile.user_id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reset
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden">
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 p-3">
                {filteredUsers.map((userProfile) => (
                  <Card key={userProfile.id} className="p-3">
                    <div className="space-y-3">
                      {/* User Info */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium flex items-center gap-2 truncate">
                            {userProfile.display_name || 'Unknown'}
                            {userProfile.role === 'admin' && (
                              <Crown className="h-4 w-4 text-amber-500 shrink-0" />
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {userProfile.user_id}
                          </p>
                        </div>
                        <Select
                          value={userProfile.subscription_plan}
                          onValueChange={(value) => handlePlanChangeRequest(userProfile, value)}
                        >
                          <SelectTrigger className={`w-24 h-8 text-xs ${getPlanBadgeColor(userProfile.subscription_plan)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          <span className="font-medium text-foreground">{userProfile.words_used?.toLocaleString() || 0}</span> / {userProfile.words_limit?.toLocaleString() || 0} words
                        </span>
                        <span>Joined {format(new Date(userProfile.created_at), 'MMM d, yyyy')}</span>
                      </div>

                      {/* Actions */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetUserWords(userProfile.user_id)}
                        className="w-full text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset Words
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
