
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
  db,
  saveUpdate
} = require("./database/db");

const { getNewNews } = require("./monitor/rssMonitor");
const { createMessage } = require("./ai/messageEditor");

const {
  sendTextMessage,
  closeWhatsApp
} = require("./whatsapp/whatsappClient");

const INTERVAL_HOURS = 10;
const INTERVAL_MS = INTERVAL_HOURS * 60 * 60 * 1000;

// Safe by default: real WhatsApp sending requires DRY_RUN=false in .env
const DRY_RUN = process.env.DRY_RUN !== "false";

const statePath = path.join(
  __dirname,
  "../data/scheduler-state.json"
);

let timer = null;
let isChecking = false;
let shuttingDown = false;

function loadLastCheck() {
  try {
    if (!fs.existsSync(statePath)) return null;

    const state = JSON.parse(
      fs.readFileSync(statePath, "utf8")
    );

    return Number(state.lastCheck) || null;
  } catch {
    return null;
  }
}

function saveLastCheck(timestamp) {
  fs.mkdirSync(path.dirname(statePath), {
    recursive: true
  });

  fs.writeFileSync(
    statePath,
    JSON.stringify({ lastCheck: timestamp }, null, 2)
  );
}

async function runCheck() {
  if (isChecking || shuttingDown) return;

  isChecking = true;

  // Save the attempt time first to prevent repeated retries after failures.
  saveLastCheck(Date.now());

  try {
    console.log("\nWebsite monitoring started.");

    const newItems = await getNewNews();

    if (!newItems.length) {
      console.log("No new news found.");
      return;
    }

    // Process only the newest item in this 10-hour cycle.
    newItems.sort((a, b) => {
      const dateA = Date.parse(a.publishedAt) || 0;
      const dateB = Date.parse(b.publishedAt) || 0;
      return dateB - dateA;
    });

    const news = newItems[0];

    console.log("New news found:", news.title);

    if (DRY_RUN) {
      console.log("DRY RUN: WhatsApp sending is disabled.");
      console.log("No Gemini request or WhatsApp message was sent.");
      return;
    }

    const groupJid = process.env.WHATSAPP_GROUP_JID;

    if (!groupJid) {
      throw new Error("WHATSAPP_GROUP_JID missing in .env");
    }

    const message = await createMessage(news);

    await sendTextMessage(groupJid, message);

    // Save only after WhatsApp accepts the send request.
    saveUpdate(news);

    console.log("News send request completed and saved.");

  } catch (error) {
    console.error("Website check failed:", error.message);
  } finally {
    if (!DRY_RUN) {
      try {
        await closeWhatsApp();
      } catch (error) {
        console.error("WhatsApp close error:", error.message);
      }
    }

    isChecking = false;

    if (!shuttingDown) {
      scheduleNextCheck();
    }
  }
}

function scheduleNextCheck() {
  if (shuttingDown) return;

  const lastCheck = loadLastCheck();
  const now = Date.now();

  const remaining = lastCheck
    ? INTERVAL_MS - (now - lastCheck)
    : 0;

  if (remaining <= 0) {
    console.log("Website check is due.");
    runCheck();
    return;
  }

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor(
    (remaining % 3600000) / 60000
  );

  console.log(
    `Next website check in ${hours} hours and ${minutes} minutes.`
  );

  timer = setTimeout(runCheck, remaining);
}

function shutdown() {
  if (shuttingDown) return;

  shuttingDown = true;

  if (timer) clearTimeout(timer);

  console.log("\nApplication stopped.");

  if (!isChecking) {
    db.close();
    process.exit(0);
  }
}

async function startApp() {
  console.log("Website WhatsApp Automation started.");
  console.log("Check interval: 10 hours.");
  console.log("Mode:", DRY_RUN ? "DRY RUN (safe test)" : "LIVE");

  scheduleNextCheck();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startApp().catch(error => {
  console.error("App startup failed:", error.message);
  shutdown();
});
