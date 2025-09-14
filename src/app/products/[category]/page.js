"use client";

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ProductCard } from '../../../components/ProductCard';
import Link from 'next/link';
import { useAuth } from '../../../lib/AuthContext';

const ITEMS_PER_PAGE = 20;

// An inner component to safely use useSearchParams
function ProductPageContent() {
  const { isAdmin } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const category = params.category;

  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [modalityFilter, setModalityFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  
  // This useEffect sets the initial filter states from the URL
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setModalityFilter(searchParams.get('modality') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const productsRef = collection(db, category === 'Systems' ? 'Systems' : 'products');
        const querySnapshot = await getDocs(productsRef);
        
        const productsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const imageUrl = data.IMAGES || data.IMAGE;
            return {
                id: doc.id,
                type: category === 'Systems' ? 'system' : 'part',
                modality: data.MODALITY || data.MODELITY,
                brand: data.MANUFACTURER || data.BRAND,
                description: data.DESCRIPTION,
                image: imageUrl && imageUrl.startsWith('http') ? imageUrl : null,
                location: data.LOCATION,
                comments: data.COMMENT || data.COMMENTS
            }
        });

        setAllProducts(productsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (category) {
      fetchData();
    }
  }, [category]);

  const filteredProducts = useMemo(() => {
    let currentProducts = allProducts;
    
    // ** UPDATED FILTERING LOGIC **
    // We now use .trim() to remove whitespace before comparing, making the match more reliable.

    if (searchTerm.trim()) {
        const lowercasedFilter = searchTerm.trim().toLowerCase();
        currentProducts = currentProducts.filter(p => 
            (p.description || '').toLowerCase().includes(lowercasedFilter)
        );
    }
    if (modalityFilter.trim()) {
        const lowercasedFilter = modalityFilter.trim().toLowerCase();
        currentProducts = currentProducts.filter(p => 
            (p.modality || '').toLowerCase().includes(lowercasedFilter)
        );
    }
    if (brandFilter.trim()) {
        const lowercasedFilter = brandFilter.trim().toLowerCase();
        currentProducts = currentProducts.filter(p => 
            (p.brand || '').toLowerCase().includes(lowercasedFilter)
        );
    }
    if (locationFilter.trim()) {
        const lowercasedFilter = locationFilter.trim().toLowerCase();
        currentProducts = currentProducts.filter(p => 
            (p.location || '').toLowerCase().includes(lowercasedFilter)
        );
    }
    return currentProducts;
  }, [allProducts, searchTerm, modalityFilter, brandFilter, locationFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((pageNumber - 1) * ITEMS_PER_PAGE, pageNumber * ITEMS_PER_PAGE);

  const isSystemsPage = category === 'Systems';
  
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800">{category}</h2>
          {isAdmin && (
            <Link 
              href={`/add/${isSystemsPage ? 'System' : 'Part'}`} 
              className="bg-teal-600 text-white font-bold py-2 px-4 rounded-full hover:bg-teal-700 transition duration-300"
            >
              + Add New {isSystemsPage ? 'System' : 'Part'}
            </Link>
          )}
        </div>
        <p className="text-center text-gray-800 my-8">Search and filter through our extensive inventory</p>
        
        <div className={`bg-white p-6 rounded-lg shadow-md mb-12 grid grid-cols-1 md:grid-cols-2 ${isAdmin && !isSystemsPage ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 items-end`}>
            {!isSystemsPage && (
                <div>
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">Part Number or Name</label>
                    <input type="text" id="search" placeholder="e.g., Siemens Coil..." className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setPageNumber(1);}} />
                </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700">Modality</label>
                <input type="text" placeholder="Type to search..." className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={modalityFilter} onChange={(e) => {setModalityFilter(e.target.value); setPageNumber(1);}} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                <input type="text" placeholder="Type to search..." className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={brandFilter} onChange={(e) => {setBrandFilter(e.target.value); setPageNumber(1);}} />
            </div>
            {isAdmin && !isSystemsPage && (
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                    <input type="text" placeholder="Type to search..." className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" value={locationFilter} onChange={(e) => {setLocationFilter(e.target.value); setPageNumber(1);}} />
                </div>
            )}
        </div>

        {isLoading ? (
          <div className="text-center py-10"><p>Loading Products...</p></div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-4">
                <button
                  onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {pageNumber} of {totalPages}
                </span>
                <button
                  onClick={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
                  disabled={pageNumber === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
         { !isLoading && filteredProducts.length === 0 && <p className="text-center text-gray-500 mt-8">No products found.</p>}
      </div>
    </section>
  );
}

// A wrapper component to handle Suspense
export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <ProductPageContent />
    </Suspense>
  );
}


