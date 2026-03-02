async function scrape(browser) {
    const url = 'https://careerviet.vn/vi/tim-viec-lam/backend-fresher.html';
    const selector = '.job-item, .item-job';
    let page;
    
    try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        console.log(`[Crawler API - CareerViet] Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 5000));
        
        const filtered = await page.$$eval(selector, (els) => {
            return els.slice(0, 10).map(el => {
                const linkNode = el.querySelector('a');
                const titleNode = el.querySelector('.job-title, h2, h3');
                const companyNode = el.querySelector('.company-name, .company');
                const locationNode = el.querySelector('.location');
                const timeNode = el.querySelector('.time, .post-date');
                
                return {
                    title: titleNode?.innerText.trim() || el.innerText.split('\n')[0].trim(),
                    link: linkNode?.href || "",
                    company: companyNode?.innerText.trim() || "Unknown",
                    location: locationNode?.innerText.trim() || "Hồ Chí Minh",
                    time: timeNode?.innerText.trim() || "Hôm nay",
                    source: "CareerViet"
                };
            }).filter(item => item.title && item.link);
        });

        console.log(`[Crawler API - CareerViet] Found ${filtered.length} matching jobs.`);
        return filtered;
    } catch (err) {
        console.error(`[Crawler API - CareerViet] Error:`, err.message);
        return [];
    } finally {
        if (page) await page.close();
    }
}

module.exports = { scrape };
