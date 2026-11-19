# Website-to-WhatsApp Automation

A self-hosted Windows automation tool that monitors configured RSS feeds, rewrites new items in Hindi with Google Gemini, and sends concise updates to a WhatsApp group.

## Features

- Monitor configurable RSS feeds.
- Rewrite news in concise, neutral Hindi using Google Gemini.
- Send updates to a configured WhatsApp group.
- Track processed items and AI request usage in a local SQLite database.
- Check feeds every 10 hours.
- Send at most one news item per monitoring cycle.
- Apply an application-level limit of 3 Gemini requests per day.
- Keep API credentials, WhatsApp session data, database files, and logs local.
- Support hidden background startup on Windows through Task Scheduler.

## Requirements

- Windows 10 or later
- Node.js 20 or later
- Python 3 with the Windows Python Launcher (`py`)
- A WhatsApp account
- A Gemini API key

## Installation

Clone this repository:

```cmd
git clone https://github.com/ravishankar135-rsp/website-whatsapp-automation.git
cd website-whatsapp-automation
```

Install dependencies and create your private environment file:

```cmd
npm install
copy .env.example .env
```

## Configuration

Open `.env` and set your own values:

```env
GEMINI_API_KEY=your_gemini_api_key
WHATSAPP_GROUP_JID=your_whatsapp_group_jid
AI_MODEL=gemini-3.5-flash-lite
DRY_RUN=true
```

Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey). Review Google's current quota and pricing before use. Do not enable billing if you want to avoid paid usage.

Keep `DRY_RUN=true` while checking your configuration. Set it to `false` only when you are ready to allow live WhatsApp messages.

Never commit or share your `.env` file, WhatsApp session folder, database, or logs.

## Configure RSS feeds

Edit `config/sources.json`. The repository includes a real BBC World RSS feed as an example source:

```json
{
  "sources": [
    {
      "name": "BBC World",
      "type": "rss",
      "url": "https://feeds.bbci.co.uk/news/world/rss.xml",
      "enabled": true
    }
  ]
}
```

You can add or disable RSS sources. Only add feeds you are permitted to access.

On a fresh installation, the first successful feed check saves the current RSS items as a baseline without sending them. Only items appearing in later checks are eligible for delivery. If a feed cannot be fetched, baseline initialization is postponed until a successful check. Existing databases are preserved during upgrades.

## WhatsApp pairing

Stop any running copy of the automation before pairing. Then run:

```cmd
npm run pair
```

Scan the QR code from WhatsApp → Linked Devices. Pairing credentials are stored locally in `auth_info_baileys/`. Never share this folder.

## Run

Start the application:

```cmd
npm start
```

The app checks enabled RSS feeds every 10 hours. For live WhatsApp delivery, set `DRY_RUN=false` in your local `.env` file.

## Background startup on Windows

The included `start-hidden.vbs` is configured for the original developer's local folder path. If you use a different folder, edit its working directory before configuring Windows Task Scheduler. The computer must be awake, logged in, and have the project drive available for scheduled checks to run.

## Free-tier and cost notes

The application itself does not require paid hosting. The code limits itself to 3 Gemini requests per day, but this is only an application-side limit; it does not guarantee free API usage. Google's model availability, quotas, and pricing can change. Check the current terms and do not configure billing if you want to avoid charges. There is no paid fallback built into this project.

## Privacy and important notice

- API keys belong only in `.env`.
- SQLite data is stored in `data/`.
- WhatsApp session credentials are stored in `auth_info_baileys/`.
- Logs are stored in `logs/`.
- These local files and folders are excluded from Git by `.gitignore`.

This project uses Baileys, an unofficial WhatsApp Web integration. It is not affiliated with or endorsed by WhatsApp or Meta. Unofficial integrations may break or carry account-restriction risks. Use responsibly; do not send spam or unsolicited bulk messages.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
