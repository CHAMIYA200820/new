const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");

const l = console.log;
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson,
} = require("./lib/functions");
const fs = require("fs");
const P = require("pino");
const config = require("./config");
const qrcode = require("qrcode-terminal");
const util = require("util");
const { sms, downloadMediaMessage } = require("./lib/msg");
const axios = require("axios");
const { File } = require("megajs");

const ownerNumber = config.OWNER_NUM;
const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

//=================== SESSION AUTH ============================
async function downloadSession() {
  if (!fs.existsSync(__dirname + "/auth_info_baileys/creds.json")) {
    if (!config.SESSION_ID)
      return console.log("Please add your session to SESSION_ID env !!");
    const sessdata = config.SESSION_ID;
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
    try {
      const data = await filer.downloadBuffer(); // Fix async issue
      fs.writeFileSync(__dirname + "/auth_info_baileys/creds.json", data);
      console.log("Session downloaded ✅");
    } catch (error) {
      console.error("Failed to download session:", error);
    }
  }
}

//================== CONNECT TO WA ============================
async function connectToWA() {
  try {
    // MongoDB Connect
    const connectDB = require("./lib/mongodb");
    await connectDB();

    // Load Config
    const { readEnv } = require("./lib/database");
    const config = await readEnv();
    const prefix = config.PREFIX;

    console.log("Connecting ❤️PINk_QUEEN_MD❤️");

    // Baileys Authentication
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/auth_info_baileys/");
    const { version } = await fetchLatestBaileysVersion();

    const robin = makeWASocket({
      logger: P({ level: "silent" }),
      printQRInTerminal: false,
      browser: Browsers.macOS("Firefox"),
      syncFullHistory: true,
      auth: state,
      version,
    });

    // Handle Connection Updates
    robin.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          connectToWA();
        }
      } else if (connection === "open") {
        console.log("❤️PINk_QUEEN_MD❤️ connected successfully ✅");

        const up = `❤️PINk_QUEEN_MD❤️ connected successful ✅`;
        const up1 = `Hello CHAMINDU, I made bot successful`;

        robin.sendMessage(ownerNumber + "@s.whatsapp.net", {
          image: { url: `https://raw.githubusercontent.com/ransika2008/Img-2/main/bot-image.jpg` },
          caption: up,
        });

        robin.sendMessage("94783314361@s.whatsapp.net", {
          image: { url: `https://raw.githubusercontent.com/ransika2008/Img-2/main/bot-image.jpg` },
          caption: up1,
        });
      }
    });

    robin.ev.on("creds.update", saveCreds);
    robin.ev.on("messages.upsert", async (mek) => {
      if (!mek.messages[0].message) return;

      mek = mek.messages[0];
      mek.message = getContentType(mek.message) === "ephemeralMessage" ? mek.message.ephemeralMessage.message : mek.message;

      const m = sms(robin, mek);
      const from = mek.key.remoteJid;
      const body = mek.message.conversation || "";

      const isCmd = body.startsWith(prefix);
      const command = isCmd ? body.slice(prefix.length).trim().split(" ").shift().toLowerCase() : "";
      const args = body.trim().split(/ +/).slice(1);
      const q = args.join(" ");
      const isGroup = from.endsWith("@g.us");
      const sender = mek.key.fromMe ? robin.user.id.split(":")[0] + "@s.whatsapp.net" : mek.key.participant || mek.key.remoteJid;
      const senderNumber = sender.split("@")[0];

      const reply = async (text) => {
        await robin.sendMessage(from, { text }, { quoted: mek });
      };

      if (isCmd) {
        try {
          const events = require("./command");
          const cmd = events.commands.find((cmd) => cmd.pattern === command) || events.commands.find((cmd) => cmd.alias?.includes(command));

          if (cmd) {
            await cmd.function(robin, mek, m, { from, sender, senderNumber, isCmd, command, args, q, reply });
          }
        } catch (error) {
          console.error("[PLUGIN ERROR]", error);
        }
      }
    });
  } catch (error) {
    console.error("Error in connectToWA:", error);
  }
}

//================== EXPRESS SERVER ============================
app.get("/", (req, res) => {
  res.send("hey, ❤️PINk_QUEEN_MD❤️ started✅");
});
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

//================== START BOT ============================
(async () => {
  await downloadSession();
  setTimeout(() => connectToWA(), 4000);
})();
