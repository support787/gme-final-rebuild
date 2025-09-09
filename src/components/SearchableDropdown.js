// src/components/SearchableDropdown.js
"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';

export const SearchableDropdown = ({ options, value, onChange, placeholder = "Type to search..." }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const filteredOptions = useMemo(() =>
        options.filter(option => option.toLowerCase().includes(searchTerm.toLowerCase())),
        [options, searchTerm]
    );
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                {value === 'All' ? placeholder : value}
            </button>
            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                    <input
                        type="text"
                        placeholder="Filter..."
                        className="w-full p-2 border-b border-gray-200 sticky top-0"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <ul>
                        {filteredOptions.map((option, index) => (
                            <li
                                key={`${option}-${index}`}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};