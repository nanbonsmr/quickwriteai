import { useState } from 'react';
import { PublicNavbar } from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Copy, Bot, Hash, Sparkles, Lightbulb, ArrowRight, FileText, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const promptExamples = [
  "Create a prompt for generating marketing copy for a SaaS product",
  "Generate a prompt for a creative writing assistant",
  "Create a prompt for a coding tutor specializing in Python",
];

const hashtagExamples = [
  "Generate trending hashtags for a fitness motivation post",
  "Create hashtags for a food blogger posting about Italian cuisine",
  "Suggest hashtags for a tech startup launching a new app",
];

const blogIntroExamples = [
  "How to start a successful online business in 2024",
  "The ultimate guide to productivity for remote workers",
  "10 healthy breakfast recipes for busy mornings",
];

const captionExamples = [
  "A sunset beach photo for a travel account",
  "New product launch for a skincare brand",
  "Monday motivation post for a fitness coach",
];

export default function FreeTools() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 py-12 px-4 pt-24">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Free AI Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Try our powerful AI generators without signing up. Generate content instantly!
            </p>
          </div>

          {/* Tools Tabs */}
          <Tabs defaultValue="chatgpt" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 md:grid-cols-4 mb-8 h-auto">
              <TabsTrigger value="chatgpt" className="flex items-center gap-2 py-2">
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">ChatGPT Prompt</span>
                <span className="sm:hidden">Prompt</span>
              </TabsTrigger>
              <TabsTrigger value="hashtag" className="flex items-center gap-2 py-2">
                <Hash className="w-4 h-4" />
                <span className="hidden sm:inline">Hashtag</span>
                <span className="sm:hidden">Hashtag</span>
              </TabsTrigger>
              <TabsTrigger value="blogintro" className="flex items-center gap-2 py-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Blog Intro</span>
                <span className="sm:hidden">Blog</span>
              </TabsTrigger>
              <TabsTrigger value="caption" className="flex items-center gap-2 py-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Caption</span>
                <span className="sm:hidden">Caption</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chatgpt">
              <FreeChatGPTPromptGenerator />
            </TabsContent>

            <TabsContent value="hashtag">
              <FreeHashtagGenerator />
            </TabsContent>

            <TabsContent value="blogintro">
              <FreeBlogIntroGenerator />
            </TabsContent>

            <TabsContent value="caption">
              <FreeCaptionGenerator />
            </TabsContent>
          </Tabs>

          {/* CTA */}
          <Card className="mt-12 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="py-8 text-center">
              <h3 className="text-2xl font-bold mb-2">Want More Features?</h3>
              <p className="text-muted-foreground mb-6">
                Sign up for free to get 5,000 words/month and access to all 12+ AI templates!
              </p>
              <Button asChild size="lg">
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

