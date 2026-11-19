const crypto = require("crypto");

function createNewsId(item) {
  const title = item.title || "Untitled";
  const link = item.link || "";
  return crypto
    .createHash("sha256")
    .update(item.guid || link || title)
    .digest("hex");
}

function isValidHttpUrl(link) {
  return typeof link === "string" &&
    (link.startsWith("https://") || link.startsWith("http://"));
}

function shouldSeedBaseline(existingUpdateCount) {
  return Number(existingUpdateCount) === 0;
}

module.exports = {
  createNewsId,
  isValidHttpUrl,
  shouldSeedBaseline
};
