import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";

export const metadata: Metadata = {
  title: "Admin Users",
};

const AdminUsersPage = async () => {
  await requireAdmin();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users Management</h1>
      <p>Users management page coming soon...</p>
    </div>
  );
};

export default AdminUsersPage;