function FreeChatGPTPromptGenerator() {
  const [prompt, setPrompt] = useState('');
  const [purpose, setPurpose] = useState('');
  const [context, setContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const { toast } = useToast();

  const MAX_FREE_GENERATIONS = 3;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe what kind of ChatGPT prompt you need",
        variant: "destructive"
      });
      return;
    }

    if (generationsUsed >= MAX_FREE_GENERATIONS) {
      toast({
        title: "Limit Reached",
        description: "Sign up for free to get 5,000 words/month!",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const enhancedPrompt = `Generate an effective and detailed ChatGPT prompt for: ${prompt}. Purpose: ${purpose || 'general use'}. Context: ${context || 'none'}. Include clear instructions, role definition, constraints, and desired output format. Make it comprehensive and professional.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          prompt: enhancedPrompt,
          template_type: 'chatgpt-prompt',
          language: 'en'
        }
      });

      if (error) throw error;

      setGeneratedContent(data.generated_content);
      setGenerationsUsed(prev => prev + 1);

      toast({
        title: "Success!",
        description: `ChatGPT prompt generated (${MAX_FREE_GENERATIONS - generationsUsed - 1} free generations left)`
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate prompt",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard"
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            ChatGPT Prompt Generator
          </CardTitle>
          <CardDescription>
            Create effective prompts for ChatGPT and AI assistants
            <span className="block mt-1 text-xs">
              {MAX_FREE_GENERATIONS - generationsUsed} free generations remaining
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose/Use Case</Label>
            <Input
              id="purpose"
              placeholder="e.g., Content creation, Code review, Tutoring"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Additional Context</Label>
            <Input
              id="context"
              placeholder="e.g., Target audience, tone, constraints"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">What should the prompt do?</Label>
            <Textarea
              id="prompt"
              placeholder="Describe in detail what you want the AI to help with..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || generationsUsed >= MAX_FREE_GENERATIONS}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Prompt
              </>
            )}
          </Button>

          {/* Example prompts */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> Try these examples:
            </p>
            <div className="space-y-2">
              {promptExamples.map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 text-xs"
                  onClick={() => setPrompt(example)}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Generated Prompt
            {generatedContent && (
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedContent ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 rounded-lg">
                {generatedContent}
              </pre>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Bot className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Your generated prompt will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FreeHashtagGenerator() {
  const [prompt, setPrompt] = useState('');
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const { toast } = useToast();

  const MAX_FREE_GENERATIONS = 3;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic or description",
        variant: "destructive"
      });
      return;
    }

    if (generationsUsed >= MAX_FREE_GENERATIONS) {
      toast({
        title: "Limit Reached",
        description: "Sign up for free to get 5,000 words/month!",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const enhancedPrompt = `Generate relevant and trending hashtags for: ${prompt}. Platform: ${platform}. Topic: ${topic || 'general'}. Provide a mix of popular, niche, and branded hashtags. Format them as a clean list.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          prompt: enhancedPrompt,
          template_type: 'hashtag',
          language: 'en'
        }
      });

      if (error) throw error;

      setGeneratedContent(data.generated_content);
      setGenerationsUsed(prev => prev + 1);

      toast({
        title: "Success!",
        description: `Hashtags generated (${MAX_FREE_GENERATIONS - generationsUsed - 1} free generations left)`
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate hashtags",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Hashtags copied to clipboard"
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-pink-500" />
            Hashtag Generator
          </CardTitle>
          <CardDescription>
            Generate trending hashtags for social media
            <span className="block mt-1 text-xs">
              {MAX_FREE_GENERATIONS - generationsUsed} free generations remaining
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic/Niche</Label>
            <Input
              id="topic"
              placeholder="e.g., Fitness, Food, Travel, Tech"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <select
              id="platform"
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter/X</option>
              <option value="tiktok">TikTok</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hashPrompt">Content Description</Label>
            <Textarea
              id="hashPrompt"
              placeholder="Describe what your post is about..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || generationsUsed >= MAX_FREE_GENERATIONS}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Hashtags
              </>
            )}
          </Button>

          {/* Example prompts */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> Try these examples:
            </p>
            <div className="space-y-2">
              {hashtagExamples.map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 text-xs"
                  onClick={() => setPrompt(example)}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Generated Hashtags
            {generatedContent && (
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedContent ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 rounded-lg">
                {generatedContent}
              </pre>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Hash className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Your generated hashtags will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FreeBlogIntroGenerator() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const { toast } = useToast();

  const MAX_FREE_GENERATIONS = 3;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter your blog topic",
        variant: "destructive"
      });
      return;
    }

    if (generationsUsed >= MAX_FREE_GENERATIONS) {
      toast({
        title: "Limit Reached",
        description: "Sign up for free to get 5,000 words/month!",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const enhancedPrompt = `Write an engaging blog introduction for the topic: "${prompt}". Tone: ${tone}. The intro should hook readers, establish relevance, and preview what's coming. Keep it 2-3 paragraphs.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          prompt: enhancedPrompt,
          template_type: 'blog',
          language: 'en'
        }
      });

      if (error) throw error;

      setGeneratedContent(data.generated_content);
      setGenerationsUsed(prev => prev + 1);

      toast({
        title: "Success!",
        description: `Blog intro generated (${MAX_FREE_GENERATIONS - generationsUsed - 1} free generations left)`
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate blog intro",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Blog intro copied to clipboard"
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Blog Intro Generator
          </CardTitle>
          <CardDescription>
            Create engaging blog introductions
            <span className="block mt-1 text-xs">
              {MAX_FREE_GENERATIONS - generationsUsed} free generations remaining
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blogTone">Tone</Label>
            <select
              id="blogTone"
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual & Friendly</option>
              <option value="authoritative">Authoritative</option>
              <option value="conversational">Conversational</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blogPrompt">Blog Topic</Label>
            <Textarea
              id="blogPrompt"
              placeholder="Enter your blog topic or title..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || generationsUsed >= MAX_FREE_GENERATIONS}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Blog Intro
              </>
            )}
          </Button>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> Try these examples:
            </p>
            <div className="space-y-2">
              {blogIntroExamples.map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 text-xs"
                  onClick={() => setPrompt(example)}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Generated Blog Intro
            {generatedContent && (
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedContent ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 rounded-lg">
                {generatedContent}
              </pre>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Your generated blog intro will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FreeCaptionGenerator() {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const { toast } = useToast();

  const MAX_FREE_GENERATIONS = 3;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe your post",
        variant: "destructive"
      });
      return;
    }

    if (generationsUsed >= MAX_FREE_GENERATIONS) {
      toast({
        title: "Limit Reached",
        description: "Sign up for free to get 5,000 words/month!",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const enhancedPrompt = `Write an engaging social media caption for ${platform} about: "${prompt}". Make it catchy, include a call-to-action, and add relevant emojis. Provide 3 different caption options.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          prompt: enhancedPrompt,
          template_type: 'social-media',
          language: 'en'
        }
      });

      if (error) throw error;

      setGeneratedContent(data.generated_content);
      setGenerationsUsed(prev => prev + 1);

      toast({
        title: "Success!",
        description: `Captions generated (${MAX_FREE_GENERATIONS - generationsUsed - 1} free generations left)`
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate captions",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copied!",
      description: "Captions copied to clipboard"
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            Social Media Caption Generator
          </CardTitle>
          <CardDescription>
            Create engaging captions for your posts
            <span className="block mt-1 text-xs">
              {MAX_FREE_GENERATIONS - generationsUsed} free generations remaining
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="captionPlatform">Platform</Label>
            <select
              id="captionPlatform"
              className="w-full px-3 py-2 border border-input bg-background rounded-md"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter/X</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="captionPrompt">Describe Your Post</Label>
            <Textarea
              id="captionPrompt"
              placeholder="What is your post about? E.g., 'A photo of my new product launch...'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || generationsUsed >= MAX_FREE_GENERATIONS}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Captions
              </>
            )}
          </Button>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> Try these examples:
            </p>
            <div className="space-y-2">
              {captionExamples.map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 text-xs"
                  onClick={() => setPrompt(example)}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Generated Captions
            {generatedContent && (
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedContent ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-4 rounded-lg">
                {generatedContent}
              </pre>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Your generated captions will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
