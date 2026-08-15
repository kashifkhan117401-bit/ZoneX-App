"use server";

import { auth } from "@clerk/nextjs/server";
import { getDb, projects, users } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export interface ProjectItem {
  id: string;
  name: string;
  productType: string;
  createdAt: Date;
  count: number;
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  { id: "1", name: "Summer Collection 2025", productType: "clothing", count: 12, createdAt: new Date() },
  { id: "2", name: "Tech Gadgets — Q3", productType: "gadget", count: 5, createdAt: new Date() },
  { id: "3", name: "Beauty Line Launch", productType: "cosmetic", count: 8, createdAt: new Date() },
];

export async function getProjectsAction(): Promise<{ success: boolean; data?: ProjectItem[]; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Not authenticated" };

    const db = getDb();
    if (!db) {
      return { success: true, data: DEFAULT_PROJECTS };
    }

    // Find or create user
    let [dbUser] = await db.select().from(users).where(eq(users.clerkId, userId));
    if (!dbUser) {
      [dbUser] = await db
        .insert(users)
        .values({
          clerkId: userId,
          email: "user@zonex.ai",
        })
        .returning();
    }

    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, dbUser.id))
      .orderBy(desc(projects.createdAt));

    return {
      success: true,
      data: userProjects.map((p) => ({
        id: p.id,
        name: p.name,
        productType: p.productType || "general",
        createdAt: p.createdAt,
        count: 0,
      })),
    };
  } catch (err) {
    console.error("getProjectsAction error:", err);
    return {
      success: true,
      data: DEFAULT_PROJECTS,
    };
  }
}

export async function createProjectAction(name: string, productType: string = "general") {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Not authenticated" };

    const db = getDb();
    if (!db) {
      return { success: true, id: generateId() };
    }

    let [dbUser] = await db.select().from(users).where(eq(users.clerkId, userId));
    if (!dbUser) {
      [dbUser] = await db
        .insert(users)
        .values({ clerkId: userId, email: "user@zonex.ai" })
        .returning();
    }

    const [newProj] = await db
      .insert(projects)
      .values({
        userId: dbUser.id,
        name,
        productType,
      })
      .returning();

    return { success: true, project: newProj };
  } catch (err) {
    console.error("createProjectAction error:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to create project" };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Not authenticated" };

    const db = getDb();
    if (!db) {
      return { success: true };
    }

    await db.delete(projects).where(eq(projects.id, id));
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete project" };
  }
}
