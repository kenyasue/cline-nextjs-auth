import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// POST upload media for an item
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid item ID" },
        { status: 400 }
      );
    }
    
    // Check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id },
    });
    
    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as string;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }
    
    if (!fileType || !["image", "video"].includes(fileType)) {
      return NextResponse.json(
        { error: "Invalid file type. Must be 'image' or 'video'." },
        { status: 400 }
      );
    }
    
    // Validate file type based on fileType
    if (fileType === "image") {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid image format. Only JPEG, PNG, GIF, and WebP are allowed." },
          { status: 400 }
        );
      }
    } else if (fileType === "video") {
      const validTypes = ["video/mp4", "video/webm", "video/ogg"];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid video format. Only MP4, WebM, and OGG are allowed." },
          { status: 400 }
        );
      }
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public/uploads/items");
    await mkdir(uploadsDir, { recursive: true });
    
    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const fileName = `item-${id}-${Date.now()}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);
    
    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    // Create media record in database
    const media = await prisma.itemMedia.create({
      data: {
        item_id: id,
        filename: `/uploads/items/${fileName}`,
        filetype: fileType,
      },
    });
    
    return NextResponse.json(media);
  } catch (error) {
    console.error("Error uploading media:", error);
    return NextResponse.json(
      { error: "Failed to upload media" },
      { status: 500 }
    );
  }
}

// DELETE a media file
export async function DELETE(
  request: NextRequest,
  { params, searchParams }: { params: { id: string }; searchParams: URLSearchParams }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const itemId = parseInt(params.id);
    const url = new URL(request.url);
    const mediaId = parseInt(url.searchParams.get("mediaId") || "");
    
    if (isNaN(itemId) || isNaN(mediaId)) {
      return NextResponse.json(
        { error: "Invalid item ID or media ID" },
        { status: 400 }
      );
    }
    
    // Check if media exists and belongs to the item
    const media = await prisma.itemMedia.findFirst({
      where: {
        id: mediaId,
        item_id: itemId,
      },
    });
    
    if (!media) {
      return NextResponse.json(
        { error: "Media not found or does not belong to this item" },
        { status: 404 }
      );
    }
    
    // Delete media record
    await prisma.itemMedia.delete({
      where: {
        id: mediaId,
      },
    });
    
    // Note: We're not deleting the actual file from the filesystem to keep this example simpler
    // In a production app, you would also delete the file from the filesystem
    
    return NextResponse.json(
      { message: "Media deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
