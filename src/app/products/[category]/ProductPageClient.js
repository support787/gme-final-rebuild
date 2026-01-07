"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ProductCard } from '../../../components/ProductCard';
import Link from 'next/link';
import { useAuth } from '../../../lib/AuthContext';

const ITEMS_PER_PAGE = 20;

export default function ProductPageContent() {
  const { isAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = params.category;

  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- URL State Management ---
  const pageParam = searchParams.get('page');
  const pageNumber = pageParam ? parseInt(pageParam, 10) : 1;

  const [inputValue, setInputValue] = useState(searchParams.get('search') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  
  const [modalityFilter, setModalityFilter] = useState(searchParams.get('modality') || '');
  const [brandFilter, setBrandFilter] = useState(searchParams.get('brand') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  
  const lastLoggedSearch = useRef(null);

  // --- Fetch Data ---
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
                price: data.PRICE || '', // Added for CSV Export
                // SAFETY CHECK: Try all possible capitalizations for Location
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

  // --- ROBUST FILTER LOGIC ---
  const filteredProducts = useMemo(() => {
    let currentProducts = allProducts;
    
    // Helper: Strip EVERYTHING that isn't a letter or number
    // "PALLET   ON--SHELF" becomes "palletonshelf"
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

  // --- CSV EXPORT FUNCTION ---
  const handleExportCSV = () => {
    // We export whatever is currently in the filtered list
    const dataToExport = filteredProducts;

    if (dataToExport.length === 0) {
      alert("No products to export!");
      return;
    }

    const headers = ['ID', 'Brand', 'Modality', 'Part Number', 'Description', 'Location', 'Price'];

    // Generate CSV content
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(product => [
        `"${product.id}"`,
        `"${product.brand || ''}"`,
        `"${product.modality || ''}"`,
        `"${product.partNumber || ''}"`,
        `"${(product.description || '').replace(/"/g, '""')}"`, // Escape quotes inside descriptions
        `"${product.location || ''}"`,
        `"${product.price || ''}"`
      ].join
