# 📘 Discord AI Search Bot (Local AI Version)

A powerful Discord bot that lets users search the web using a slash command.  
It performs a real-time Google search via **Serper API**, summarizes the results using **Ollama Cloud (or local LLM)**, and replies directly in Discord.

No n8n.  
No external automation tools.  
Fully controlled inside your bot.

---

## 🚀 Features

- ✨ `/search <query>` — Ask anything instantly  
- 🌐 Real-time Google search results (Serper API)  
- 🤖 AI-powered summarization (Ollama Cloud or local model)  
- ⚡ Fast responses with deferred replies  
- 🔒 Fully self-hosted logic (no workflow engines)  
- 🧠 Built with Discord.js + TypeScript  
- 🖥 Runs locally or on VPS  

---

## 🏗 Architecture Overview


User
↓
Discord Slash Command
↓
Bot (Discord.js + TypeScript)
↓
Serper API (Google Search)
↓
Ollama Cloud (AI Summary)
↓
Discord Response


Everything happens inside your bot.  
No webhooks. No n8n. No automation middle-layer.

---

## 📦 Tech Stack

| Technology | Purpose |
|------------|----------|
| **Discord.js v14+** | Discord bot framework |
| **TypeScript** | Type safety |
| **Serper API** | Google search results |
| **Ollama Cloud / Local Ollama** | AI summarization |
| **Axios** | HTTP requests |
| **dotenv** | Environment configuration |

---

# 🛠 Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/discord-ai-search-bot.git
cd discord-ai-search-bot
2️⃣ Install Dependencies
npm install
3️⃣ Configure Environment Variables

Create a .env file:

DISCORD_TOKEN=your_discord_bot_token
SERPER_API_KEY=your_serper_api_key
OLLAMA_API_KEY=your_ollama_cloud_api_key
OLLAMA_BASE_URL=https://api.ollama.com

If using local Ollama instead of cloud:

OLLAMA_URL=http://localhost:11434/api/generate
4️⃣ Build & Run
npm run build
node dist/index.js

Or with development mode:

npm run dev
🔑 Required API Keys
🔎 Serper API

Generate at: https://serper.dev/

Used for Google search results (titles, snippets, and links)

🤖 Ollama Cloud API Key

Get from: https://ollama.com/

Used for AI summarization of search results

💬 Usage

Once the bot is online, use:

/search artificial intelligence news
Example Response
🔎 Top Results:

Artificial intelligence continues to grow rapidly...
Major tech companies are investing heavily...

🤖 Summary:
AI development is accelerating across industries...
🖥 VPS Deployment (Optional)

Install PM2:

npm install -g pm2
pm2 start dist/index.js --name ai-search-bot
pm2 save
pm2 startup
🔥 Why This Version Is Better Than n8n
Old (n8n Version)	New (Local Version)
Required external workflow	Fully integrated
Webhook complexity	Direct slash command
Harder to debug	Simple TypeScript code
Slower (extra hop)	Faster response
External dependency	Fully controlled
🚀 Future Improvements (Optional)

Streaming AI responses live in Discord

Rich embeds with clickable sources

Caching repeated searches

Rate limiting per user

Multi-guild optimization

Docker container deployment

Memory-based conversation mode