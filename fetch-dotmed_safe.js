const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// --- SETTINGS ---
const SAVE_INTERVAL = 500; // Save to file every 500 items found
// user=102949
const START_URL = "https://www.dotmed.com/webstore/?user=383840&description=-1&manufacturer=-1&mode=all&sort=&order=&type=parts&listings_per_page=15";
const FILENAME = 'dotmed_existing.csv';

async function runSafeScan() {
    console.log("================================================");
    console.log("   STARTING SAFE BROWSER SCAN (AUTO-SAVE)       ");
    console.log("================================================");

    // 1. LOAD EXISTING DATA (So we don't start from zero)
    let seenUrls = new Set();
    let allItems = [];
    const filePath = path.join(__dirname, FILENAME);

    if (fs.existsSync(filePath)) {
        console.log("Found existing file. Loading previous items...");
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').slice(1); // Skip header
        
        lines.forEach(line => {
            const parts = line.split('","');
            if (parts.length >= 3) {
                const url = parts[2].replace(/"/g, '').trim();
                const title = parts[0].replace(/"/g, '').trim();
                const cleanTitle = parts[1].replace(/"/g, '').trim();
                
                if (url) {
                    seenUrls.add(url);
                    allItems.push({ title, cleanTitle, url });
                }
            }
        });
        console.log(`-> Loaded ${allItems.length} existing items.`);
    }

    // 2. LAUNCH BROWSER
    console.log("Launching Browser...");
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized'] 
    });
    
    const page = await browser.newPage();
    
    // Safety: Block images/fonts to speed up and reduce "Frame Detached" errors
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
            req.abort();
        } else {
            req.continue();
        }
    });

    let offset = 6317; // You can change this manually if you want to skip ahead. e.g offset =3000
    let hasMore = true;
    let pageCount = 1;
    let newItemsSession = 0;

    console.log("Starting scan... (Progress will be saved automatically)");

    while (hasMore) {
        try {
            const targetUrl = `${START_URL}&offset=${offset}`;
            
            // Wait for network idle to prevent "Frame Detached" errors
            await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

            // Random human-like pause
            const randomWait = Math.floor(Math.random() * 1000) + 1500;
            await new Promise(r => setTimeout(r, randomWait));

            // Extract items
            const extractedItems = await page.evaluate(() => {
                const results = [];
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

            // Filter duplicates
            let newOnPage = 0;
            for (const item of extractedItems) {
                if (!seenUrls.has(item.href)) {
                    seenUrls.add(item.href);
                    allItems.push({
                        title: item.title,
                        cleanTitle: item.title.toLowerCase().replace(/[^a-z0-9]/g, ''),
                        url: item.href
                    });
                    newOnPage++;
                    newItemsSession++;
                }
            }

            console.log(`Page ${pageCount} (Offset ${offset}): Found ${newOnPage} NEW items. (Total: ${allItems.length})`);

            // --- AUTO-SAVE FEATURE ---
            if (newItemsSession > 0 && newItemsSession % SAVE_INTERVAL < 15) {
                console.log(`   [AUTO-SAVE] Saving ${allItems.length} items to disk...`);
                saveToFile(allItems);
            }
            // -------------------------

            // Stopping Logic
            if (newOnPage === 0) {
                 const hasNext = await page.evaluate(() => !!document.querySelector('.pagination .page-item:last-child a'));
                 if (!hasNext && pageCount > 1) {
                     console.log("No 'Next' button found. Scan complete.");
                     hasMore = false;
                 }
                 if (offset > 35000) hasMore = false; // Safety limit
            }

            offset += 15;
            pageCount++;

        } catch (error) {
            console.error("Error on page (Retrying in 5s):", error.message);
            await new Promise(r => setTimeout(r, 5000));
            // We do NOT increment offset here, so it retries the same page
        }
    }

    await browser.close();
    saveToFile(allItems);
    console.log("DONE! Final save complete.");
}

function saveToFile(items) {
    const csvContent = 'Title,CleanTitle,URL\n' + 
        items.map(i => `"${i.title.replace(/"/g, '""')}","${i.cleanTitle}","${i.url}"`).join('\n');
    
    fs.writeFileSync(path.join(__dirname, FILENAME), csvContent);
}

runSafeScan();