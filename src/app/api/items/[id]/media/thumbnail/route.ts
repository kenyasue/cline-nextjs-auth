import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { writeFile, mkdir } from "fs/promises";

const prisma = new PrismaClient();

// GET video thumbnail
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(request.url);
    const mediaId = url.searchParams.get("mediaId");
    
    if (!mediaId) {
      return NextResponse.json(
        { error: "Media ID is required" },
        { status: 400 }
      );
    }
    
    const itemId = parseInt(params.id);
    const mediaIdInt = parseInt(mediaId);
    
    if (isNaN(itemId) || isNaN(mediaIdInt)) {
      return NextResponse.json(
        { error: "Invalid item ID or media ID" },
        { status: 400 }
      );
    }
    
    // Get media info
    const media = await prisma.itemMedia.findFirst({
      where: {
        id: mediaIdInt,
        item_id: itemId,
      },
    });
    
    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }
    
    // Only process videos
    if (media.filetype !== "video") {
      return NextResponse.json(
        { error: "Media is not a video" },
        { status: 400 }
      );
    }
    
    // Check if thumbnail already exists
    const videoPath = path.join(process.cwd(), "public", media.filename.substring(1));
    const thumbnailDir = path.join(process.cwd(), "public/uploads/thumbnails");
    const thumbnailFilename = `thumbnail-${media.id}.jpg`;
    const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
    const publicThumbnailPath = `/uploads/thumbnails/${thumbnailFilename}`;
    
    // Create thumbnails directory if it doesn't exist
    await mkdir(thumbnailDir, { recursive: true });
    
    // If thumbnail exists and is newer than video, return it
    if (fs.existsSync(thumbnailPath)) {
      const videoStats = fs.statSync(videoPath);
      const thumbnailStats = fs.statSync(thumbnailPath);
      
      if (thumbnailStats.mtime > videoStats.mtime) {
        // Redirect to the thumbnail
        return NextResponse.redirect(new URL(publicThumbnailPath, request.url));
      }
    }
    
    // Generate thumbnail using ffmpeg
    try {
      await new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
          "-i", videoPath,
          "-ss", "00:00:01", // Take frame from 1 second in
          "-vframes", "1",
          "-q:v", "2", // High quality
          thumbnailPath
        ]);
        
        ffmpeg.on("close", (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`FFmpeg process exited with code ${code}`));
          }
        });
        
        ffmpeg.on("error", (err) => {
          reject(err);
        });
      });
      
      // Redirect to the thumbnail
      return NextResponse.redirect(new URL(publicThumbnailPath, request.url));
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      
      // If ffmpeg fails, return a placeholder image or error
      return NextResponse.json(
        { error: "Failed to generate thumbnail" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing thumbnail request:", error);
    return NextResponse.json(
      { error: "Failed to process thumbnail request" },
      { status: 500 }
    );
  }
}
