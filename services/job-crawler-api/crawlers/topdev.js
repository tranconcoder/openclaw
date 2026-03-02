async function scrape(browser, rawDir) {
    const urls = [
        'https://topdev.vn/jobs/search?job_categories_ids=2&job_levels_ids=1617&page=1&keyword=backend',
        'https://topdev.vn/jobs/search?job_categories_ids=2&job_levels_ids=1616&page=1&keyword=backend'
    ];
    const selector = '.job-item, .job-card-item, .item-job-item, div.rounded-\\[16px\\].border-brand-600, div.cursor-pointer.rounded-\\[16px\\]';
    let allJobs = [];
    const fs = require('fs');
    const path = require('path');

    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        let page;
        try {
            page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            console.log(`[Crawler API - TopDev] Navigating to ${url}`);
            
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
            
            // Wait for potential dynamic content
            await new Promise(r => setTimeout(r, 5000));

            // Save raw HTML for evaluation
            if (rawDir) {
                const html = await page.content();
                fs.writeFileSync(path.join(rawDir, `topdev_raw_${i}.html`), html);
                console.log(`[Crawler API - TopDev] Raw HTML saved to topdev_raw_${i}.html`);
            }
            
            const filtered = await page.$$eval(selector, (els) => {
                return els.slice(0, 20).map(el => {
                    const linkNode = el.querySelector('a[href*="/viec-lam/"], a[href*="/jobs/view/"], a');
                    const titleNode = el.querySelector('h3, h2, .title, .job-title, [class*="job-title"]');
                    const companyNode = el.querySelector('.company, .company-name, .brand-name, [class*="company"]');
                    const locationNode = el.querySelector('.location, .address, .city, [class*="location"]');
                    const timeNode = el.querySelector('.time, .distance-time-job-posted, .posted-date, [class*="time"]');
                    
                    return {
                        title: titleNode?.innerText.trim() || el.innerText.split('\n')[0].trim(),
                        link: linkNode?.href || "",
                        company: companyNode?.innerText.trim() || "Unknown",
                        location: locationNode?.innerText.trim() || "Hồ Chí Minh",
                        time: timeNode?.innerText.trim() || "Gần đây",
                        source: "TopDev"
                    };
                }).filter(item => item.title && item.link && item.link.includes('http'));
            });
            console.log(`[Crawler API - TopDev] Found ${filtered.length} jobs on page ${i}`);
            allJobs = allJobs.concat(filtered);
        } catch (err) {
            console.error(`[Crawler API - TopDev] Error scraping ${url}:`, err.message);
        } finally {
            if (page) await page.close();
        }
    }
    return allJobs;
}

module.exports = { scrape };
