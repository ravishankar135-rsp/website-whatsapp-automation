
const Parser = require("rss-parser");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const { hasUpdate } = require("../database/db");
const { processNewsWithPython } = require("./pythonBridge");

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

  const newItems = [];

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items) {
        const title = item.title || "Untitled";
        const link = item.link || "";

        if (!link.startsWith("https://") &&
            !link.startsWith("http://")) {
          continue;
        }

        const id = crypto
          .createHash("sha256")
          .update(item.guid || link || title)
          .digest("hex");

        if (hasUpdate(id)) continue;

        const cleanNews = await processNewsWithPython({
          title,
          link,
          description: item.contentSnippet || item.content || ""
        });

        newItems.push({
          id,
          source: source.name,
          title: cleanNews.title,
          link: cleanNews.link,
          description: cleanNews.description,
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

  return newItems;
}

module.exports = { getNewNews };
