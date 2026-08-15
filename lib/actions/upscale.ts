"use server";

import { auth } from "@clerk/nextjs/server";
import { upscaleImage } from "@/lib/fal";

export interface UpscaleResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export async function upscaleAction(imageUrl: string): Promise<UpscaleResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    if (!imageUrl) {
      return { success: false, error: "No image URL provided for upscaling" };
    }

    const result = await upscaleImage(imageUrl);
    return {
      success: true,
      imageUrl: result.imageUrl,
    };
  } catch (err) {
    console.error("Upscale error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Upscaling failed.",
    };
  }
}
