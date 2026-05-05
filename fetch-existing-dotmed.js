const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// We use the EXACT base URL found in your debug HTML file
// We removed specific parameters to let the loop handle them cleanly
const BASE_URL_START = "https://www.dotmed.com/webstore/?user=102949&description=-1&manufacturer=-1&mode=all&sort=&order=&type=parts&listings_per_page=15";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAllExistingListings() {
    console.log(`Starting Stealth Scan (Step 15)...`);
    
    let offset = 0;
    const stepSize = 15; 
    let hasMore = true;
    let allItems = [];
    let consecutiveEmptyPages = 0; 
    let pageCount = 1;

    // FAKE BROWSER HEADERS (Crucial for not getting blocked)
    const headers = { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.dotmed.com/'
    };

    while (hasMore) {
        try {
            // Construct URL exactly how DotMed expects it
            const targetUrl = `${BASE_URL_START}&offset=${offset}`;
            
            // console.log(`Fetching: ${targetUrl}`); // Uncomment to see exact links
            
            const response = await axios.get(targetUrl, { headers });
            const $ = cheerio.load(response.data);
            
            // 1. FIND ITEMS
            // We look for the specific listing row class from your HTML file
            // Your HTML shows id="listing_5545247_" class="row listing-list..."
            const productRows = $('.listing-list');
            
            let newItemsOnPage = 0;

            productRows.each((i, el) => {
                // Find the title link inside this row
                const linkTag = $(el).find('h4 a');
                const title = linkTag.text().trim();
                const href = linkTag.attr('href');

                if (title && href) {
                    const isDuplicate = allItems.some(item => item.title === title);
                    if (!isDuplicate) {
                        allItems.push({
                            title: title,
                            cleanTitle: title.toLowerCase().replace(/[^a-z0-9]/g, '')
                        });
                        newItemsOnPage++;
                    }
                }
            });

            // 2. CHECK RESULTS
            if (newItemsOnPage === 0) {
                consecutiveEmptyPages++;
                console.log(`Page ${pageCount} (Offset ${offset}): 0 items found.`);
                
                // --- EMERGENCY DEBUG SAVE ---
                // If we fail on Page 1 or 2, something is WRONG (Blocked/Captcha).
                if (pageCount <= 2) {
                    console.log("!!! SAVING DEBUG FILE !!!");
                    fs.writeFileSync(path.join(__dirname, 'debug_failed_scan.html'), response.data);
                    console.log("Saved 'debug_failed_scan.html' to your Desktop/Folder.");
                    console.log("Please open that file to see why DotMed blocked us.");
                    hasMore = false; 
                    break;
                }

                if (consecutiveEmptyPages >= 5) {
                    hasMore = false;
                    console.log('Scan complete (No new items for 5 pages).');
                    break;
                }
            } else {
                consecutiveEmptyPages = 0; 
                console.log(`Page ${pageCount} (Offset ${offset}): Found ${newItemsOnPage} new items. (Total: ${allItems.length})`);
            }

            // 3. NEXT STEP
            offset += stepSize;
            pageCount++;
            
            // SLOWER: Wait 1 full second to be polite and avoid blocks
            await sleep(1000); 

        } catch (error) {
            console.error(`Error at offset ${offset}:`, error.message);
            await sleep(5000); // Wait 5 seconds if there is an error
        }
    }

    // 4. SAVE CSV
    if (allItems.length > 0) {
        const csvContent = 'Title,CleanTitle\n' + 
            allItems.map(i => `"${i.title.replace(/"/g, '""')}","${i.cleanTitle}"`).join('\n');
        
        const outputPath = path.join(__dirname, 'dotmed_existing.csv');
        fs.writeFileSync(outputPath, csvContent);

        console.log(`------------------------------------------------`);
        console.log(`SUCCESS: Saved ${allItems.length} items to dotmed_existing.csv`);
        console.log(`------------------------------------------------`);
    } else {
        console.log("FAILED: No items were saved because none were found.");
    }
}

fetchAllExistingListings();