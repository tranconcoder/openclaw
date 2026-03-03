async function scrape(browser) {
    const url = 'https://www.linkedin.com/jobs/search?keywords=Backend&location=Ho+Chi+Minh+City&f_TPR=r86400&f_WT=2';
    const selector = '.jobs-search__results-list li';
    let page;
    
    try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        console.log(`[Crawler API - LinkedIn] Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Save raw HTML for evaluation
        if (arguments[1]) {
            const fs = require('fs');
            const path = require('path');
            const html = await page.content();
            fs.writeFileSync(path.join(arguments[1], 'linkedin_raw.html'), html);
        }
        
        await new Promise(r => setTimeout(r, 5000));
        
        const filtered = await page.$$eval(selector, (els) => {
            return els.slice(0, 15).map(el => {
                const linkNode = el.querySelector('a[href*="/jobs/view/"], a[href*="/jobs/"], .base-card__full-link, .title-job a, .job-item-2, a');
                const titleNode = el.querySelector('h3, h2, .title, .job-title, .base-search-card__title');
                const companyNode = el.querySelector('.company, .company-name, .base-search-card__subtitle, .brand-name, .sub-line-item');
                const locationNode = el.querySelector('.location, .address, .job-search-card__location, .city');
                const timeNode = el.querySelector('.time, .distance-time-job-posted, time, .posted-date');
                
                const descNode = el.querySelector('.job-search-card__snippet, .base-search-card__metadata, p, .description');
                return {
                    title: titleNode?.innerText.trim() || el.innerText.split('\n')[0].trim(),
                    link: linkNode?.href || "",
                    company: companyNode?.innerText.trim() || "Unknown",
                    location: locationNode?.innerText.trim() || "Hồ Chí Minh",
                    time: timeNode?.innerText.trim() || "Gần đây",
                    description: descNode?.innerText.trim() || "",
                    source: "LinkedIn"
                };
            }).filter(item => {
                const loc = item.location.toLowerCase();
                const isHCMorRemote = loc.includes('ho chi minh') || loc.includes('hồ chí minh') || loc.includes('hcm') || loc.includes('remote') || loc.includes('từ xa') || loc.includes('vietnam') || loc.includes('toàn quốc');
                
                const time = item.time.toLowerCase();
                const isToday = time.includes('giờ trước') || time.includes('phút trước') || time.includes('hôm nay') || 
                               time.includes('hours ago') || time.includes('minutes ago') || time.includes('just now') ||
                               time.includes('gần đây') || time.includes('mới');
                
                return item.title && isHCMorRemote && isToday;
            });
        });

        console.log(`[Crawler API - LinkedIn] Found ${filtered.length} matching jobs.`);
        return filtered;
    } catch (err) {
        console.error(`[Crawler API - LinkedIn] Error:`, err.message);
        return [];
    } finally {
        if (page) await page.close().catch(() => {});
    }
}

module.exports = { scrape };
