import { useEffect, useState } from "react";
import { useSubtitles } from "@/hooks/useSubtitles";
import type { SubtitleFile } from "@shared/schema";

interface SubtitleOverlayProps {
  subtitle: SubtitleFile | null;
  currentTime: number;
  subtitleDelay: number;
  subtitleSize: number;
  playbackRate?: number;
}

export default function SubtitleOverlay({
  subtitle,
  currentTime,
  subtitleDelay,
  subtitleSize,
  playbackRate = 1,
}: SubtitleOverlayProps) {
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");
  const { parseSubtitles, getCurrentSubtitle } = useSubtitles();

  useEffect(() => {
    if (subtitle && subtitle.content) {
      const parsedSubtitles = parseSubtitles(subtitle.content, subtitle.format);
      // More precise timing calculation with subtitle delay
      const videoTimeMs = currentTime * 1000; // Convert to milliseconds
      const adjustedTime = videoTimeMs + subtitleDelay; // Apply delay
      const current = getCurrentSubtitle(parsedSubtitles, adjustedTime);
      setCurrentSubtitle(current);
    } else {
      setCurrentSubtitle("");
    }
  }, [subtitle, currentTime, subtitleDelay, playbackRate, parseSubtitles, getCurrentSubtitle]);

  if (!currentSubtitle) {
    return null;
  }

  return (
    <div
      className="subtitle-overlay absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center px-4 max-w-3xl"
      style={{
        fontSize: `${subtitleSize}px`,
        textShadow: '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 2px rgba(0,0,0,0.8)',
        lineHeight: '1.4',
        color: 'white',
        fontWeight: '500',
        zIndex: 10,
      }}
      dangerouslySetInnerHTML={{ __html: currentSubtitle }}
    />
  );
}
