const express = require('express');
const puppeteer = require('puppeteer-core');

const app = express();
const port = process.env.PORT || 3000;
const BROWSER_WS_URL = process.env.BROWSER_WS_URL || 'ws://browserless:3000';

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
            linkedinCrawler.scrape(browser),
            topcvCrawler.scrape(browser),
            topdevCrawler.scrape(browser),
            itviecCrawler.scrape(browser),
            vietnamWorksCrawler.scrape(browser),
            careerVietCrawler.scrape(browser),
            glintsCrawler.scrape(browser),
            facebookCrawler.scrape(browser),
            vieclam24hCrawler.scrape(browser)
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
