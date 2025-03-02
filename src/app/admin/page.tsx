import { redirect } from "next/navigation";

export default function AdminDashboard() {
  // Redirect to users page as that's our main feature
  redirect("/admin/users");
}
