import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layout, Pin, PinOff, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PinnedTemplate {
  id: string;
  template_id: string;
  pinned_at: string;
  pinned_by: string;
}

const availableTemplates = [
  { id: 'blog', title: 'Blog Posts', description: 'Create engaging blog content' },
  { id: 'social', title: 'Social Media', description: 'Generate captivating social posts' },
  { id: 'email', title: 'Email Writer', description: 'Craft professional emails' },
  { id: 'ads', title: 'Ad Copy', description: 'Create compelling ads' },
  { id: 'humanize', title: 'AI Text Humanizer', description: 'Transform AI text' },
  { id: 'cv', title: 'CV Writer', description: 'Create professional CVs' },
  { id: 'product', title: 'Product Description', description: 'Generate product descriptions' },
  { id: 'letter', title: 'Letter Writer', description: 'Write professional letters' },
  { id: 'script', title: 'Script Writer', description: 'Create video/audio scripts' },
  { id: 'hashtag', title: 'Hashtag Generator', description: 'Generate trending hashtags' },
  { id: 'post-ideas', title: 'Post Ideas Generator', description: 'Get creative content ideas' },
  { id: 'chatgpt-prompt', title: 'ChatGPT Prompt Generator', description: 'Create effective prompts' },
  { id: 'image-prompt', title: 'Image Prompt Generator', description: 'Generate image prompts' },
  { id: 'video-prompt', title: 'Video Prompt Generator', description: 'Create video prompts' },
  { id: 'proposal', title: 'Proposal Writer', description: 'Create business proposals' },
  { id: 'court-report', title: 'Court Report Writer', description: 'Generate legal documents' },
  { id: 'ads-image-prompt', title: 'AI Ads Image Prompt', description: 'Generate ad image prompts' },
  { id: 'background-image-prompt', title: 'AI Background Image', description: 'Create background prompts' },
  { id: 'friendly-letter', title: 'AI Friendly Letter', description: 'Write heartfelt letters' },
  { id: 'cover-letter', title: 'Cover Letter Writer', description: 'Create cover letters' },
  { id: 'press-release', title: 'Press Release Generator', description: 'Generate press releases' },
  { id: 'business-plan', title: 'Business Plan Writer', description: 'Create business plans' },
  { id: 'linkedin-post', title: 'LinkedIn Post Generator', description: 'Create LinkedIn posts' },
  { id: 'newsletter', title: 'Newsletter Generator', description: 'Create newsletters' },
  { id: 'product-review', title: 'Product Review Generator', description: 'Write product reviews' },
];

export default function AdminTemplates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pinnedTemplates, setPinnedTemplates] = useState<PinnedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPinnedTemplates = async () => {
    if (!user?.id || !user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'get-pinned-templates',
          userId: user.id,
          userEmail: user.email
        }
      });

      if (!error && data?.pinnedTemplates) {
        setPinnedTemplates(data.pinnedTemplates);
      }
    } catch (error) {
      console.error('Error loading pinned templates:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPinnedTemplates();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPinnedTemplates();
    setRefreshing(false);
    toast({ title: "Templates refreshed" });
  };

  const pinTemplate = async (templateId: string) => {
    if (!user?.id || !user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'pin-template',
          userId: user.id,
          userEmail: user.email,
          data: { templateId }
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Template pinned" });
      await loadPinnedTemplates();
    } catch (error: any) {
      console.error('Error pinning template:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to pin template",
        variant: "destructive",
      });
    }
  };

  const unpinTemplate = async (templateId: string) => {
    if (!user?.id || !user?.email) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'unpin-template',
          userId: user.id,
          userEmail: user.email,
          data: { templateId }
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Template unpinned" });
      await loadPinnedTemplates();
    } catch (error: any) {
      console.error('Error unpinning template:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to unpin template",
        variant: "destructive",
      });
    }
  };

  const isTemplatePinned = (templateId: string) => {
    return pinnedTemplates.some(pt => pt.template_id === templateId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Layout className="h-8 w-8" />
            Template Management
          </h1>
          <p className="text-muted-foreground">Pin templates to feature them on the homepage</p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Pinned Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pin className="h-5 w-5" />
            Pinned Templates
          </CardTitle>
          <CardDescription>{pinnedTemplates.length} templates pinned</CardDescription>
        </CardHeader>
        <CardContent>
          {pinnedTemplates.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {pinnedTemplates.map((pt) => {
                const template = availableTemplates.find(t => t.id === pt.template_id);
                return (
                  <Badge 
                    key={pt.id} 
                    variant="default" 
                    className="flex items-center gap-2 px-3 py-1.5"
                  >
                    {template?.title || pt.template_id}
                    <button onClick={() => unpinTemplate(pt.template_id)}>
                      <PinOff className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No templates pinned yet</p>
          )}
        </CardContent>
      </Card>

      {/* All Templates */}
      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>Click to pin or unpin templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableTemplates.map((template) => {
              const isPinned = isTemplatePinned(template.id);
              return (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    isPinned 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => isPinned ? unpinTemplate(template.id) : pinTemplate(template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{template.title}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    {isPinned ? (
                      <Pin className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <PinOff className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
