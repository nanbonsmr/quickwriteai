import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Sparkles, 
  Download, 
  CreditCard, 
  Lightbulb, 
  RefreshCw, 
  BarChart3,
  PieChart,
  LineChart,
  CheckSquare,
  Table,
  FileText,
  Wand2,
  Eye,
  Plus,
  Trash2
} from 'lucide-react';
import { 
  saveExcel, 
  parseUserData, 
  detectSheetType, 
  getChartColors,
  type ExcelData,
  type SheetData
} from '@/lib/excelUtils';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const excelExamples = [
  {
    title: "Sales Report",
    data: `Product,Q1 Sales,Q2 Sales,Q3 Sales,Q4 Sales
Laptops,45000,52000,48000,61000
Phones,38000,41000,39000,45000
Tablets,22000,25000,28000,32000
Accessories,15000,18000,21000,24000
Software,32000,35000,38000,42000`
  },
  {
    title: "Project Tasks",
    data: `Task,Status,Priority,Assignee,Due Date
Website Redesign,In Progress,High,John Smith,2024-02-15
Mobile App Update,Pending,Medium,Sarah Johnson,2024-02-20
Database Migration,Completed,Critical,Mike Brown,2024-01-30
API Integration,In Progress,High,Emma Wilson,2024-02-10
Documentation,Pending,Low,Chris Davis,2024-02-28`
  },
  {
    title: "Budget Tracker",
    data: `Category,Budget,Actual,Variance
Marketing,50000,48500,1500
Operations,120000,118000,2000
Salaries,200000,200000,0
Equipment,35000,38000,-3000
Travel,25000,22000,3000
Training,15000,12000,3000`
  },
  {
    title: "Employee Directory",
    data: `Name,Department,Position,Salary,Start Date
John Smith,Engineering,Senior Developer,95000,2021-03-15
Sarah Johnson,Marketing,Marketing Manager,78000,2020-06-01
Mike Brown,Operations,Operations Lead,72000,2019-11-20
Emma Wilson,Design,UI/UX Designer,68000,2022-01-10
Chris Davis,Sales,Sales Representative,55000,2023-02-28`
  }
];

const chartTypes = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: LineChart },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'doughnut', label: 'Doughnut Chart', icon: PieChart },
];

