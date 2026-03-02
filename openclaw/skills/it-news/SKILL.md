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
node /home/node/.openclaw/skills/it-news/index.js
```

## Response Guidelines for LLM

When the `node /home/node/.openclaw/skills/it-news/index.js` command is executed, it returns a structured Markdown output. 

**IMPORTANT: When presenting this news to the user, you MUST:**
1. **Maintain the Session Structure**: Keep each news item in its own section as provided in the tool output.
2. **Use the separator**: Use `***` or a clear horizontal rule between articles.
3. **Format Headers**: Use `### 👨‍💻 [N] Title` format for each Dev.to article.
4. **Preserve Metadata**: Always show the `> 🔗 [Link]`, `> 🏷️ Tags`, and `> 👤 Author` block exactly as formatted.
5. **Conciseness**: If the user asks for a specific summary, you can further condense, but by default, present the sectioned content clearly.
6. **Translation**: Since the raw output from the tool is in English, you **MUST translate the title, summary, and article content into Vietnamese** to make it accessible to the user, while keeping technical terms if necessary.
7. **Language**: Always respond in the language used by the user (Vietnamese in this context).
