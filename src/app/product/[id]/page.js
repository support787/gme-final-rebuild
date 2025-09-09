// src/app/product/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../../lib/AuthContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;
  const { isAdmin } = useAuth();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setIsLoading(true);
      const collectionsToTry = ['Systems', 'products'];
      let foundProduct = null;

      for (const collectionName of collectionsToTry) {
        const docRef = doc(db, collectionName, productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const imageUrl = data.IMAGES || data.IMAGE;
          foundProduct = {
            id: docSnap.id,
            modality: data.MODALITY || data.MODELITY,
            brand: data.MANUFACTURER || data.BRAND,
            description: data.DESCRIPTION,
            image: imageUrl && imageUrl.startsWith('http') ? imageUrl : null,
            comments: data.COMMENT || data.COMMENTS
          };
          break;
        }
      }
      
      setProduct(foundProduct);
      if (foundProduct?.image) {
          const imageList = foundProduct.image.includes(';') ? foundProduct.image.split(';') : [foundProduct.image];
          setCurrentImage(imageList[0]);
      }
      setIsLoading(false);
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return <div className="text-center py-20">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-20">Product not found.</div>;
  }

  const imageList = product.image ? (product.image.includes(';') ? product.image.split(';') : [product.image]) : [];
  const displayComments = product.comments && !product.comments.startsWith('http') ? product.comments : 'No comments.';

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-6">
        <button onClick={() => router.back()} className="text-teal-600 hover:underline mb-8 inline-block">
          ← Back to previous page
        </button>
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* --- THIS IS THE FIX: Only show image column if an image exists --- */}
          {product.image && (
            <div className="md:w-1/2">
              <div className="mb-4">
                <Image 
                  src={currentImage}
                  alt={product.description} 
                  width={800} height={600} 
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              {imageList.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {imageList.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      width={200} height={150}
                      className={`w-full h-20 object-cover rounded-md cursor-pointer border-2 ${currentImage === img ? 'border-teal-500' : 'border-transparent'}`}
                      onClick={() => setCurrentImage(img)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Use full width if no image, otherwise half width */}
          <div className={product.image ? "md:w-1/2" : "w-full"}>
            <p className="text-lg text-gray-500">{product.modality} {product.brand ? `/ ${product.brand}` : ''}</p>
            <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">{product.description}</h1>
            <p className="text-gray-700 text-lg my-6">This is a high-quality, pre-owned piece of equipment. It has been professionally tested and refurbished by our certified engineers to meet original manufacturer specifications. It is available for immediate worldwide shipping. Please contact us for a detailed quote, service history, and any further information.</p>
            
            <Link 
                href={`/contact?subject=Quote Request: ${encodeURIComponent(product.description)}`}
                className="bg-teal-600 text-white font-bold py-4 px-8 rounded-full hover:bg-teal-700 transition duration-300 text-lg inline-block"
            >
                Request a Quote
            </Link>
            
            {isAdmin && (
                 <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <h3 className="text-xl font-bold text-yellow-800 mb-2">Internal Admin Notes</h3>
                    <div className="text-yellow-700">
                        <p><strong className="font-semibold">Comments:</strong> {displayComments}</p>
                    </div>
                    <div className="mt-4 flex space-x-4">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Edit Product</button>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Delete Product</button>
                    </div>
                </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}