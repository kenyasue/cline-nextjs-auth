"use client";

import { useState } from "react";
import Image from "next/image";
import VideoThumbnail from "./VideoThumbnail";
import Lightbox from "./Lightbox";

interface MediaItemProps {
  media: {
    id: number;
    filename: string;
    filetype: string;
  };
  alt: string;
  className?: string;
  aspectRatio?: "square" | "video" | "auto";
  enableLightbox?: boolean;
}

export default function MediaItem({
  media,
  alt,
  className = "",
  aspectRatio = "square",
  enableLightbox = true,
}: MediaItemProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const aspectRatioClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  };

  const handleMediaClick = () => {
    if (enableLightbox) {
      setLightboxOpen(true);
    }
  };

  return (
    <>
      <div 
        className={`relative overflow-hidden ${aspectRatioClasses[aspectRatio]} ${className} ${enableLightbox ? "cursor-pointer" : ""}`}
      >
        {media.filetype === "image" ? (
          <Image
            src={media.filename}
            alt={alt}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            onClick={handleMediaClick}
          />
        ) : (
          <VideoThumbnail
            src={media.filename}
            alt={alt}
            className="h-full w-full"
            onClick={handleMediaClick}
          />
        )}
      </div>

      {enableLightbox && (
        <Lightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          media={media}
        />
      )}
    </>
  );
}
