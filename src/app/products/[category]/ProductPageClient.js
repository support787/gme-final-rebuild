"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ProductCard } from '../../../components/ProductCard';
import Link from 'next/link';
import { useAuth } from '../../../lib/AuthContext';

const ITEMS_PER_PAGE = 20;

// ==========================================
// 1. PARTS LISTS
// ==========================================
const PARTS_MODALITIES = [
  "CT", "MRI", "CATH", "C-ARM", "X-RAY", "MAMMO", "PET/CT", "TUBE", "NUCLEAR", 
  "ULTRASOUND", "CR/PRINTER", "INJECTOR", "MONITOR", "UPS", 
  "POWER SUPPLY", "WORKSTATION",  "NETWORK"
];

const PARTS_BRANDS = [
  "GE", "SIEMENS", "PHILIPS", "TOSHIBA", "HITACHI", "HOLOGIC", "LORAD", "SHIMADZU", 
  "AGFA", "KODAK", "KONICA", "MEDRAD", "NEC", "EIZO", "CISCO", "COSEL", "DELL", 
  "ESAOTE", "FUJI", "LIEBEL-FLARSHEIM", "MALLINCKRODT", "NEMOTO"
];

// ==========================================
// 2. SYSTEMS LISTS
// ==========================================
const SYSTEMS_MODALITIES = [
  "CT", "MRI", "CATH/ANGIO", "PET/CT", "MAMMO", "SPECT/CT", "C-ARM", "DR", "R/F", "ULTRASOUND"
];

const SYSTEMS_BRANDS = [
  "GE", "SIEMENS", "PHILIPS", "TOSHIBA", "CANON", "HITACHI", "HOLOGIC"
];

function ProductPageContent() {
  const { isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname(); 
  const category = params.category;
  
  const isSystemsPage = category === 'Systems';

  // --- DYNAMICALLY CHOOSE WHICH LIST TO USE ---
  const SIDEBAR_MODALITIES = isSystemsPage ? SYSTEMS_MODALITIES : PARTS_MODALITIES;
  const SIDEBAR_BRANDS = isSystemsPage ? SYSTEMS_BRANDS : PARTS_BRANDS;

  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [expandedCategory, setExpandedCategory] = useState(null);
  const sidebarRef = useRef(null);

  // URL State
  const pageParam = searchParams.get('page');
  const pageNumber = pageParam ? parseInt(pageParam, 10) : 1;

  const [inputValue, setInputValue] = useState(searchParams.get('search') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  
  // Filters
  const [modalityFilter, setModalityFilter] = useState(searchParams.get('modality') || '');
  const [brandFilter, setBrandFilter] = useState(searchParams.get('brand') || '');
  
  // NEW: Location Input State (For Admins)
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  
  const lastLoggedSearch = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (expandedCategory && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setExpandedCategory(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expandedCategory]);


  // Sync State with URL
  useEffect(() => {
    setModalityFilter(searchParams.get('modality') || '');
    setBrandFilter(searchParams.get('brand') || '');
    setSearchTerm(searchParams.get('search') || '');
    
    // Sync Search Inputs
    setInputValue(searchParams.get('search') || '');
    setLocationInput(searchParams.get('location') || '');
    setLocationFilter(searchParams.get('location') || '');
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

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let currentProducts = allProducts;
    const cleanString = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Keyword Search
    if (searchTerm.trim()) {
        const cleanFilter = cleanString(searchTerm);
        currentProducts = currentProducts.filter(p => {
            const descriptionMatch = cleanString(p.description).includes(cleanFilter);
            const partNumberMatch = cleanString(p.partNumber).includes(cleanFilter);
            return descriptionMatch || partNumberMatch;
        });
    }
    // 2. Modality Filter
    if (modalityFilter.trim()) {
        const cleanFilter = cleanString(modalityFilter);
        currentProducts = currentProducts.filter(p => 
            cleanString(p.modality).includes(cleanFilter)
        );
    }
    // 3. Brand Filter
    if (brandFilter.trim()) {
        const cleanFilter = cleanString(brandFilter);
        currentProducts = currentProducts.filter(p => 
            cleanString(p.brand).includes(cleanFilter)
        );
    }
    // 4. Location Filter (Admin)
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

      let filename = isSystemsPage ? 'grand_systems.csv' : 'grand_parts.csv';
      if (searchTerm) filename = `grand_search_${searchTerm}.csv`;
      else if (locationFilter) filename = `grand_location_${locationFilter}.csv`;

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

  // Navigation Helpers
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

  // NEW: Handler for Location Commit
  const handleLocationCommit = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set('page', '1'); 
    if (locationInput) currentParams.set('location', locationInput);
    else currentParams.delete('location');
    router.replace(`${pathname}?${currentParams.toString()}`);
  };
  
  const handleFilterChange = (key, value) => {
      const currentParams = new URLSearchParams(searchParams.toString());
      currentParams.set('page', '1');
      if (value) currentParams.set(key, value);
      else currentParams.delete(key);
      router.replace(`${pathname}?${currentParams.toString()}`);
  }

  const toggleCategory = (cat) => {
    if (expandedCategory === cat) setExpandedCategory(null);
    else setExpandedCategory(cat);
  };
  
  const selectSubItem = () => setExpandedCategory(null);

  const isBrandActive = (brand) => brandFilter.toLowerCase() === brand.toLowerCase();
  const isModalityActive = (mod) => modalityFilter.toLowerCase() === mod.toLowerCase();
  
  const paginatedProducts = filteredProducts.slice((pageNumber - 1) * ITEMS_PER_PAGE, pageNumber * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_