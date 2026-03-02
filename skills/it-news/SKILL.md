---
name: it-news
description: "Get the latest IT, software programming, and web development news. Use when the user asks for IT news, tech updates, web development news, programming articles, or top stories from Dev.to and Hacker News."
homepage: "local"
metadata: { "openclaw": { "emoji": "📰", "requires": { "bins": ["node"] } } }
---

# IT News Skill

Get the latest aggregated news focusing on IT, software programming, and web development.

## When to Use

✅ **USE this skill when:**
- "What's the latest IT news today?"
- "Any interesting programming articles on Dev.to?"
- "Show me Hacker News top stories."
- "What is happening in the web development world?"
- "Tin tức IT hôm nay có gì hot?"

## When NOT to Use
❌ **DON'T use this skill when:**
- Asking for general world news (politics, sports).
- Asking for financial/stock market news (use vn-market-news-monitor or similar).

## Commands

### Fetch latest news
```bash
node /app/skills/it-news/index.js
```
