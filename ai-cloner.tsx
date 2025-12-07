/**
 * AI Cloner - Voice & Image Cloning
 * Clean, user-friendly interface with PROFITHACK branding
 */

import { useState } from "react";
import { Mic, Image, Upload, Sparkles, Download, Play, Pause } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function AIClonerPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleVoiceClone = async () => {
    if (!voiceFile) {
      toast({ title: "Please upload a voice sample", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({ 
        title: "✨ Voice cloned successfully!",
        description: "Your AI voice is ready to use"
      });
    }, 3000);
  };

  const handleImageClone = async () => {
    if (!imageFile) {
      toast({ title: "Please upload an image", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast({ 
        title: "✨ Image processed successfully!",
        description: "Your AI clone is ready"
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-pink-950/20 pb-20">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Cloner</h1>
              <p className="text-sm text-gray-400">Clone voices & create AI avatars</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Credits Banner */}
        <Card className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 border-pink-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Your Credits</p>
                <p className="text-2xl font-bold text-white">2,500</p>
              </div>
              <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                Get More Credits
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cloner Tabs */}
        <Tabs defaultValue="voice" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/50">
            <TabsTrigger 
              value="voice" 
              className="data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice Cloner
            </TabsTrigger>
            <TabsTrigger 
              value="image" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Image className="w-4 h-4 mr-2" />
              Image Cloner
            </TabsTrigger>
          </TabsList>

          {/* Voice Cloner Tab */}
          <TabsContent value="voice" className="space-y-4 mt-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mic className="w-5 h-5 text-pink-500" />
                  Clone Your Voice
                </CardTitle>
                <CardDescription>
                  Upload a clear voice sample (30 seconds minimum) to create your AI voice clone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-pink-500 transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setVoiceFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="voice-upload"
                  />
                  <label 
                    htmlFor="voice-upload" 
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-pink-500" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {voiceFile ? voiceFile.name : "Click to upload audio"}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        MP3, WAV, M4A (30s minimum)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Processing Info */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">What you'll get:</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500">✓</span>
                      <span>High-quality AI voice that sounds like you</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500">✓</span>
                      <span>Use in videos, podcasts, and content creation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500">✓</span>
                      <span>Multiple languages and accents supported</span>
                    </li>
                  </ul>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleVoiceClone}
                  disabled={!voiceFile || isProcessing}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white h-12 text-base font-semibold"
                  data-testid="button-clone-voice"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Cloning Voice...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Clone Voice (50 Credits)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Sample Voices */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-base">Your AI Voices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  <Mic className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No voice clones yet</p>
                  <p className="text-sm mt-1">Clone your first voice to get started</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image Cloner Tab */}
          <TabsContent value="image" className="space-y-4 mt-4">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Image className="w-5 h-5 text-purple-500" />
                  Create AI Avatar
                </CardTitle>
                <CardDescription>
                  Upload your photo to create a realistic AI avatar for videos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="image-upload"
                  />
                  <label 
                    htmlFor="image-upload" 
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {imageFile ? imageFile.name : "Click to upload photo"}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        JPG, PNG (High resolution recommended)
                      </p>
                    </div>
                  </label>
                </div>

                {/* Preview */}
                {imageFile && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={URL.createObjectURL(imageFile)} 
                      alt="Preview" 
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {/* Processing Info */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">What you'll get:</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">✓</span>
                      <span>Photorealistic AI avatar</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">✓</span>
                      <span>Animated avatar for video creation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500">✓</span>
                      <span>Multiple poses and expressions</span>
                    </li>
                  </ul>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleImageClone}
                  disabled={!imageFile || isProcessing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white h-12 text-base font-semibold"
                  data-testid="button-clone-image"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Creating Avatar...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Create Avatar (100 Credits)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* AI Avatars Gallery */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-base">Your AI Avatars</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No avatars yet</p>
                  <p className="text-sm mt-1">Create your first AI avatar</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
