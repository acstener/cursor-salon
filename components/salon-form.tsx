"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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

type HaircutStyle = "short-back-sides" | "cesar" | "top-knot" | "man-bun" | "long-back-sides-short-top" | "farmers-mullet" | "corporate-mullet" | "monk-mode" | "mohawk" | "tarzan" | "dreadlocks";
type HairColor = "natural" | "blonde" | "ginger";

export function SalonForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [selectedHaircut, setSelectedHaircut] = useState<HaircutStyle>("short-back-sides");
  const [selectedColor, setSelectedColor] = useState<HairColor>("natural");
  const [uploadedFiles, setUploadedFiles] = useState<{file: File, storageId: Id<"_storage"> | null, uploading: boolean}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{imageUrl: string, storageId: Id<"_storage">} | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentStep, setCurrentStep] = useState<'upload' | 'salon-transform' | 'styling'>("upload");
  const [salonImage, setSalonImage] = useState<{imageUrl: string, storageId: Id<"_storage">} | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const generateImage = useAction(api.salon.generateNanoBanana);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const normalHaircuts = [
    { value: "short-back-sides" as const, label: "Short Back & Sides", description: "Classic professional haircut with short, tapered back and sides, slightly longer on top. Clean and versatile business style." },
    { value: "cesar" as const, label: "Caesar Cut", description: "Short, layered cut with hair brushed forward. Timeless Roman-inspired style that's low maintenance and sophisticated." },
    { value: "top-knot" as const, label: "Top Knot", description: "Long hair on top pulled back into a neat knot, with shorter sides. Modern and trendy style." },
    { value: "man-bun" as const, label: "Man Bun", description: "Long hair gathered into a bun at the back of the head. Relaxed, bohemian style with medium-length sides." },
    { value: "long-back-sides-short-top" as const, label: "Long Back & Sides, Short Top", description: "Unique reverse cut with longer hair on back and sides, shorter on top. Unconventional but stylish approach." },
  ];

  const experimentalHaircuts = [
    { value: "farmers-mullet" as const, label: "Farmers Mullet", description: "Business front, party back. Classic working-class rebellion style with pronounced length difference." },
    { value: "corporate-mullet" as const, label: "Corporate Mullet", description: "Sophisticated mullet with subtle length variation. Professional front with stylish longer back." },
    { value: "monk-mode" as const, label: "Monk Mode", description: "Distinctive ring of hair around the head with bald crown, like a medieval monk's tonsure. Bold and unique statement." },
    { value: "mohawk" as const, label: "Mohawk", description: "Dramatic strip of hair down the center of the head with shaved sides. Bold, rebellious punk rock style." },
    { value: "tarzan" as const, label: "Tarzan Hair", description: "Wild, long, flowing hair with natural texture. Untamed, jungle-inspired look with rugged appeal." },
    { value: "dreadlocks" as const, label: "Dreadlocks", description: "Thick, textured rope-like locks. Natural, free-flowing bohemian style with cultural significance." },
  ];

  const colorOptions = [
    { value: "natural" as const, label: "Natural", description: "Keep original hair color - authentic and realistic" },
    { value: "blonde" as const, label: "Blonde", description: "Golden blonde highlights - bright, attention-grabbing" },
    { value: "ginger" as const, label: "Ginger", description: "Rich copper-red tones - bold and distinctive" },
  ];


  const generateMasterPrompt = () => {
    const allHaircuts = [...normalHaircuts, ...experimentalHaircuts];
    const selectedHaircutData = allHaircuts.find(h => h.value === selectedHaircut)!;
    const selectedColorData = colorOptions.find(c => c.value === selectedColor)!;
    
    return `Transform this person in the salon chair to have: ${selectedHaircutData.description.toLowerCase()} ${selectedColorData.description.toLowerCase()}. Keep them in the same salon setting with the cape, just change their hairstyle and color. Make it photorealistic, professional salon result.`;
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
      
      // Auto-proceed to salon transformation after first upload
      if (fileIndex === 0) {
        setTimeout(() => {
          handleSalonTransformation(storageId);
        }, 1000);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadedFiles(prev => prev.filter((_, index) => index !== fileIndex));
    }
  };

  const handleSalonTransformation = async (storageId: Id<"_storage">) => {
    try {
      setCurrentStep("salon-transform");
      
      const salonPrompt = "Transform this person to be sitting in a professional salon chair wearing a black hair salon cape/cloak around their shoulders, ready for a haircut. The setting should be a modern, upscale hair salon with good lighting. Keep their face and features exactly the same, just place them in the salon environment with the cape. Professional salon photography style.";
      
      const output = await generateImage({
        prompt: salonPrompt,
        storageIds: [storageId],
      });
      
      setSalonImage(output);
      setCurrentStep("styling");
    } catch (error) {
      console.error("Error in salon transformation:", error);
    }
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'));
    fileArray.forEach(file => handleFileUpload(file));
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleStyleTransformation = async () => {
    if (!salonImage) return;
    
    try {
      setIsGenerating(true);
      
      const masterPrompt = generateMasterPrompt();
      
      const output = await generateImage({
        prompt: masterPrompt,
        storageIds: [salonImage.storageId],
      });
      
      // Replace the display image with the new styled result
      setResult(output);
    } catch (error) {
      console.error("Error generating styled image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetExperience = () => {
    setCurrentStep("upload");
    setUploadedFiles([]);
    setSalonImage(null);
    setResult(null);
    setIsGenerating(false);
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  useEffect(() => {
    // Initialize audio element
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3; // Set to 30% volume
    }
    
  }, []);

  const MusicToggle = () => (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleMusic}
        className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
      >
        {isMusicPlaying ? (
          <>
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6" />
            </svg>
            Playing
          </>
        ) : (
          <>
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            Music Off
          </>
        )}
      </Button>
      <audio ref={audioRef} preload="auto">
        <source src="/Elevator Music.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );

  if (currentStep === "upload") {
    return (
      <div className={cn("grid gap-6", className)} {...props}>
        <MusicToggle />
        <div className="grid gap-2 text-center">
          <h1 className="text-4xl font-bold">Welcome to AI Salon</h1>
          <p className="text-xl text-muted-foreground">
            Upload your photo to get started
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Upload Your Photo</CardTitle>
            <CardDescription>
              We'll transform you into our salon for a personalized styling experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
                  isDragOver 
                    ? "border-primary bg-primary/5" 
                    : "border-muted-foreground/25 hover:border-muted-foreground/50"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) handleFiles(files);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-primary">Click to upload your photo</p>
                    <p className="text-muted-foreground">or drag and drop</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </div>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                      <div className="flex-shrink-0 w-12 h-12 bg-muted rounded overflow-hidden">
                        <img 
                          src={URL.createObjectURL(item.file)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(item.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {item.uploading && (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                            <span className="text-xs text-muted-foreground">Processing...</span>
                          </div>
                        )}
                        {item.storageId && (
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600 font-medium">Ready</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === "salon-transform") {
    return (
      <div className={cn("grid gap-6", className)} {...props}>
        <MusicToggle />
        <div className="grid gap-2 text-center">
          <h1 className="text-4xl font-bold">Welcome to the Salon!</h1>
          <p className="text-xl text-muted-foreground">
            Getting you ready for your transformation...
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                  <div className="relative">
                    {/* Barber pole animation */}
                    <div className="w-16 h-20 bg-gradient-to-b from-red-500 via-white to-blue-500 rounded-full animate-spin" style={{animationDuration: '2s'}}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-16 bg-white/80 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-lg font-medium">Preparing your salon experience...</p>
                <p className="text-sm text-muted-foreground mt-2">Getting your chair ready...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <MusicToggle />
      <div className="grid gap-2 text-center">
        <h1 className="text-4xl font-bold">What can we do for you?</h1>
        <p className="text-xl text-muted-foreground">
          Choose your perfect style transformation
        </p>
        <Button variant="outline" onClick={resetExperience} className="mx-auto mt-2">
          Start Over
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {salonImage && (
          <Card>
            <CardHeader>
              <CardTitle>{result ? "Your New Look" : "You in the Salon"}</CardTitle>
              <CardDescription>
                {result ? "Looking amazing! Try another style?" : "Looking great! Now let's try some new styles"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <img
                  src={result ? result.imageUrl : salonImage.imageUrl}
                  alt={result ? "Your styled look" : "You in the salon"}
                  className="w-full rounded-lg shadow"
                />
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Styling...</p>
                    </div>
                  </div>
                )}
              </div>
              {result && !isGenerating && (
                <div className="flex gap-2 mt-4">
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
              )}
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Style</CardTitle>
            <CardDescription>
              Select your perfect haircut, color, and look
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid gap-6">

                <div className="grid gap-4">
                  <div>
                    <Label className="text-base font-medium">Classic Haircuts</Label>
                    <div className="grid grid-cols-1 gap-2 mt-3">
                      {normalHaircuts.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={selectedHaircut === option.value ? "default" : "outline"}
                          onClick={() => setSelectedHaircut(option.value)}
                          className="h-12 justify-start text-left p-3"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Label className="text-base font-medium flex items-center gap-2">
                      Experimental Haircuts
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-normal">
                        Bold
                      </span>
                    </Label>
                    <div className="grid grid-cols-1 gap-2 mt-3">
                      {experimentalHaircuts.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={selectedHaircut === option.value ? "default" : "outline"}
                          onClick={() => setSelectedHaircut(option.value)}
                          className="h-12 justify-start text-left p-3"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
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


                <Button 
                  type="button"
                  onClick={handleStyleTransformation} 
                  disabled={isGenerating || !salonImage}
                  className="w-full"
                >
                  {isGenerating ? "Styling..." : "Apply This Style"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}