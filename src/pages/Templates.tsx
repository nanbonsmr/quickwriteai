import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  PenTool, 
  MessageSquare, 
  Mail, 
  Megaphone,
  ArrowRight,
  Sparkles,
  Clock,
  Users
} from 'lucide-react';

const templates = [
  {
    id: 'blog',
    title: 'Blog Posts',
    description: 'Create engaging blog content, articles, and web copy',
    icon: PenTool,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    features: ['SEO Optimized', 'Multiple Tones', 'Custom Length'],
    usageCount: '2.1k uses'
  },
  {
    id: 'social',
    title: 'Social Media',
    description: 'Generate captivating social media posts and captions',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    features: ['Platform Specific', 'Hashtag Ready', 'Engaging CTAs'],
    usageCount: '1.8k uses'
  },
  {
    id: 'email',
    title: 'Email Writer',
    description: 'Craft professional emails, newsletters, and campaigns',
    icon: Mail,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    features: ['Subject Lines', 'Personalized', 'Call-to-Actions'],
    usageCount: '1.5k uses'
  },
  {
    id: 'ads',
    title: 'Ad Copy',
    description: 'Create compelling advertisements and marketing copy',
    icon: Megaphone,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    features: ['High Converting', 'A/B Test Ready', 'Platform Optimized'],
    usageCount: '950 uses'
  }
];

export default function Templates() {
  const location = useLocation();
  const currentTemplate = location.pathname.split('/')[2];

  if (currentTemplate && currentTemplate !== 'templates') {
    const template = templates.find(t => t.id === currentTemplate);
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {template && <template.icon className={`w-6 h-6 ${template.color}`} />}
            {template?.title || 'Template'} Generator
          </h2>
          <p className="text-muted-foreground">
            {template?.description || 'Generate content using AI'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon!</CardTitle>
            <CardDescription>
              Individual template generators are currently in development. 
              For now, you can use all templates from the main dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/">
                <ArrowRight className="w-4 h-4 mr-2" />
                Go to Dashboard
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Content Templates</h2>
        <p className="text-muted-foreground">
          Choose from our collection of AI-powered content generation templates.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="group hover:shadow-elegant transition-all duration-200 cursor-pointer">
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 ${template.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                <template.icon className={`w-6 h-6 ${template.color}`} />
              </div>
              <CardTitle className="text-lg">{template.title}</CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span className="font-medium">{template.usageCount}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full group-hover:shadow-sm" asChild>
                <a href={`/templates/${template.id}`}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Use Template
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popular Templates Section */}
      <Card className="bg-gradient-subtle border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Most Popular This Week
          </CardTitle>
          <CardDescription>
            Templates that are trending among content creators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.slice(0, 2).map((template, index) => (
              <div key={template.id} className="flex items-center gap-4 p-4 bg-background rounded-lg">
                <div className={`w-10 h-10 ${template.bgColor} rounded-lg flex items-center justify-center`}>
                  <template.icon className={`w-5 h-5 ${template.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{template.title}</h4>
                  <p className="text-sm text-muted-foreground">{template.usageCount}</p>
                </div>
                <Badge variant={index === 0 ? 'default' : 'secondary'}>
                  #{index + 1}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}