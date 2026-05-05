const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// URL with 15 items per page. user=102949
const START_URL = "https://www.dotmed.com/webstore/?user=247174&description=-1&manufacturer=-1&mode=all&sort=&order=&type=parts&listings_per_page=15";

async function runBrowserScan() {
    console.log("Launching Real Browser (Puppeteer)...");
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized'] 
    });
    
    const page = await browser.newPage();
    
    // We will track items by their UNIQUE URL now, not their Title
    let seenUrls = new Set();
    let allItems = [];
    
// resume from where it left. 0 beginning
    let offset = 3150;
    let hasMore = true;
    let pageCount = 1;

    console.log("Starting scan... DO NOT CLOSE the Chrome window.");

    while (hasMore) {
        try {
            const targetUrl = `${START_URL}&offset=${offset}`;
            await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

            // Wait 2-3 seconds for page to settle
            const randomWait = Math.floor(Math.random() * 1000) + 2000;
            await new Promise(r => setTimeout(r, randomWait));

            // Extract items
            const extractedItems = await page.evaluate(() => {
                const results = [];
                // Look for links inside the H4 tag (Title Links only) to avoid grabbing image links twice
                const links = document.querySelectorAll('h4 a[href*="/listing/"]');
                
                links.forEach(link => {
                    const title = link.innerText.trim();
                    const href = link.getAttribute('href');
                    if (title && href) {
                        results.push({ title, href });
                    }
                });
                return results;
            });

            // Filter duplicates using URL
            let newItemsOnPage = 0;
            for (const item of extractedItems) {
                if (!seenUrls.has(item.href)) {
                    seenUrls.add(item.href); // Remember this URL
                    allItems.push({
                        title: item.title,
                        cleanTitle: item.title.toLowerCase().replace(/[^a-z0-9]/g, ''),
                        url: item.href
                    });
                    newItemsOnPage++;
                }
            }

            console.log(`Page ${pageCount} (Offset ${offset}): Found ${newItemsOnPage} new items. (Total Unique: ${allItems.length})`);

            // STOPPING LOGIC
            if (newItemsOnPage === 0) {
                 // Double check if we are at the end by looking for a "Next" button/link
                 const hasNext = await page.evaluate(() => {
                     // Check if there is an active 'Next' page link in pagination
                     return !!document.querySelector('.pagination .page-item:last-child a');
                 });
                 
                 // If we found 0 items and there is no next button (or we are deep in offsets), we stop.
                 if (!hasNext && pageCount > 1) {
                     console.log("No new items and no 'Next' button found. Scan complete.");
                     hasMore = false;
                 }
                 
                 // Safety: If we get 3 empty pages in a row, we stop
                 if (offset > 35000) hasMore = false; // Hard limit for safety
            }

            // Move to next page
            offset += 15;
            pageCount++;

        } catch (error) {
            console.error("Error on page:", error.message);
            await new Promise(r => setTimeout(r, 5000));
        }
    }

    await browser.close();

    // Save File
    const csvContent = 'Title,CleanTitle,URL\n' + 
        allItems.map(i => `"${i.title.replace(/"/g, '""')}","${i.cleanTitle}","${i.url}"`).join('\n');
    
    fs.writeFileSync(path.join(__dirname, 'dotmed_existing.csv'), csvContent);
    console.log(`------------------------------------------------`);
    console.log(`DONE! Saved ${allItems.length} items to dotmed_existing.csv`);
    console.log(`------------------------------------------------`);
}

runBrowserScan();