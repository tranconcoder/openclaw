const express = require('express');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;
const BROWSER_WS_URL = process.env.BROWSER_WS_URL || 'ws://browserless:3000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/openclaw';
const DISABLE_FILE_LOGGING = process.env.DISABLE_FILE_LOGGING === 'true';

// MongoDB Connection
mongoose.connect(MONGODB_URI)
    .then(() => console.log('[Crawler API] Connected to MongoDB'))
    .catch(err => console.error('[Crawler API] MongoDB connection error:', err));

// Job Schema
const jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String,
    time: String,
    description: String,
    link: { type: String, unique: true },
    source: String,
    raw_data: Object,
    scrapedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

app.use(express.json());

// Load crawler modules
const linkedinCrawler = require('./crawlers/linkedin');
const topcvCrawler = require('./crawlers/topcv');
const topdevCrawler = require('./crawlers/topdev');
const itviecCrawler = require('./crawlers/itviec');
const vietnamWorksCrawler = require('./crawlers/vietnamworks');
const careerVietCrawler = require('./crawlers/careerviet');
const glintsCrawler = require('./crawlers/glints');
const facebookCrawler = require('./crawlers/facebook');
const vieclam24hCrawler = require('./crawlers/vieclam24h');

// Platform display names
const SOURCE_EMOJIS = {
    linkedin: '🔗',
    topcv: '📋',
    topdev: '💻',
    itviec: '🏆',
    vietnamworks: '🇻🇳',
    careerviet: '🌟',
    glints: '✨',
    facebook: '📘',
    vieclam24h: '⏰'
};

/**
 * Build a beautiful markdown response from job results.
 * Only returns jobs that are NEW (isNew: true), up to 5 per platform.
 */
function buildMarkdownResponse(combinedResults, metadata) {
    const lines = [];
    const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    lines.push(`# 💼 IT JOBS BACKEND — INTERN / FRESHER`);
    lines.push(`> 📅 Cập nhật: ${now} | 🆕 Tổng job mới: **${metadata.totalNew}** | 🔍 Tổng đã quét: **${metadata.totalScraped}**\n`);
    lines.push(`---\n`);

    let hasAnyJob = false;

    for (const [source, jobs] of Object.entries(combinedResults)) {
        if (!jobs || jobs.length === 0) continue;

        const emoji = SOURCE_EMOJIS[source] || '📌';
        const sourceName = source.toUpperCase();
        lines.push(`## ${emoji} ${sourceName}\n`);

        jobs.forEach((job, index) => {
            const newBadge = job.isNew ? ' `🆕 MỚI`' : '';
            lines.push(`### ${index + 1}. [${job.title}](${job.link})${newBadge}`);
            lines.push(`| | |`);
            lines.push(`|---|---|`);
            lines.push(`| 🏢 **Công ty** | ${job.company} |`);
            lines.push(`| 📍 **Địa điểm** | ${job.location} |`);
            lines.push(`| ⏳ **Cập nhật** | ${job.time} |`);
            if (job.description) {
                // Trim to avoid super long descriptions in the markdown
                const desc = job.description.replace(/\n+/g, ' ').trim().slice(0, 200);
                lines.push(`| 📝 **Mô tả** | ${desc}${job.description.length > 200 ? '...' : ''} |`);
            }
            lines.push(``);
            hasAnyJob = true;
        });

        lines.push(`---\n`);
    }

    if (!hasAnyJob) {
        lines.push(`> ⚠️ Hôm nay chưa tìm thấy job Backend Intern/Fresher mới nào phù hợp. Hãy quay lại sau!\n`);
    }

    return lines.join('\n');
}

