import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import axios from "axios";

export const data = new SlashCommandBuilder()
  .setName("search")
  .setDescription("Search the web with AI analysis")
  .addStringOption(option =>
    option
      .setName("query")
      .setDescription("What do you want to search?")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const query = interaction.options.getString("query", true);

  await interaction.deferReply();

  try {
    await axios.post(
      "YOUR N8N LISTENING WEBHOOK URL (PUBLISHED)",
      { query }
    );

    await interaction.editReply(`🔎 Searching for **${query}**...`);
  } catch (error) {
    console.error(error);
    await interaction.editReply("❌ Search failed.");
  }
}