"use client";
import { useState } from 'react';
import { db } from '../lib/firebase'; // Make sure this path points to your firebase.js file
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function InventoryScanner() {
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [dbStatus, setDbStatus] = useState("");

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setScanResult(null);
    setDbStatus("Analyzing image...");

    try {
      // 1. Convert the image to Base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result;

        // 2. Send to our Gemini API Route
        const response = await fetch('/api/scan-label', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64String })
        });

        const result = await response.json();

        if (result.success) {
          const partData = result.data;
          setScanResult(partData);
          
          if (partData.partNumber) {
              await checkDatabase(partData.partNumber);
          } else {
              setDbStatus("Could not find a clear part number in the image.");
          }
        } else {
          setDbStatus("Error: Could not read the label.");
        }
        setLoading(false);
      };
    } catch (error) {
      console.error(error);
      setDbStatus("Something went wrong during the scan.");
      setLoading(false);
    }
  };

  const checkDatabase = async (partNumber) => {
    setDbStatus(`Searching database for Part #${partNumber}...`);
    
    // 3. Check Firestore for the extracted part number
    const partsRef = collection(db, 'parts'); // Change 'parts' to your actual Firestore collection name if it's different
    const q = query(partsRef, where("partNumber", "==", partNumber));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setDbStatus(`✅ Part #${partNumber} already exists in your inventory!`);
      // Here you can eventually add logic to show the existing item
    } else {
      setDbStatus(`⚠️ Part #${partNumber} is NOT in the database. Ready to add!`);
      // Here you can eventually add logic to pre-fill your "Add Item" form
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 mt-6 max-w-xl">
      <h2 className="text-xl font-bold mb-4 text-gray-800">📷 Smart Inventory Scanner</h2>
      
      <div className="mb-4">
        <label className="block bg-blue-600 text-white text-center font-bold py-3 px-4 rounded cursor-pointer hover:bg-blue-700 transition">
          {loading ? "Scanning Label..." : "Take Photo or Upload Label"}
          {/* capture="environment" forces mobile devices to open the rear camera directly! */}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            onChange={handleImageUpload} 
            className="hidden" 
            disabled={loading}
          />
        </label>
      </div>

      {dbStatus && (
        <div className="p-3 bg-gray-50 border-l-4 border-blue-500 mb-4">
          <p className="text-sm font-medium text-gray-700">{dbStatus}</p>
        </div>
      )}

      {scanResult && (
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <h3 className="font-bold text-green-800 mb-2">AI Extraction Results:</h3>
          <ul className="text-sm text-green-900 space-y-1">
            <li><strong>Part Number:</strong> {scanResult.partNumber || "Not found"}</li>
            <li><strong>Manufacturer:</strong> {scanResult.manufacturer || "Not found"}</li>
            <li><strong>Description:</strong> {scanResult.description || "Not found"}</li>
          </ul>
        </div>
      )}
    </div>
  );
}