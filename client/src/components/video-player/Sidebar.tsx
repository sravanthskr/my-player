import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileVideo, FileText, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatFileSize } from "@/lib/videoUtils";
import type { VideoFile, SubtitleFile } from "@shared/schema";

interface SidebarProps {
  videos: VideoFile[];
  subtitles: SubtitleFile[];
  currentVideo: VideoFile | null;
  currentSubtitle: SubtitleFile | null;
  onVideoSelect: (video: VideoFile) => void;
  onSubtitleSelect: (subtitle: SubtitleFile | null) => void;
  onVideoAdd: (video: VideoFile) => void;
  onSubtitleAdd: (subtitle: SubtitleFile) => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  aspectRatio?: string;
  onAspectRatioChange?: (ratio: string) => void;
  subtitleDelay: number;
  onSubtitleDelayChange: (delay: number) => void;
  subtitleSize: number;
  onSubtitleSizeChange: (size: number) => void;
}

export default function Sidebar({
  videos,
  subtitles,
  currentVideo,
  currentSubtitle,
  onVideoSelect,
  onSubtitleSelect,
  onVideoAdd,
  onSubtitleAdd,
  playbackRate,
  onPlaybackRateChange,
  aspectRatio = "default",
  onAspectRatioChange,
  subtitleDelay,
  onSubtitleDelayChange,
  subtitleSize,
  onSubtitleSizeChange,
}: SidebarProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  // Remove local playback speed state as it's now controlled by parent
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loadVideoMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log("Loading video file:", file.name, file.type, file.size);
      // Create a local URL for the file - no server upload needed
      const url = URL.createObjectURL(file);
      
      // Create a local video file object
      const videoFile = {
        id: Date.now(), // Simple ID generation
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        duration: null,
        audioTracks: null,
        subtitleTracks: null,
        metadata: null,
        localUrl: url, // Store the local URL
        file: file // Store the actual file object
      };
      
      return videoFile;
    },
    onSuccess: (data) => {
      console.log("Video loaded successfully:", data);
      onVideoAdd(data);
      onVideoSelect(data);
      toast({
        title: "Video loaded successfully",
        description: `${data.originalName} is ready to play`,
      });
    },
    onError: (error) => {
      console.error("Video loading failed:", error);
      toast({
        title: "Load failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loadSubtitleMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log("Loading subtitle file:", file.name, file.type, file.size);
      // Read the file content directly
      const content = await file.text();
      const format = file.name.split('.').pop()?.toLowerCase() || 'srt';
      
      // Create a local subtitle file object
      const subtitleFile = {
        id: Date.now(), // Simple ID generation
        filename: file.name,
        originalName: file.name,
        format,
        language: 'en', // Default language
        content,
        file: file // Store the actual file object
      };
      
      return subtitleFile;
    },
    onSuccess: (data) => {
      console.log("Subtitle loaded successfully:", data);
      onSubtitleAdd(data);
      onSubtitleSelect(data);
      toast({
        title: "Subtitle loaded successfully",
        description: `${data.originalName} is ready to use`,
      });
    },
    onError: (error) => {
      console.error("Subtitle loading failed:", error);
      toast({
        title: "Load failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => 
      file.type.startsWith("video/") || 
      file.name.toLowerCase().endsWith(".mkv") ||
      file.name.toLowerCase().endsWith(".avi") ||
      file.name.toLowerCase().endsWith(".mov") ||
      file.name.toLowerCase().endsWith(".wmv") ||
      file.name.toLowerCase().endsWith(".flv") ||
      file.name.toLowerCase().endsWith(".m4v")
    );
    const subtitleFile = files.find(file => 
      file.name.endsWith(".srt") || 
      file.name.endsWith(".ass") || 
      file.name.endsWith(".vtt")
    );

    if (videoFile) {
      loadVideoMutation.mutate(videoFile);
    }
    if (subtitleFile) {
      loadSubtitleMutation.mutate(subtitleFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's a video file by type or extension
      const isVideoFile = file.type.startsWith("video/") || 
        file.name.toLowerCase().endsWith(".mkv") ||
        file.name.toLowerCase().endsWith(".avi") ||
        file.name.toLowerCase().endsWith(".mov") ||
        file.name.toLowerCase().endsWith(".wmv") ||
        file.name.toLowerCase().endsWith(".flv") ||
        file.name.toLowerCase().endsWith(".m4v");
      
      if (isVideoFile) {
        loadVideoMutation.mutate(file);
      } else {
        toast({
          title: "Unsupported file type",
          description: "Please select a video file (MP4, MKV, AVI, MOV, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubtitleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadSubtitleMutation.mutate(file);
    }
  };

  const adjustSubtitleDelay = (adjustment: number) => {
    onSubtitleDelayChange(subtitleDelay + adjustment);
  };

  return (
    <aside className="w-80 vlc-surface border-r border-vlc-border p-4 overflow-y-auto">
      {/* File Upload Section */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">LOAD LOCAL VIDEO FILE</h3>
        <div
          className={`drag-drop-zone p-8 text-center ${isDragOver ? "drag-over" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <FileVideo className="mx-auto text-vlc-orange mb-3" size={48} />
          <p className="text-gray-300 mb-2">Drag & drop video files here</p>
          <p className="text-xs text-gray-500 mb-4">Supports MP4, MKV, AVI, MOV, WebM</p>
          <Input
            type="file"
            accept="video/*,.mkv,.avi,.mov,.wmv,.flv,.m4v"
            onChange={handleFileSelect}
            className="hidden"
            id="videoFile"
          />
          <Button
            onClick={() => document.getElementById("videoFile")?.click()}
            className="vlc-orange text-white"
            disabled={loadVideoMutation.isPending}
          >
            {loadVideoMutation.isPending ? "Loading..." : "Browse Files"}
          </Button>
        </div>
      </div>

      {/* Video List */}
      {videos.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 text-gray-300">VIDEOS</h3>
          <div className="space-y-2">
            {videos.map((video) => (
              <div
                key={video.id}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  currentVideo?.id === video.id
                    ? "bg-vlc-orange text-white"
                    : "bg-vlc-surface hover:bg-vlc-border"
                }`}
                onClick={() => onVideoSelect(video)}
              >
                <div className="text-sm font-medium truncate">{video.originalName}</div>
                <div className="text-xs text-gray-400">
                  {formatFileSize(video.size)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audio Tracks */}
      {currentVideo?.audioTracks && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 text-gray-300">AUDIO TRACKS</h3>
          <Select>
            <SelectTrigger className="track-selector">
              <SelectValue placeholder="Select audio track" />
            </SelectTrigger>
            <SelectContent>
              {currentVideo.audioTracks.map((track) => (
                <SelectItem key={track.index} value={track.index.toString()}>
                  Track {track.index + 1} - {track.title || track.language} ({track.codec})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Subtitle Tracks */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">SUBTITLE TRACKS</h3>
        <Select 
          value={currentSubtitle?.id.toString() || "none"}
          onValueChange={(value) => {
            if (value === "none") {
              onSubtitleSelect(null);
            } else {
              const subtitle = subtitles.find(s => s.id.toString() === value);
              if (subtitle) onSubtitleSelect(subtitle);
            }
          }}
        >
          <SelectTrigger className="track-selector mb-3">
            <SelectValue placeholder="Select subtitle track" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {currentVideo?.subtitleTracks?.map((track) => (
              <SelectItem key={track.index} value={`embedded-${track.index}`}>
                {track.title || track.language} (Embedded)
              </SelectItem>
            ))}
            {subtitles.map((subtitle) => (
              <SelectItem key={subtitle.id} value={subtitle.id.toString()}>
                {subtitle.originalName} ({subtitle.format})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* External Subtitle Upload */}
        <div className="mt-3">
          <Input
            type="file"
            accept=".srt,.ass,.vtt"
            onChange={handleSubtitleFileSelect}
            className="hidden"
            id="subtitleFile"
          />
          <Button
            onClick={() => document.getElementById("subtitleFile")?.click()}
            variant="outline"
            className="w-full"
            disabled={loadSubtitleMutation.isPending}
          >
            <Upload className="mr-2" size={16} />
            {loadSubtitleMutation.isPending ? "Loading..." : "Load External Subtitles"}
          </Button>
        </div>
      </div>

      {/* Subtitle Synchronization */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">SUBTITLE SYNC</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Label className="text-xs text-gray-400 w-16">Delay:</Label>
            <Slider
              value={[subtitleDelay]}
              onValueChange={([value]) => onSubtitleDelayChange(value)}
              min={-10000}
              max={10000}
              step={50}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-16">{subtitleDelay}ms</span>
          </div>
          
          {/* Custom delay input */}
          <div className="flex items-center space-x-2">
            <Label className="text-xs text-gray-400 w-16">Custom:</Label>
            <Input
              type="number"
              value={subtitleDelay}
              onChange={(e) => onSubtitleDelayChange(parseInt(e.target.value) || 0)}
              className="flex-1 h-7 text-xs"
              placeholder="Enter delay in ms"
              step={10}
              min={-10000}
              max={10000}
            />
            <span className="text-xs text-gray-400">ms</span>
          </div>

          <div className="flex items-center space-x-3">
            <Label className="text-xs text-gray-400 w-16">Size:</Label>
            <Slider
              value={[subtitleSize]}
              onValueChange={([value]) => onSubtitleSizeChange(value)}
              min={12}
              max={48}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-12">{subtitleSize}px</span>
          </div>
          
          {/* Precise adjustment buttons */}
          <div className="grid grid-cols-4 gap-1">
            <Button
              onClick={() => adjustSubtitleDelay(-1000)}
              size="sm"
              className="vlc-orange text-white text-xs"
            >
              -1s
            </Button>
            <Button
              onClick={() => adjustSubtitleDelay(-100)}
              size="sm"
              className="vlc-orange text-white text-xs"
            >
              -0.1s
            </Button>
            <Button
              onClick={() => adjustSubtitleDelay(100)}
              size="sm"
              className="vlc-orange text-white text-xs"
            >
              +0.1s
            </Button>
            <Button
              onClick={() => adjustSubtitleDelay(1000)}
              size="sm"
              className="vlc-orange text-white text-xs"
            >
              +1s
            </Button>
          </div>
          
          {/* Reset button */}
          <Button
            onClick={() => onSubtitleDelayChange(0)}
            size="sm"
            variant="outline"
            className="w-full text-xs"
          >
            Reset Sync
          </Button>
        </div>
      </div>

      {/* Playback Settings */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">PLAYBACK</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Speed</span>
            <Select value={playbackRate.toString()} onValueChange={(value) => onPlaybackRateChange(parseFloat(value))}>
              <SelectTrigger className="track-selector w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.25">0.25x</SelectItem>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="0.75">0.75x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.25">1.25x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="1.75">1.75x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="3">3x</SelectItem>
                <SelectItem value="4">4x</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Aspect Ratio</span>
            <Select value={aspectRatio} onValueChange={onAspectRatioChange || (() => {})}>
              <SelectTrigger className="track-selector w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="16:9">16:9</SelectItem>
                <SelectItem value="4:3">4:3</SelectItem>
                <SelectItem value="21:9">21:9</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>



      {/* Keyboard Shortcuts */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">KEYBOARD SHORTCUTS</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Play/Pause</span>
            <span>Space (tap)</span>
          </div>
          <div className="flex justify-between">
            <span>Temporary Speed</span>
            <span>Space (hold)</span>
          </div>
          <div className="flex justify-between">
            <span>Speed: 1.25x/1.5x/2x/2.5x/3x</span>
            <span>Keys 1-5</span>
          </div>
          <div className="flex justify-between">
            <span>Speed +0.5x/-0.5x</span>
            <span>+ / -</span>
          </div>
          <div className="flex justify-between">
            <span>Speed +0.1x/-0.1x</span>
            <span>] / [</span>
          </div>
          <div className="flex justify-between">
            <span>Skip 10s</span>
            <span>← →</span>
          </div>
          <div className="flex justify-between">
            <span>Volume</span>
            <span>↑ ↓</span>
          </div>
          <div className="flex justify-between">
            <span>Subtitle delay +100ms/-100ms</span>
            <span>K / H</span>
          </div>
          <div className="flex justify-between">
            <span>Subtitle delay +1s/-1s</span>
            <span>J / G</span>
          </div>
          <div className="flex justify-between">
            <span>Subtitle delay +10ms/-10ms</span>
            <span>. / ,</span>
          </div>
          <div className="flex justify-between">
            <span>Fullscreen</span>
            <span>F</span>
          </div>
          <div className="flex justify-between">
            <span>Mute</span>
            <span>M</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-gray-300">FEATURES</h3>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-vlc-orange rounded-full"></span>
            <span>Video duration display with remaining time toggle</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-vlc-orange rounded-full"></span>
            <span>Instant seeking with smooth progress bar</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-vlc-orange rounded-full"></span>
            <span>Playback speed control (0.25x to 4x)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-vlc-orange rounded-full"></span>
            <span>Aspect ratio adjustment options</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-vlc-orange rounded-full"></span>
            <span>Auto-save video position & settings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-vlc-orange rounded-full"></span>
            <span>Subtitle sync with delay adjustment</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-vlc-orange rounded-full"></span>
            <span>Keyboard shortcuts (Space, ←/→, F, M)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-vlc-orange rounded-full"></span>
            <span>Fullscreen mode with auto-hide controls</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-vlc-orange rounded-full"></span>
            <span>Local file support (MP4, MKV, AVI, MOV)</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
