const express = require('express');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;
const BROWSER_WS_URL = process.env.BROWSER_WS_URL || 'ws://browserless:3000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/openclaw';

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

        // Ensure data/raw directory exists
        const dataDir = path.join(__dirname, 'data');
        const rawDir = path.join(dataDir, 'raw');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
        if (!fs.existsSync(rawDir)) fs.mkdirSync(rawDir);

        // Start scraping concurrently
        const [
            linkedinJobs, 
            topcvJobs, 
            topdevJobs, 
            itviecJobs, 
            vietnamWorksJobs, 
            careerVietJobs, 
            glintsJobs, 
            facebookJobs,
            vieclam24hJobs
        ] = await Promise.all([
            linkedinCrawler.scrape(browser, rawDir),
            topcvCrawler.scrape(browser, rawDir),
            topdevCrawler.scrape(browser, rawDir),
            itviecCrawler.scrape(browser, rawDir),
            vietnamWorksCrawler.scrape(browser, rawDir),
            careerVietCrawler.scrape(browser, rawDir),
            glintsCrawler.scrape(browser, rawDir),
            facebookCrawler.scrape(browser, rawDir),
            vieclam24hCrawler.scrape(browser, rawDir)
        ]);

        const results = {
            data: {
                linkedin: linkedinJobs,
                topcv: topcvJobs,
                topdev: topdevJobs,
                itviec: itviecJobs,
                vietnamworks: vietnamWorksJobs,
                careerviet: careerVietJobs,
                glints: glintsJobs,
                facebook: facebookJobs,
                vieclam24h: vieclam24hJobs
            },
            metadata: {
                totalScraped: linkedinJobs.length + topcvJobs.length + topdevJobs.length + itviecJobs.length + vietnamWorksJobs.length + careerVietJobs.length + glintsJobs.length + facebookJobs.length + vieclam24hJobs.length,
                timestamp: new Date().toISOString()
            }
        };

        // Save raw response to data directory for debugging/evaluation as requested
        try {
            const dataDir = path.join(__dirname, 'data');
            if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
            fs.writeFileSync(path.join(dataDir, 'raw_response.json'), JSON.stringify(results, null, 2));
            console.log(`[Crawler API] Raw response saved to ${path.join(dataDir, 'raw_response.json')}`);
        } catch (err) {
            console.error('[Crawler API] Failed to save raw response:', err.message);
        }

        // Save to MongoDB (Upsert)
        const allJobs = [
            ...linkedinJobs, ...topcvJobs, ...topdevJobs, ...itviecJobs, 
            ...vietnamWorksJobs, ...careerVietJobs, ...glintsJobs, 
            ...facebookJobs, ...vieclam24hJobs
        ];

        console.log(`[Crawler API] Saving ${allJobs.length} jobs to MongoDB...`);
        for (const job of allJobs) {
            try {
                await Job.findOneAndUpdate(
                    { link: job.link },
                    { $set: job },
                    { upsert: true, new: true }
                );
            } catch (err) {
                console.error(`[Crawler API] Error saving job ${job.link}:`, err.message);
            }
        }

        res.json(results);

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
