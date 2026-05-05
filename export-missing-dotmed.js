const fs = require('fs');
const path = require('path');

// --- FIREBASE SETUP ---
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

// !!! PASTE YOUR FIREBASE CONFIG HERE !!!
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  authDomain: "grand-medical-website.firebaseapp.com",
  projectId: "grand-medical-website",
  storageBucket: "grand-medical-website.appspot.com",
  messagingSenderId: "799272313892",
  appId: "1:799272313892:web:6dd4ee226cb9e791e524b1",
  measurementId: "G-HK1ZM18JET"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to clean up text
function cleanText(text) {
    if (!text) return '';
    return text.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function exportMissingItems() {
    console.log("================================================");
    console.log("   STARTING EXPORT PROCESS V4 (SAFE MODE)       ");
    console.log("================================================");

    const existingFilePath = path.join(__dirname, 'dotmed_existing.csv');
    if (!fs.existsSync(existingFilePath)) {
        console.error("ERROR: Could not find 'dotmed_existing.csv'.");
        return;
    }

    console.log("1. Reading DotMed file...");
    const existingFileContent = fs.readFileSync(existingFilePath, 'utf-8');
    const existingLines = existingFileContent.split('\n').slice(1);
    
    const existingPartNumbers = new Set();
    
    existingLines.forEach(line => {
        const parts = line.split('","');
        if (parts.length >= 3) {
            let url = parts[2].replace(/"/g, '').trim();
            const segments = url.split('/');
            if (segments.length >= 2) {
                const partNumFromUrl = segments[segments.length - 2];
                if (partNumFromUrl) existingPartNumbers.add(cleanText(partNumFromUrl));
            }
        }
    });

    console.log(`   -> Found ${existingPartNumbers.size} unique Part Numbers on DotMed.`);

    console.log("2. Fetching products from Firebase...");
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    console.log(`   -> Fetched ${snapshot.size} products from Firebase.`);

    let missingItems = [];
    let duplicateCount = 0;
    let skippedEmptyCount = 0;

    console.log("3. Comparing items...");

    snapshot.forEach(doc => {
        const data = doc.data();
        
        const description = data.DESCRIPTION || "";
        const partNumber = data['PART NUMBER'] || ""; 
        const manufacturer = data.MANUFACTURER || "";
        const price = data.PRICE || 0;

        if (!description) {
            skippedEmptyCount++;
            return;
        }

        const cPartNum = cleanText(partNumber);
        
        let isDuplicate = false;

        // Check Part Number
        if (cPartNum && existingPartNumbers.has(cPartNum)) {
            isDuplicate = true;
        }

        if (isDuplicate) {
            duplicateCount++;
        } else {
            // It's NEW!
            missingItems.push({
                title: description,
                partNumber: partNumber,
                manufacturer: manufacturer,
                price: price,
                quantity: 1
            });
        }
    });

    console.log(`------------------------------------------------`);
    console.log(`Summary:`);
    console.log(`- Total Firebase Items: ${snapshot.size}`);
    console.log(`- Skipped (No Description): ${skippedEmptyCount}`);
    console.log(`- Duplicates Found (Already on DotMed): ${duplicateCount}`);
    console.log(`- NEW Items to Upload: ${missingItems.length}`);
    console.log(`------------------------------------------------`);

    if (missingItems.length > 0) {
        // DotMed Upload Format
        const header = "Headline,Description,Manufacturer,Model,Part Number,Price,Quantity\n";
        
        const csvRows = missingItems.map(item => {
            // SAFE CONVERSION: Ensure everything is a String before calling .replace
            const t = String(item.title || "").replace(/"/g, '""');
            const m = String(item.manufacturer || "").replace(/"/g, '""');
            const pn = String(item.partNumber || "").replace(/"/g, '""');
            const p = String(item.price || "0");
            const q = String(item.quantity || "1");
            
            return `"${t}","${t}","${m}","","${pn}","${p}","${q}"`;
        });

        const finalCsvContent = header + csvRows.join('\n');
        const outputFilename = 'dotmed_missing_items_upload.csv';
        
        fs.writeFileSync(path.join(__dirname, outputFilename), finalCsvContent);
        console.log(`SUCCESS! Created '${outputFilename}'`);
        console.log(`You now have a clean file with ${missingItems.length} new items ready for upload.`);
    } else {
        console.log("No new items found.");
    }
}

exportMissingItems();