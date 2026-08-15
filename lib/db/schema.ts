/**
 * Drizzle ORM Schema
 *
 * To run migrations after adding your real DATABASE_URL:
 *   npx drizzle-kit push
 */

import {
  pgTable,
  text,
  integer,
  timestamp,
  json,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  plan: text("plan").notNull().default("free"),
  credits: integer("credits").notNull().default(20),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  productType: text("product_type").default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generations = pgTable("generations", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "product" | "model"
  inputUrl: text("input_url"),
  outputUrl: text("output_url"),
  prompt: text("prompt"),
  configJson: json("config_json"),
  creditsUsed: integer("credits_used").notNull().default(2),
  status: text("status").notNull().default("pending"), // "pending" | "done" | "error"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brandPresets = pgTable("brand_presets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  presetJson: json("preset_json").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
