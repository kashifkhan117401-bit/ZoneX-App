"use server";

import { auth } from "@clerk/nextjs/server";
import { generateProductPhoto, removeBackground } from "@/lib/fal";
import { generateProductPhotoGemini } from "@/lib/gemini";
import { generateId } from "@/lib/utils";

export type ImageProvider = "gemini-2.5" | "gemini-3.1" | "fal-flux";

export interface ProductGenerationConfig {
  productImageUrl: string;
  background: string;
  backgroundId?: string;
  angle: string;
  aspectRatio: string;
  customPrompt?: string;
  provider: ImageProvider;
  productImageBase64?: string;
  productImageMime?: string;
}

export interface GenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  id?: string;
  creditsUsed?: number;
  provider?: ImageProvider;
}

const CREDITS_BY_PROVIDER: Record<ImageProvider, number> = {
  "gemini-2.5": 1,
  "gemini-3.1": 2,
  "fal-flux": 2,
};

export async function generateProductAction(
  config: ProductGenerationConfig
): Promise<GenerationResult> {
  try {
    let userId: string | null = null;
    try {
      const authObj = await auth();
      userId = authObj.userId;
    } catch {
      // Allow testing without hard failure
    }

    const creditsUsed = CREDITS_BY_PROVIDER[config.provider] || 1;

    // ── Google Gemini 2.5 / 3.1 ───────────────────────────
    if (config.provider === "gemini-2.5" || config.provider === "gemini-3.1") {
      const result = await generateProductPhotoGemini({
        background: config.background,
        backgroundId: config.backgroundId,
        angle: config.angle,
        aspectRatio: config.aspectRatio,
        customPrompt: config.customPrompt,
        productImageBase64: config.productImageBase64,
        productImageMime: config.productImageMime,
        model: config.provider === "gemini-3.1" ? "gemini-3.1-flash-image" : "gemini-2.5-flash-image",
      });
      return {
        success: true,
        imageUrl: result.imageUrl,
        id: generateId(),
        creditsUsed,
        provider: config.provider,
      };
    }

    // ── fal.ai FLUX ──────────────────────────────────────
    if (config.provider === "fal-flux") {
      let processedUrl = config.productImageUrl;
      if (process.env.FAL_KEY) {
        try {
          const removed = await removeBackground(config.productImageUrl);
          processedUrl = removed.imageUrl;
        } catch {
          // continue with original if rembg fails
        }
      }
      const result = await generateProductPhoto({
        productImageUrl: processedUrl,
        background: config.background,
        backgroundId: config.backgroundId,
        angle: config.angle,
        aspectRatio: config.aspectRatio,
        customPrompt: config.customPrompt,
      });
      return {
        success: true,
        imageUrl: result.imageUrl,
        id: generateId(),
        creditsUsed,
        provider: config.provider,
      };
    }

    return { success: false, error: "Unknown provider selected" };
  } catch (err) {
    console.error("generateProductAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Generation failed. Please try again.",
    };
  }
}
