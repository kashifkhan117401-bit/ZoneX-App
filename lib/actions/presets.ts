"use server";

import { auth } from "@clerk/nextjs/server";
import { getDb, brandPresets, users } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export interface PresetPayload {
  name: string;
  defaultBg: string;
  defaultGender: string;
  defaultRatio: string;
  customPrompt?: string;
}

export async function saveBrandPresetAction(preset: PresetPayload) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Not authenticated" };

    const db = getDb();
    if (!db) {
      return { success: true };
    }

    let [dbUser] = await db.select().from(users).where(eq(users.clerkId, userId));
    if (!dbUser) {
      [dbUser] = await db.insert(users).values({ clerkId: userId, email: "user@zonex.ai" }).returning();
    }

    const [saved] = await db
      .insert(brandPresets)
      .values({
        userId: dbUser.id,
        name: preset.name,
        presetJson: preset,
      })
      .returning();

    return { success: true, preset: saved };
  } catch (err) {
    console.error("saveBrandPresetAction error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to save preset" };
  }
}

export async function getBrandPresetsAction() {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Not authenticated" };

    const db = getDb();
    if (!db) {
      return { success: true, presets: [] };
    }

    let [dbUser] = await db.select().from(users).where(eq(users.clerkId, userId));
    if (!dbUser) return { success: true, presets: [] };

    const presets = await db
      .select()
      .from(brandPresets)
      .where(eq(brandPresets.userId, dbUser.id))
      .orderBy(desc(brandPresets.createdAt));

    return { success: true, presets };
  } catch (err) {
    console.error("getBrandPresetsAction error:", err);
    return { success: false, presets: [] };
  }
}
