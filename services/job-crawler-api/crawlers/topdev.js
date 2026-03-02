async function scrape(browser) {
    const urls = [
        'https://topdev.vn/jobs/search?job_categories_ids=2&job_levels_ids=1617&page=1&keyword=backend',
        'https://topdev.vn/jobs/search?job_categories_ids=2&job_levels_ids=1616&page=1&keyword=backend'
    ];
    const selector = '.job-item, .job-card-item, .item-job-item';
    let allJobs = [];

    for (const url of urls) {
        let page;
        try {
            page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            console.log(`[Crawler API - TopDev] Navigating to ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            await new Promise(r => setTimeout(r, 5000));
            
            const filtered = await page.$$eval(selector, (els) => {
                return els.slice(0, 10).map(el => {
                    const linkNode = el.querySelector('a[href*="/jobs/view/"], a[href*="/jobs/"], a');
                    const titleNode = el.querySelector('h3, h2, .title, .job-title');
                    const companyNode = el.querySelector('.company, .company-name, .brand-name');
                    const locationNode = el.querySelector('.location, .address, .city');
                    const timeNode = el.querySelector('.time, .distance-time-job-posted, .posted-date');
                    
                    return {
                        title: titleNode?.innerText.trim() || el.innerText.split('\n')[0].trim(),
                        link: linkNode?.href || "",
                        company: companyNode?.innerText.trim() || "Unknown",
                        location: locationNode?.innerText.trim() || "Hồ Chí Minh",
                        time: timeNode?.innerText.trim() || "Gần đây",
                        source: "TopDev"
                    };
                }).filter(item => {
                    const time = item.time.toLowerCase();
                    return item.title && (time.includes('giờ') || time.includes('phút') || time.includes('hôm nay') || time.includes('gần đây') || time.includes('mới'));
                });
            });
            allJobs = allJobs.concat(filtered);
        } catch (err) {
            console.error(`[Crawler API - TopDev] Error:`, err.message);
        } finally {
            if (page) await page.close();
        }
    }
    return allJobs;
}

module.exports = { scrape };