app.get('/api/jobs', async (req, res) => {
    const keyword = req.query.keyword || 'backend';
    const level = req.query.level || 'intern,fresher';
    const location = req.query.location || 'hcm,remote';

    let browser = null;
    try {
        console.log(`[Crawler API] Connecting to browser at ${BROWSER_WS_URL}...`);
        
        // Retry connection logic for stable startup
        const maxRetries = 5;
        let connected = false;
        for (let i = 0; i < maxRetries; i++) {
            try {
                browser = await puppeteer.connect({ browserWSEndpoint: BROWSER_WS_URL });
                connected = true;
                break;
            } catch (err) {
                console.log(`Connecting to browser failed, retrying... (${maxRetries - 1 - i} left)`);
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        if (!connected || !browser) {
             throw new Error("Could not connect to browserless service.");
        }

        console.log('[Crawler API] Browser connected, starting crawlers...');

        // Ensure data/raw directory exists (optional)
        const dataDir = path.join(__dirname, 'data');
        const rawDir = path.join(dataDir, 'raw');
        if (!DISABLE_FILE_LOGGING) {
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
            if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir);
        }

        // Start scraping sequentially to avoid OOM on VPS
        console.log('[Crawler API] Scraping sources sequentially...');
        
        const linkedinJobs = await linkedinCrawler.scrape(browser, !DISABLE_FILE_LOGGING ? rawDir : null).catch(() => []);
        await new Promise(r => setTimeout(r, 2000));
        const topcvJobs = await topcvCrawler.scrape(browser, !DISABLE_FILE_LOGGING ? rawDir : null).catch(() => []);
        await new Promise(r => setTimeout(r, 2000));
        const topdevJobs = await topdevCrawler.scrape(browser, !DISABLE_FILE_LOGGING ? rawDir : null).catch(() => []);
        await new Promise(r => setTimeout(r, 2000));
        const itviecJobs = await itviecCrawler.scrape(browser, !DISABLE_FILE_LOGGING ? rawDir : null).catch(() => []);
        await new Promise(r => setTimeout(r, 2000));
        const vietnamWorksJobs = await vietnamWorksCrawler.scrape(browser, !DISABLE_FILE_LOGGING ? rawDir : null).catch(() => []);
        await new Promise(r => setTimeout(r, 2000));
        const careerVietJobs = await careerVietCrawler.scrape(browser, !DISABLE_FILE_LOGGING ? rawDir : null).catch(() => []);
        await new Promise(r => setTimeout(r, 2000));
        const glintsJobs = await glintsCrawler.scrape(browser, !DISABLE_FILE_LOGGING ? rawDir : null).catch(() => []);
        await new Promise(r => setTimeout(r, 2000));
        const facebookJobs = await facebookCrawler.scrape(browser, !DISABLE_FILE_LOGGING ? rawDir : null).catch(() => []);
        await new Promise(r => setTimeout(r, 2000));
        const vieclam24hJobs = await vieclam24hCrawler.scrape(browser, !DISABLE_FILE_LOGGING ? rawDir : null).catch(() => []);

        // Process and filter jobs (check against MongoDB)
        const jobGroups = {
            linkedin: linkedinJobs,
            topcv: topcvJobs,
            topdev: topdevJobs,
            itviec: itviecJobs,
            vietnamworks: vietnamWorksJobs,
            careerviet: careerVietJobs,
            glints: glintsJobs,
            facebook: facebookJobs,
            vieclam24h: vieclam24hJobs
        };

        // Combined results: only NEW jobs (up to 5 per platform) returned to skill
        const combinedResults = {};
        let totalScrapedCount = 0;
        let totalNewCount = 0;

        console.log('[Crawler API] Processing and tagging jobs...');

        const techRegex = /\b(node\.?js|node|js|javascript|ts|typescript|next\.?js|next|php|java|go|golang)\b/i;
        const levelRegex = /\b(intern|fresher|thực\s*tập|thuc\s*tap)\b/i;

        for (const [source, jobs] of Object.entries(jobGroups)) {
            // Filter strictly by tech and level
            const filteredJobs = jobs.filter(job => {
                const titleStr = String(job.title).toLowerCase();
                return techRegex.test(titleStr) && levelRegex.test(titleStr);
            });

            totalScrapedCount += filteredJobs.length;
            combinedResults[source] = [];

            // Classify all as new/existing first, collect new ones
            const newJobs = [];

            for (const job of filteredJobs) {
                try {
                    // Update if exists, insert if not. Return original doc.
                    const existingJob = await Job.findOneAndUpdate(
                        { link: job.link },
                        { $set: { ...job, scrapedAt: new Date() } },
                        { upsert: true, new: false }
                    );
                    const isNew = !existingJob;
                    if (isNew) {
                        newJobs.push({ ...job, isNew: true });
                    }
                } catch (err) {
                    console.error(`[Crawler API] Error processing job ${job.link}:`, err.message);
                }
            }

            // Only deliver up to 5 NEW jobs per platform to skill
            const deliveredNew = newJobs.slice(0, 5);
            totalNewCount += deliveredNew.length;

            // Add to results: 5 newest new jobs (rest saved in DB for future calls)
            combinedResults[source] = deliveredNew;

            if (newJobs.length > 5) {
                console.log(`[Crawler API] ${source}: ${newJobs.length} new jobs found, delivering only top 5. Remaining ${newJobs.length - 5} saved to DB for next call.`);
            }
        }

        const markdown = buildMarkdownResponse(combinedResults, {
            totalNew: totalNewCount,
            totalScraped: totalScrapedCount,
            timestamp: new Date().toISOString()
        });

        // Save raw response to data directory for debugging (optional)
        if (!DISABLE_FILE_LOGGING) {
            try {
                if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
                fs.writeFileSync(path.join(dataDir, 'raw_response.md'), markdown);
            } catch (err) {
                console.error('[Crawler API] Failed to save raw response:', err.message);
            }
        }

        // Return markdown as plain text for the skill to consume directly
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(markdown);

    } catch (error) {
        console.error('[Crawler API] Error scraping jobs:', error);
        res.status(500).json({ error: 'Failed to scrape jobs', details: error.message });
    } finally {
        if (browser) await browser.disconnect();
    }
});

app.listen(port, () => {
    console.log(`[Crawler API] Server listening on port ${port}`);
});
