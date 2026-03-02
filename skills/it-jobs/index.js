const cheerio = require('cheerio');

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
};

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

function isHCMorRemote(loc) {
    const l = loc.toLowerCase();
    return l.includes('ho chi minh') || l.includes('hồ chí minh') || l.includes('hcm') || l.includes('remote') || l.includes('từ xa');
}

function isToday(timeStr) {
    const t = timeStr.toLowerCase();
    return t.includes('giờ trước') || t.includes('phút trước') || t.includes('hôm nay') || t.includes('hours ago') || t.includes('minutes ago');
}

// --- LinkedIn ---
async function fetchLinkedInJobs() {
    try {
        const url = 'https://www.linkedin.com/jobs/search/?keywords=backend%20OR%20nodejs%20OR%20php%20OR%20java%20%28intern%20OR%20fresher%29&location=Vietnam&f_TPR=r86400';
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const html = await res.text();
        const $ = cheerio.load(html);

        const jobs = [];
        $('.jobs-search__results-list > li').each((i, el) => {
            const title = $(el).find('.base-search-card__title').text().trim();
            const company = $(el).find('.base-search-card__subtitle').text().trim();
            const location = $(el).find('.job-search-card__location').text().trim();
            const time = $(el).find('time').text().trim();
            const link = $(el).find('.base-card__full-link').attr('href') || $(el).find('.base-search-card__info > a').attr('href');
            
            if (title && isHCMorRemote(location)) {
                jobs.push({ title, company, location, link: link ? link.split('?')[0] : '', time });
            }
        });
        return formatMsg(jobs.slice(0, 5), 'LinkedIn');
    } catch (err) {
        return `*(⚠️ Lỗi lấy tin LinkedIn: ${err.message})*\n\n`;
    }
}

// --- TopCV ---
async function fetchTopCVJobs() {
    try {
        const url = 'https://www.topcv.vn/tim-viec-lam-backend-fresher-tai-ho-chi-minh-kl2';
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const html = await res.text();
        const $ = cheerio.load(html);

        const jobs = [];
        $('.job-item-2').each((i, el) => {
            const title = $(el).find('.title a span').text().trim() || $(el).find('h3 a span').text().trim();
            const link = $(el).find('.title a').attr('href') || $(el).find('h3 a').attr('href');
            const company = $(el).find('.company').text().trim();
            const location = $(el).find('.address').text().trim() || 'Hồ Chí Minh';
            const time = $(el).find('.time').text().trim();
            
            if (title && isHCMorRemote(location) && isToday(time)) {
                jobs.push({ title, company, location, link, time });
            }
        });
        return formatMsg(jobs.slice(0, 5), 'TopCV');
    } catch (err) {
        return `*(⚠️ Lỗi lấy tin TopCV: ${err.message})*\n\n`;
    }
}

// --- ITViec ---
async function fetchITViecJobs() {
    try {
        const url = 'https://itviec.com/it-jobs/backend/ho-chi-minh-hcm?job_level%5B%5D=fresher';
        const res = await fetch(url, { headers: { ...HEADERS, 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const html = await res.text();
        const $ = cheerio.load(html);

        const jobs = [];
        $('.job-card').each((i, el) => {
            const title = $(el).find('h3.title a').text().trim() || $(el).find('h3 a').text().trim();
            let link = $(el).find('h3 a').attr('href');
            if (link && !link.startsWith('http')) link = 'https://itviec.com' + link;
            const company = $(el).find('.company').text().trim() || $(el).find('.company-name').text().trim();
            const location = $(el).find('.location .text').text().trim() || 'Hồ Chí Minh';
            const time = $(el).find('.distance-time-job-posted').text().trim();
            
            if (title && isHCMorRemote(location)) {
                jobs.push({ title, company, location, link, time: time || 'Gần đây' });
            }
        });
        const todayJobs = jobs.filter(j => isToday(j.time) || j.time === 'Gần đây');
        return formatMsg(todayJobs.slice(0, 5), 'ITViec');
    } catch (err) {
        return `*(⚠️ Lỗi lấy tin ITViec có thể bị Cloudflare chặn: ${err.message})*\n\n`;
    }
}

// --- TopDev ---
async function fetchTopDevJobs() {
    try {
        const urls = [
            'https://topdev.vn/jobs/search?job_categories_ids=2&job_levels_ids=1617&page=1&keyword=backend', // Fresher
            'https://topdev.vn/jobs/search?job_categories_ids=2&job_levels_ids=1616&page=1&keyword=backend'  // Intern
        ];
        
        let allHtml = '';
        for (const url of urls) {
            const res = await fetch(url, { headers: HEADERS });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            allHtml += await res.text();
        }

        const $ = cheerio.load(allHtml);
        const jobs = [];
        // Important: TopDev might return raw HTML for cards or JSON. Assuming it returns HTML based on the URL format.
        $('.job-item, .job-card-item, div.bg-white.rounded-sm.shadow-sm').each((i, el) => {
            const title = $(el).find('h3 a').text().trim() || $(el).find('.title-job').text().trim() || $(el).find('h2 a').text().trim() || $(el).find('h3').text().trim();
            const link = $(el).find('h3 a').attr('href') || $(el).find('a.btn-apply').attr('href') || $(el).find('h2 a').attr('href');
            let location = 'Hồ Chí Minh';
            const locationNodes = $(el).find('.location, .text-gray-500.text-sm');
            if (locationNodes.length) {
                location = locationNodes.text().replace(/\n/g, '').replace(/  +/g, ' ').trim();
            }
            
            // Assume topdev results from this specific search are highly relevant and recent
            // TopDev may not show exact "hours ago", so we rely on sorting
            let company = $(el).find('.company-name').text().trim() || $(el).find('p.company').text().trim() || $(el).find('a.text-gray-600').text().trim() || 'Unknown Company';
            
            if (title && isHCMorRemote(location)) {
                // To avoid duplicates since we concat HTML
                if (!jobs.find(j => j.link === link)) {
                    jobs.push({ title, company, location, link, time: 'Gần đây' });
                }
            }
        });
        
        return formatMsg(jobs.slice(0, 5), 'TopDev');
    } catch (err) {
        return `*(⚠️ Lỗi lấy tin TopDev: ${err.message})*\n\n`;
    }
}

async function main() {
    console.log("# 🚀 JOBS IT BACKEND (INTERN/FRESHER) TẠI HCM/REMOTE HÔM NAY\n");
    console.log("Tìm kiếm trên các nền tảng: LinkedIn, TopCV, ITViec, TopDev.\n\n***\n");
    
    // Fetch in parallel
    const [ln, topcv, itviec, topdev] = await Promise.all([
        fetchLinkedInJobs(),
        fetchTopCVJobs(),
        fetchITViecJobs(),
        fetchTopDevJobs()
    ]);
    
    console.log(ln);
    console.log(topcv);
    console.log(itviec);
    console.log(topdev);
}

main().catch(console.error);
