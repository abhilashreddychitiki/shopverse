import { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth-guard';

export const metadata: Metadata = {
  title: 'User Details',
};

const UserDetailsPage = async ({ params }: { params: { id: string } }) => {
  await requireAdmin();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Details</h1>
      <p>User ID: {params.id}</p>
      <p>User details page coming soon...</p>
    </div>
  );
};

export default UserDetailsPage;
