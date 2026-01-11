"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from 'react'; // Added Suspense
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ProductCard } from '../../../components/ProductCard';
import Link from 'next/link';
import { useAuth } from '../../../lib/AuthContext';

const ITEMS_PER_PAGE = 20;

const SIDEBAR_MODALITIES = [
  "C-ARM", "CATH", "CR/PRINTER", "CT", "INJECTOR", "MAMMO", 
  "MONITOR", "MRI", "NETWORK", "NUCLEAR", "PET/CT", 
  "POWER SUPPLY", "TUBE", "ULTRASOUND", "UPS", "WORKSTATION", "X-RAY"
];

const SIDEBAR_BRANDS = [
  "AGFA", "CISCO", "COSEL", "DELL", "EIZO", "ESAOTE", "FUJI", "GE", 
  "HITACHI", "HOLOGIC", "KODAK", "KONICA", "LIEBEL-FLARSHEIM", "LORAD", 
  "MALLINCKRODT", "MEDRAD", "NEC", "NEMOTO", "PHILIPS", 
  "SHIMADZU", "SIEMENS", "TOSHIBA"
];

// 1. Rename the main function to 'ProductPageContent' (Internal use only)
function ProductPageContent() {
  const { isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname(); 
  const category = params.category;

  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBrand, setExpandedBrand] = useState(null);

  // URL State
  const pageParam = searchParams.get('page');
  const pageNumber = pageParam ? parseInt(pageParam, 10) : 1;

  const [inputValue, setInputValue] = useState(searchParams.get('search') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [modalityFilter, setModalityFilter] = useState(searchParams.get('modality') || '');
  const [brandFilter, setBrandFilter] = useState(searchParams.get('brand') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  
  const lastLoggedSearch = useRef(null);

  // Sync State with URL
  useEffect(() => {
    const currentBrand = searchParams.get('brand') || '';
    setModalityFilter(searchParams.get('modality') || '');
    setBrandFilter(currentBrand);
    setSearchTerm(searchParams.get('search') || '');
    setInputValue(searchParams.get('search') || '');

    if (currentBrand) {
      setExpandedBrand(currentBrand);
    }
  }, [searchParams]);

  // Fetch Data
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
                partNumber: data['PART NUMBER'] || data.PART_NUMBER || data.partNumber,
                image: imageUrl && imageUrl.startsWith('http') ? imageUrl : null,
                price: data.PRICE || '', 
                location: data.LOCATION || data.Location || data.location || '', 
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

  // Filters
  const filteredProducts = useMemo(() => {
    let currentProducts = allProducts;
    const cleanString = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    if (searchTerm.trim()) {
        const cleanFilter = cleanString(searchTerm);
        currentProducts = currentProducts.filter(p => {
            const descriptionMatch = cleanString(p.description).includes(cleanFilter);
            const partNumberMatch = cleanString(p.partNumber).includes(cleanFilter);
            return descriptionMatch || partNumberMatch;
        });
    }
    if (modalityFilter.trim()) {
        const cleanFilter = cleanString(modalityFilter);
        currentProducts = currentProducts.filter(p => 
            cleanString(p.modality).includes(cleanFilter)
        );
    }
    if (brandFilter.trim()) {
        const cleanFilter = cleanString(brandFilter);
        currentProducts = currentProducts.filter(p => 
            cleanString(p.brand).includes(cleanFilter)
        );
    }
    if (locationFilter.trim()) {
        const cleanFilter = cleanString(locationFilter);
        currentProducts = currentProducts.filter(p => 
            cleanString(p.location).includes(cleanFilter)
        );
    }
    return currentProducts;
  }, [allProducts, searchTerm, modalityFilter, brandFilter, locationFilter]);

  // CSV Export
  const handleExportCSV = () => {
    const dataToExport = filteredProducts;
    if (dataToExport.length === 0) {
      alert("No products found to export! Please try refreshing the page.");
      return;
    }
    const confirmDownload = confirm(`Ready to download ${dataToExport.length} items?`);
    if (!confirmDownload) return;

    try {
      const headers = ['ID', 'Brand', 'Modality', 'Part Number', 'Description', 'Image URL', 'Location', 'Price'];
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(product => [
          `"${product.id}"`,
          `"${String(product.brand || '')}"`,
          `"${String(product.modality || '')}"`,
          `"${String(product.partNumber || '')}"`,
          `"${String(product.description || '').replace(/"/g, '""')}"`, 
          `"${String(product.image || '')}"`,
          `"${String(product.location || '')}"`,
          `"${String(product.price || '')}"`
        ].join(','))
      ].join('\n');

      let filename = 'grand_inventory_full.csv';
      if (searchTerm) filename = `grand_inventory_search_${searchTerm}.csv`;
      else if (brandFilter) filename = `grand_inventory_${brandFilter}.csv`;
      else if (modalityFilter) filename = `grand_inventory_${modalityFilter}.csv`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert(`Error exporting CSV: ${error.message}`);
    }
  };

  // Search Logging
  useEffect(() => {
    if (searchTerm && !isLoading && category === 'Parts' && lastLoggedSearch.current !== searchTerm) {
      const found = filteredProducts.length > 0;
      const logSearch = async () => {
        try {
          await addDoc(collection(db, 'search_logs'), {
            term: searchTerm,
            foundResults: found,
            resultCount: filteredProducts.length,
            timestamp: serverTimestamp()
          });
          lastLoggedSearch.current = searchTerm;
        } catch (error) { console.error("Error logging search:", error); }
      };
      logSearch();
    }
  }, [searchTerm, isLoading, filteredProducts, category]);

  // Pagination Helper
  const createPageURL = (pageNumber) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handleSearchCommit = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set('page', '1'); 
    if (inputValue) currentParams.set('search', inputValue);
    else currentParams.delete('search');
    router.replace(`${pathname}?${currentParams.toString()}`);
  };
  
  const handleFilterChange = (key, value) => {
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set('page', '1');
      if (value) currentParams.set(key, value);
      else currentParams.delete(key);
      router.replace(`${pathname}?${currentParams.toString()}`);
  }

  // Helper Logic
  const toggleBrand = (brand) => {
    if (expandedBrand === brand) setExpandedBrand(null);
    else setExpandedBrand(brand);
  };
  const isBrandActive = (brand) => brandFilter.toLowerCase() === brand.toLowerCase();
  const isModalityActive = (mod) => modalityFilter.toLowerCase() === mod.toLowerCase();
  const paginatedProducts = filteredProducts.slice((pageNumber - 1) * ITEMS_PER_PAGE, pageNumber * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const isSystemsPage = category === 'Systems';

  return (
    <section className="py-12 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">{category} Inventory</h2>
          <div className="flex space-x-4">
            {isAdmin && (
              <button onClick={handleExportCSV} className="bg-green-600 text-white font-bold py-2 px-4 rounded-full hover:bg-green-700 transition flex items-center shadow-sm">
                <span className="mr-2" role="img" aria-label="download">⬇</span> Export CSV
              </button>
            )}
            {isAdmin && (
              <Link href={`/add/${isSystemsPage ? 'System' : 'Part'}`} className="bg-teal-600 text-white font-bold py-2 px-4 rounded-full hover:bg-teal-700 transition shadow-sm">
                + Add New {isSystemsPage ? 'System' : 'Part'}
              </Link>
            )}
          </div>
        </div>
        
        {/* SEARCH */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
             <div className="relative">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search by Part Number or Keyword</label>
                <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="search" 
                      placeholder="e.g., 45356713149 or Siemens Coil..." 
                      className="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500" 
                      value={inputValue} 
                      onChange={(e) => setInputValue(e.target.value)}
                      onBlur={handleSearchCommit}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchCommit(); } }}
                    />
                    <button onClick={handleSearchCommit} className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition">
                        Search
                    </button>
                </div>
             </div>
        </div>

        {/* LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* SIDEBAR (FLYOUT) */}
            <aside className="w-full lg:w-64 flex-shrink-0 hidden lg:block relative z-20">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 border-b bg-gray-50">
                        <Link href={pathname || '#'} className="text-sm font-bold text-red-500 hover:text-red-700 flex items-center">
                           <span>✕ Clear All Filters</span>
                        </Link>
                    </div>

                    {SIDEBAR_BRANDS.map((brand) => {
                        const isOpen = expandedBrand === brand;
                        const isActive = isBrandActive(brand);

                        return (
                            <div key={brand} className="relative group"> 
                                <Link 
                                    href={`${pathname}?brand=${encodeURIComponent(brand)}`}
                                    onClick={() => toggleBrand(brand)}
                                    className={`flex w-full justify-between items-center px-4 py-3 text-sm font-medium border-b border-gray-100 last:border-0 transition-colors
                                        ${isActive 
                                            ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-600'
                                            : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{brand}</span>
                                    <span className="ml-2 text-gray-400">›</span>
                                </Link>

                                {isOpen && (
                                    <div className="absolute left-full top-0 ml-1 w-56 bg-white border border-gray-200 shadow-xl rounded-r-lg rounded-b-lg overflow-y-auto max-h-[80vh] z-50 animate-fadeIn">
                                        <div className="bg-gray-50 px-4 py-2 border-b text-xs font-bold text-gray-500 uppercase">
                                            {brand} Modalities
                                        </div>
                                        <Link 
                                            href={`${pathname}?brand=${encodeURIComponent(brand)}`}
                                            className={`block px-4 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 border-b border-gray-50 ${!modalityFilter ? 'font-bold text-teal-600' : 'text-gray-600'}`}
                                        >
                                            View All {brand}
                                        </Link>
                                        {SIDEBAR_MODALITIES.map((mod) => (
                                            <Link
                                                key={mod}
                                                href={`${pathname}?brand=${encodeURIComponent(brand)}&modality=${encodeURIComponent(mod)}`}
                                                className={`block px-4 py-2 text-sm transition-colors
                                                    ${isModalityActive(mod) 
                                                        ? 'font-bold text-teal-600 bg-teal-50' 
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-teal-600'
                                                    }`}
                                            >
                                                {mod}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* CONTENT */}
            <div className="flex-1 w-full z-10">
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <select className="p-2 border rounded-md" value={brandFilter} onChange={(e) => handleFilterChange('brand', e.target.value)}>
                        <option value="">All Manufacturers</option>
                        {SIDEBAR_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <select className="p-2 border rounded-md" value={modalityFilter} onChange={(e) => handleFilterChange('modality', e.target.value)}>
                        <option value="">All Modalities</option>
                        {SIDEBAR_MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading Inventory...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-sm text-gray-600 flex justify-between items-center">
                            <span>Showing {paginatedProducts.length} of {filteredProducts.length} results</span>
                            {(searchTerm || brandFilter || modalityFilter) && (
                                <button onClick={() => router.push(pathname || '')} className="text-red-500 hover:text-red-700 text-sm font-medium">Clear All Filters</button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {paginatedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center space-x-4">
                                <Link href={createPageURL(Math.max(1, pageNumber - 1))} className={`px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 ${pageNumber === 1 ? 'opacity-50 pointer-events-none' : ''}`}>
                                    ← Previous
                                </Link>
                                <span className="text-sm text-gray-700">Page {pageNumber} of {totalPages}</span>
                                <Link href={createPageURL(Math.min(totalPages, pageNumber + 1))} className={`px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 ${pageNumber === totalPages ? 'opacity-50 pointer-events-none' : ''}`}>
                                    Next →
                                </Link>
                            </div>
                        )}
                        {!isLoading && filteredProducts.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                                <p className="text-xl text-gray-400 mb-2">No products found</p>
                                <p className="text-gray-500">Try adjusting your filters.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
      </div>
    </section>
  );
}

// 2. Export the Wrapper! This is what fixes the "Build Failed" error.
export default function ProductPageClient() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <ProductPageContent />
    </Suspense>
  );
}