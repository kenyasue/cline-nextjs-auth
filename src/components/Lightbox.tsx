"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  media: {
    id: number;
    filename: string;
    filetype: string;
  };
}

export default function Lightbox({ isOpen, onClose, media }: LightboxProps) {
  const [isClosing, setIsClosing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleOverlayClick}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        <button
          onClick={handleClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 focus:outline-none"
          aria-label="Close lightbox"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="bg-black rounded-lg overflow-hidden">
          {media.filetype === "image" ? (
            <div className="relative w-full h-[80vh]">
              <Image
                src={media.filename}
                alt="Lightbox image"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </div>
          ) : (
            <div className="relative w-full h-[80vh] flex items-center justify-center">
              <video
                ref={videoRef}
                src={media.filename}
                className="max-w-full max-h-full"
                controls
                autoPlay
                playsInline
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
