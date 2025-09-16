import { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// UPDATED: This function is now more robust to prevent build failures.
export async function generateStaticParams() {
  console.log('Attempting to generate static params for product pages...');
  try {
    const systemsRef = collection(db, 'Systems');
    const productsRef = collection(db, 'products');

    const [systemsSnapshot, productsSnapshot] = await Promise.all([
      getDocs(systemsRef),
      getDocs(productsRef)
    ]);

    const systemsIds = systemsSnapshot.docs.map(doc => ({ id: doc.id }));
    const productsIds = productsSnapshot.docs.map(doc => ({ id: doc.id }));

    console.log(`Found ${systemsIds.length} systems to build.`);
    console.log(`Found ${productsIds.length} parts to build.`);

    const allIds = [...systemsIds, ...productsIds];
    
    if (allIds.length === 0) {
      console.warn('Warning: No products or systems found to pre-build. This might be expected if the database is empty.');
      // Return a dummy param to prevent build failure on empty data
      return [{ id: 'no-products' }]; 
    }

    return allIds;

  } catch (error) {
    console.error('CRITICAL ERROR during generateStaticParams:', error);
    // If there's an error, return an empty array to prevent the build from crashing.
    return [];
  }
}

// This is the main page component. It's a Server Component.
export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Product...</div>}>
      <ProductDetailClient />
    </Suspense>
  );
}


