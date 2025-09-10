"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import Replicate from "replicate";

export const generateNanoBanana = action({
  args: {
    prompt: v.string(),
    imageUrls: v.optional(v.array(v.string())),
    storageIds: v.optional(v.array(v.id("_storage"))),
  },
  returns: v.object({
    imageUrl: v.string(),
    storageId: v.id("_storage"),
  }),
  handler: async (ctx, args) => {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Prepare image inputs by converting storage IDs to URLs
    const imageInputs = [];
    
    // Add URLs from imageUrls if provided
    if (args.imageUrls) {
      imageInputs.push(...args.imageUrls);
    }
    
    // Convert storage IDs to URLs if provided
    if (args.storageIds) {
      for (const storageId of args.storageIds) {
        const url = await ctx.storage.getUrl(storageId);
        if (url) {
          imageInputs.push(url);
        }
      }
    }

    console.log("Starting nano-banana generation with:", {
      prompt: args.prompt,
      imageCount: imageInputs.length,
    });

    try {
      const output = await replicate.run("google/nano-banana", {
        input: {
          prompt: args.prompt,
          image_input: imageInputs.length > 0 ? imageInputs : undefined,
        },
      });

      console.log("Nano-banana generation completed, output type:", typeof output);

      // Extract URL from Replicate output
      let resultUrl: string;
      
      if (output && typeof output === 'object') {
        // Check if it's a FileOutput with url() method
        if ('url' in output && typeof output.url === 'function') {
          const url = output.url();
          resultUrl = url.toString();
          console.log("Got URL from FileOutput (string):", resultUrl);
        }
        // Check if it has a direct url property
        else if ('url' in output && typeof output.url === 'string') {
          resultUrl = output.url;
          console.log("Got URL from object property:", resultUrl);
        }
        else {
          throw new Error(`Unexpected output format: ${typeof output}`);
        }
      }
      // Fallback if output is already a string URL
      else if (typeof output === 'string') {
        resultUrl = output;
        console.log("Got direct string URL:", resultUrl);
      }
      else {
        throw new Error(`Unexpected output format: ${typeof output}`);
      }

      // Fetch the generated image and store it in Convex
      console.log("Fetching generated image to store in Convex...");
      const response = await fetch(resultUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch generated image: ${response.statusText}`);
      }
      
      const imageBlob = await response.blob();
      const storageId = await ctx.storage.store(imageBlob);
      console.log("Stored generated image with storage ID:", storageId);

      return {
        imageUrl: resultUrl,
        storageId: storageId,
      };
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