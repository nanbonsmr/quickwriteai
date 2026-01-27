import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PublicNavbar } from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Image, 
  Type, 
  QrCode, 
  Palette, 
  FileDown, 
  Copy, 
  Download,
  Upload,
  RefreshCw,
  Loader2,
  FileImage,
  Minimize2,
  Hash,
  ArrowRightLeft,
  Scissors,
  AlignLeft
} from 'lucide-react';

// Tool Components
const ImageCompressor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [quality, setQuality] = useState([80]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setOriginalSize(file.size);
      setCompressedUrl('');
    }
  };

  const compressImage = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setCompressedUrl(url);
              setCompressedSize(blob.size);
              setIsProcessing(false);
              toast({ title: "Success!", description: "Image compressed successfully" });
            }
          },
          'image/jpeg',
          quality[0] / 100
        );
      };
      
      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      setIsProcessing(false);
      toast({ title: "Error", description: "Failed to compress image", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Upload Image</Label>
        <Input type="file" accept="image/*" onChange={handleFileSelect} />
      </div>
      
      {selectedFile && (
        <>
          <div className="space-y-2">
            <Label>Quality: {quality[0]}%</Label>
            <Slider value={quality} onValueChange={setQuality} min={10} max={100} step={5} />
          </div>
          
          <Button onClick={compressImage} disabled={isProcessing} className="w-full">
            {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Compressing...</> : <><Minimize2 className="mr-2 h-4 w-4" /> Compress Image</>}
          </Button>
        </>
      )}
      
      {compressedUrl && (
        <div className="space-y-2 p-4 bg-muted rounded-lg">
          <p className="text-sm">Original: {(originalSize / 1024).toFixed(2)} KB</p>
          <p className="text-sm">Compressed: {(compressedSize / 1024).toFixed(2)} KB</p>
          <p className="text-sm text-green-600">Saved: {((1 - compressedSize / originalSize) * 100).toFixed(1)}%</p>
          <Button asChild className="w-full">
            <a href={compressedUrl} download="compressed-image.jpg"><Download className="mr-2 h-4 w-4" /> Download</a>
          </Button>
        </div>
      )}
    </div>
  );
};

const ImageConverter = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState('png');
  const [convertedUrl, setConvertedUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setConvertedUrl('');
    }
  };

  const convertImage = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const mimeType = outputFormat === 'jpg' ? 'image/jpeg' : `image/${outputFormat}`;
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setConvertedUrl(url);
              setIsProcessing(false);
              toast({ title: "Success!", description: `Image converted to ${outputFormat.toUpperCase()}` });
            }
          },
          mimeType,
          0.95
        );
      };
      
      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      setIsProcessing(false);
      toast({ title: "Error", description: "Failed to convert image", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Upload Image</Label>
        <Input type="file" accept="image/*" onChange={handleFileSelect} />
      </div>
      
      <div className="space-y-2">
        <Label>Output Format</Label>
        <Select value={outputFormat} onValueChange={setOutputFormat}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="jpg">JPG</SelectItem>
            <SelectItem value="webp">WebP</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button onClick={convertImage} disabled={!selectedFile || isProcessing} className="w-full">
        {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...</> : <><ArrowRightLeft className="mr-2 h-4 w-4" /> Convert Image</>}
      </Button>
      
      {convertedUrl && (
        <Button asChild className="w-full">
          <a href={convertedUrl} download={`converted-image.${outputFormat}`}><Download className="mr-2 h-4 w-4" /> Download {outputFormat.toUpperCase()}</a>
        </Button>
      )}
    </div>
  );
};

const TextCaseConverter = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const { toast } = useToast();

  const convert = (type: string) => {
    let result = '';
    switch (type) {
      case 'upper': result = inputText.toUpperCase(); break;
      case 'lower': result = inputText.toLowerCase(); break;
      case 'title': result = inputText.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()); break;
      case 'sentence': result = inputText.charAt(0).toUpperCase() + inputText.slice(1).toLowerCase(); break;
      case 'alternate': result = inputText.split('').map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join(''); break;
      case 'reverse': result = inputText.split('').reverse().join(''); break;
    }
    setOutputText(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    toast({ title: "Copied!", description: "Text copied to clipboard" });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Enter Text</Label>
        <Textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type or paste your text here..." rows={4} />
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" onClick={() => convert('upper')}>UPPERCASE</Button>
        <Button variant="outline" onClick={() => convert('lower')}>lowercase</Button>
        <Button variant="outline" onClick={() => convert('title')}>Title Case</Button>
        <Button variant="outline" onClick={() => convert('sentence')}>Sentence</Button>
        <Button variant="outline" onClick={() => convert('alternate')}>aLtErNaTe</Button>
        <Button variant="outline" onClick={() => convert('reverse')}>esreveR</Button>
      </div>
      
      {outputText && (
        <div className="space-y-2">
          <Label>Result</Label>
          <Textarea value={outputText} readOnly rows={4} />
          <Button onClick={copyToClipboard} className="w-full"><Copy className="mr-2 h-4 w-4" /> Copy Result</Button>
        </div>
      )}
    </div>
  );
};

