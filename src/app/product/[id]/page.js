import { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';

// By REMOVING the generateStaticParams function, we are telling Next.js
// to no longer pre-build every single product page. Instead, these pages
// will be generated on-demand when a user visits them for the first time.
// This significantly reduces the work required during the build process,
// preventing timeouts and build failures.

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Product...</div>}>
      <ProductDetailClient />
    </Suspense>
  );
}



