import { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// --- NEW SEO LOGIC STARTS HERE ---
// This function runs on the server before the page loads to generate the title.
export async function generateMetadata({ params }) {
  const productId = params.id;
  
  // We need to fetch the product data here on the server to build the title
  let productData = null;
  const collections = ['Systems', 'products'];
  
  // Try to find the product in either collection
  for (const col of collections) {
    try {
      const docRef = doc(db, col, productId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        productData = docSnap.data();
        break;
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  }

  // If no product found, return a generic title
  if (!productData) {
    return {
      title: 'Product Details | Grand Medical Equipment',
    }
  }

  // Build the dynamic variables
  const description = productData.DESCRIPTION || 'Medical Equipment';
  const manufacturer = productData.MANUFACTURER || productData.BRAND || '';
  const modality = productData.MODALITY || productData.MODELITY || '';

  // Return the optimized "For Sale" title and description
  return {
    title: `${manufacturer} ${description} - For Sale | Grand Medical`,
    description: `Buy used ${manufacturer} ${description}. Quality refurbished ${modality} available now. Contact Grand Medical Equipment for pricing and shipping.`,
  }
}
// --- NEW SEO LOGIC ENDS HERE ---


// Your existing component remains exactly the same
export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading Product...</div>}>
      <ProductDetailClient />
    </Suspense>
  );
}


