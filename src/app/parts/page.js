'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
// 1. Import your Firebase database connection and Firestore functions
import { db } from '../../lib/firebase'; // Adjust this path if your firebase.js is elsewhere
import { collection, getDocs } from 'firebase/firestore';


// 2. This function now fetches ALL parts from the correct 'products' collection
async function fetchAllParts() {
  console.log("Attempting to fetch all parts from the 'products' collection...");
  
  // CORRECTED: Your original code uses the 'products' collection for parts.
  const partsCollectionRef = collection(db, 'products');
  const partsSnapshot = await getDocs(partsCollectionRef);
  
  const partsList = partsSnapshot.docs.map(doc => {
    const data = doc.data();
    // CORRECTED: We now map the data using the field names from your original code.
    return {
      id: doc.id,
      description: data.DESCRIPTION,
      modality: data.MODALITY || data.MODELITY,
      brand: data.MANUFACTURER || data.BRAND,
      image: data.IMAGES || data.IMAGE,
    }
  });

  if (partsList.length > 0) {
    console.log("Data fetched successfully. First part:", partsList[0]);
  } else {
    console.log("No data found in the 'products' collection.");
  }

  return partsList;
}

// This component contains all the logic for fetching and filtering.
function PartsList() {
  const [parts, setParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadAndFilterParts = async () => {
      setIsLoading(true);

      const currentSearchTerm = searchParams.get('search') || '';
      setSearchTerm(currentSearchTerm);

      const allParts = await fetchAllParts();

      if (currentSearchTerm && allParts.length > 0) {
        const lowercasedTerm = currentSearchTerm.toLowerCase();
        
        // CORRECTED: We now filter on the 'description' field, just like your original code.
        const results = allParts.filter(part => 
          (part.description || '').toLowerCase().includes(lowercasedTerm)
        );
        setParts(results);

      } else {
        // If there's no search, show all parts
        setParts(allParts);
      }

      setIsLoading(false);
    };

    loadAndFilterParts();
  }, [searchParams]);


  if (isLoading) {
    return <div className="text-center p-10">Loading parts...</div>;
  }

  return (
    <div>
      {searchTerm && (
        <p className="mb-6 text-lg">
          Showing results for: <strong>"{searchTerm}"</strong>
        </p>
      )}

      {parts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parts.map(part => (
            // CORRECTED: Displaying the 'description' field.
            <div key={part.id} className="border p-4 rounded-lg shadow-md bg-white">
              <h3 className="text-lg font-semibold text-gray-800">{part.description}</h3>
              <p className="text-gray-600 mt-1">Brand: {part.brand}</p>
              <p className="text-gray-600">Modality: {part.modality}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No parts found matching your search for "{searchTerm}".</p>
      )}
    </div>
  );
}


export default function PartsPage() {
  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-800 border-b pb-4">Medical Equipment Parts</h1>
      <Suspense fallback={<div className="text-center p-10">Loading search results...</div>}>
        <PartsList />
      </Suspense>
    </div>
  );
}




