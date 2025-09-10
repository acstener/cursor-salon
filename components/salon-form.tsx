"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type HaircutStyle = "buzzcut" | "dreadlocks" | "military" | "mullet";
type HairColor = "natural" | "blonde" | "ginger";
type LookStyle = "forbes" | "catwalk" | "redcarpet" | "hbo";

export function SalonForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [selectedHaircut, setSelectedHaircut] = useState<HaircutStyle>("buzzcut");
  const [selectedColor, setSelectedColor] = useState<HairColor>("natural");
  const [selectedLook, setSelectedLook] = useState<LookStyle>("forbes");
  const [uploadedFiles, setUploadedFiles] = useState<{file: File, storageId: Id<"_storage"> | null, uploading: boolean}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{imageUrl: string, storageId: Id<"_storage">} | null>(null);

  const generateImage = useAction(api.salon.generateNanoBanana);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const haircutOptions = [
    { value: "buzzcut" as const, label: "Buzz Cut", description: "Clean, sharp #1-3 guard all over. Ultra-professional military precision cut." },
    { value: "dreadlocks" as const, label: "Dreadlocks", description: "Thick, textured rope-like locks. Natural, free-flowing bohemian style." },
    { value: "military" as const, label: "Military Fade", description: "High and tight fade with longer top. Disciplined, commanding presence." },
    { value: "mullet" as const, label: "Farmers Mullet", description: "Business front, party back. Classic working-class rebellion style." },
  ];

  const colorOptions = [
    { value: "natural" as const, label: "Natural", description: "Keep original hair color - authentic and realistic" },
    { value: "blonde" as const, label: "Blonde", description: "Golden blonde highlights - bright, attention-grabbing" },
    { value: "ginger" as const, label: "Ginger", description: "Rich copper-red tones - bold and distinctive" },
  ];

  const lookOptions = [
    { value: "forbes" as const, label: "Forbes 30 Under 30", tag: "new", description: "Magazine cover CEO look - sharp suit, confident pose, executive lighting" },
    { value: "catwalk" as const, label: "Catwalk Model", tag: "new", description: "High fashion runway ready - editorial makeup, dramatic lighting, avant-garde" },
    { value: "redcarpet" as const, label: "Red Carpet", tag: "new", description: "Hollywood premiere glamour - perfect styling, paparazzi-ready sophistication" },
    { value: "hbo" as const, label: "HBO Character", tag: "new", description: "Prestige drama lead - intense, cinematic character with depth and gravitas" },
  ];

  const generateMasterPrompt = () => {
    const selectedHaircutData = haircutOptions.find(h => h.value === selectedHaircut)!;
    const selectedColorData = colorOptions.find(c => c.value === selectedColor)!;
    const selectedLookData = lookOptions.find(l => l.value === selectedLook)!;
    
    return `Transform this person with a ${selectedHaircutData.description.toLowerCase()} Give them ${selectedColorData.description.toLowerCase()}. Style them as: ${selectedLookData.description.toLowerCase()}. Make it photorealistic, professional quality, and naturally integrated.`;
  };

  const handleFileUpload = async (file: File) => {
    const fileIndex = uploadedFiles.length;
    setUploadedFiles(prev => [...prev, { file, storageId: null, uploading: true }]);

    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }
      
      const { storageId } = await result.json();
      
      setUploadedFiles(prev => 
        prev.map((item, index) => 
          index === fileIndex 
            ? { ...item, storageId, uploading: false }
            : item
        )
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadedFiles(prev => prev.filter((_, index) => index !== fileIndex));
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setResult(null);
      
      const storageIds = uploadedFiles
        .filter(item => item.storageId !== null)
        .map(item => item.storageId!);
      
      const masterPrompt = generateMasterPrompt();
      
      const output = await generateImage({
        prompt: masterPrompt,
        storageIds: storageIds.length > 0 ? storageIds : undefined,
      });
      
      setResult(output);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold">AI Salon</h1>
        <p className="text-balance text-muted-foreground">
          Transform your images using Google's Nano-Banana model
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Style Configuration</CardTitle>
            <CardDescription>
              Upload your images and choose your desired style transformation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="image-upload">Upload Images</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => handleFileUpload(file));
                    }}
                    className="cursor-pointer"
                  />
                  {uploadedFiles.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded text-sm">
                      <span className="truncate flex-1">{item.file.name}</span>
                      {item.uploading && <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>}
                      {item.storageId && <span className="text-green-600">✓</span>}
                    </div>
                  ))}
                </div>

                <div className="grid gap-3">
                  <Label>Haircut Style</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {haircutOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={selectedHaircut === option.value ? "default" : "outline"}
                        onClick={() => setSelectedHaircut(option.value)}
                        className="h-10"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label>Hair Color</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={selectedColor === option.value ? "default" : "outline"}
                        onClick={() => setSelectedColor(option.value)}
                        className="h-10"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label>Look Style</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {lookOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={selectedLook === option.value ? "default" : "outline"}
                        onClick={() => setSelectedLook(option.value)}
                        className="h-10 justify-between"
                      >
                        <span>{option.label}</span>
                        {option.tag && (
                          <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                            {option.tag}
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  type="button"
                  onClick={handleGenerate} 
                  disabled={isGenerating || uploadedFiles.filter(f => f.storageId).length === 0}
                  className="w-full"
                >
                  {isGenerating ? "Transforming..." : "Transform My Look"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Result</CardTitle>
            <CardDescription>
              Your transformed image will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating && (
              <div className="flex items-center justify-center h-64 bg-muted rounded">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Generating your transformation...</p>
                </div>
              </div>
            )}
            
            {result && !isGenerating && (
              <div className="space-y-4">
                <img
                  src={result.imageUrl}
                  alt="Generated result"
                  className="w-full rounded shadow"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={result.imageUrl} target="_blank" rel="noopener noreferrer">
                      Open Full Size
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={result.imageUrl} download="ai-salon-result.jpg">
                      Download
                    </a>
                  </Button>
                </div>
              </div>
            )}
            
            {!result && !isGenerating && (
              <div className="flex items-center justify-center h-64 bg-muted rounded">
                <p className="text-muted-foreground">Upload images and click transform to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}