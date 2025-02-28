import {
  boolean,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Available roles and their permissions
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  CREATOR: "creator",
  VIEWER: "viewer",
} as const;

// Permission levels for different operations
export const PERMISSIONS = {
  CREATE_AGENT: "create_agent",
  EDIT_AGENT: "edit_agent",
  DELETE_AGENT: "delete_agent",
  VIEW_AGENT: "view_agent",
  EDIT_ANY_AGENT: "edit_any_agent",
  DELETE_ANY_AGENT: "delete_any_agent",
  VIEW_ANY_AGENT: "view_any_agent",
  MANAGE_USERS: "manage_users",
} as const;

// Role to permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MANAGER]: [
    PERMISSIONS.CREATE_AGENT,
    PERMISSIONS.EDIT_AGENT,
    PERMISSIONS.DELETE_AGENT,
    PERMISSIONS.VIEW_AGENT,
    PERMISSIONS.EDIT_ANY_AGENT,
    PERMISSIONS.DELETE_ANY_AGENT,
    PERMISSIONS.VIEW_ANY_AGENT,
  ],
  [ROLES.CREATOR]: [
    PERMISSIONS.CREATE_AGENT,
    PERMISSIONS.EDIT_AGENT,
    PERMISSIONS.DELETE_AGENT,
    PERMISSIONS.VIEW_AGENT,
  ],
  [ROLES.VIEWER]: [PERMISSIONS.VIEW_AGENT],
};

// Database schema definitions
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  role: text("role").notNull().default(ROLES.VIEWER),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active").notNull().default(true),
  settings: json("settings").default({}),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  systemPrompt: text("system_prompt"),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  config: json("config").default({}),
  modelId: text("model_id").notNull(),
  tags: json("tags").default([]),
});

export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  agentId: integer("agent_id")
    .notNull()
    .references(() => agents.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isTemplate: boolean("is_template").notNull().default(false),
  category: text("category"),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  agentId: integer("agent_id")
    .notNull()
    .references(() => agents.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isArchived: boolean("is_archived").notNull().default(false),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  metadata: json("metadata").default({}),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users);
export const insertAgentSchema = createInsertSchema(agents);
export const insertPromptSchema = createInsertSchema(prompts);
export const insertConversationSchema = createInsertSchema(conversations);
export const insertMessageSchema = createInsertSchema(messages);

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Type definitions for roles and permissions
export type Role = (typeof ROLES)[keyof typeof ROLES];
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
