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
import { Megaphone, Plus, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Promotion {
  id: string;
  title: string;
  message: string;
  button_text: string;
  button_link: string | null;
  image_url: string | null;
  is_active: boolean;
  show_on_landing: boolean;
  show_on_dashboard: boolean;
  target_users: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export default function AdminPromotions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [newPromotion, setNewPromotion] = useState({
    title: "",
    message: "",
    button_text: "Learn More",
    button_link: "",
    image_url: "",
    show_on_landing: true,
    show_on_dashboard: true,
    target_users: "free"
  });

  const loadPromotions = async () => {
    if (!user?.id || !user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'get-promotions',
          userId: user.id,
          userEmail: user.email
        }
      });

      if (!error && data?.promotions) {
        setPromotions(data.promotions);
      }
    } catch (error) {
      console.error('Error loading promotions:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPromotions();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPromotions();
    setRefreshing(false);
    toast({ title: "Promotions refreshed" });
  };

  const createPromotion = async () => {
    if (!newPromotion.title || !newPromotion.message) {
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
          action: 'create-promotion',
          userId: user.id,
          userEmail: user.email,
          data: newPromotion
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Success",
        description: "Promotion created successfully",
      });

      setNewPromotion({
        title: "",
        message: "",
        button_text: "Learn More",
        button_link: "",
        image_url: "",
        show_on_landing: true,
        show_on_dashboard: true,
        target_users: "free"
      });
      await loadPromotions();
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast({
        title: "Error",
        description: "Failed to create promotion",
        variant: "destructive",
      });
    }
  };

  const togglePromotionStatus = async (id: string, currentStatus: boolean) => {
    if (!user?.id || !user?.email) return;

    try {
      const { error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'toggle-promotion',
          userId: user.id,
          userEmail: user.email,
          data: { promotionId: id, isActive: currentStatus }
        }
      });

      if (error) throw error;
      await loadPromotions();
      toast({ title: currentStatus ? "Promotion deactivated" : "Promotion activated" });
    } catch (error) {
      console.error('Error toggling promotion:', error);
    }
  };

  const deletePromotion = async (id: string) => {
    if (!user?.id || !user?.email) return;

    try {
      const { error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'delete-promotion',
          userId: user.id,
          userEmail: user.email,
          data: { promotionId: id }
        }
      });

      if (error) throw error;
      toast({ title: "Promotion deleted" });
      await loadPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast({
        title: "Error",
        description: "Failed to delete promotion",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-8 w-8" />
            Promotions
          </h1>
          <p className="text-muted-foreground">Create and manage promotional popups</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Create Promotion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Promotion
          </CardTitle>
          <CardDescription>Create promotional popups that appear on landing page and dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promo-title">Title</Label>
              <Input
                id="promo-title"
                value={newPromotion.title}
                onChange={(e) => setNewPromotion({ ...newPromotion, title: e.target.value })}
                placeholder="e.g., Upgrade to Pro!"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-button-text">Button Text</Label>
              <Input
                id="promo-button-text"
                value={newPromotion.button_text}
                onChange={(e) => setNewPromotion({ ...newPromotion, button_text: e.target.value })}
                placeholder="e.g., Learn More"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="promo-message">Message</Label>
            <Textarea
              id="promo-message"
              value={newPromotion.message}
              onChange={(e) => setNewPromotion({ ...newPromotion, message: e.target.value })}
              placeholder="Your promotional message..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promo-button-link">Button Link</Label>
              <Input
                id="promo-button-link"
                value={newPromotion.button_link}
                onChange={(e) => setNewPromotion({ ...newPromotion, button_link: e.target.value })}
                placeholder="/app/pricing or https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-image-url">Image URL (optional)</Label>
              <Input
                id="promo-image-url"
                value={newPromotion.image_url}
                onChange={(e) => setNewPromotion({ ...newPromotion, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Target Users</Label>
              <Select 
                value={newPromotion.target_users} 
                onValueChange={(value) => setNewPromotion({ ...newPromotion, target_users: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free Users Only</SelectItem>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="paid">Paid Users Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={newPromotion.show_on_landing}
                onCheckedChange={(checked) => setNewPromotion({ ...newPromotion, show_on_landing: checked })}
              />
              <Label>Show on Landing Page</Label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={newPromotion.show_on_dashboard}
                onCheckedChange={(checked) => setNewPromotion({ ...newPromotion, show_on_dashboard: checked })}
              />
              <Label>Show on Dashboard</Label>
            </div>
          </div>
          <Button onClick={createPromotion} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Promotion
          </Button>
        </CardContent>
      </Card>

      {/* Existing Promotions */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Promotions</CardTitle>
          <CardDescription>{promotions.length} total promotions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {promotions.map((promotion) => (
              <div key={promotion.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{promotion.title}</h3>
                      <Badge variant={promotion.is_active ? 'default' : 'secondary'}>
                        {promotion.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{promotion.target_users}</Badge>
                      {promotion.show_on_landing && <Badge variant="outline">Landing</Badge>}
                      {promotion.show_on_dashboard && <Badge variant="outline">Dashboard</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{promotion.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Button: {promotion.button_text}</span>
                      {promotion.button_link && <span>Link: {promotion.button_link}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Created: {format(new Date(promotion.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={promotion.is_active}
                        onCheckedChange={() => togglePromotionStatus(promotion.id, promotion.is_active)}
                      />
                      <span className="text-sm text-muted-foreground w-16">
                        {promotion.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => deletePromotion(promotion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {promotions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No promotions found. Create one to get started!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
