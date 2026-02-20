import dotenv from 'dotenv';
dotenv.config();

import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { data as searchCommand } from './commands/search.js';

const commands = [
  searchCommand.toJSON(),
];

console.log(`📊 Total commands: ${commands.length}`); // Should show 100

const clientId = process.env.CLIENT_ID!;
const token = process.env.DISCORD_TOKEN!;

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('🚀 Deploying commands...');
    console.log(`📝 Registering ${commands.length} commands:`);
    
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('✅ Commands deployed successfully!');
  } catch (err) {
    console.error('❌ Error deploying commands:', err);
  }
})();