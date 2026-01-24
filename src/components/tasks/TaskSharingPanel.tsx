import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Share2, Link, Mail, Copy, Trash2, Check, Loader2, Globe, Lock, Eye } from "lucide-react";
import { useTaskSharing, TaskShare } from "@/hooks/useTaskSharing";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { SharedTaskPreviewModal } from "./SharedTaskPreviewModal";

interface TaskSharingPanelProps {
  taskId: string | null;
}

export function TaskSharingPanel({ taskId }: TaskSharingPanelProps) {
  const { toast } = useToast();
  const { shares, loading, createPublicShare, shareWithEmail, revokeShare, getShareUrl } =
    useTaskSharing(taskId);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewToken, setPreviewToken] = useState<string | null>(null);

  const handleCreatePublicLink = async () => {
    setSubmitting(true);
    await createPublicShare();
    setSubmitting(false);
  };

  const handleShareWithEmail = async () => {
    if (!email.trim()) return;

    setSubmitting(true);
    const result = await shareWithEmail(email.trim(), permission);
    if (result) {
      setEmail("");
    }
    setSubmitting(false);
  };

  const handleCopyLink = async (share: TaskShare) => {
    const url = getShareUrl(share);
    await navigator.clipboard.writeText(url);
    setCopiedId(share.id);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = async (shareId: string) => {
    await revokeShare(shareId);
  };

  const handlePreview = (share: TaskShare) => {
    if (share.share_token) {
      setPreviewToken(share.share_token);
      setPreviewOpen(true);
    }
  };

  if (!taskId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Share2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Save the task first to share it</p>
      </div>
    );
  }

  const publicShares = shares.filter((s) => s.is_public);
  const emailShares = shares.filter((s) => !s.is_public && s.shared_with_email);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 text-primary" />
        <h4 className="font-medium text-sm">Share Task</h4>
      </div>

      {/* Create public link */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Link className="h-4 w-4" />
          <span>Public Link</span>
        </div>
        {publicShares.length > 0 ? (
          <div className="space-y-2">
            {publicShares.map((share) => (
              <div
                key={share.id}
                className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm"
              >
                <Globe className="h-4 w-4 text-green-500 shrink-0" />
                <span className="flex-1 truncate text-xs">
                  {getShareUrl(share).slice(0, 40)}...
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handlePreview(share)}
                  title="Preview shared task"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleCopyLink(share)}
                >
                  {copiedId === share.id ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive"
                  onClick={() => handleRevoke(share.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreatePublicLink}
            disabled={submitting}
            className="w-full gap-2"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Link className="h-4 w-4" />
            )}
            Create Public Link
          </Button>
        )}
      </div>

      {/* Share with email */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4" />
          <span>Share via Email</span>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="flex-1"
          />
          <Select value={permission} onValueChange={setPermission}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="view">View</SelectItem>
              <SelectItem value="edit">Edit</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="icon"
            onClick={handleShareWithEmail}
            disabled={!email.trim() || submitting}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Shared with list */}
      {emailShares.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Shared With</span>
          <ScrollArea className="max-h-32">
            <div className="space-y-2 pr-3">
              {emailShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center gap-2 p-2 rounded bg-background border"
                >
                  <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-sm truncate">{share.shared_with_email}</span>
                  <Badge variant="outline" className="text-xs">
                    {share.permission}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={() => handleRevoke(share.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
      {/* Preview Modal */}
      <SharedTaskPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        shareToken={previewToken}
      />
    </div>
  );
}
