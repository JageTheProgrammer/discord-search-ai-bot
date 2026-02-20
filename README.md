# 📘 Discord AI Search Bot + n8n

A powerful Discord bot that lets users search the web using a slash command.  
It sends queries to an **n8n webhook**, scrapes Google results via **Serper API**, uses AI to analyze them, and returns a summarized response back to Discord.

---

## 🚀 Features

- ✨ `/search <query>` — Ask anything
- 🌐 Real-time Google search results
- 🤖 AI-powered summarization
- 🔁 Automated workflow via n8n
- 📩 Sends responses back to Discord
- ⚡ Built with Discord.js + TypeScript

---

## 🏗 Architecture Overview
User → Discord Slash Command → Bot (Discord.js)
→ n8n Webhook → Serper API (Google Search)
→ AI Summarization → Discord Webhook Response


---

## 📦 Tech Stack

| Technology | Purpose |
|------------|----------|
| **Discord.js** | Discord bot framework |
| **TypeScript** | Static typing |
| **n8n** | Workflow automation |
| **Serper API** | Google search results |
| **Ollama / LLM** | AI summarization |
| **Axios** | HTTP requests |

---

## 📁 Project Structure
.
├── src/
│ ├── commands/
│ │ ├── search.ts
│ │ └── ...
│ ├── events/
│ ├── deploy-commands.ts
│ └── index.ts
├── workflows/
│ └── n8n-search-workflow.json
├── .env
├── package.json
└── README.md


---

# 🛠 Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/jagetheprogrammer/discord-search-ai-bot.git
cd discord-search-ai-bot

2️⃣ Install Dependencies
npm install
npm run build ( after editing commands/search.ts config top your own n8n url. )

3️⃣ Configure Environment Variables

Edit a .env to your own.

⚙️ n8n Setup ( create free 14d trial on https://n8n.io/)
1️⃣ Import Workflow

Inside your n8n instance:

Go to Workflows

Click Import

Upload: workflows/n8n-search-workflow.json

🔑 Serper API

In the HTTP Request node: change the api key to your own one. you can generate one at : https://serper.dev/

🔗 Discord Webhook

Replace the webhook URL with: your own webhook url. 

3️⃣ Activate the Workflow

Enable the Webhook node

Ensure JSON parameters are enabled

Activate the workflow

Publish the workflow 

💬 Usage

Once deployed, use the slash command:

/search bill gates
Example Response
🔎 Searching...

🤖 Summary:
Bill Gates is a technology entrepreneur and philanthropist...