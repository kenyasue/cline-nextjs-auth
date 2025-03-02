"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Image from "next/image";

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
}

interface User {
  id: number;
  username: string;
  avatar: string | null;
  created_at: string;
  modified_at: string;
}

export default function EditUserPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>();
  
  const password = watch("password");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/admin/login");
            return;
          }
          if (response.status === 404) {
            router.push("/admin/users");
            return;
          }
          throw new Error("Failed to fetch user");
        }
        
        const data = await response.json();
        setUser(data);
        setValue("username", data.username);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Error loading user. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id, router, setValue]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    setError(null);
    
    try {
      const updateData: { username?: string; password?: string } = {};
      
      if (data.username !== user?.username) {
        updateData.username = data.username;
      }
      
      if (data.password) {
        updateData.password = data.password;
      }
      
      // Only make the API call if there are changes
      if (Object.keys(updateData).length > 0) {
        const response = await fetch(`/api/users/${params.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update user");
        }
        
        const updatedUser = await response.json();
        setUser(updatedUser);
      }
      
      router.push("/admin/users");
    } catch (err: any) {
      console.error("Error updating user:", err);
      setError(err.message || "Failed to update user. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    
    setUploadingAvatar(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      
      const response = await fetch(`/api/users/${params.id}/avatar`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload avatar");
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // Reset the file input
      const fileInput = document.getElementById("avatar") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      console.error("Error uploading avatar:", err);
      setError(err.message || "Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700">User not found</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit User</h1>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {error && (
          <div className="mb-4 bg-red-50 p-4 rounded-md">
            <div className="text-red-700">{error}</div>
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Avatar</h2>
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {avatarPreview ? (
                <div className="h-24 w-24 rounded-full overflow-hidden">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : user.avatar ? (
                <div className="h-24 w-24 rounded-full overflow-hidden">
                  <Image
                    src={user.avatar}
                    alt={user.username}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                disabled={uploadingAvatar}
              />
              {avatarFile && (
                <button
                  type="button"
                  onClick={uploadAvatar}
                  className="mt-2 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? "Uploading..." : "Upload Avatar"}
                </button>
              )}
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={saving}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password (leave blank to keep current)
            </label>
            <input
              id="password"
              type="password"
              {...register("password", {
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={saving}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword", {
                validate: (value) =>
                  !password || value === password || "Passwords do not match",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              disabled={saving}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
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
    </div>
  );
}
