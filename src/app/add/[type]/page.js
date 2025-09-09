// src/app/add/[type]/page.js
"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function AddProductPage() {
    const params = useParams();
    const router = useRouter();
    const type = params.type; // "System" or "Part"
    
    const [formData, setFormData] = useState({});
    const isSystem = type === 'System';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const collectionName = isSystem ? 'Systems' : 'products';
        try {
            await addDoc(collection(db, collectionName), formData);
            alert(`${type} added successfully!`);
            router.push(`/products/${type}s`); // Redirect to the list page
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to add new item.");
        }
    };

    const partFields = [
        { name: 'MODELITY', label: 'Modality', type: 'text' },
        { name: 'BRAND', label: 'Brand', type: 'text' },
        { name: 'DESCRIPTION', label: 'Description', type: 'textarea' },
        { name: 'IMAGE', label: 'Image URL', type: 'text' },
        { name: 'LOCATION', label: 'Location', type: 'text' },
        { name: 'COMMENTS', label: 'Comments', type: 'textarea' },
    ];

    const systemFields = [
        { name: 'MODALITY', label: 'Modality', type: 'text' },
        { name: 'MANUFACTURER', label: 'Manufacturer', type: 'text' },
        { name: 'DESCRIPTION', label: 'Description', type: 'textarea' },
        { name: 'IMAGES', label: 'Image URL(s)', type: 'text' },
        { name: 'COMMENT', label: 'Comment', type: 'textarea' },
    ];

    const fields = isSystem ? systemFields : partFields;

    return (
        <section className="py-20 bg-slate-50">
            <div className="container mx-auto px-6 max-w-2xl">
                <h2 className="text-3xl font-bold text-gray-800 mb-8">Add New {type}</h2>
                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                    {fields.map(field => (
                        <div key={field.name}>
                            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">{field.label}</label>
                            {field.type === 'textarea' ? (
                                <textarea id={field.name} name={field.name} onChange={handleChange} rows="4" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            ) : (
                                <input type="text" id={field.name} name={field.name} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            )}
                        </div>
                    ))}
                    <div className="flex space-x-4">
                        <button type="submit" className="bg-teal-600 text-white font-bold py-3 px-6 rounded-full hover:bg-teal-700 transition duration-300">Save {type}</button>
                        <button type="button" onClick={() => router.back()} className="bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-full hover:bg-gray-300 transition duration-300">Cancel</button>
                    </div>
                </form>
            </div>
        </section>
    );
}