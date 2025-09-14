import { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient'; // Import the new client component
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// This function tells Next.js to pre-build a page for every product.
export async function generateStaticParams() {
  // Fetch all IDs from both the Systems and products collections
  const systemsRef = collection(db, 'Systems');
  const productsRef = collection(db, 'products');

  const systemsSnapshot = await getDocs(systemsRef);
  const productsSnapshot = await getDocs(productsRef);

  const systemsIds = systemsSnapshot.docs.map(doc => ({ id: doc.id }));
  const productsIds = productsSnapshot.docs.map(doc => ({ id: doc.id }));

  // Combine them into one list for Next.js
  return [...systemsIds, ...productsIds];
}

// This is the main page component, now a Server Component.
export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Product...</div>}>
      <ProductDetailClient />
    </Suspense>
  );
}

