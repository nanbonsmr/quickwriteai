import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Plus, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  target_users: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    type: "info",
    target_users: "all"
  });

  const loadNotifications = async () => {
    if (!user?.id || !user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'get-notifications',
          userId: user.id,
          userEmail: user.email
        }
      });

      if (!error && data?.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
    toast({ title: "Notifications refreshed" });
  };

  const createNotification = async () => {
    if (!newNotification.title || !newNotification.message) {
      toast({
        title: "Error",
        description: "Title and message are required",
        variant: "destructive",
      });
      return;
    }
    if (!user?.id || !user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'create-notification',
          userId: user.id,
          userEmail: user.email,
          data: newNotification
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Success",
        description: "Notification created successfully",
      });

      setNewNotification({
        title: "",
        message: "",
        type: "info",
        target_users: "all"
      });
      await loadNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive",
      });
    }
  };

  const toggleNotificationStatus = async (id: string, currentStatus: boolean) => {
    if (!user?.id || !user?.email) return;

    try {
      const { error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'toggle-notification',
          userId: user.id,
          userEmail: user.email,
          data: { notificationId: id, isActive: currentStatus }
        }
      });

      if (error) throw error;
      await loadNotifications();
    } catch (error) {
      console.error('Error toggling notification:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user?.id || !user?.email) return;

    try {
      const { error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'delete-notification',
          userId: user.id,
          userEmail: user.email,
          data: { notificationId: id }
        }
      });

      if (error) throw error;
      toast({ title: "Notification deleted" });
      await loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground">Send notifications to your users</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Create Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Notification
          </CardTitle>
          <CardDescription>Send notifications to specific user groups</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notification-title">Title</Label>
              <Input
                id="notification-title"
                value={newNotification.title}
                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                placeholder="Notification title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notification-type">Type</Label>
              <Select 
                value={newNotification.type} 
                onValueChange={(value) => setNewNotification({ ...newNotification, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notification-message">Message</Label>
            <Textarea
              id="notification-message"
              value={newNotification.message}
              onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
              placeholder="Notification message..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Target Users</Label>
            <Select 
              value={newNotification.target_users} 
              onValueChange={(value) => setNewNotification({ ...newNotification, target_users: value })}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="free">Free Users</SelectItem>
                <SelectItem value="premium">Premium Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={createNotification} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Notification
          </Button>
        </CardContent>
      </Card>

      {/* Existing Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Notifications</CardTitle>
          <CardDescription>{notifications.length} total notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{notification.title}</h3>
                      <Badge variant={getTypeBadgeVariant(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Badge variant="outline">{notification.target_users}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created: {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={notification.is_active}
                        onCheckedChange={() => toggleNotificationStatus(notification.id, notification.is_active)}
                      />
                      <span className="text-sm text-muted-foreground w-16">
                        {notification.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No notifications found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
