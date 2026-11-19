const Parser = require("rss-parser");
const path = require("path");
const fs = require("fs");

const {
  hasUpdate,
  saveUpdate,
  getUpdateCount,
  isBaselineComplete,
  markBaselineComplete
} = require("../database/db");
const { processNewsWithPython } = require("./pythonBridge");
const {
  createNewsId,
  isValidHttpUrl,
  shouldSeedBaseline
} = require("./newsUtils");

const parser = new Parser();

const configPath = path.join(
  __dirname,
  "../../config/sources.json"
);

async function getNewNews() {
  const config = JSON.parse(
    fs.readFileSync(configPath, "utf8")
  );

  if (!Array.isArray(config.sources)) {
    throw new Error("Invalid sources configuration");
  }

  const sources = config.sources.filter(
    source => source.enabled && source.type === "rss"
  );

  const feedItems = [];

  // Fetch every enabled feed before changing baseline state. If a feed fails,
  // the next run can retry without leaving a partially initialized baseline.
  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items) {
        const title = item.title || "Untitled";
        const link = item.link || "";

        if (!isValidHttpUrl(link)) continue;

        feedItems.push({
          id: createNewsId({ ...item, title, link }),
          source: source.name,
          title,
          link,
          description: item.contentSnippet || item.content || "",
          publishedAt: item.pubDate
        });
      }

      console.log(`${source.name}: feed checked`);
    } catch (error) {
      console.error(
        `[ERROR] ${source.name}: ${error.message}`
      );
      throw error;
    }
  }

  // A brand-new installation records the current feed contents as its
  // starting point, preventing old articles from being sent as new news.
  // Existing databases are preserved and are not reseeded during upgrade.
  if (!isBaselineComplete()) {
    if (shouldSeedBaseline(getUpdateCount())) {
      for (const item of feedItems) {
        saveUpdate(item);
      }

      console.log(
        `First-run baseline saved: ${feedItems.length} existing feed item(s) will not be sent.`
      );

      markBaselineComplete();
      return [];
    }

    markBaselineComplete();
  }

  const newItems = [];

  for (const item of feedItems) {
    if (hasUpdate(item.id)) continue;

    const cleanNews = await processNewsWithPython({
      title: item.title,
      link: item.link,
      description: item.description
    });

    newItems.push({
      ...item,
      title: cleanNews.title,
      link: cleanNews.link,
      description: cleanNews.description
    });
  }

  return newItems;
}

module.exports = { getNewNews };
