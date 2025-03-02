"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserIcon } from "@/components/icons/UserIcon";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <div className="bg-primary-800 text-white w-64 flex-shrink-0 hidden md:block">
      <div className="p-4">
        <h2 className="text-2xl font-semibold">Simple CMS</h2>
      </div>
      <nav className="mt-8">
        <ul>
          <li>
            <Link
              href="/admin/users"
              className={`flex items-center px-4 py-3 hover:bg-primary-700 ${
                isActive("/admin/users") ? "bg-primary-700" : ""
              }`}
            >
              <UserIcon className="w-5 h-5 mr-3" />
              <span>Users</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
