import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Zap, Coins } from 'lucide-react';

export default function AdScriptGeneratorPage() {
  const [productDescription, setProductDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [platform, setPlatform] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!productDescription || !targetAudience || !platform) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // In a real app, you'd make an API call to your backend
      // const response = await fetch('/api/tools/generate-ad-script', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ productDescription, targetAudience, platform }),
      // });
      // const data = await response.json();
      // if (response.ok) {
      //   setGeneratedScript(data.script);
      // } else {
      //   setError(data.error || 'Something went wrong.');
      // }

      // Placeholder API call for now
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      setGeneratedScript(`(Sample script for ${platform})\n\n🔥 Are you a ${targetAudience} tired of the same old grind? Discover ${productDescription}, the game-changer you've been waiting for! \n\n✨ Unleash your potential with our cutting-edge features. \n💡 Don't miss out on this limited-time offer! \n\nTap the link in our bio to learn more! #${platform.replace(' ', '')} #viral #fyp`);

    } catch (err) {
      setError('Failed to generate script. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">AI Ad Script Generator</h1>
        <p className="text-xl text-muted-foreground">
          Generate viral-ready ad scripts for any product and platform in seconds.
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
          <Coins className="h-4 w-4" />
          <span>Costs 10 credits per generation</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Your Script</CardTitle>
            <CardDescription>
              Provide some details, and our AI will do the rest.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product Description</Label>
              <Textarea
                id="product"
                placeholder="e.g., A new brand of high-performance running shoes with advanced cushioning."
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Young athletes and fitness enthusiasts."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                  <SelectItem value="Instagram Reels">Instagram Reels</SelectItem>
                  <SelectItem value="YouTube Shorts">YouTube Shorts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Script
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Script</CardTitle>
            <CardDescription>
              Your AI-powered script, ready to go viral.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedScript ? (
              <Textarea
                value={generatedScript}
                readOnly
                className="min-h-[300px]"
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Your generated script will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
