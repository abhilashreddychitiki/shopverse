import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { getUserById } from "@/lib/actions/user.actions";
import UserForm from "./user-form";

export const metadata: Metadata = {
  title: "Update User",
};

const UpdateUserPage = async (props: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const params = await props.params;
  const { id } = params;

  const user = await getUserById(id);

  if (!user) return notFound();

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <h1 className="h2-bold">Update User</h1>
      <UserForm user={user} />
    </div>
  );
};

export default UpdateUserPage;
