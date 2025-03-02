"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MediaItem from "@/components/MediaItem";
import Lightbox from "@/components/Lightbox";

interface ItemMedia {
  id: number;
  item_id: number;
  filename: string;
  filetype: string;
  created_at: string;
  modified_at: string;
}

interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: string;
  modified_at: string;
  media: ItemMedia[];
}

export default function ItemDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<ItemMedia | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/public/items/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/");
            return;
          }
          throw new Error("Failed to fetch item");
        }
        
        const data = await response.json();
        setItem(data);
        
        // Set the first image as active media if available
        if (data.media && data.media.length > 0) {
          const firstImage = data.media.find((m: ItemMedia) => m.filetype === "image") || data.media[0];
          setActiveMedia(firstImage);
        }
      } catch (err) {
        console.error("Error fetching item:", err);
        setError("Error loading item. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-4 rounded-md">
          <div className="text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  // If no item data yet, show placeholder
  const displayItem = item || {
    id: parseInt(params.id),
    name: "Premium Wireless Headphones",
    description: "Experience crystal-clear sound with our premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and ultra-comfortable ear cushions, these headphones are perfect for music lovers and professionals alike. The sleek design and premium materials ensure durability and style, while the advanced Bluetooth technology provides seamless connectivity with all your devices.",
    price: 199.99,
    created_at: new Date().toISOString(),
    modified_at: new Date().toISOString(),
    media: []
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="text-primary-600 hover:text-primary-800">
          &larr; Back to Products
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Media Gallery */}
          <div className="md:w-1/2 p-4">
            <div className="mb-4 bg-gray-100 rounded-lg overflow-hidden relative" style={{ height: "400px" }}>
              {activeMedia ? (
                <MediaItem
                  media={activeMedia}
                  alt={displayItem.name}
                  aspectRatio="auto"
                  className="h-full"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-20 w-20 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {displayItem.media.length > 0 ? (
              <div className="grid grid-cols-5 gap-2">
                {displayItem.media.map((media) => (
                  <div
                    key={media.id}
                    className={`h-16 bg-gray-100 rounded cursor-pointer relative ${
                      activeMedia?.id === media.id ? "ring-2 ring-primary-500" : ""
                    }`}
                    onClick={() => setActiveMedia(media)}
                  >
                    {media.filetype === "image" ? (
                      <Image
                        src={media.filename}
                        alt={`Thumbnail ${media.id}`}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="relative h-full w-full">
                        <Image
                          src={`/api/items/${params.id}/media/thumbnail?mediaId=${media.id}`}
                          alt={`Video thumbnail ${media.id}`}
                          fill
                          className="object-cover rounded"
                          onError={(e) => {
                            // Fallback if thumbnail fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="h-full w-full flex items-center justify-center bg-gray-200 rounded">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="h-6 w-6 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                    />
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="2"
                                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black bg-opacity-30 rounded-full p-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-white"
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
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm mt-4">
                No media available for this product
              </div>
            )}
          </div>
          
          {/* Item Details */}
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayItem.name}</h1>
            <div className="text-2xl text-primary-600 font-bold mb-4">
              ${displayItem.price.toFixed(2)}
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{displayItem.description}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Details</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>High-quality materials</li>
                <li>Durable construction</li>
                <li>30-day money-back guarantee</li>
                <li>1-year warranty</li>
              </ul>
            </div>
            
            <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      
      {/* Related Products Section (Placeholder) */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">You May Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 relative"></div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Related Product {i}</h3>
                <p className="text-gray-600 text-sm mb-2">Brief description of the related product.</p>
                <div className="text-primary-600 font-bold">${(19.99 * i).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
