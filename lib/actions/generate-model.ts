"use server";

import { auth } from "@clerk/nextjs/server";
import { generateModelPhoto } from "@/lib/fal";
import { generateModelPhotoGemini } from "@/lib/gemini";
import { generateId } from "@/lib/utils";

export type ImageProvider = "gemini-2.5" | "gemini-3.1" | "fal-flux";

export interface ModelGenerationConfig {
  productImageUrl: string;
  gender: string;
  ageRange: string;
  ethnicity: string;
  bodyType: string;
  hairStyle: string;
  pose: string;
  expression: string;
  scene: string;
  productType: string;
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
  "gemini-2.5": 2,
  "gemini-3.1": 3,
  "fal-flux": 3,
};

export async function generateModelAction(
  config: ModelGenerationConfig
): Promise<GenerationResult> {
  try {
    let userId: string | null = null;
    try {
      const authObj = await auth();
      userId = authObj.userId;
    } catch {
      // Allow testing without hard failure
    }

    const creditsUsed = CREDITS_BY_PROVIDER[config.provider] || 2;

    // ── Google Gemini 2.5 / 3.1 ───────────────────────────
    if (config.provider === "gemini-2.5" || config.provider === "gemini-3.1") {
      const result = await generateModelPhotoGemini({
        gender: config.gender,
        ageRange: config.ageRange,
        ethnicity: config.ethnicity,
        bodyType: config.bodyType,
        hairStyle: config.hairStyle,
        pose: config.pose,
        expression: config.expression,
        scene: config.scene,
        productType: config.productType,
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
      const result = await generateModelPhoto({
        productImageUrl: config.productImageUrl,
        gender: config.gender,
        ageRange: config.ageRange,
        ethnicity: config.ethnicity,
        bodyType: config.bodyType,
        hairStyle: config.hairStyle,
        pose: config.pose,
        expression: config.expression,
        scene: config.scene,
        productType: config.productType,
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

    return { success: false, error: "Unknown provider" };
  } catch (err) {
    console.error("generateModelAction error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Generation failed. Please try again.",
    };
  }
}
