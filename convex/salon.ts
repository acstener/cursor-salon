"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import Replicate from "replicate";

export const generateNanoBanana = action({
  args: {
    prompt: v.string(),
    imageUrls: v.array(v.string()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    console.log("Starting nano-banana generation with:", {
      prompt: args.prompt,
      imageCount: args.imageUrls.length,
    });

    try {
      const output = await replicate.run("google/nano-banana", {
        input: {
          prompt: args.prompt,
          image_input: args.imageUrls,
        },
      });

      console.log("Nano-banana generation completed, output type:", typeof output);

      // Handle different output formats from Replicate
      if (output && typeof output === 'object') {
        // Check if it's a FileOutput with url() method
        if ('url' in output && typeof output.url === 'function') {
          const url = output.url();
          const urlString = url.toString();
          console.log("Got URL from FileOutput (string):", urlString);
          return urlString;
        }
        
        // Check if it has a direct url property
        if ('url' in output && typeof output.url === 'string') {
          console.log("Got URL from object property:", output.url);
          return output.url;
        }
      }
      
      // Fallback if output is already a string URL
      if (typeof output === 'string') {
        console.log("Got direct string URL:", output);
        return output;
      }

      // If we get here, we don't know the format - just convert to string
      const outputStr = String(output);
      console.log("Converting unknown output to string:", outputStr);
      return outputStr;
    } catch (error) {
      console.error("Error in nano-banana generation:", error);
      throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

// Additional function to test the Replicate connection
export const testReplicate = action({
  args: {},
  returns: v.string(),
  handler: async (ctx, args) => {
    try {
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      // Simple test to verify the connection works
      console.log("Testing Replicate connection...");
      
      return "Replicate connection successful!";
    } catch (error) {
      console.error("Error testing Replicate:", error);
      throw new Error(`Replicate connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});