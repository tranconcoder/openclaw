async function scrape(browser) {
    const url = 'https://www.vietnamworks.com/viec-lam?q=backend&l=29.15&g=5';
    let page;
    
    try {
        page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        console.log(`[Crawler API - VietnamWorks] Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Save raw HTML for evaluation
        if (arguments[1]) {
            const fs = require('fs');
            const path = require('path');
            const html = await page.content();
            fs.writeFileSync(path.join(arguments[1], 'vietnamworks_raw.html'), html);
        }
        
        // Use __NEXT_DATA__ extraction if possible
        const data = await page.evaluate(() => {
            const el = document.getElementById('__NEXT_DATA__');
            if (el) {
                try {
                    const json = JSON.parse(el.innerText);
                    // Path: props.pageProps.initialState.jobList.data
                    return json.props?.pageProps?.initialState?.jobList?.data || [];
                } catch (e) {
                    return [];
                }
            }
            return [];
        });

        if (data.length > 0) {
            console.log(`[Crawler API - VietnamWorks] Extracted ${data.length} jobs from __NEXT_DATA__`);
            return data.map(item => ({
                title: item.jobTitle || "",
                link: item.jobUrl ? `https://www.vietnamworks.com${item.jobUrl}` : "",
                company: item.companyName || "Unknown",
                location: item.locationName || "Hồ Chí Minh",
                time: "Hôm nay",
                description: item.jobDescription || item.skills?.join(', ') || "",
                source: "VietnamWorks"
            })).filter(job => job.title && job.link);
        }

        // Fallback to DOM if JSON fails
        const selector = '.job-item, [class*="job-item"], div.block-job-list > div, div.block-job-list a';
        await new Promise(r => setTimeout(r, 5000));
        const filtered = await page.$$eval(selector, (els) => {
            return els.slice(0, 10).map(el => {
                const linkNode = el.querySelector('a');
                const titleNode = el.querySelector('h3, h2, [class*="title"]');
                const companyNode = el.querySelector('[class*="company"]');
                const locationNode = el.querySelector('[class*="address"], [class*="location"]');
                const timeNode = el.querySelector('[class*="time"], [class*="updated"]');
                
                const descNode = el.querySelector('.job-snippet, .requirements, p, [class*="skill"]');
                return {
                    title: titleNode?.innerText.trim() || el.innerText.split('\n')[0].trim(),
                    link: el.href || linkNode?.href || "",
                    company: companyNode?.innerText.trim() || "Unknown",
                    location: locationNode?.innerText.trim() || "Hồ Chí Minh",
                    time: timeNode?.innerText.trim() || "Hôm nay",
                    description: descNode?.innerText.trim() || "",
                    source: "VietnamWorks"
                };
            }).filter(item => item.title && item.link);
        });

        return filtered;
    } catch (err) {
        console.error(`[Crawler API - VietnamWorks] Error:`, err.message);
        return [];
    } finally {
        if (page) await page.close().catch(() => {});
    }
}

module.exports = { scrape };
