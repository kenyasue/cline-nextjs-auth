"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/public/items");
        
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError("Error loading items. Please try again.");
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const getFirstImage = (item: Item) => {
    const imageMedia = item.media.find((m: ItemMedia) => m.filetype === "image");
    return imageMedia ? imageMedia.filename : null;
  };

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

  // If no items, show placeholder items
  const displayItems = items.length > 0 ? items : [
    {
      id: 1,
      name: "Premium Headphones",
      description: "High-quality wireless headphones with noise cancellation.",
      price: 199.99,
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      media: []
    },
    {
      id: 2,
      name: "Smartphone Stand",
      description: "Adjustable aluminum stand for smartphones and tablets.",
      price: 29.99,
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      media: []
    },
    {
      id: 3,
      name: "Wireless Charger",
      description: "Fast wireless charging pad compatible with all Qi-enabled devices.",
      price: 49.99,
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      media: []
    },
    {
      id: 4,
      name: "Bluetooth Speaker",
      description: "Portable waterproof speaker with 20-hour battery life.",
      price: 79.99,
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      media: []
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h1>
        <p className="text-gray-600">Discover our latest and most popular items</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayItems.map((item) => (
          <Link key={item.id} href={`/items/${item.id}`}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 bg-gray-200 relative">
                {getFirstImage(item) ? (
                  <Image
                    src={getFirstImage(item)!}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-gray-400"
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
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h2>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-primary-600 font-bold">${item.price.toFixed(2)}</span>
                  <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                    {item.media.length} media
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
