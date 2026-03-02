async function scrape(browser) {
    const url = 'https://glints.com/vn/opportunities/jobs/explore?slug=computer-software&country=VN&workArrangementOptions=&HierarchicalJobCategoryIds=9dd9bc4d-38d5-4b5e-876a-de19bc22da45&yearsOfExperienceRanges=FRESH_GRAD%2CLESS_THAN_A_YEAR&sortBy=LATEST';
    const selector = '[class*="JobCardSc__JobCardWrapper"], [class*="JobCardsc__JobCardWrapper"]';
    let page;
    
    try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        console.log(`[Crawler API - Glints] Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Save raw HTML for evaluation
        if (arguments[1]) {
            const fs = require('fs');
            const path = require('path');
            const html = await page.content();
            fs.writeFileSync(path.join(arguments[1], 'glints_raw.html'), html);
        }
        await new Promise(r => setTimeout(r, 5000));
        
        const filtered = await page.$$eval(selector, (els) => {
            return els.slice(0, 10).map(el => {
                const linkNode = el.querySelector('a');
                const titleNode = el.querySelector('h3, h2');
                const companyNode = el.querySelector('[class*="CompanyLocation__CompanyName"]');
                const locationNode = el.querySelector('[class*="CompanyLocation__Location"]');
                const timeNode = el.querySelector('[class*="UpdatedAt"]');
                
                const linkSrc = el.href || (el.closest && el.closest('a') ? el.closest('a').href : null) || linkNode?.href || "";
                const finalLink = linkSrc && linkSrc.startsWith('/') ? `https://glints.com${linkSrc}` : linkSrc;
                return {
                    title: titleNode?.innerText.trim() || el.innerText.split('\n')[0].trim(),
                    link: finalLink,
                    company: companyNode?.innerText.trim() || "Unknown",
                    location: locationNode?.innerText.trim() || "Hồ Chí Minh",
                    time: timeNode?.innerText.trim() || "Hôm nay",
                    source: "Glints"
                };
            }).filter(item => item.title && item.link);
        });

        console.log(`[Crawler API - Glints] Found ${filtered.length} matching jobs.`);
        return filtered;
    } catch (err) {
        console.error(`[Crawler API - Glints] Error:`, err.message);
        return [];
    } finally {
        if (page) await page.close();
    }
}

module.exports = { scrape };
