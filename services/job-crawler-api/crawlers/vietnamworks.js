async function scrape(browser) {
    const url = 'https://www.vietnamworks.com/tim-viec-lam/it-phan-mem-c2?q=backend%20fresher';
    const selector = '.job-item, [class*="job-item"]';
    let page;
    
    try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        console.log(`[Crawler API - VietnamWorks] Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 5000));
        
        const filtered = await page.$$eval(selector, (els) => {
            return els.slice(0, 10).map(el => {
                const linkNode = el.querySelector('a');
                const titleNode = el.querySelector('h3, h2, [class*="title"]');
                const companyNode = el.querySelector('[class*="company"]');
                const locationNode = el.querySelector('[class*="location"], [class*="address"]');
                const timeNode = el.querySelector('[class*="posted"], [class*="time"]');
                
                return {
                    title: titleNode?.innerText.trim() || el.innerText.split('\n')[0].trim(),
                    link: linkNode?.href || "",
                    company: companyNode?.innerText.trim() || "Unknown",
                    location: locationNode?.innerText.trim() || "Hồ Chí Minh",
                    time: timeNode?.innerText.trim() || "Mới đây",
                    source: "VietnamWorks"
                };
            }).filter(item => item.title && item.link);
        });

        console.log(`[Crawler API - VietnamWorks] Found ${filtered.length} matching jobs.`);
        return filtered;
    } catch (err) {
        console.error(`[Crawler API - VietnamWorks] Error:`, err.message);
        return [];
    } finally {
        if (page) await page.close();
    }
}

module.exports = { scrape };
