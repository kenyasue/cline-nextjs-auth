import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all items for public display
export async function GET() {
  try {
    const items = await prisma.item.findMany({
      include: {
        media: true,
      },
    });
    
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching public items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
