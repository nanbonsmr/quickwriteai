import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExportDropdown } from '@/components/ExportDropdown';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useToast } from '@/hooks/use-toast';

interface EditorState {
  content: string;
  title?: string;
  templateType?: string;
}

export default function Editor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const initialState = location.state as EditorState | null;
  
  const [content, setContent] = useState(initialState?.content || '');
  const [originalContent] = useState(initialState?.content || '');
  const [title, setTitle] = useState(initialState?.title || 'Untitled Document');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!initialState?.content) {
      toast({
        title: "No content to edit",
        description: "Please generate content first before using the editor.",
        variant: "destructive",
      });
      navigate('/app/templates');
    }
  }, [initialState, navigate, toast]);

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    setWordCount(words);
    setCharCount(chars);
    setHasChanges(content !== originalContent);
  }, [content, originalContent]);

  const handleReset = () => {
    setContent(originalContent);
    toast({
      title: "Content reset",
      description: "Your changes have been reverted to the original.",
    });
  };

  const handleSaveToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Your edited content has been copied.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const getFilename = () => {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'document';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Content Editor
            </h1>
            <p className="text-sm text-muted-foreground">
              Edit and format your content before exporting
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToClipboard}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Copy
          </Button>
          <ExportDropdown
            content={content}
            filename={getFilename()}
            disabled={!content.trim()}
          />
        </div>
      </div>

      {/* Document Settings */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Document Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title..."
              className="max-w-md"
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
            {hasChanges && (
              <>
                <span>•</span>
                <span className="text-amber-500">Unsaved changes</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rich Text Editor */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Content Editor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            content={content}
            onChange={setContent}
          />
        </CardContent>
      </Card>

      {/* Bottom Actions */}
      <div className="flex justify-end gap-2 pb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <ExportDropdown
          content={content}
          filename={getFilename()}
          disabled={!content.trim()}
        />
      </div>
    </div>
  );
}