export default function ExcelGenerator() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const chartRef = useRef<HTMLCanvasElement>(null);
  
  const [rawData, setRawData] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [fileName, setFileName] = useState('my-excel');
  const [includeChart, setIncludeChart] = useState(true);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie' | 'doughnut'>('bar');
  const [isGenerating, setIsGenerating] = useState(false);
  const [parsedData, setParsedData] = useState<{ headers: string[]; rows: (string | number | boolean)[][] } | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('paste');
  
  // Parse data when raw data changes
  useEffect(() => {
    if (rawData.trim()) {
      const parsed = parseUserData(rawData);
      setParsedData(parsed);
    } else {
      setParsedData(null);
    }
  }, [rawData]);

  // Get chart data
  const getChartData = useCallback(() => {
    if (!parsedData || parsedData.rows.length === 0) return null;
    
    const labels = parsedData.rows.map(row => String(row[0]));
    const numericColumns = parsedData.headers.slice(1).map((header, idx) => ({
      label: header,
      data: parsedData.rows.map(row => {
        const val = row[idx + 1];
        return typeof val === 'number' ? val : parseFloat(String(val).replace(/[$,]/g, '')) || 0;
      })
    })).filter(col => col.data.some(v => v !== 0));

    if (numericColumns.length === 0) return null;

    const colors = getChartColors(chartType === 'pie' || chartType === 'doughnut' ? labels.length : numericColumns.length);

    if (chartType === 'pie' || chartType === 'doughnut') {
      // For pie/doughnut, use first numeric column
      return {
        labels,
        datasets: [{
          data: numericColumns[0].data,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.8', '1')),
          borderWidth: 2
        }]
      };
    }

    return {
      labels,
      datasets: numericColumns.map((col, idx) => ({
        label: col.label,
        data: col.data,
        backgroundColor: colors[idx],
        borderColor: colors[idx].replace('0.8', '1'),
        borderWidth: 2,
        fill: chartType === 'line' ? false : undefined,
        tension: chartType === 'line' ? 0.3 : undefined
      }))
    };
  }, [parsedData, chartType]);

  const chartData = getChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#6B7280',
          font: { size: 12 }
        }
      },
      title: {
        display: true,
        text: sheetName,
        color: '#1F2937',
        font: { size: 16, weight: 'bold' as const }
      }
    },
    scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
      x: {
        ticks: { color: '#6B7280' },
        grid: { color: 'rgba(107, 114, 128, 0.1)' }
      },
      y: {
        ticks: { color: '#6B7280' },
        grid: { color: 'rgba(107, 114, 128, 0.1)' }
      }
    } : undefined
  };

  // Generate Excel with AI assistance
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please describe what kind of Excel data you want to generate.",
        variant: "destructive"
      });
      return;
    }

    if (!profile) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate content.",
        variant: "destructive"
      });
      return;
    }

    if (profile.words_used >= profile.words_limit) {
      toast({
        title: "Word limit reached",
        description: "Please upgrade your plan to generate more content.",
        variant: "destructive",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/pricing')}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        )
      });
      return;
    }

    setIsAiGenerating(true);

    try {
      const enhancedPrompt = `Generate realistic sample data for an Excel spreadsheet based on this request: "${aiPrompt}"

IMPORTANT: Return ONLY a CSV-formatted table with NO explanation. Use these rules:
1. First row must be headers
2. Use comma as delimiter
3. Include 5-10 realistic data rows
4. For numbers: use realistic values (sales might be 10000-100000, percentages 0-100)
5. For dates: use format YYYY-MM-DD
6. For status fields: use values like "Completed", "In Progress", "Pending", "High", "Medium", "Low"
7. Make the data look realistic and professional

Example format:
Product,Q1 Sales,Q2 Sales,Status
Widget A,45000,52000,Active
Widget B,38000,41000,Active

Return ONLY the CSV data, nothing else.`;

      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          template_type: 'excel_data',
          prompt: enhancedPrompt,
          language: 'en'
        }
      });

      if (error) throw error;

      const generatedContent = data.generated_content;
      
      // Clean up the response - remove any markdown code blocks
      let cleanedData = generatedContent
        .replace(/```csv\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      setRawData(cleanedData);
      setActiveTab('paste');
      
      // Extract filename from prompt
      const words = aiPrompt.toLowerCase().split(' ');
      const keyWords = words.filter(w => w.length > 3 && !['want', 'need', 'create', 'make', 'generate', 'with', 'for'].includes(w));
      if (keyWords.length > 0) {
        setFileName(keyWords.slice(0, 2).join('-').replace(/[^a-z0-9-]/g, ''));
      }

      // Update word usage
      const wordCount = data.word_count || cleanedData.split(/\s+/).length;
      await supabase.rpc('update_word_usage', {
        user_uuid: profile.user_id,
        words_to_add: wordCount
      });

      await refreshProfile();
      
      toast({
        title: "Data generated!",
        description: "AI has created sample data. Review and export to Excel."
      });

    } catch (error: any) {
      console.error('AI generation error:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate data with AI.",
        variant: "destructive"
      });
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Export to Excel
  const handleExport = async () => {
    if (!parsedData || parsedData.headers.length === 0) {
      toast({
        title: "No data",
        description: "Please add some data first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const sheetType = detectSheetType(parsedData.headers);
      
      const excelData: ExcelData = {
        title: fileName,
        sheets: [{
          name: sheetName,
          type: sheetType,
          headers: parsedData.headers,
          rows: parsedData.rows,
          styling: {
            alternateRowColors: true,
            freezeTopRow: true,
            autoFilter: true
          }
        }]
      };

      await saveExcel(excelData, fileName);

      toast({
        title: "Excel exported!",
        description: `${fileName}.xlsx has been downloaded.`
      });

    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: error.message || "Failed to export Excel file.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const loadExample = (example: typeof excelExamples[0]) => {
    setRawData(example.data);
    setSheetName(example.title);
    setFileName(example.title.toLowerCase().replace(/\s+/g, '-'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          Excel Generator
        </h2>
        <p className="text-muted-foreground">
          Create professional Excel spreadsheets with charts, formatting, and formulas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Data Input
              </CardTitle>
              <CardDescription>
                Paste your data or let AI generate sample data for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="paste" className="flex items-center gap-2">
                    <Table className="w-4 h-4" />
                    Paste Data
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    AI Generate
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="paste" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data (CSV, Tab-separated, or Pipe-separated)</Label>
                    <Textarea
                      placeholder="Paste your data here...
Example:
Name,Sales,Revenue
Product A,150,4500
Product B,200,6000"
                      value={rawData}
                      onChange={(e) => setRawData(e.target.value)}
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Describe what data you need</Label>
                    <Textarea
                      placeholder="E.g., A sales report for Q1 2024 with product names, quantities sold, and revenue..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button 
                    onClick={handleAiGenerate} 
                    disabled={isAiGenerating || !aiPrompt.trim()}
                    className="w-full"
                  >
                    {isAiGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating Data...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fileName">File Name</Label>
                  <Input
                    id="fileName"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="my-excel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sheetName">Sheet Name</Label>
                  <Input
                    id="sheetName"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="Sheet1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Chart Preview</Label>
                  <p className="text-xs text-muted-foreground">Show chart visualization</p>
                </div>
                <Switch checked={includeChart} onCheckedChange={setIncludeChart} />
              </div>

              {includeChart && (
                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <Select value={chartType} onValueChange={(v) => setChartType(v as typeof chartType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {chartTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button 
                onClick={handleExport} 
                disabled={isGenerating || !parsedData}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export to Excel
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          {/* Data Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Data Preview
              </CardTitle>
              <CardDescription>
                {parsedData ? `${parsedData.headers.length} columns, ${parsedData.rows.length} rows` : 'No data loaded'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parsedData && parsedData.headers.length > 0 ? (
                <div className="overflow-auto max-h-64 rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-primary text-primary-foreground sticky top-0">
                      <tr>
                        {parsedData.headers.map((header, idx) => (
                          <th key={idx} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.rows.slice(0, 10).map((row, rowIdx) => (
                        <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-muted/30' : ''}>
                          {row.map((cell, cellIdx) => (
                            <td key={cellIdx} className="px-3 py-2 whitespace-nowrap">
                              {typeof cell === 'boolean' ? (
                                cell ? <Badge variant="default" className="bg-green-500">✓</Badge> : <Badge variant="secondary">○</Badge>
                              ) : (
                                <span className={
                                  String(cell).toLowerCase() === 'high' || String(cell).toLowerCase() === 'critical' ? 'text-red-500 font-medium' :
                                  String(cell).toLowerCase() === 'completed' || String(cell).toLowerCase() === 'done' ? 'text-green-500 font-medium' :
                                  String(cell).toLowerCase() === 'pending' || String(cell).toLowerCase() === 'in progress' ? 'text-yellow-500 font-medium' :
                                  ''
                                }>
                                  {typeof cell === 'number' && parsedData.headers[cellIdx]?.toLowerCase().includes('sal') 
                                    ? `$${cell.toLocaleString()}`
                                    : String(cell)
                                  }
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.rows.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center py-2 border-t">
                      Showing 10 of {parsedData.rows.length} rows
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Table className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Paste data or use AI to generate sample data
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart Preview */}
          {includeChart && chartData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Chart Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {chartType === 'bar' && <Bar data={chartData} options={chartOptions} />}
                  {chartType === 'line' && <Line data={chartData} options={chartOptions} />}
                  {chartType === 'pie' && <Pie data={chartData} options={chartOptions} />}
                  {chartType === 'doughnut' && <Doughnut data={chartData} options={chartOptions} />}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Quick Start Examples
          </CardTitle>
          <CardDescription>
            Click on any example to load it instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {excelExamples.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-4 flex flex-col items-start gap-1"
                onClick={() => loadExample(example)}
              >
                <span className="font-medium">{example.title}</span>
                <span className="text-xs text-muted-foreground">
                  {example.data.split('\n').length - 1} rows
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
