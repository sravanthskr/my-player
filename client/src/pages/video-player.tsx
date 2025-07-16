import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import VideoPlayer from "@/components/video-player/VideoPlayer";
import Sidebar from "@/components/video-player/Sidebar";
import { Play } from "lucide-react";
import type { VideoFile, SubtitleFile } from "@shared/schema";
import { savePlayerState, loadPlayerState, saveVideoSettings, loadVideoSettings } from "@/lib/storage";

export default function VideoPlayerPage() {
  const [currentVideo, setCurrentVideo] = useState<VideoFile | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleFile | null>(null);
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [subtitles, setSubtitles] = useState<SubtitleFile[]>([]);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(70);
  const [showTimeRemaining, setShowTimeRemaining] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("default");
  const [subtitleDelay, setSubtitleDelay] = useState(0);
  const [subtitleSize, setSubtitleSize] = useState(20);

  // Add functions to manage local video and subtitle lists
  const addVideo = (video: VideoFile) => {
    setVideos(prev => [...prev, video]);
  };

  const addSubtitle = (subtitle: SubtitleFile) => {
    setSubtitles(prev => [...prev, subtitle]);
  };

  // Load saved state on component mount
  useEffect(() => {
    const savedState = loadPlayerState();
    if (savedState) {
      setPlaybackRate(savedState.playbackRate);
      setVolume(savedState.volume);
      setShowTimeRemaining(savedState.showTimeRemaining);
      
      // If there's a current video, load its settings
      if (savedState.currentVideoId && currentVideo?.id === savedState.currentVideoId) {
        const videoSettings = loadVideoSettings(savedState.currentVideoId);
        if (videoSettings) {
          // Video position will be restored in VideoPlayer component
        }
      }
    }
  }, []);

  // Save state when important settings change
  useEffect(() => {
    if (currentVideo) {
      savePlayerState({
        currentVideoId: currentVideo.id,
        currentSubtitleId: currentSubtitle?.id || null,
        playbackRate,
        volume,
        showTimeRemaining,
        videoPosition: 0, // Will be updated by VideoPlayer
        lastPlayed: new Date().toISOString()
      });
    }
  }, [currentVideo, currentSubtitle, playbackRate, volume, showTimeRemaining]);

  // Enhanced video selection that restores position
  const handleVideoSelect = (video: VideoFile) => {
    setCurrentVideo(video);
    
    // Load saved settings for this video
    const videoSettings = loadVideoSettings(video.id);
    if (videoSettings) {
      setPlaybackRate(videoSettings.playbackRate);
      if (videoSettings.subtitle) {
        const subtitle = subtitles.find(s => s.id === videoSettings.subtitle);
        if (subtitle) {
          setCurrentSubtitle(subtitle);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-vlc-dark text-white">
      {/* Header */}
      <header className="vlc-surface border-b border-vlc-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Play className="text-vlc-orange" size={24} />
            <h1 className="text-xl font-semibold">Video Player</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white transition-colors">
              <i className="fas fa-cog"></i>
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <i className="fas fa-question-circle"></i>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        <Sidebar
          videos={videos}
          subtitles={subtitles}
          currentVideo={currentVideo}
          currentSubtitle={currentSubtitle}
          onVideoSelect={handleVideoSelect}
          onSubtitleSelect={setCurrentSubtitle}
          onVideoAdd={addVideo}
          onSubtitleAdd={addSubtitle}
          playbackRate={playbackRate}
          onPlaybackRateChange={setPlaybackRate}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          subtitleDelay={subtitleDelay}
          onSubtitleDelayChange={setSubtitleDelay}
          subtitleSize={subtitleSize}
          onSubtitleSizeChange={setSubtitleSize}
        />
        
        <main className="flex-1 flex flex-col">
          <VideoPlayer
            video={currentVideo}
            subtitle={currentSubtitle}
            videos={videos}
            subtitles={subtitles}
            playbackRate={playbackRate}
            onPlaybackRateChange={setPlaybackRate}
            aspectRatio={aspectRatio}
            subtitleDelay={subtitleDelay}
            onSubtitleDelayChange={setSubtitleDelay}
            subtitleSize={subtitleSize}
            onSubtitleSizeChange={setSubtitleSize}
          />
        </main>
      </div>
    </div>
  );
}
