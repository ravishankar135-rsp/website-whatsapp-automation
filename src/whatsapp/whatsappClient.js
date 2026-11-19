
const path = require("path");
const qrcode = require("qrcode-terminal");
const pino = require("pino");

let sock = null;
let connectionPromise = null;
let isConnected = false;

async function connectWhatsApp() {
  if (isConnected && sock) return sock;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    const {
      default: makeWASocket,
      useMultiFileAuthState,
      DisconnectReason
    } = await import("@whiskeysockets/baileys");

    const authFolder = path.resolve(
      __dirname,
      "../../auth_info_baileys"
    );

    const { state, saveCreds } =
      await useMultiFileAuthState(authFolder);

    sock = makeWASocket({
      auth: state,
      logger: pino({ level: "silent" }),
      markOnlineOnConnect: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, qr, lastDisconnect } = update;

      if (qr) {
        console.log("\nScan QR using WhatsApp Linked Devices:");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open") {
        isConnected = true;
        console.log("WhatsApp connected successfully!");
      }

      if (connection === "close") {
        isConnected = false;
        sock = null;

        const statusCode =
          lastDisconnect?.error?.output?.statusCode;

        if (statusCode === DisconnectReason.loggedOut) {
          console.log("WhatsApp logged out. Pair again.");
        } else {
          console.log("WhatsApp disconnected. Restart the application to reconnect.");
        }
      }
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("WhatsApp connection timed out"));
      }, 60000);

      sock.ev.on("connection.update", function waitForConnection(update) {
        if (update.connection === "open") {
          clearTimeout(timeout);
          sock.ev.off("connection.update", waitForConnection);
          resolve();
        }

        if (update.connection === "close") {
          clearTimeout(timeout);
          sock.ev.off("connection.update", waitForConnection);
          reject(new Error("WhatsApp connection closed"));
        }
      });
    });

    return sock;
  })();

  try {
    return await connectionPromise;
  } finally {
    connectionPromise = null;
  }
}

async function sendTextMessage(jid, message) {
  if (!jid || !jid.endsWith("@g.us")) {
    throw new Error("Valid WhatsApp group JID is required");
  }

  if (!message || !message.trim()) {
    throw new Error("Message cannot be empty");
  }

  const client = await connectWhatsApp();

  const result = await client.sendMessage(jid, {
    text: message
  });

  console.log("WhatsApp send request accepted:", result.key.id);

  return result;
}

async function closeWhatsApp() {
  if (sock) {
    sock.end(undefined);
    sock = null;
    isConnected = false;
  }
}

module.exports = {
  connectWhatsApp,
  sendTextMessage,
  closeWhatsApp
};
