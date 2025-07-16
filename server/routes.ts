import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertVideoFileSchema, insertSubtitleFileSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // 5GB limit
  fileFilter: (req, file, cb) => {
    // Allow all video file types including MKV
    const allowedMimeTypes = [
      'video/mp4',
      'video/avi',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska', // MKV
      'video/webm',
      'video/ogg',
      'video/3gpp',
      'video/x-flv',
      'video/x-ms-wmv'
    ];
    
    const allowedExtensions = [
      '.mp4', '.avi', '.mov', '.mkv', '.webm', '.ogg', '.3gp', '.flv', '.wmv', '.m4v'
    ];
    
    const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const hasValidExtension = allowedExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );
    
    if (hasValidMimeType || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload a video file.`));
    }
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Mock FFprobe functionality for metadata extraction
function extractVideoMetadata(filePath: string): Promise<any> {
  return new Promise((resolve) => {
    // In a real implementation, this would use FFprobe
    // For now, return mock metadata
    resolve({
      duration: 3600, // 1 hour in seconds
      audioTracks: [
        { index: 0, language: "en", codec: "aac", title: "English" },
        { index: 1, language: "es", codec: "aac", title: "Spanish" },
      ],
      subtitleTracks: [
        { index: 0, language: "en", codec: "subrip", title: "English" },
        { index: 1, language: "es", codec: "subrip", title: "Spanish" },
      ],
      metadata: {
        title: "Sample Video",
        format: "mp4",
        bitrate: 1000000,
      },
    });
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload video file
  app.post("/api/upload/video", (req, res) => {
    upload.single("video")(req, res, async (err) => {
      try {
        if (err) {
          console.error("Upload error:", err);
          return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
          return res.status(400).json({ message: "No video file uploaded" });
        }

        console.log("File uploaded:", req.file.originalname, req.file.mimetype);

        // Set proper mimetype for MKV files
        let mimeType = req.file.mimetype;
        if (req.file.originalname.toLowerCase().endsWith('.mkv')) {
          mimeType = 'video/x-matroska';
        }

        const metadata = await extractVideoMetadata(req.file.path);
        
        const videoData = insertVideoFileSchema.parse({
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: mimeType,
          size: req.file.size,
          duration: metadata.duration,
          audioTracks: metadata.audioTracks,
          subtitleTracks: metadata.subtitleTracks,
          metadata: metadata.metadata,
        });

        const videoFile = await storage.createVideoFile(videoData);
        res.json(videoFile);
      } catch (error) {
        console.error("Error uploading video:", error);
        res.status(500).json({ message: "Failed to upload video file" });
      }
    });
  });

  // Upload subtitle file
  app.post("/api/upload/subtitle", upload.single("subtitle"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No subtitle file uploaded" });
      }

      const content = fs.readFileSync(req.file.path, "utf-8");
      const format = path.extname(req.file.originalname).toLowerCase().slice(1);
      
      const subtitleData = insertSubtitleFileSchema.parse({
        filename: req.file.filename,
        originalName: req.file.originalname,
        format,
        language: req.body.language || "en",
        content,
      });

      const subtitleFile = await storage.createSubtitleFile(subtitleData);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json(subtitleFile);
    } catch (error) {
      console.error("Error uploading subtitle:", error);
      res.status(500).json({ message: "Failed to upload subtitle file" });
    }
  });

  // Serve video files
  app.get("/api/video/:id", async (req, res) => {
    try {
      const videoFile = await storage.getVideoFile(parseInt(req.params.id));
      if (!videoFile) {
        return res.status(404).json({ message: "Video file not found" });
      }

      const filePath = path.join(uploadsDir, videoFile.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Video file not found on disk" });
      }

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': videoFile.mimeType,
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': videoFile.mimeType,
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (error) {
      console.error("Error serving video:", error);
      res.status(500).json({ message: "Failed to serve video file" });
    }
  });

  // Get all video files
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getAllVideoFiles();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Get all subtitle files
  app.get("/api/subtitles", async (req, res) => {
    try {
      const subtitles = await storage.getAllSubtitleFiles();
      res.json(subtitles);
    } catch (error) {
      console.error("Error fetching subtitles:", error);
      res.status(500).json({ message: "Failed to fetch subtitles" });
    }
  });

  // Delete video file
  app.delete("/api/video/:id", async (req, res) => {
    try {
      const videoFile = await storage.getVideoFile(parseInt(req.params.id));
      if (videoFile) {
        const filePath = path.join(uploadsDir, videoFile.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        await storage.deleteVideoFile(parseInt(req.params.id));
      }
      res.json({ message: "Video file deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ message: "Failed to delete video file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
