const fs = require('fs');
const path = require('path');

// Helper to clean text (capitalize first letter)
function formatText(text) {
    if (!text) return '';
    // Replace dashes with spaces and capitalize
    return text.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function convertExistingToFormat() {
    console.log("=================================================");
    console.log("   CONVERTING SCRAPED DATA TO UPLOAD FORMAT      ");
    console.log("=================================================");

    const inputPath = path.join(__dirname, 'dotmed_existing.csv');
    if (!fs.existsSync(inputPath)) {
        console.error("ERROR: Could not find 'dotmed_existing.csv'.");
        return;
    }

    const fileContent = fs.readFileSync(inputPath, 'utf-8');
    const lines = fileContent.split('\n').slice(1); // Skip header

    let convertedItems = [];

    lines.forEach(line => {
        // Line format: "Title","CleanTitle","URL"
        const parts = line.split('","');
        
        if (parts.length >= 3) {
            const title = parts[0].replace(/"/g, '').trim();
            let url = parts[2].replace(/"/g, '').trim();
            
            // EXTRACT DATA FROM URL
            // Example: /listing/cath-lab/philips/fd10/452209010221/5545247
            const segments = url.split('/');
            
            // We need at least the Listing ID (last) and Part Number (2nd to last)
            if (segments.length >= 3) {
                // Determine positions relative to the end of the URL
                const listingId = segments[segments.length - 1]; // "5545247"
                const partNumber = segments[segments.length - 2]; // "452209010221"
                
                // Try to grab optional fields if they exist in the URL structure
                // Note: URL structure varies, but usually: .../listing/CATEGORY/MANUFACTURER/MODEL/...
                // segments[2] is usually Category
                // segments[3] is usually Manufacturer
                // segments[4] is usually Model (if present)
                
                const category = segments[2] ? formatText(segments[2]) : "Medical Equipment";
                const mfg = segments[3] ? formatText(segments[3]) : "";
                const model = segments[4] && segments[4] !== partNumber ? formatText(segments[4]) : "";

                convertedItems.push({
                    category: category,
                    systemModel: model,
                    systemMfg: mfg,
                    partMfg: mfg, // Guessing Part Mfg is same as System Mfg
                    partNumber: partNumber,
                    partName: title,
                    listingId: listingId
                });
            }
        }
    });

    console.log(`Parsed ${convertedItems.length} items from your scraped list.`);

    // GENERATE CSV CONTENT
    if (convertedItems.length > 0) {
        // Official Headers
        const outputHeader = [
            "Category", "System Model", "System Mfg", "Part Mfg", "Comments", 
            "Part Number", "Part/Item Name", "Condition", "Listing Type", 
            "Request Type", "Price", "Quantity", "Listing ID (Leave Blank to Add)"
        ];

        const csvRows = convertedItems.map(item => {
            const esc = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

            return [
                esc(item.category),     // Category (Extracted from URL)
                esc(item.systemModel),  // System Model (Extracted from URL)
                esc(item.systemMfg),    // System Mfg (Extracted from URL)
                esc(item.partMfg),      // Part Mfg (Extracted from URL)
                esc(item.partName),     // Comments (Using Title)
                esc(item.partNumber),   // Part Number (Extracted from URL)
                esc(item.partName),     // Part/Item Name (Title)
                esc("Used"),            // Condition (Default)
                esc("For Sale"),        // Listing Type
                esc(""),                // Request Type
                esc(""),                // Price (Unknown)
                esc(""),                // Quantity (Unknown)
                esc(item.listingId)     // Listing ID (Extracted - IMPORTANT for updates)
            ].join(",");
        });

        const finalContent = outputHeader.join(",") + "\n" + csvRows.join("\n");
        const outputFilename = 'dotmed_existing_formatted.csv';
        
        fs.writeFileSync(path.join(__dirname, outputFilename), finalContent);
        console.log(`SUCCESS! Created '${outputFilename}'`);
        console.log(`This file matches the upload format but contains your EXISTING items.`);
    }
}

convertExistingToFormat();