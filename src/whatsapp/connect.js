
const path = require("path");
const qrcode = require("qrcode-terminal");
const pino = require("pino");

async function pairWhatsApp() {
  let sock;
  let finished = false;

  try {
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

    sock.ev.on("connection.update", async (update) => {
      const { connection, qr, lastDisconnect } = update;

      if (qr) {
        console.log("\nScan QR using WhatsApp > Linked Devices:\n");
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open" && !finished) {
        finished = true;
        console.log("\nWhatsApp pairing successful!");
        console.log("Session credentials saved locally.");

        setTimeout(() => {
          sock.end(undefined);
          console.log("Pairing utility closed.");
        }, 2000);
      }

      if (connection === "close" && !finished) {
        const statusCode =
          lastDisconnect?.error?.output?.statusCode;

        if (statusCode === DisconnectReason.loggedOut) {
          console.error("WhatsApp logged out. Pair again.");
        } else {
          console.error("WhatsApp connection closed. Try again.");
        }

        finished = true;
        process.exitCode = 1;
      }
    });

  } catch (error) {
    console.error("Pairing failed:", error.message);
    process.exitCode = 1;

    if (sock) sock.end(undefined);
  }
}

pairWhatsApp();