const WordCounter = () => {
  const [text, setText] = useState('');
  
  const stats = {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    sentences: text.split(/[.!?]+/).filter(s => s.trim()).length,
    paragraphs: text.split(/\n\n+/).filter(p => p.trim()).length,
    readingTime: Math.ceil((text.trim() ? text.trim().split(/\s+/).length : 0) / 200)
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Enter Text</Label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste your text here..." rows={6} />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-2xl font-bold text-primary">{stats.words}</p>
          <p className="text-sm text-muted-foreground">Words</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-2xl font-bold text-primary">{stats.characters}</p>
          <p className="text-sm text-muted-foreground">Characters</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-2xl font-bold text-primary">{stats.charactersNoSpaces}</p>
          <p className="text-sm text-muted-foreground">No Spaces</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-2xl font-bold text-primary">{stats.sentences}</p>
          <p className="text-sm text-muted-foreground">Sentences</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-2xl font-bold text-primary">{stats.paragraphs}</p>
          <p className="text-sm text-muted-foreground">Paragraphs</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-2xl font-bold text-primary">{stats.readingTime}</p>
          <p className="text-sm text-muted-foreground">Min Read</p>
        </div>
      </div>
    </div>
  );
};

const QRCodeGenerator = () => {
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const { toast } = useToast();

  const generateQR = () => {
    if (!text.trim()) {
      toast({ title: "Error", description: "Please enter text or URL", variant: "destructive" });
      return;
    }
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    setQrUrl(url);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Text or URL</Label>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text or URL to encode..." />
      </div>
      
      <Button onClick={generateQR} className="w-full"><QrCode className="mr-2 h-4 w-4" /> Generate QR Code</Button>
      
      {qrUrl && (
        <div className="flex flex-col items-center gap-4">
          <img src={qrUrl} alt="QR Code" className="border rounded-lg" />
          <Button asChild><a href={qrUrl} download="qr-code.png"><Download className="mr-2 h-4 w-4" /> Download QR Code</a></Button>
        </div>
      )}
    </div>
  );
};

const ColorConverter = () => {
  const [hexColor, setHexColor] = useState('#3b82f6');
  const { toast } = useToast();

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  };

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    let { r, g, b } = rgb;
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgb = hexToRgb(hexColor);
  const hsl = hexToHsl(hexColor);

  const copyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: "Copied!", description: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Pick a Color</Label>
        <div className="flex gap-2">
          <Input type="color" value={hexColor} onChange={(e) => setHexColor(e.target.value)} className="w-16 h-10 p-1 cursor-pointer" />
          <Input value={hexColor} onChange={(e) => setHexColor(e.target.value)} placeholder="#000000" />
        </div>
      </div>
      
      <div className="h-24 rounded-lg border" style={{ backgroundColor: hexColor }} />
      
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="font-mono">{hexColor.toUpperCase()}</span>
          <Button variant="ghost" size="sm" onClick={() => copyValue(hexColor.toUpperCase())}><Copy className="h-4 w-4" /></Button>
        </div>
        {rgb && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-mono">rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
            <Button variant="ghost" size="sm" onClick={() => copyValue(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}><Copy className="h-4 w-4" /></Button>
          </div>
        )}
        {hsl && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-mono">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</span>
            <Button variant="ghost" size="sm" onClick={() => copyValue(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}><Copy className="h-4 w-4" /></Button>
          </div>
        )}
      </div>
    </div>
  );
};

