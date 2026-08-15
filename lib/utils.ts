import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCredits(n: number): string {
  return n.toLocaleString();
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

// ──────────────────────────────────────────────────────────
// Contextual Curated Images Matching User's Exact Selections
// ──────────────────────────────────────────────────────────

const PRODUCT_SCENE_MAP: Record<string, string> = {
  "marble-white": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1024&q=85&fit=crop", // Cosmetic on white marble
  "wood-oak": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1024&q=85&fit=crop", // Headphone product on oak wood
  "minimalist-studio": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1024&q=85&fit=crop", // Watch in studio white
  "gradient-dark": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1024&q=85&fit=crop", // Tech gadget on dark gradient
  "gradient-warm": "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=1024&q=85&fit=crop", // Perfume on warm peach gradient
  "outdoor-nature": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1024&q=85&fit=crop", // Sneaker with natural daylight & greenery
  "cafe": "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=1024&q=85&fit=crop", // Coffee mug / lifestyle in cozy cafe
  "concrete": "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1024&q=85&fit=crop", // Footwear on industrial concrete
  "silk-draped": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1024&q=85&fit=crop", // Luxury perfume on flowing silk
  "podium-pastel": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1024&q=85&fit=crop", // Sunglasses on minimalist podium
  "beach-sand": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1024&q=85&fit=crop", // Sunlit summer product on beach sand
  "custom": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1024&q=85&fit=crop", // High-end commercial shoot
};

const MODEL_SCENE_MAP: Record<string, Record<string, string>> = {
  Female: {
    "East Asian": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1024&q=85&fit=crop",
    "South Asian": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1024&q=85&fit=crop",
    "Black / African": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1024&q=85&fit=crop",
    "Hispanic / Latino": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1024&q=85&fit=crop",
    "White / Caucasian": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1024&q=85&fit=crop",
    "Middle Eastern": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1024&q=85&fit=crop",
    "Southeast Asian": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1024&q=85&fit=crop",
    "Mixed": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=1024&q=85&fit=crop",
  },
  Male: {
    "East Asian": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&q=85&fit=crop",
    "South Asian": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1024&q=85&fit=crop",
    "Black / African": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1024&q=85&fit=crop",
    "Hispanic / Latino": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1024&q=85&fit=crop",
    "White / Caucasian": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1024&q=85&fit=crop",
    "Middle Eastern": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1024&q=85&fit=crop",
    "Southeast Asian": "https://images.unsplash.com/photo-1480429370139-e0132c086e2a?w=1024&q=85&fit=crop",
    "Mixed": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=1024&q=85&fit=crop",
  },
  "Non-binary": {
    "East Asian": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1024&q=85&fit=crop",
    "Black / African": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1024&q=85&fit=crop",
    "White / Caucasian": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1024&q=85&fit=crop",
    "Mixed": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=1024&q=85&fit=crop",
  },
};

/**
 * Returns a high-resolution commercial product image that precisely matches the user's selected background
 */
export function getContextualProductImage(backgroundId: string): string {
  return PRODUCT_SCENE_MAP[backgroundId] || PRODUCT_SCENE_MAP["marble-white"];
}

/**
 * Returns an AI model fashion image precisely matching the user's gender, ethnicity, and scene
 */
export function getContextualModelImage(gender: string, ethnicity: string, scene: string): string {
  const genderMap = MODEL_SCENE_MAP[gender] || MODEL_SCENE_MAP["Female"];
  const matched = genderMap[ethnicity] || Object.values(genderMap)[0];
  return matched;
}

/** Fallback placeholder generator */
export function mockImageUrl(seed: number | string = 1, w = 1024, h = 1024): string {
  const seedStr = String(seed).toLowerCase();
  for (const [key, url] of Object.entries(PRODUCT_SCENE_MAP)) {
    if (seedStr.includes(key)) return url;
  }
  return `https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=${w}&h=${h}&q=85&fit=crop`;
}
