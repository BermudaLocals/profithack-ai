import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, Sparkles, TrendingUp, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ViralTemplate } from "@shared/schema";

export function ViralContentGenerator() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<ViralTemplate | null>(null);
  const [currentEvent, setCurrentEvent] = useState("");
  const [generatedHook, setGeneratedHook] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: templates } = useQuery<ViralTemplate[]>({
    queryKey: ["/api/viral/templates"],
  });

  const generateHook = () => {
    if (!selectedTemplate || !currentEvent) {
      toast({
        title: "Missing Info",
        description: "Select a template and enter a topic",
        variant: "destructive",
      });
      return;
    }

    // Generate hook using template format
    const hook = selectedTemplate.hookFormat
      .replace('[Show]', 'The Simpsons')
      .replace('[Current Event]', currentEvent)
      .replace('[person]', 'GF')
      .replace('[shocking thing]', currentEvent)
      .replace('[Thing 1]', currentEvent.split('vs')[0]?.trim() || 'Option 1')
      .replace('[Thing 2]', currentEvent.split('vs')[1]?.trim() || 'Option 2')
      .replace('[controversial action]', currentEvent)
      .replace('[dark truth]', currentEvent)
      .replace('[innocent thing]', 'your favorite show');

    setGeneratedHook(hook);
    
    toast({
      title: "Hook Generated! 🎣",
      description: "Your viral hook is ready to use",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedHook);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Copied!",
      description: "Hook copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Viral Content Generator
          </CardTitle>
          <CardDescription>
            Use proven viral formats to manufacture content that goes viral
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Select Viral Template</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates?.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover-elevate ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary bg-primary/5'
                      : ''
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                  data-testid={`template-${template.id}`}
                >
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {template.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        ~{template.optimalLength}s
                      </Badge>
                      {template.avgViralScore && parseFloat(template.avgViralScore.toString()) > 0 && (
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {template.avgViralScore}% viral
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {selectedTemplate && (
            <>
              {/* Input Field */}
              <div className="space-y-2">
                <Label htmlFor="topic">
                  {selectedTemplate.category === 'predictions' && 'Current Event/Topic'}
                  {selectedTemplate.category === 'text_stories' && 'Shocking Thing That Happened'}
                  {selectedTemplate.category === 'debates' && 'Thing 1 vs Thing 2'}
                  {selectedTemplate.category === 'reddit_stories' && 'Controversial Action'}
                </Label>
                <Input
                  id="topic"
                  placeholder={
                    selectedTemplate.category === 'predictions'
                      ? 'e.g., AI taking over jobs, Trump 2025, World War 3'
                      : selectedTemplate.category === 'text_stories'
                      ? 'e.g., cheating, lying about money, secret family'
                      : selectedTemplate.category === 'debates'
                      ? 'e.g., Family Guy vs South Park'
                      : 'e.g., refusing to pay for my sister\'s wedding'
                  }
                  value={currentEvent}
                  onChange={(e) => setCurrentEvent(e.target.value)}
                  data-testid="input-topic"
                />
              </div>

              {/* Generate Button */}
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={generateHook}
                data-testid="button-generate-hook"
              >
                <Rocket className="h-4 w-4" />
                Generate Viral Hook
              </Button>

              {/* Generated Hook Display */}
              {generatedHook && (
                <Card className="border-primary bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      Your Viral Hook 🎣
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyToClipboard}
                        data-testid="button-copy-hook"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold" data-testid="text-generated-hook">
                      {generatedHook}
                    </p>
                    
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground font-semibold">
                        Recommended Hashtags:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.hashtagSuggestions?.map((tag, i) => (
                          <Badge key={i} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground font-semibold">
                        Target Keywords:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.targetKeywords?.map((keyword, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        💡 <strong>Pro Tip:</strong> Use this hook as your video title AND the first 3 seconds of text on screen. 
                        Keep it under {selectedTemplate.optimalLength} seconds for maximum retention.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Template Strategy Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Why This Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTemplate.requiredElements?.map((element, i) => (
                      <Badge key={i} variant="outline" className="justify-start">
                        ✓ {element.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    <strong>Visual Style:</strong> {selectedTemplate.visualStyle?.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Optimal Length:</strong> {selectedTemplate.optimalLength} seconds
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
