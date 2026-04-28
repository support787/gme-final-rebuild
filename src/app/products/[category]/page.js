// This forces Next.js to NEVER cache this page, always fetching fresh from the server
export const dynamic = 'force-dynamic'; 

import { Suspense } from 'react';
import ProductPageContent from './ProductPageClient'; 

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Page...</div>}>
      <ProductPageContent />
    </Suspense>
  );
}