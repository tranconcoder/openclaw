const puppeteer = require('puppeteer-core');

// In Docker, 'browserless' is the hostname. On host, use 'localhost' if port is mapped.
const BROWSER_WS_URL = process.env.BROWSER_WS_URL || 'ws://browserless:3000';

function formatMsg(jobs, source) {
    let md = `## 🔥 IT Jobs Mới Trên ${source} (Backend, Intern/Fresher, HCM/Remote, Hôm nay)\n\n`;
    if (jobs.length === 0) {
        md += `*Không tìm thấy job mới thỏa tiêu chí trong 24h qua (hoặc site chặn truy cập).* \n\n***\n\n`;
        return md;
    }
    jobs.forEach((job, idx) => {
        md += `*   **${idx + 1}. [${job.title}](${job.link})**\n`;
        md += `    * 🏢 **Công ty:** ${job.company}\n`;
        md += `    * 📍 **Địa điểm:** ${job.location} | ⏳ **Cập nhật:** ${job.time || 'Hôm nay/Mới nhất'}\n`;
    });
    return md + '\n***\n\n';
}

async function scrapeJobs(browser, url, selector) {
    const page = await browser.newPage();
    try {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        
        // Wait for page to load and some content to appear
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        const items = await page.$$eval(selector, (els) => {
            return els.slice(0, 10).map(el => {
                const titleNode = el.querySelector('h3 a, .title a, h2 a, .job-title a, .base-search-card__title, .title-job a');
                const companyNode = el.querySelector('.company, .company-name, .base-search-card__subtitle, .brand-name');
                const locationNode = el.querySelector('.location, .address, .job-search-card__location, .city');
                const timeNode = el.querySelector('.time, .distance-time-job-posted, time, .posted-date');
                
                return {
                    title: titleNode?.innerText.trim() || "",
                    link: titleNode?.href || "",
                    company: companyNode?.innerText.trim() || "Unknown",
                    location: locationNode?.innerText.trim() || "Hồ Chí Minh",
                    time: timeNode?.innerText.trim() || "Gần đây"
                };
            });
        });

        // Filter results in the main Node.js context (not browser context)
        return items.filter(item => {
            const loc = item.location.toLowerCase();
            const isHCMorRemote = loc.includes('ho chi minh') || loc.includes('hồ chí minh') || loc.includes('hcm') || loc.includes('remote') || loc.includes('từ xa') || loc.includes('vietnam');
            
            const time = item.time.toLowerCase();
            const isToday = time.includes('giờ trước') || time.includes('phút trước') || time.includes('hôm nay') || time.includes('hours ago') || time.includes('minutes ago') || time.includes('just now');
            
            return item.title && isHCMorRemote && isToday;
        });
    } catch (err) {
        console.error(`Error scraping ${url}:`, err.message);
        return [];
    } finally {
        await page.close();
    }
}

async function main() {
    console.log("# 🚀 JOBS IT BACKEND (INTERN/FRESHER) TẠI HCM/REMOTE HÔM NAY\n");
    console.log("*Note: Sử dụng Puppeteer để lấy dữ liệu mới nhất (đảm bảo độ chính xác hơn).*\n\n***\n");

    let browser;
    try {
        browser = await puppeteer.connect({ browserWSEndpoint: BROWSER_WS_URL });
        
        // --- LinkedIn ---
        const lnUrl = 'https://www.linkedin.com/jobs/search/?keywords=backend%20OR%20nodejs%20OR%20php%20OR%20java%20%28intern%20OR%20fresher%29&location=Vietnam&f_TPR=r86400';
        const lnJobs = await scrapeJobs(browser, lnUrl, '.jobs-search__results-list > li');
        console.log(formatMsg(lnJobs.slice(0, 5), 'LinkedIn'));

        // --- TopCV ---
        const topcvUrl = 'https://www.topcv.vn/tim-viec-lam-backend-fresher-tai-ho-chi-minh-kl2';
        const topcvJobs = await scrapeJobs(browser, topcvUrl, '.job-item-2');
        console.log(formatMsg(topcvJobs.slice(0, 5), 'TopCV'));

        // --- TopDev ---
        const topdevFresherUrl = 'https://topdev.vn/jobs/search?job_categories_ids=2&job_levels_ids=1617&page=1&keyword=backend';
        const topdevInternUrl = 'https://topdev.vn/jobs/search?job_categories_ids=2&job_levels_ids=1616&page=1&keyword=backend';
        
        const [tdFresher, tdIntern] = await Promise.all([
            scrapeJobs(browser, topdevFresherUrl, '.job-item, .job-card-item'),
            scrapeJobs(browser, topdevInternUrl, '.job-item, .job-card-item')
        ]);
        console.log(formatMsg([...tdFresher, ...tdIntern].slice(0, 8), 'TopDev'));

        // --- ITViec ---
        const itviecUrl = 'https://itviec.com/it-jobs/backend/ho-chi-minh-hcm?job_level%5B%5D=fresher';
        const itviecJobs = await scrapeJobs(browser, itviecUrl, '.job-card');
        console.log(formatMsg(itviecJobs.slice(0, 5), 'ITViec'));

    } catch (err) {
        console.error("Critical Error:", err.message);
        console.log(`*(⚠️ Lỗi kết nối trình duyệt: ${err.message})*\n\n`);
    } finally {
        if (browser) await browser.disconnect();
    }
}

main().catch(console.error);
