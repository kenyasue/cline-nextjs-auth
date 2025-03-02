"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                Simple Shop
              </Link>
            </div>
            <nav className="ml-6 flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === "/"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-700 hover:text-primary-600"
                }`}
              >
                Home
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <Link
              href="/admin"
              className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
