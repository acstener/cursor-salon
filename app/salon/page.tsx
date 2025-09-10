"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SalonPage() {
  const [prompt, setPrompt] = useState("Make the sheets in the style of the logo. Make the scene natural.");
  const [imageUrls, setImageUrls] = useState([
    "https://replicate.delivery/pbxt/NbYIclp4A5HWLsJ8lF5KgiYSNaLBBT1jUcYcHYQmN1uy5OnN/tmpcqc07f_q.png",
    "https://replicate.delivery/pbxt/NbYId45yH8s04sptdtPcGqFIhV7zS5GTcdS3TtNliyTAoYPO/Screenshot%202025-08-26%20at%205.30.12%E2%80%AFPM.png"
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const generateImage = useAction(api.salon.generateNanoBanana);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setResult(null);
      
      const output = await generateImage({
        prompt,
        imageUrls: imageUrls.filter(url => url.trim() !== "")
      });
      
      setResult(output);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">AI Salon</CardTitle>
          <CardDescription>
            Transform your images using Google's Nano-Banana model through Replicate
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Input Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how you want to transform the images..."
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label>Image URLs</Label>
              <div className="space-y-2 mt-2">
                {imageUrls.map((url, index) => (
                  <Input
                    key={index}
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...imageUrls];
                      newUrls[index] = e.target.value;
                      setImageUrls(newUrls);
                    }}
                    placeholder={`Image URL ${index + 1}`}
                  />
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImageUrls([...imageUrls, ""])}
                >
                  Add Another Image URL
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate Image"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Result</CardTitle>
          </CardHeader>
          <CardContent>
            {isGenerating && (
              <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Generating your image...</p>
                </div>
              </div>
            )}
            
            {result && !isGenerating && (
              <div className="space-y-4">
                <img
                  src={result}
                  alt="Generated result"
                  className="w-full rounded-lg shadow-lg"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={result} target="_blank" rel="noopener noreferrer">
                      Open Full Size
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={result} download="nano-banana-result.jpg">
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            )}
            
            {!result && !isGenerating && (
              <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
                <p className="text-muted-foreground">Your generated image will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}