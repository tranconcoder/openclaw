async function scrape(browser) {
    const url = 'https://vieclam24h.vn/viec-lam-it-phan-mem-tai-tp-hcm-o8p122.html?q=backend';
    const selector = '[data-testid="job-card"], .job-item, div.flex.flex-col.rounded-\\[8px\\].bg-white.border';
    let page;
    
    try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        console.log(`[Crawler API - Vieclam24h] Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Save raw HTML for evaluation
        if (arguments[1]) {
            const fs = require('fs');
            const path = require('path');
            const html = await page.content();
            fs.writeFileSync(path.join(arguments[1], 'vieclam24h_raw.html'), html);
        }
        await new Promise(r => setTimeout(r, 5000));
        
        const filtered = await page.$$eval(selector, (els) => {
            return els.slice(0, 10).map(el => {
                const linkNode = el.querySelector('a');
                const titleNode = el.querySelector('h3, h2, [class*="title"]');
                const companyNode = el.querySelector('[class*="company"]');
                const locationNode = el.querySelector('[class*="address"], [class*="location"]');
                const timeNode = el.querySelector('[class*="time"], [class*="updated"]');
                
                const linkHref = el.href || (el.closest('a') ? el.closest('a').href : null) || linkNode?.href || "";
                return {
                    title: titleNode?.innerText.trim() || el.innerText.split('\n')[0].trim(),
                    link: linkHref,
                    company: companyNode?.innerText.trim() || "Unknown",
                    location: locationNode?.innerText.trim() || "Hồ Chí Minh",
                    time: timeNode?.innerText.trim() || "Hôm nay",
                    source: "Vieclam24h"
                };
            }).filter(item => item.title && item.link);
        });

        console.log(`[Crawler API - Vieclam24h] Found ${filtered.length} matching jobs.`);
        return filtered;
    } catch (err) {
        console.error(`[Crawler API - Vieclam24h] Error:`, err.message);
        return [];
    } finally {
        if (page) await page.close().catch(() => {});
    }
}

module.exports = { scrape };
