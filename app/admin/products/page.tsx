import { Metadata } from "next";
import { requireAdmin } from "@/lib/auth-guard";

export const metadata: Metadata = {
  title: "Admin Products",
};

const AdminProductsPage = async () => {
  await requireAdmin();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products Management</h1>
      <p>Products management page coming soon...</p>
    </div>
  );
};

export default AdminProductsPage;
