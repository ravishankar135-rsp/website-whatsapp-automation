\# Website-to-WhatsApp Automation



Automate website and RSS monitoring, rewrite new updates with Google Gemini AI, and deliver concise messages to a WhatsApp group.



\## Features



\- RSS feed monitoring

\- AI-powered news rewriting in Hindi

\- WhatsApp group message delivery

\- SQLite-based update tracking

\- 10-hour monitoring interval

\- Maximum one news message per monitoring cycle

\- Application-level limit of 3 Gemini requests per day

\- Local storage for WhatsApp session and monitoring history

\- Background execution support on Windows



\## Tech Stack



\- Node.js

\- Python

\- Google Gemini API

\- Baileys

\- SQLite

\- RSS Parser



\## Requirements



\- Windows 10/11

\- Node.js 20 or later

\- Python 3

\- A WhatsApp account

\- Google Gemini API key



\## Installation



Clone the repository:



```bash

git clone https://github.com/YOUR\_USERNAME/YOUR\_REPOSITORY.git

cd YOUR\_REPOSITORY

```



Install dependencies:



```bash

npm install

```



Create your environment file:



```bash

copy .env.example .env

```



\## Configuration



Open `.env` and configure:



```env

GEMINI\_API\_KEY=your\_gemini\_api\_key

WHATSAPP\_GROUP\_JID=your\_group\_jid

AI\_MODEL=gemini-3.5-flash-lite

DRY\_RUN=true

```



Keep `DRY\_RUN=true` while testing. Set it to `false` only when you are ready to enable live WhatsApp sending.



Never share or commit your `.env` file.



\## Configure RSS Sources



Edit:



```text

config/sources.json

```



Example:



```json

{

&#x20; "sources": \[

&#x20;   {

&#x20;     "name": "BBC World",

&#x20;     "type": "rss",

&#x20;     "url": "https://feeds.bbci.co.uk/news/world/rss.xml",

&#x20;     "enabled": true

&#x20;   }

&#x20; ]

}

```



Add RSS feeds that you are permitted to access.



\## WhatsApp Pairing



Stop the running automation before pairing.



Run:



```bash

npm run pair

```



Scan the QR code using WhatsApp → Linked Devices.



Your WhatsApp session is stored locally in `auth\_info\_baileys/`. Do not share this folder.



\## Run the Application



Start:



```bash

npm start

```



The application checks configured RSS sources every 10 hours.



For live delivery, configure `DRY\_RUN=false` in `.env`.



\## Data and Privacy



\- Update history is stored locally in `data/`.

\- WhatsApp session credentials are stored locally in `auth\_info\_baileys/`.

\- Logs are stored locally in `logs/`.

\- API keys and private configuration must remain in `.env`.

\- These private files and folders must not be uploaded to GitHub.



\## Free-Tier Usage



This project does not require a paid hosting service.



Gemini API availability, free quotas, and model limits are controlled by Google and may change. The application has its own limit of 3 AI requests per day. This does not guarantee unlimited free API usage.



Do not enable billing or configure paid API services if you want to keep the project free.



\## Important Notice



This project uses Baileys, an unofficial WhatsApp Web integration. It is not affiliated with or endorsed by WhatsApp or Meta. Use responsibly and understand that unofficial integrations may carry account restrictions or compatibility risks.



Avoid spam, bulk messaging, and sending content without permission.



\## License



MIT License


## Repository
https://github.com/ravishankar135-rsp/website-whatsapp-automation
