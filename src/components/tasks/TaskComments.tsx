import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import { useTaskComments, TaskComment } from "@/hooks/useTaskComments";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface TaskCommentsProps {
  taskId: string | null;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { user } = useAuth();
  const { comments, loading, addComment, updateComment, deleteComment } = useTaskComments(taskId);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    const result = await addComment(newComment.trim());
    if (result) {
      setNewComment("");
    }
    setSubmitting(false);
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setSubmitting(true);
    const success = await updateComment(commentId, editContent.trim());
    if (success) {
      setEditingId(null);
      setEditContent("");
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const startEditing = (comment: TaskComment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  if (!taskId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Save the task first to add comments</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h4 className="font-medium text-sm">Comments ({comments.length})</h4>
      </div>

      {/* Comments list */}
      <ScrollArea className="max-h-64">
        <div className="space-y-3 pr-3">
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-2 group">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium truncate">
                      {user?.email || "User"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                    {comment.created_at !== comment.updated_at && (
                      <span className="text-[10px] text-muted-foreground">(edited)</span>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] text-sm"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={submitting || !editContent.trim()}
                          className="h-7"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          className="h-7"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                      {comment.user_id === user?.id && (
                        <div className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 flex gap-1 bg-background/80 backdrop-blur-sm rounded p-1">
                          <button
                            onClick={() => startEditing(comment)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 hover:bg-muted rounded text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add comment form */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[60px] text-sm resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleAddComment();
            }
          }}
        />
        <Button
          size="icon"
          onClick={handleAddComment}
          disabled={!newComment.trim() || submitting}
          className="shrink-0"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Press ⌘+Enter to submit
      </p>
    </div>
  );
}
