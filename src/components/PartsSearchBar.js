'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PartsSearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // CORRECTED: This now points to your main Parts page URL structure.
      router.push(`/products/Parts?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter Part Number or Name or Description..."
          className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="absolute top-0 right-0 mt-1 mr-1 px-4 py-1.5 text-white bg-teal-500 rounded-full hover:bg-teal-600 focus:outline-none"
        >
          Search
        </button>
      </div>
    </form>
  );
}
