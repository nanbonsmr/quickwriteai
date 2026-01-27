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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Megaphone, Plus, Trash2, RefreshCw, Pencil } from "lucide-react";
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

interface PromotionFormData {
  title: string;
  message: string;
  button_text: string;
  button_link: string;
  image_url: string;
  show_on_landing: boolean;
  show_on_dashboard: boolean;
  target_users: string;
}

const defaultFormData: PromotionFormData = {
  title: "",
  message: "",
  button_text: "Learn More",
  button_link: "",
  image_url: "",
  show_on_landing: true,
  show_on_dashboard: true,
  target_users: "free"
};

export default function AdminPromotions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newPromotion, setNewPromotion] = useState<PromotionFormData>(defaultFormData);
  
  // Edit state
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [editFormData, setEditFormData] = useState<PromotionFormData>(defaultFormData);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

      setNewPromotion(defaultFormData);
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

  const openEditDialog = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setEditFormData({
      title: promotion.title,
      message: promotion.message,
      button_text: promotion.button_text || "Learn More",
      button_link: promotion.button_link || "",
      image_url: promotion.image_url || "",
      show_on_landing: promotion.show_on_landing,
      show_on_dashboard: promotion.show_on_dashboard,
      target_users: promotion.target_users || "free"
    });
    setIsEditDialogOpen(true);
  };

  const updatePromotion = async () => {
    if (!editingPromotion || !user?.id || !user?.email) return;
    
    if (!editFormData.title || !editFormData.message) {
      toast({
        title: "Error",
        description: "Title and message are required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error, data } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'update-promotion',
          userId: user.id,
          userEmail: user.email,
          data: {
            promotionId: editingPromotion.id,
            updates: {
              title: editFormData.title,
              message: editFormData.message,
              button_text: editFormData.button_text,
              button_link: editFormData.button_link || null,
              image_url: editFormData.image_url || null,
              show_on_landing: editFormData.show_on_landing,
              show_on_dashboard: editFormData.show_on_dashboard,
              target_users: editFormData.target_users
            }
          }
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Success",
        description: "Promotion updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingPromotion(null);
      await loadPromotions();
    } catch (error) {
      console.error('Error updating promotion:', error);
      toast({
        title: "Error",
        description: "Failed to update promotion",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

  const PromotionForm = ({ 
    data, 
    onChange, 
    isEdit = false 
  }: { 
    data: PromotionFormData; 
    onChange: (data: PromotionFormData) => void;
    isEdit?: boolean;
  }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? 'edit-' : ''}promo-title`}>Title</Label>
          <Input
            id={`${isEdit ? 'edit-' : ''}promo-title`}
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="e.g., Upgrade to Pro!"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? 'edit-' : ''}promo-button-text`}>Button Text</Label>
          <Input
            id={`${isEdit ? 'edit-' : ''}promo-button-text`}
            value={data.button_text}
            onChange={(e) => onChange({ ...data, button_text: e.target.value })}
            placeholder="e.g., Learn More"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${isEdit ? 'edit-' : ''}promo-message`}>Message</Label>
        <Textarea
          id={`${isEdit ? 'edit-' : ''}promo-message`}
          value={data.message}
          onChange={(e) => onChange({ ...data, message: e.target.value })}
          placeholder="Your promotional message..."
          rows={3}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? 'edit-' : ''}promo-button-link`}>Button Link</Label>
          <Input
            id={`${isEdit ? 'edit-' : ''}promo-button-link`}
            value={data.button_link}
            onChange={(e) => onChange({ ...data, button_link: e.target.value })}
            placeholder="/app/pricing or https://..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${isEdit ? 'edit-' : ''}promo-image-url`}>Image URL (optional)</Label>
          <Input
            id={`${isEdit ? 'edit-' : ''}promo-image-url`}
            value={data.image_url}
            onChange={(e) => onChange({ ...data, image_url: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Target Users</Label>
          <Select 
            value={data.target_users} 
            onValueChange={(value) => onChange({ ...data, target_users: value })}
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
            checked={data.show_on_landing}
            onCheckedChange={(checked) => onChange({ ...data, show_on_landing: checked })}
          />
          <Label>Show on Landing Page</Label>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Switch
            checked={data.show_on_dashboard}
            onCheckedChange={(checked) => onChange({ ...data, show_on_dashboard: checked })}
          />
          <Label>Show on Dashboard</Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 sm:h-8 sm:w-8" />
            Promotions
          </h1>
          <p className="text-sm text-muted-foreground">Create and manage promotional popups</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Create Promotion */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Plus className="h-5 w-5" />
            Create New Promotion
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Create promotional popups that appear on landing page and dashboard</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <PromotionForm data={newPromotion} onChange={setNewPromotion} />
          <Button onClick={createPromotion} className="w-full mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Promotion
          </Button>
        </CardContent>
      </Card>

      {/* Existing Promotions */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Existing Promotions</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{promotions.length} total promotions</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-4">
            {promotions.map((promotion) => (
              <div key={promotion.id} className="border rounded-lg p-3 sm:p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base">{promotion.title}</h3>
                      <Badge variant={promotion.is_active ? 'default' : 'secondary'} className="text-xs">
                        {promotion.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      <Badge variant="outline" className="text-xs">{promotion.target_users}</Badge>
                      {promotion.show_on_landing && <Badge variant="outline" className="text-xs">Landing</Badge>}
                      {promotion.show_on_dashboard && <Badge variant="outline" className="text-xs">Dashboard</Badge>}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">{promotion.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span>Button: {promotion.button_text}</span>
                      {promotion.button_link && <span className="truncate max-w-32">Link: {promotion.button_link}</span>}
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
                      <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline w-16">
                        {promotion.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => openEditDialog(promotion)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => deletePromotion(promotion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {promotions.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">No promotions found. Create one to get started!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Promotion</DialogTitle>
            <DialogDescription>Update the promotion details below</DialogDescription>
          </DialogHeader>
          <PromotionForm data={editFormData} onChange={setEditFormData} isEdit />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updatePromotion} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}