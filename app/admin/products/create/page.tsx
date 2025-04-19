import { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth-guard';

export const metadata: Metadata = {
  title: 'Create Product',
};

const CreateProductPage = async () => {
  await requireAdmin();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create Product</h1>
      <p>Create product page coming soon...</p>
    </div>
  );
};

export default CreateProductPage;