const LoremGenerator = () => {
  const [paragraphs, setParagraphs] = useState('3');
  const [output, setOutput] = useState('');
  const { toast } = useToast();

  const loremWords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];

  const generateLorem = () => {
    const count = parseInt(paragraphs) || 3;
    const result = [];
    
    for (let p = 0; p < count; p++) {
      const sentenceCount = Math.floor(Math.random() * 4) + 4;
      const sentences = [];
      
      for (let s = 0; s < sentenceCount; s++) {
        const wordCount = Math.floor(Math.random() * 10) + 8;
        const words = [];
        for (let w = 0; w < wordCount; w++) {
          words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
        }
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        sentences.push(words.join(' ') + '.');
      }
      result.push(sentences.join(' '));
    }
    
    setOutput(result.join('\n\n'));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!", description: "Lorem ipsum copied to clipboard" });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Number of Paragraphs</Label>
        <Input type="number" min="1" max="20" value={paragraphs} onChange={(e) => setParagraphs(e.target.value)} />
      </div>
      
      <Button onClick={generateLorem} className="w-full"><AlignLeft className="mr-2 h-4 w-4" /> Generate Lorem Ipsum</Button>
      
      {output && (
        <div className="space-y-2">
          <Textarea value={output} readOnly rows={8} />
          <Button onClick={copyToClipboard} className="w-full"><Copy className="mr-2 h-4 w-4" /> Copy Text</Button>
        </div>
      )}
    </div>
  );
};

const tools = [
  { id: 'image-compress', name: 'Image Compressor', description: 'Reduce image file size while maintaining quality', icon: Minimize2, color: 'text-blue-500', component: ImageCompressor },
  { id: 'image-convert', name: 'Image Converter', description: 'Convert images between PNG, JPG, and WebP formats', icon: FileImage, color: 'text-green-500', component: ImageConverter },
  { id: 'text-case', name: 'Text Case Converter', description: 'Convert text to uppercase, lowercase, title case, and more', icon: Type, color: 'text-purple-500', component: TextCaseConverter },
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, sentences, and reading time', icon: Hash, color: 'text-orange-500', component: WordCounter },
  { id: 'qr-generator', name: 'QR Code Generator', description: 'Generate QR codes from text or URLs', icon: QrCode, color: 'text-pink-500', component: QRCodeGenerator },
  { id: 'color-converter', name: 'Color Converter', description: 'Convert colors between HEX, RGB, and HSL', icon: Palette, color: 'text-cyan-500', component: ColorConverter },
  { id: 'lorem-generator', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text for your designs', icon: AlignLeft, color: 'text-yellow-500', component: LoremGenerator },
];

export default function Tools() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const ActiveToolComponent = activeTool ? tools.find(t => t.id === activeTool)?.component : null;

  return (
    <>
      <Helmet>
        <title>Free Online Tools - Image Compressor, QR Generator, Text Tools | PeakDraft</title>
        <meta name="description" content="Free online tools for image compression, format conversion, QR code generation, text case conversion, word counting, and more. No signup required." />
        <meta name="keywords" content="image compressor, qr code generator, text tools, color converter, word counter, lorem ipsum generator, free online tools" />
        <link rel="canonical" href="https://peakdraft.lovable.app/tools" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <PublicNavbar />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Free Online Tools</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful utilities for images, text, and more. No signup required, works entirely in your browser.
              </p>
            </div>
          </section>

          {/* Tools Section */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              {!activeTool ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tools.map((tool) => (
                    <Card 
                      key={tool.id} 
                      className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary/50"
                      onClick={() => setActiveTool(tool.id)}
                    >
                      <CardHeader>
                        <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2`}>
                          <tool.icon className={`h-6 w-6 ${tool.color}`} />
                        </div>
                        <CardTitle>{tool.name}</CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <Button variant="ghost" onClick={() => setActiveTool(null)} className="mb-6">
                    ← Back to all tools
                  </Button>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {(() => {
                          const tool = tools.find(t => t.id === activeTool);
                          if (tool) {
                            const IconComponent = tool.icon;
                            return <IconComponent className={`h-6 w-6 ${tool.color}`} />;
                          }
                          return null;
                        })()}
                        {tools.find(t => t.id === activeTool)?.name}
                      </CardTitle>
                      <CardDescription>
                        {tools.find(t => t.id === activeTool)?.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {ActiveToolComponent && <ActiveToolComponent />}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </section>
        </main>

        <PublicFooter />
      </div>
    </>
  );
}
