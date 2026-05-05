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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to clean text
function cleanText(text) {
    if (!text) return '';
    return text.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function generateUpload() {
    console.log("================================================");
    console.log("   STARTING DOTMED IMPORT GENERATOR (V2)        ");
    console.log("================================================");

    // 1. READ YOUR DOWNLOADED FILE
    const exportFilePath = path.join(__dirname, 'dotmed_export.csv');
    if (!fs.existsSync(exportFilePath)) {
        console.error("ERROR: Could not find 'dotmed_export.csv'.");
        return;
    }

    console.log("1. Reading your DotMed export file...");
    const fileContent = fs.readFileSync(exportFilePath, 'utf-8');
    const lines = fileContent.split('\n');

    const firstLine = lines[0];
    const separator = firstLine.includes('\t') ? '\t' : ',';
    const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''));
    const partNumIndex = headers.findIndex(h => h === "Part Number" || h === "Part No");

    const existingPartNumbers = new Set();
    
    // Parse existing items
    lines.slice(1).forEach(line => {
        if (!line.trim()) return;
        const columns = line.split(separator);
        if (columns[partNumIndex]) {
            const pn = columns[partNumIndex].replace(/"/g, '').trim();
            if (pn) existingPartNumbers.add(cleanText(pn));
        }
    });

    console.log(`   -> Found ${existingPartNumbers.size} existing items in your DotMed export.`);

    // 2. FETCH FIREBASE PRODUCTS
    console.log("2. Fetching products from Firebase...");
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    console.log(`   -> Fetched ${snapshot.size} products from Firebase.`);

    let missingItems = [];
    let duplicateCount = 0;
    let skippedEmptyCount = 0;

    // 3. COMPARE AND BUILD NEW LIST
    snapshot.forEach(doc => {
        const data = doc.data();
        
        // --- FIELD MAPPING ---
        const description = data.DESCRIPTION || ""; 
        const partNumber = data['PART NUMBER'] || ""; 
        const manufacturer = data.MANUFACTURER || "";
        const price = data.PRICE || "";
        
        // NEW: Fetch Modality to fill System Model
        // We check 'MODALITY' and 'MODELITY' (due to the typo we saw earlier)
        const modality = data.MODALITY || data.MODELITY || "Medical Equipment"; 

        if (!description) {
            skippedEmptyCount++;
            return;
        }

        const cPartNum = cleanText(partNumber);
        
        if (cPartNum && existingPartNumbers.has(cPartNum)) {
            duplicateCount++;
        } else {
            // It's NEW!
            missingItems.push({
                partNumber: partNumber,
                partName: description,
                manufacturer: manufacturer,
                price: price,
                quantity: "1",
                listingType: "For Sale",
                condition: "used",
                // We will use this for System Model
                systemModel: modality 
            });
        }
    });

    console.log(`------------------------------------------------`);
    console.log(`Summary:`);
    console.log(`- Total Firebase Items: ${snapshot.size}`);
    console.log(`- Already on DotMed: ${duplicateCount}`);
    console.log(`- NEW Items to Generate: ${missingItems.length}`);
    console.log(`------------------------------------------------`);

    // 4. GENERATE THE UPLOAD FILE
    if (missingItems.length > 0) {
        // Headers based on your file
        const outputHeader = [
            "Category", "System Model", "System Mfg", "Part Mfg", "Comments", 
            "Part Number", "Part/Item Name", "Condition", "Listing Type", 
            "Request Type", "Price", "Quantity", "Listing ID (Leave Blank to Add)"
        ];

        const csvRows = missingItems.map(item => {
            const esc = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

            return [
                // Column 1: Category -> We use Modality here too (e.g. "CT Scanner")
                esc(item.systemModel), 
                
                // Column 2: System Model -> We use Modality here as you requested
                esc(item.systemModel),  
                
                esc(""),                // System Mfg
                esc(item.manufacturer), // Part Mfg
                esc(item.partName),     // Comments
                esc(item.partNumber),   // Part Number
                esc(item.partName),     // Part/Item Name
                esc(item.condition),    // Condition
                esc("For Sale"),        // Listing Type
                esc(""),                // Request Type
                esc(item.price),        // Price
                esc(item.quantity),     // Quantity
                ""                      // Listing ID (BLANK = NEW ITEM)
            ].join(",");
        });

        const finalContent = outputHeader.join(",") + "\n" + csvRows.join("\n");
        const outputFilename = 'dotmed_final_upload_ready.csv';
        
        fs.writeFileSync(path.join(__dirname, outputFilename), finalContent);
        console.log(`SUCCESS! Created '${outputFilename}'`);
        console.log(`This file now includes 'System Model' populated with your Modality.`);
    } else {
        console.log("No new items found.");
    }
}

generateUpload();