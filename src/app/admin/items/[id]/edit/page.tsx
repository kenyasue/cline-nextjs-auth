"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Image from "next/image";

interface FormData {
  name: string;
  description: string;
  price: string;
}

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

export default function EditItemPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<string>("image");
  const [mediaError, setMediaError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/items/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/admin/login");
            return;
          }
          if (response.status === 404) {
            router.push("/admin/items");
            return;
          }
          throw new Error("Failed to fetch item");
        }
        
        const data = await response.json();
        setItem(data);
        setValue("name", data.name);
        setValue("description", data.description);
        setValue("price", data.price.toString());
      } catch (err) {
        console.error("Error fetching item:", err);
        setError("Error loading item. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [params.id, router, setValue]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError(null);
    
    try {
      const updateData: { name?: string; description?: string; price?: number } = {};
      
      if (data.name !== item?.name) {
        updateData.name = data.name;
      }
      
      if (data.description !== item?.description) {
        updateData.description = data.description;
      }
      
      if (parseFloat(data.price) !== item?.price) {
        updateData.price = parseFloat(data.price);
      }
      
      // Only make the API call if there are changes
      if (Object.keys(updateData).length > 0) {
        const response = await fetch(`/api/items/${params.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update item");
        }
        
        const updatedItem = await response.json();
        setItem(updatedItem);
      }
      
      router.push("/admin/items");
    } catch (err: any) {
      console.error("Error updating item:", err);
      setError(err.message || "Failed to update item. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
      setMediaError(null);
    }
  };

  const uploadMedia = async () => {
    if (!mediaFile) {
      setMediaError("Please select a file to upload");
      return;
    }
    
    setUploadingMedia(true);
    setMediaError(null);
    
    try {
      const formData = new FormData();
      formData.append("file", mediaFile);
      formData.append("fileType", mediaType);
      
      const response = await fetch(`/api/items/${params.id}/media`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload media");
      }
      
      // Refresh item data to show the new media
      const itemResponse = await fetch(`/api/items/${params.id}`);
      if (!itemResponse.ok) {
        throw new Error("Failed to refresh item data");
      }
      
      const updatedItem = await itemResponse.json();
      setItem(updatedItem);
      
      // Reset form
      setMediaFile(null);
      const fileInput = document.getElementById("media") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      console.error("Error uploading media:", err);
      setMediaError(err.message || "Failed to upload media. Please try again.");
    } finally {
      setUploadingMedia(false);
    }
  };

  const deleteMedia = async (mediaId: number) => {
    if (!confirm("Are you sure you want to delete this media?")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/items/${params.id}/media?mediaId=${mediaId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete media");
      }
      
      // Update the item state by removing the deleted media
      if (item) {
        setItem({
          ...item,
          media: item.media.filter(m => m.id !== mediaId),
        });
      }
    } catch (err) {
      console.error("Error deleting media:", err);
      alert("Failed to delete media. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700">Item not found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Item</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        {error && (
          <div className="mb-4 bg-red-50 p-4 rounded-md">
            <div className="text-red-700">{error}</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={saving}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              {...register("description", {
                required: "Description is required",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={saving}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register("price", {
                  required: "Price is required",
                  min: {
                    value: 0,
                    message: "Price must be a positive number",
                  },
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: "Price must be a valid number with up to 2 decimal places",
                  },
                })}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                disabled={saving}
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">
                {errors.price.message}
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Media Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Media Files</h2>
        
        {/* Upload Form */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-md font-medium text-gray-700 mb-3">Upload New Media</h3>
          
          {mediaError && (
            <div className="mb-4 bg-red-50 p-3 rounded-md">
              <div className="text-red-700 text-sm">{mediaError}</div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="mediaType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Media Type
              </label>
              <select
                id="mediaType"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                disabled={uploadingMedia}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            
            <div>
              <label
                htmlFor="media"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                File
              </label>
              <input
                id="media"
                type="file"
                onChange={handleMediaChange}
                accept={mediaType === "image" ? "image/*" : "video/*"}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                disabled={uploadingMedia}
              />
            </div>
          </div>
          
          <div className="mt-3">
            <button
              type="button"
              onClick={uploadMedia}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              disabled={uploadingMedia || !mediaFile}
            >
              {uploadingMedia ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
        
        {/* Media Gallery */}
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3">Media Gallery</h3>
          
          {item.media.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              No media files yet. Upload some using the form above.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {item.media.map((media) => (
                <div key={media.id} className="border rounded-md overflow-hidden bg-gray-50">
                  <div className="h-40 relative">
                    {media.filetype === "image" ? (
                      <Image
                        src={media.filename}
                        alt={`Item media ${media.id}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-200">
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
                  </div>
                  <div className="p-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500 capitalize">
                        {media.filetype}
                      </span>
                      <button
                        onClick={() => deleteMedia(media.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
