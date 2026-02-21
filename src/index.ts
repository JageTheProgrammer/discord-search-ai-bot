import dotenv from "dotenv";
dotenv.config();

import {
  Client,
  Collection,
  GatewayIntentBits,
  ChatInputCommandInteraction,
} from "discord.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


export interface Command {
  data: any;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface BotClient extends Client {
  commands: Collection<string, Command>;
}


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
}) as BotClient;

client.commands = new Collection();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import { pathToFileURL } from "url";

async function loadCommands() {
  const commandsPath = path.join(__dirname, "commands");

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((f) => f.endsWith(".js"));

  for (const file of commandFiles) {
    try {
      const filePath = path.join(commandsPath, file);

      // 🔥 Convert Windows path to file:// URL
      const fileUrl = pathToFileURL(filePath).href;

      const command = await import(fileUrl);

      client.commands.set(command.data.name, command);

      console.log("✅ Loaded command:", command.data.name);
    } catch (error) {
      console.error(`❌ Failed to load command ${file}:`, error);
    }
  }
}


client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
});


client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (!interaction.guild) {
    return interaction.reply({
      content: "❌ Commands can only be used inside a server.",
      ephemeral: true,
    });
  }

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(
      `❌ Error executing command ${interaction.commandName}:`,
      err
    );

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply("❌ Error executing command");
      } else {
        await interaction.reply({
          content: "❌ Error executing command",
          ephemeral: true,
        });
      }
    } catch {}
  }
});


async function init() {
  try {
    await loadCommands();

    if (!process.env.DISCORD_TOKEN) {
      throw new Error("DISCORD_TOKEN missing in .env");
    }

    await client.login(process.env.DISCORD_TOKEN);

    console.log("🚀 Bot is running!");
  } catch (error) {
    console.error("❌ Failed to start bot:", error);
    process.exit(1);
  }
}

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

init();

export { client };