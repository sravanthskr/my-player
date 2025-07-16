import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const videoFiles = pgTable("video_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  duration: integer("duration"), // in seconds
  audioTracks: jsonb("audio_tracks").$type<Array<{
    index: number;
    language: string;
    codec: string;
    title?: string;
  }>>(),
  subtitleTracks: jsonb("subtitle_tracks").$type<Array<{
    index: number;
    language: string;
    codec: string;
    title?: string;
  }>>(),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
});

export const subtitleFiles = pgTable("subtitle_files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  format: text("format").notNull(), // srt, ass, vtt
  language: text("language"),
  content: text("content").notNull(),
});

export const insertVideoFileSchema = createInsertSchema(videoFiles).omit({
  id: true,
});

export const insertSubtitleFileSchema = createInsertSchema(subtitleFiles).omit({
  id: true,
});

export type VideoFile = typeof videoFiles.$inferSelect & {
  localUrl?: string;
  file?: File;
};
export type SubtitleFile = typeof subtitleFiles.$inferSelect & {
  file?: File;
};
export type InsertVideoFile = z.infer<typeof insertVideoFileSchema>;
export type InsertSubtitleFile = z.infer<typeof insertSubtitleFileSchema>;
