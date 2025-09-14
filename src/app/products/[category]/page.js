import { Suspense } from 'react';
import ProductPageContent from './ProductPageClient'; // Import the new client component

// This function tells Next.js which pages to build. It can now exist
// in this file because we have removed "use client".
export async function generateStaticParams() {
  // This will pre-build the /products/Systems and /products/Parts pages.
  return [{ category: 'Systems' }, { category: 'Parts' }];
}

// This is the main page component. It's now a Server Component.
export default function ProductsPage() {
  // It renders the client component, wrapped in Suspense for best practice.
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Page...</div>}>
      <ProductPageContent />
    </Suspense>
  );
}




