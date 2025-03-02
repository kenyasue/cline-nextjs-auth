import { redirect } from "next/navigation";

export default function AdminDashboard() {
  // Redirect to items page as that's our main feature
  redirect("/admin/items");
}
