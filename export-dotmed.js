const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// 1. Initialize Firebase Admin
// Make sure service-account.json is in the same folder!
const serviceAccount = require('./service-account.json'); 

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Helper to escape CSV fields (handles commas and quotes inside text)
const escapeCsv = (field) => {
  if (field === undefined || field === null) return '';
  const stringField = String(field).replace(/"/g, '""'); // Double up quotes
  return `"${stringField}"`; // Surround with quotes
};

async function generateDotmedCSV() {
  console.log('Fetching products from Firebase...');
  
  // We will fetch both collections
  const collections = ['products', 'Systems'];
  let allItems = [];

  for (const colName of collections) {
    const snapshot = await db.collection(colName).get();
    snapshot.forEach(doc => {
      const data = doc.data();
      allItems.push({ ...data, _id: doc.id, _type: colName });
    });
  }

  console.log(`Found ${allItems.length} total items.`);

  // 2. Define DotMed Headers
  // These are standard generic headers. 
  // IMPORTANT: You might need to change these to match the DotMed Sample File exactly.
  const headers = [
    'Manufacturer',
    'Model',
    'Description', // Often mapped to "Headline" or "Title"
    'Category',
    'Price',
    'Quantity',
    'Condition',
    'Image URL',
    'Internal Part Number'
  ];

  // Start the CSV string
  let csvContent = headers.join(',') + '\n';

  // 3. Loop through items and format them
  for (const item of allItems) {
    
    // Normalize Data
    const manufacturer = item.MANUFACTURER || item.BRAND || '';
    const partNumber = item['PART NUMBER'] || item.PART_NUMBER || item.partNumber || '';
    const modality = item.MODALITY || item.MODELITY || '';
    
    // Construct a Title/Headline
    // DotMed likes descriptive titles: "GE 12345 MRI Coil"
    let title = item.DESCRIPTION || '';
    if (!title.toLowerCase().includes(manufacturer.toLowerCase())) {
        title = `${manufacturer} ${title}`;
    }

    // Clean up Images (DotMed usually accepts one URL or comma-separated)
    let imageUrl = item.IMAGES || item.IMAGE || '';
    if (imageUrl.includes(';')) {
        // If you have multiple images joined by ';', replace with ',' if DotMed requires commas
        // Or just take the first one if they only allow one.
        // Let's try sending all of them separated by a pipe '|' or comma ',' depending on DotMed specs.
        imageUrl = imageUrl.replace(/;/g, ','); 
    }

    // Create the row
    const row = [
      escapeCsv(manufacturer),
      escapeCsv(partNumber), // Using Part Number as Model
      escapeCsv(title),      // Description/Headline
      escapeCsv(modality),   // Category
      escapeCsv(item.PRICE || ''), // Price
      escapeCsv('1'),        // Quantity (Default to 1)
      escapeCsv('Used'),     // Condition (Default to Used)
      escapeCsv(imageUrl),
      escapeCsv(partNumber)  // Internal reference
    ];

    csvContent += row.join(',') + '\n';
  }

  // 4. Write to file
  const outputPath = path.join(__dirname, 'dotmed_upload.csv');
  fs.writeFileSync(outputPath, csvContent);

  console.log(`SUCCESS: Created 'dotmed_upload.csv' with ${allItems.length} items.`);
  console.log(`Location: ${outputPath}`);
}

generateDotmedCSV().catch(console.error);