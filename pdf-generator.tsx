import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PDFGeneratorPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [isMarkdown, setIsMarkdown] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async () => {
    if (!title || !content) {
      toast({
        title: "Missing fields",
        description: "Please provide both title and content",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          isMarkdown,
          author: author || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const html = await response.text();
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      
      if (newWindow) {
        toast({
          title: "PDF ready!",
          description: "Click the print button in the new window to save as PDF",
        });
      } else {
        toast({
          title: "Pop-up blocked",
          description: "Please allow pop-ups to view the PDF",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exampleMarkdown = `# Sample Report

## Executive Summary

This is a sample PDF report generated using **PROFITHACK AI's PDF Generator**.

### Key Features

- ✅ Markdown support
- ✅ Professional styling
- ✅ Print-optimized
- ✅ Brand colors

## Data Table

| Metric | Value | Status |
|--------|-------|--------|
| Users | 1,000 | ✅ Growing |
| Revenue | $50K | 🚀 Up 200% |
| Videos | 5,000 | 💎 Viral |

## Conclusion

Use this tool to generate beautiful PDF reports for your business!`;

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
          PDF Generator
        </h1>
        <p className="text-muted-foreground">
          Create professional PDF reports from Markdown or HTML content
        </p>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generator">
            <FileText className="w-4 h-4 mr-2" />
            Generator
          </TabsTrigger>
          <TabsTrigger value="api">
            <Sparkles className="w-4 h-4 mr-2" />
            API Docs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate PDF</CardTitle>
              <CardDescription>
                Enter your content and generate a print-ready PDF document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Monthly Sales Report"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  data-testid="input-pdf-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author (optional)</Label>
                <Input
                  id="author"
                  placeholder="Your name or company"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  data-testid="input-pdf-author"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Content</Label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isMarkdown}
                        onChange={(e) => setIsMarkdown(e.target.checked)}
                        className="rounded"
                        data-testid="checkbox-markdown"
                      />
                      Markdown format
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setContent(exampleMarkdown)}
                      data-testid="button-load-example"
                    >
                      Load Example
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="content"
                  placeholder={isMarkdown ? "Enter markdown content..." : "Enter HTML content..."}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                  data-testid="textarea-pdf-content"
                />
              </div>

              <Button
                onClick={generatePDF}
                disabled={isGenerating}
                size="lg"
                className="w-full"
                data-testid="button-generate-pdf"
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PDF Generator API</CardTitle>
              <CardDescription>
                Use our API to generate PDFs programmatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">POST /api/pdf/generate</h3>
                <p className="text-sm text-muted-foreground">
                  Generate a PDF from text content
                </p>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Request Body:</p>
                  <pre className="text-xs overflow-x-auto">
{`{
  "title": "My Report",
  "content": "# Heading\\n\\nContent...",
  "isMarkdown": true,
  "author": "John Doe",
  "headerText": "Optional header",
  "footerText": "Optional footer"
}`}
                  </pre>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Response:</p>
                  <pre className="text-xs">
Returns HTML document ready for printing/saving as PDF
                  </pre>
                </div>
              </div>

              <hr />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">POST /api/pdf/generate-from-file</h3>
                <p className="text-sm text-muted-foreground">
                  Generate a PDF from an existing file
                </p>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-2">Request Body:</p>
                  <pre className="text-xs overflow-x-auto">
{`{
  "filePath": "SYSTEM_AUDIT_TIKTOK_COMPARISON.md",
  "title": "System Audit Report",
  "author": "PROFITHACK AI"
}`}
                  </pre>
                </div>
              </div>

              <hr />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Example Usage (JavaScript)</h3>
                
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
{`const response = await fetch('/api/pdf/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Monthly Report',
    content: '# Sales Data\\n\\nRevenue: $50K',
    isMarkdown: true,
    author: 'Sales Team'
  })
});

const html = await response.text();
// Open in new window for printing
window.open(URL.createObjectURL(
  new Blob([html], { type: 'text/html' })
));`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
