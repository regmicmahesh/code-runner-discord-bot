import { Client, Events, GatewayIntentBits, REST, Routes } from 'discord.js';

import commands from './commands';

const TOKEN = process.env.TOKEN!
const CLIENT_ID = process.env.CLIENT_ID!

const mustRegister = async () => {
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands.map(el => el.data) });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
await mustRegister();

const client = new Client({ intents: [GatewayIntentBits.Guilds] })
client.once(Events.ClientReady, (readyClient) => console.log(`Ready! Logged in as ${readyClient.user.tag}`));

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        const command = commands.find(el => el.data.name == commandName)
        if (!command) {
            await interaction.reply("this command is not registered.");
            return;
        }
        await command.executeChat(interaction);
        return;
    }

    if (interaction.isModalSubmit()) {
        const { customId } = interaction;
        const command = commands.find(el => el.data.name == customId);
        if (!command) {
            await interaction.reply("this command is not registered.");
            return;
        }
        await command.executeModalSubmit(interaction);
        return;
    }
})

client.login(TOKEN);