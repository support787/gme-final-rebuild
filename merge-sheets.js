const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function mergeSheets() {
    console.log("========================================");
    console.log("   STARTING CSV MERGE PROCESS           ");
    console.log("========================================");

    const fileAPath = path.join(__dirname, 'A.csv');
    const fileBPath = path.join(__dirname, 'B.csv');
    const outputPath = path.join(__dirname, 'merged_output.csv');

    if (!fs.existsSync(fileAPath) || !fs.existsSync(fileBPath)) {
        console.error("ERROR: Could not find 'A.csv' or 'B.csv'.");
        return;
    }

    // --- 1. READ FILE B INTO MEMORY (The Source of Truth) ---
    console.log("Reading File B to build lookup map...");
    const mapB = new Map();
    
    const contentB = fs.readFileSync(fileBPath, 'utf-8');
    const linesB = contentB.split(/\r?\n/); // Handle Windows/Unix line endings
    
    // Assuming Row 1 is header, we skip it for the map, but we might need it later
    // We assume the structure is 5 columns. 
    // Column Index 4 is the "Part Number" (5th column).
    
    linesB.slice(1).forEach(line => {
        if (!line.trim()) return;
        
        // Split by comma, handling quotes roughly
        // (If your CSV has commas INSIDE quotes, we need a smarter regex)
        const cols = parseCSVLine(line);
        
        if (cols.length >= 5) {
            const key = cols[4].trim().toLowerCase(); // Column 5 is key
            if (key) {
                // Store the first 4 columns as the value
                // We only store the FIRST match we find (as requested)
                if (!mapB.has(key)) {
                    mapB.set(key, [cols[0], cols[1], cols[2], cols[3]]);
                }
            }
        }
    });

    console.log(`-> Indexed ${mapB.size} items from File B.`);

    // --- 2. PROCESS FILE A AND MERGE ---
    console.log("Processing File A and merging...");
    
    const contentA = fs.readFileSync(fileAPath, 'utf-8');
    const linesA = contentA.split(/\r?\n/);
    
    let mergedLines = [];
    let matchCount = 0;

    // Add Header (from A)
    mergedLines.push(linesA[0]); 

    linesA.slice(1).forEach(line => {
        if (!line.trim()) return;
        
        const cols = parseCSVLine(line);
        
        if (cols.length >= 5) {
            const key = cols[4].trim().toLowerCase(); // Part Number in A
            
            if (mapB.has(key)) {
                // MATCH FOUND! Replace cols 1-4 with data from B
                const dataB = mapB.get(key);
                
                // Update columns 0, 1, 2, 3
                cols[0] = dataB[0];
                cols[1] = dataB[1];
                cols[2] = dataB[2];
                cols[3] = dataB[3];
                
                matchCount++;
            }
        }
        
        // Reconstruct the line
        // We wrap fields in quotes to be safe
        const newLine = cols.map(c => `"${c.replace(/"/g, '""')}"`).join(',');
        mergedLines.push(newLine);
    });

    // --- 3. SAVE OUTPUT ---
    fs.writeFileSync(outputPath, mergedLines.join('\n'));
    
    console.log("----------------------------------------");
    console.log(`DONE! Processed ${linesA.length - 1} rows.`);
    console.log(`Updated ${matchCount} rows with data from File B.`);
    console.log(`Saved to: merged_output.csv`);
    console.log("----------------------------------------");
}

// Helper to handle CSV lines with quotes (e.g. "Smith, John",123)
function parseCSVLine(text) {
    const result = [];
    let cur = '';
    let inQuote = false;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(cur);
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur);
    
    // Clean up quotes from the resulting values
    return result.map(val => {
        val = val.trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        }
        return val.replace(/""/g, '"'); // Unescape double quotes
    });
}

mergeSheets();