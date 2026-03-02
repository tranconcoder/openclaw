const devToTag = 'programming';
const hnUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json';
const itemUrl = (id) => `https://hacker-news.firebaseio.com/v0/item/${id}.json`;

async function fetchDevToNews() {
  try {
    const res = await fetch(`https://dev.to/api/articles?tag=${devToTag}&top=1`);
    if (!res.ok) throw new Error(`Dev.to API error: ${res.status}`);
    const data = await res.json();
    
    let md = '### 👨‍💻 Dev.to Top Articles (Programming)\n\n';
    data.slice(0, 5).forEach((article, idx) => {
      md += `${idx + 1}. **[${article.title}](${article.url})**\n`;
      md += `   *Tags: ${article.tag_list.join(', ')} | ❤️ ${article.public_reactions_count}*\n`;
      if (article.description) {
         md += `   *Summary: ${article.description}*\n\n`;
      }
    });
    return md;
  } catch (err) {
    return '*(Error fetching Dev.to news)*\n\n';
  }
}

async function fetchHackerNews() {
  try {
    const res = await fetch(hnUrl);
    if (!res.ok) throw new Error(`HN API error: ${res.status}`);
    const topIds = await res.json();
    
    let md = '### 👾 Hacker News Top Stories\n\n';
    
    const storiesPromises = topIds.slice(0, 5).map(async (id) => {
      const itemRes = await fetch(itemUrl(id));
      return await itemRes.json();
    });
    
    const stories = await Promise.all(storiesPromises);
    
    stories.forEach((story, idx) => {
      const title = story?.title || 'Unknown Title';
      const url = story?.url || `https://news.ycombinator.com/item?id=${story?.id}`;
      const score = story?.score || 0;
      md += `${idx + 1}. **[${title}](${url})** *(⬆️ ${score})*\n`;
    });
    return md + '\n';
  } catch (err) {
    return '*(Error fetching Hacker News)*\n\n';
  }
}

async function main() {
  console.log("# 📰 Today's IT & Web Dev News\n");
  const [devToHtml, hnHtml] = await Promise.all([
    fetchDevToNews(),
    fetchHackerNews()
  ]);
  
  console.log(devToHtml);
  console.log(hnHtml);
}

main().catch(console.error);
