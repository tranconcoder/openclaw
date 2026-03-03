async function scrape(browser) {
    const sources = [
        { level: 'intern', url: 'https://careerviet.vn/viec-lam/backend-tai-ho-chi-minh-kc1l8e1-vi.html' },
        { level: 'fresher', url: 'https://careerviet.vn/viec-lam/backend-tai-ho-chi-minh-kc1l8e2-vi.html' },
        { level: 'junior', url: 'https://careerviet.vn/viec-lam/backend-tai-ho-chi-minh-kc1l8e3-vi.html' }
    ];
    const selector = '.job-item, .item-job';
    let page;
    const allJobs = [];
    
    try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        for (const source of sources) {
            console.log(`[Crawler API - CareerViet] Navigating to ${source.level}: ${source.url}`);
            await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            // Save raw HTML for evaluation
            if (arguments[1]) {
                const fs = require('fs');
                const path = require('path');
                const html = await page.content();
                fs.writeFileSync(path.join(arguments[1], `careerviet_${source.level}_raw.html`), html);
            }
            
            await new Promise(r => setTimeout(r, 3000));
            
            const jobs = await page.$$eval(selector, (els, level) => {
                return els.slice(0, 10).map(el => {
                    const linkNode = el.querySelector('a');
                    const titleNode = el.querySelector('.job-title, h2, h3');
                    const companyNode = el.querySelector('.company-name, .company');
                    const locationNode = el.querySelector('.location');
                    const timeNode = el.querySelector('.time, .post-date');
                    
                    const descNode = el.querySelector('.job-snippet, .skills, .tag, p');
                    return {
                        title: titleNode?.innerText.trim() || el.innerText.split('\n')[0].trim(),
                        link: linkNode?.href || "",
                        company: companyNode?.innerText.trim() || "Unknown",
                        location: locationNode?.innerText.trim() || "Hồ Chí Minh",
                        time: timeNode?.innerText.trim() || "Hôm nay",
                        description: descNode?.innerText.trim() || "",
                        source: `CareerViet (${level})`
                    };
                }).filter(item => item.title && item.link);
            }, source.level);

            allJobs.push(...jobs);
        }

        console.log(`[Crawler API - CareerViet] Total found: ${allJobs.length} jobs.`);
        return allJobs;
    } catch (err) {
        console.error(`[Crawler API - CareerViet] Error:`, err.message);
        return allJobs; // Return what we have so far
    } finally {
        if (page) await page.close().catch(() => {});
    }
}

module.exports = { scrape };
