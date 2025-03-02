"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface VideoThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  autoplay?: boolean;
}

export default function VideoThumbnail({
  src,
  alt,
  className = "",
  onClick,
  autoplay = false,
}: VideoThumbnailProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate thumbnail from video
  useEffect(() => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = src;
    video.muted = true;
    
    // Try to seek to the middle of the video for a better thumbnail
    video.addEventListener("loadedmetadata", () => {
      video.currentTime = video.duration / 2;
    });
    
    video.addEventListener("seeked", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailDataUrl = canvas.toDataURL("image/jpeg");
        setThumbnailUrl(thumbnailDataUrl);
      }
      
      // Clean up
      video.remove();
    });
    
    // Handle errors
    video.addEventListener("error", () => {
      console.error("Error generating video thumbnail");
      setThumbnailUrl(null);
    });
    
    // Start loading the video
    video.load();
    
    return () => {
      video.remove();
    };
  }, [src]);

  // Handle hover to play
  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement) {
      if (isHovering || autoplay) {
        videoElement.play().catch(err => {
          console.error("Error playing video:", err);
        });
      } else {
        videoElement.pause();
        if (canvasRef.current && thumbnailUrl) {
          // Reset to thumbnail when not hovering
          videoElement.currentTime = 0;
        }
      }
    }
  }, [isHovering, autoplay, thumbnailUrl]);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onClick}
    >
      {/* Hidden canvas for thumbnail generation */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        loop
        className={`absolute inset-0 w-full h-full object-cover ${
          isHovering || autoplay ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
      />
      
      {/* Thumbnail image */}
      {thumbnailUrl ? (
        <div className={`absolute inset-0 ${isHovering || autoplay ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}>
          <Image
            src={thumbnailUrl}
            alt={alt}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className={`absolute inset-0 flex items-center justify-center bg-gray-200 ${isHovering || autoplay ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )}
      
      {/* Play button overlay */}
      <div className={`absolute inset-0 flex items-center justify-center ${isHovering || autoplay ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}>
        <div className="bg-black bg-opacity-30 rounded-full p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
