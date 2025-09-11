// src/app/product/[id]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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
  
  // State for editing functionality
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState(null);

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
            type: collectionName === 'Systems' ? 'system' : 'part',
            modality: data.MODALITY || data.MODELITY,
            brand: data.MANUFACTURER || data.BRAND,
            description: data.DESCRIPTION,
            image: imageUrl && imageUrl.startsWith('http') ? imageUrl : null,
            comments: data.COMMENT || data.COMMENTS,
            location: data.LOCATION
          };
          break;
        }
      }
      
      setProduct(foundProduct);
      setEditedProduct(foundProduct); // Initialize editedProduct with fetched data
      if (foundProduct?.image) {
          const imageList = foundProduct.image.includes(';') ? foundProduct.image.split(';') : [foundProduct.image];
          setCurrentImage(imageList[0]);
      }
      setIsLoading(false);
    };

    fetchProduct();
  }, [productId]);

  // --- Admin Functions ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const collectionName = product.type === 'system' ? 'Systems' : 'products';
    const docRef = doc(db, collectionName, product.id);
    
    // Prepare data with original field names for Firestore
    const dataToSave = product.type === 'system' ? {
      MODALITY: editedProduct.modality,
      MANUFACTURER: editedProduct.brand,
      DESCRIPTION: editedProduct.description,
      IMAGES: editedProduct.image,
      COMMENT: editedProduct.comments
    } : {
      MODELITY: editedProduct.modality,
      BRAND: editedProduct.brand,
      DESCRIPTION: editedProduct.description,
      IMAGE: editedProduct.image,
      LOCATION: editedProduct.location,
      COMMENTS: editedProduct.comments
    };

    try {
      await updateDoc(docRef, dataToSave);
      setProduct(editedProduct); // Update the main product state
      setIsEditing(false);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("Failed to save changes.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${product.description}"? This cannot be undone.`)) {
      const collectionName = product.type === 'system' ? 'Systems' : 'products';
      const docRef = doc(db, collectionName, product.id);
      try {
        await deleteDoc(docRef);
        alert('Product deleted successfully.');
        router.push(`/products/${product.type === 'system' ? 'Systems' : 'Parts'}`);
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Failed to delete item.");
      }
    }
  };

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
          <div className={product.image ? "md:w-1/2" : "w-full"}>
            {isEditing ? (
              <div className="space-y-4">
                <div><label className="font-bold">Modality:</label><input type="text" name="modality" value={editedProduct.modality} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                <div><label className="font-bold">{product.type === 'part' ? 'Brand' : 'Manufacturer'}:</label><input type="text" name="brand" value={editedProduct.brand} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>
                <div><label className="font-bold">Description:</label><textarea name="description" value={editedProduct.description} onChange={handleInputChange} className="w-full p-2 border rounded" rows="4"></textarea></div>
                <div><label className="font-bold">Image URL(s):</label><textarea name="image" value={editedProduct.image} onChange={handleInputChange} className="w-full p-2 border rounded" rows="3" placeholder="Separate multiple URLs with a semicolon (;)"></textarea></div>
              </div>
            ) : (
              <>
                <p className="text-lg text-gray-500">{product.modality} {product.brand ? `/ ${product.brand}` : ''}</p>
                <h1 className="text-4xl font-bold text-gray-900 mt-2 mb-4">{product.description}</h1>
                <p className="text-gray-700 text-lg my-6">This is a high-quality, pre-owned piece of equipment...</p>
                <Link 
                    href={`/contact?subject=Quote Request: ${encodeURIComponent(product.description)}`}
                    className="bg-teal-600 text-white font-bold py-4 px-8 rounded-full hover:bg-teal-700 transition duration-300 text-lg inline-block"
                >
                    Request a Quote
                </Link>
              </>
            )}
            
            {isAdmin && (
                 <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    {isEditing ? (
                        <div className="space-y-4">
                          {product.type === 'part' && <div><label className="font-bold">Location:</label><input type="text" name="location" value={editedProduct.location} onChange={handleInputChange} className="w-full p-2 border rounded" /></div>}
                          <div><label className="font-bold">Comments:</label><textarea name="comments" value={editedProduct.comments} onChange={handleInputChange} className="w-full p-2 border rounded" rows="3"></textarea></div>
                          <div className="flex space-x-4">
                              <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Save Changes</button>
                              <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Cancel</button>
                          </div>
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-xl font-bold text-yellow-800 mb-2">Internal Admin Notes</h3>
                            <div className="text-yellow-700">
                                <p><strong className="font-semibold">Location:</strong> {product.location || 'N/A'}</p>
                                <p><strong className="font-semibold">Comments:</strong> {displayComments}</p>
                            </div>
                            <div className="mt-4 flex space-x-4">
                                <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Edit Product</button>
                                <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Delete Product</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}