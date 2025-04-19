import { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth-guard';

export const metadata: Metadata = {
  title: 'Edit Product',
};

const EditProductPage = async ({ params }: { params: { id: string } }) => {
  await requireAdmin();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <p>Product ID: {params.id}</p>
      <p>Edit product page coming soon...</p>
    </div>
  );
};

export default EditProductPage;
