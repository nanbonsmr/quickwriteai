import { useState } from 'react';
import { PublicNavbar } from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Bot, Hash, Sparkles, Lightbulb, ArrowRight, FileText, MessageSquare, Mail, ChevronDown, ShoppingBag, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const tools = [
  {
    id: 'chatgpt',
    title: 'ChatGPT Prompt Generator',
    description: 'Create effective prompts for ChatGPT and AI assistants',
    icon: Bot,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 'hashtag',
    title: 'Hashtag Generator',
    description: 'Generate trending hashtags for social media posts',
    icon: Hash,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    id: 'blogintro',
    title: 'Blog Intro Generator',
    description: 'Create engaging blog introductions that hook readers',
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'caption',
    title: 'Social Media Caption Generator',
    description: 'Create engaging captions for your social media posts',
    icon: MessageSquare,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 'email',
    title: 'Email Subject Line Generator',
    description: 'Write compelling email subject lines that get opened',
    icon: Mail,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    id: 'product',
    title: 'Product Description Generator',
    description: 'Create persuasive product descriptions that sell',
    icon: ShoppingBag,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'seo',
    title: 'SEO Meta Description Generator',
    description: 'Write optimized meta descriptions for better search rankings',
    icon: Search,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
];

export default function FreeTools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1 py-12 px-4 pt-24">
        <div className="container max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4">100% Free • No Sign Up Required</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Free AI Tools
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Try our powerful AI generators without signing up. Generate content instantly!
            </p>
          </motion.div>

          {/* Tools Grid */}
          <div className="grid gap-6">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              const isActive = activeTool === tool.id;
              
              return (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card 
                    className={`transition-all duration-300 overflow-hidden ${isActive ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md hover:-translate-y-1'}`}
                  >
                    <CardHeader 
                      className="cursor-pointer select-none"
                      onClick={() => setActiveTool(isActive ? null : tool.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <motion.div 
                            className={`p-3 rounded-xl ${tool.bgColor}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Icon className={`w-6 h-6 ${tool.color}`} />
                          </motion.div>
                          <div>
                            <CardTitle className="text-xl">{tool.title}</CardTitle>
                            <CardDescription className="mt-1">{tool.description}</CardDescription>
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: isActive ? 180 : 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <Button variant="ghost" size="icon" className="pointer-events-none">
                            <ChevronDown className="w-5 h-5" />
                          </Button>
                        </motion.div>
                      </div>
                    </CardHeader>
                    
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <CardContent className="pt-0 border-t">
                            <motion.div 
                              className="pt-6"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            >
                              {tool.id === 'chatgpt' && <FreeChatGPTPromptGenerator />}
                              {tool.id === 'hashtag' && <FreeHashtagGenerator />}
                              {tool.id === 'blogintro' && <FreeBlogIntroGenerator />}
                              {tool.id === 'caption' && <FreeCaptionGenerator />}
                              {tool.id === 'email' && <FreeEmailSubjectGenerator />}
                              {tool.id === 'product' && <FreeProductDescriptionGenerator />}
                              {tool.id === 'seo' && <FreeSeoMetaGenerator />}
                            </motion.div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </div>

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

const emailSubjectExamples = [
  "A promotional email for a Black Friday sale",
  "A welcome email for new newsletter subscribers",
  "An abandoned cart reminder email for an e-commerce store",
];

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
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {MAX_FREE_GENERATIONS - generationsUsed} free generations remaining
          </p>
        </div>
        
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
      </div>

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
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
            <pre className="whitespace-pre-wrap font-sans text-sm bg-background p-4 rounded-lg border max-h-[400px] overflow-auto">
              {generatedContent}
            </pre>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">Your generated prompt will appear here</p>
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
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {MAX_FREE_GENERATIONS - generationsUsed} free generations remaining
          </p>
        </div>

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
      </div>

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
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
            <pre className="whitespace-pre-wrap font-sans text-sm bg-background p-4 rounded-lg border max-h-[400px] overflow-auto">
              {generatedContent}
            </pre>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Hash className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">Your generated hashtags will appear here</p>
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
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {MAX_FREE_GENERATIONS - generationsUsed} free generations remaining
          </p>
        </div>

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
      </div>

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
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
            <pre className="whitespace-pre-wrap font-sans text-sm bg-background p-4 rounded-lg border max-h-[400px] overflow-auto">
              {generatedContent}
            </pre>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">Your generated blog intro will appear here</p>
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
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {MAX_FREE_GENERATIONS - generationsUsed} free generations remaining
          </p>
        </div>

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
      </div>

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
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
            <pre className="whitespace-pre-wrap font-sans text-sm bg-background p-4 rounded-lg border max-h-[400px] overflow-auto">
              {generatedContent}
            </pre>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">Your generated captions will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FreeEmailSubjectGenerator() {
  const [prompt, setPrompt] = useState('');
  const [emailType, setEmailType] = useState('promotional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const { toast } = useToast();

  const MAX_FREE_GENERATIONS = 3;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe your email",
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
      const enhancedPrompt = `Generate 10 compelling email subject lines for: "${prompt}". Email type: ${emailType}. Make them attention-grabbing, create urgency where appropriate, and keep them under 60 characters. Include a mix of styles: question-based, benefit-focused, curiosity-driven, and urgency-based.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          prompt: enhancedPrompt,
          template_type: 'email',
          language: 'en'
        }
      });

      if (error) throw error;

      setGeneratedContent(data.generated_content);
      setGenerationsUsed(prev => prev + 1);

      toast({
        title: "Success!",
        description: `Subject lines generated (${MAX_FREE_GENERATIONS - generationsUsed - 1} free generations left)`
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate subject lines",
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
      description: "Subject lines copied to clipboard"
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {MAX_FREE_GENERATIONS - generationsUsed} free generations remaining
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailType">Email Type</Label>
          <select
            id="emailType"
            className="w-full px-3 py-2 border border-input bg-background rounded-md"
            value={emailType}
            onChange={(e) => setEmailType(e.target.value)}
          >
            <option value="promotional">Promotional/Sales</option>
            <option value="newsletter">Newsletter</option>
            <option value="welcome">Welcome Email</option>
            <option value="followup">Follow-up</option>
            <option value="abandoned-cart">Abandoned Cart</option>
            <option value="announcement">Announcement</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emailPrompt">Describe Your Email</Label>
          <Textarea
            id="emailPrompt"
            placeholder="What is your email about? E.g., 'A 50% off summer sale for our clothing store...'"
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
              Generate Subject Lines
            </>
          )}
        </Button>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> Try these examples:
          </p>
          <div className="space-y-2">
            {emailSubjectExamples.map((example, index) => (
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
      </div>

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            Generated Subject Lines
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
            <pre className="whitespace-pre-wrap font-sans text-sm bg-background p-4 rounded-lg border max-h-[400px] overflow-auto">
              {generatedContent}
            </pre>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">Your generated subject lines will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const productExamples = [
  "A wireless noise-cancelling headphone for music lovers",
  "An organic skincare serum for anti-aging",
  "A smart fitness tracker watch with heart rate monitoring",
];

function FreeProductDescriptionGenerator() {
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
        description: "Please describe your product",
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
      const enhancedPrompt = `Write a compelling product description for: "${prompt}". Tone: ${tone}. Include key features, benefits, and a persuasive call-to-action. Make it engaging and SEO-friendly. Structure it with a headline, main description, and bullet points for features.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          prompt: enhancedPrompt,
          template_type: 'product-description',
          language: 'en'
        }
      });

      if (error) throw error;

      setGeneratedContent(data.generated_content);
      setGenerationsUsed(prev => prev + 1);

      toast({
        title: "Success!",
        description: `Product description generated (${MAX_FREE_GENERATIONS - generationsUsed - 1} free generations left)`
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate product description",
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
      description: "Product description copied to clipboard"
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {MAX_FREE_GENERATIONS - generationsUsed} free generations remaining
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="productTone">Tone</Label>
          <select
            id="productTone"
            className="w-full px-3 py-2 border border-input bg-background rounded-md"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option value="professional">Professional</option>
            <option value="luxury">Luxury & Premium</option>
            <option value="casual">Casual & Friendly</option>
            <option value="technical">Technical & Detailed</option>
            <option value="playful">Playful & Fun</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="productPrompt">Describe Your Product</Label>
          <Textarea
            id="productPrompt"
            placeholder="Describe your product, its features, target audience, and key benefits..."
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
              Generate Description
            </>
          )}
        </Button>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> Try these examples:
          </p>
          <div className="space-y-2">
            {productExamples.map((example, index) => (
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
      </div>

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            Generated Description
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
            <pre className="whitespace-pre-wrap font-sans text-sm bg-background p-4 rounded-lg border max-h-[400px] overflow-auto">
              {generatedContent}
            </pre>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">Your generated product description will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const seoExamples = [
  "A blog post about 10 best productivity apps for remote workers",
  "An e-commerce page selling organic coffee beans",
  "A landing page for a SaaS project management tool",
];

function FreeSeoMetaGenerator() {
  const [prompt, setPrompt] = useState('');
  const [keyword, setKeyword] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationsUsed, setGenerationsUsed] = useState(0);
  const { toast } = useToast();

  const MAX_FREE_GENERATIONS = 3;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe your page content",
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
      const enhancedPrompt = `Generate 5 SEO-optimized meta descriptions for: "${prompt}". ${keyword ? `Target keyword: ${keyword}.` : ''} Each description should be between 150-160 characters, include a call-to-action, and be compelling for search users. Format each with a character count.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { 
          prompt: enhancedPrompt,
          template_type: 'seo-meta',
          language: 'en'
        }
      });

      if (error) throw error;

      setGeneratedContent(data.generated_content);
      setGenerationsUsed(prev => prev + 1);

      toast({
        title: "Success!",
        description: `Meta descriptions generated (${MAX_FREE_GENERATIONS - generationsUsed - 1} free generations left)`
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate meta descriptions",
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
      description: "Meta descriptions copied to clipboard"
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {MAX_FREE_GENERATIONS - generationsUsed} free generations remaining
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seoKeyword">Target Keyword (optional)</Label>
          <Input
            id="seoKeyword"
            placeholder="e.g., best productivity apps, organic coffee"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seoPrompt">Page Content Description</Label>
          <Textarea
            id="seoPrompt"
            placeholder="Describe what your page is about, its main purpose, and target audience..."
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
              Generate Meta Descriptions
            </>
          )}
        </Button>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> Try these examples:
          </p>
          <div className="space-y-2">
            {seoExamples.map((example, index) => (
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
      </div>

      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            Generated Meta Descriptions
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
            <pre className="whitespace-pre-wrap font-sans text-sm bg-background p-4 rounded-lg border max-h-[400px] overflow-auto">
              {generatedContent}
            </pre>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">Your generated meta descriptions will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
