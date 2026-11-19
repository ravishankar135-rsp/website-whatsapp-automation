const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createNewsId,
  isValidHttpUrl,
  shouldSeedBaseline
} = require("../src/monitor/newsUtils");

test("same RSS item produces a stable ID", () => {
  const item = {
    guid: "bbc-item-123",
    title: "Example headline",
    link: "https://www.bbc.com/news/example"
  };

  assert.equal(createNewsId(item), createNewsId(item));
});

test("RSS item ID prefers its GUID", () => {
  const first = createNewsId({
    guid: "stable-guid",
    title: "Headline A",
    link: "https://example.com/a"
  });
  const second = createNewsId({
    guid: "stable-guid",
    title: "Headline B",
    link: "https://example.com/b"
  });

  assert.equal(first, second);
});

test("only HTTP and HTTPS links are accepted", () => {
  assert.equal(isValidHttpUrl("https://example.com/news"), true);
  assert.equal(isValidHttpUrl("http://example.com/news"), true);
  assert.equal(isValidHttpUrl("javascript:alert(1)"), false);
  assert.equal(isValidHttpUrl(""), false);
  assert.equal(isValidHttpUrl(null), false);
});

test("first-run baseline is used only for an empty update database", () => {
  assert.equal(shouldSeedBaseline(0), true);
  assert.equal(shouldSeedBaseline("0"), true);
  assert.equal(shouldSeedBaseline(1), false);
  assert.equal(shouldSeedBaseline(21), false);
});
