import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import axios from "axios";

interface SerperResponse {
  organic?: {
    title: string;
    snippet: string;
    link: string;
  }[];
}

interface OllamaResponse {
  response?: string;
}

export const data = new SlashCommandBuilder()
  .setName("search")
  .setDescription("Search the web with AI analysis")
  .addStringOption((option) =>
    option
      .setName("query")
      .setDescription("What do you want to search?")
      .setRequired(true)
  );

async function searchWeb(query: string) {
  if (!process.env.SERPER_API_KEY) {
    throw new Error("SERPER_API_KEY missing in .env");
  }

  const response = await axios.post<SerperResponse>(
    "https://google.serper.dev/search",
    { q: query },
    {
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  return response.data.organic ?? [];
}

function formatResults(
  results: { title: string; snippet: string; link: string }[]
) {
  if (!results.length) {
    return "No results found.";
  }

  let text = "🔎 Top Results:\n\n";

  for (const r of results.slice(0, 5)) {
    text += `**${r.title}**\n${r.snippet}\n${r.link}\n\n`;
  }

  return text;
}

import { Ollama } from "ollama";

const ollama = new Ollama({
  host: process.env.OLLAMA_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
  },
});

async function summarize(text: string) {
  if (!process.env.OLLAMA_API_KEY) {
    throw new Error("OLLAMA_API_KEY missing in .env");
  }

  try {
    const response = await ollama.generate({
      model: "gpt-oss:120b", // cloud-safe model
      prompt: `Summarize this clearly for Discord:\n\n${text}`,
      stream: false,
    });

    if (!response?.response) {
      throw new Error("Invalid response from Ollama Cloud");
    }

    return response.response;
  } catch (err: any) {
    console.error("Ollama Cloud Error:", err?.message || err);
    throw new Error("Ollama Cloud request failed");
  }
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const query = interaction.options.getString("query", true);

  try {
    await interaction.deferReply(); // MUST happen before long operations

    const results = await searchWeb(query);
    const formatted = formatResults(results);
    const summary = await summarize(formatted);

    // Discord 2000 character limit safety
    const safeMessage =
      summary.length > 1900
        ? summary.slice(0, 1900) + "\n\n... (truncated)"
        : summary;

    await interaction.editReply(safeMessage);
  } catch (error) {
    console.error("SEARCH COMMAND ERROR:", error);

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply("❌ Search failed.");
      } else {
        await interaction.reply("❌ Search failed.");
      }
    } catch (replyError) {
      console.error("Reply error:", replyError);
    }
  }
}