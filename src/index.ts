import dotenv from 'dotenv';
dotenv.config();

import { Client, Collection, CommandInteraction, GatewayIntentBits, MessageFlags, Events, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export interface BotClient extends Client {
    commands: Collection<string, { data: any; execute: (interaction: CommandInteraction) => Promise<void> }>;
}

// Add proper intents
const client: BotClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
}) as BotClient;

client.commands = new Collection();

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store all commands for deployment
let allCommands: any[] = [];

// Load commands dynamically
async function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.ts') || f.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            const { data, execute } = await import(`./commands/${file}`);
            client.commands.set(data.name, { data, execute });
            
            // Store command JSON for deployment
            allCommands.push(data.toJSON());
            
            console.log('✅ Loaded command:', data.name);
        } catch (error) {
            console.error(`❌ Failed to load command ${file}:`, error);
        }
    }
    
    console.log(`📝 Total commands loaded: ${allCommands.length}`);
}

// Function to register commands to a specific guild
async function registerCommandsToGuild(guildId: string, guildName: string) {
    try {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
        
        console.log(`📝 Registering ${allCommands.length} commands to new guild: ${guildName} (${guildId})...`);
        
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId),
            { body: allCommands }
        );
        
        console.log(`✅ Successfully registered commands to ${guildName}!`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to register commands to guild ${guildName}:`, error);
        return false;
    }
}

// When bot is ready
client.once(Events.ClientReady, () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);
    console.log(`📊 Bot is in ${client.guilds.cache.size} servers`);
    
    // Display all servers
    displayServers();
});

// When bot joins a new server
client.on(Events.GuildCreate, async (guild) => {
    console.log(`\n🎉 Bot was added to a new server: ${guild.name} (${guild.id})`);
    console.log(`👑 Owner: ${(await guild.fetchOwner()).user.tag}`);
    console.log(`👥 Members: ${guild.memberCount}`);
    
    // Automatically register commands to this new guild
    const success = await registerCommandsToGuild(guild.id, guild.name);
    
    if (success) {
        console.log(`✅ Commands are now available in ${guild.name}!`);
        
        // Try to send a welcome message in the system channel or first text channel
        try {
            const defaultChannel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0);
            if (defaultChannel && defaultChannel.isTextBased()) {
                await defaultChannel.send({
                    embeds: [{
                        title: '🎉 Thanks for adding LumoBot!',
                        description: `I've automatically registered **${allCommands.length} commands** to this server!\n\nType **/** to see all available commands.\nNeed help? Use **/help**`,
                        color: 0x5865F2,
                        footer: { text: 'LumoBot - Your Ultimate Discord Bot' }
                    }]
                });
            }
        } catch (error) {
            console.log('Could not send welcome message');
        }
    }
});

// When bot leaves a server
client.on(Events.GuildDelete, (guild) => {
    console.log(`👋 Bot was removed from: ${guild.name} (${guild.id})`);
    console.log(`📊 Now in ${client.guilds.cache.size} servers`);
});

// Handle interactions
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(`❌ Error executing command ${interaction.commandName}:`, err);

        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ content: '❌ Error executing command' });
            } else {
                await interaction.reply({
                    content: '❌ Error executing command',
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch {
            // Ignore
        }
    }
});

// Function to display all servers
function displayServers() {
    const guilds = client.guilds.cache;
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 **BOT IS IN ${guilds.size} SERVERS**`);
    console.log('='.repeat(50));
    
    if (guilds.size === 0) {
        console.log('❌ Bot is not in any servers yet!');
        console.log('📝 Invite the bot using: https://discord.com/api/oauth2/authorize?client_id=' + client.user?.id + '&permissions=8&scope=bot%20applications.commands');
    } else {
        const sortedGuilds = guilds.sort((a, b) => b.memberCount - a.memberCount);
        
        sortedGuilds.forEach((guild, index) => {
            console.log(`\n📌 **SERVER #${index + 1}**`);
            console.log(`   📛 Name: ${guild.name}`);
            console.log(`   🆔 ID: ${guild.id}`);
            console.log(`   👥 Members: ${guild.memberCount.toLocaleString()}`);
        });
        
        // Summary statistics
        console.log('\n' + '='.repeat(50));
        console.log('📊 **SUMMARY STATISTICS**');
        console.log('='.repeat(50));
        
        const totalMembers = guilds.reduce((acc, guild) => acc + guild.memberCount, 0);
        
        console.log(`📊 Total Servers: ${guilds.size}`);
        console.log(`👥 Total Members: ${totalMembers.toLocaleString()}`);
    }
}

// Initialize bot
async function init() {
    try {
        // Load all commands first
        await loadCommands();
        
        // Login to Discord
        await client.login(process.env.DISCORD_TOKEN);
        console.log('✅ Bot is running!');
        
        // Register commands to ALL existing servers on startup
        console.log('\n📝 Registering commands to all existing servers...');
        const guilds = client.guilds.cache;
        
        for (const [id, guild] of guilds) {
            await registerCommandsToGuild(id, guild.name);
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('\n✅ All commands registered to existing servers!');
        
    } catch (error) {
        console.error('❌ Failed to start bot:', error);
        process.exit(1);
    }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
});

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down...');
    await client.destroy();
    process.exit(0);
});

init();

export { client };