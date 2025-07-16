import { videoFiles, subtitleFiles, type VideoFile, type SubtitleFile, type InsertVideoFile, type InsertSubtitleFile } from "@shared/schema";

export interface IStorage {
  // Video file operations
  createVideoFile(videoFile: InsertVideoFile): Promise<VideoFile>;
  getVideoFile(id: number): Promise<VideoFile | undefined>;
  getAllVideoFiles(): Promise<VideoFile[]>;
  deleteVideoFile(id: number): Promise<void>;
  
  // Subtitle file operations
  createSubtitleFile(subtitleFile: InsertSubtitleFile): Promise<SubtitleFile>;
  getSubtitleFile(id: number): Promise<SubtitleFile | undefined>;
  getAllSubtitleFiles(): Promise<SubtitleFile[]>;
  deleteSubtitleFile(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private videoFiles: Map<number, VideoFile>;
  private subtitleFiles: Map<number, SubtitleFile>;
  private currentVideoId: number;
  private currentSubtitleId: number;

  constructor() {
    this.videoFiles = new Map();
    this.subtitleFiles = new Map();
    this.currentVideoId = 1;
    this.currentSubtitleId = 1;
  }

  async createVideoFile(insertVideoFile: InsertVideoFile): Promise<VideoFile> {
    const id = this.currentVideoId++;
    const videoFile: VideoFile = { 
      ...insertVideoFile, 
      id,
      metadata: insertVideoFile.metadata || null,
      duration: insertVideoFile.duration || null,
      audioTracks: insertVideoFile.audioTracks as any || null,
      subtitleTracks: insertVideoFile.subtitleTracks as any || null
    };
    this.videoFiles.set(id, videoFile);
    return videoFile;
  }

  async getVideoFile(id: number): Promise<VideoFile | undefined> {
    return this.videoFiles.get(id);
  }

  async getAllVideoFiles(): Promise<VideoFile[]> {
    return Array.from(this.videoFiles.values());
  }

  async deleteVideoFile(id: number): Promise<void> {
    this.videoFiles.delete(id);
  }

  async createSubtitleFile(insertSubtitleFile: InsertSubtitleFile): Promise<SubtitleFile> {
    const id = this.currentSubtitleId++;
    const subtitleFile: SubtitleFile = { 
      ...insertSubtitleFile, 
      id,
      language: insertSubtitleFile.language || null
    };
    this.subtitleFiles.set(id, subtitleFile);
    return subtitleFile;
  }

  async getSubtitleFile(id: number): Promise<SubtitleFile | undefined> {
    return this.subtitleFiles.get(id);
  }

  async getAllSubtitleFiles(): Promise<SubtitleFile[]> {
    return Array.from(this.subtitleFiles.values());
  }

  async deleteSubtitleFile(id: number): Promise<void> {
    this.subtitleFiles.delete(id);
  }
}

export const storage = new MemStorage();
