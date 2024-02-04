const { Client, GatewayIntentBits, Partials, Events} = require("discord.js");

const dotenv = require("dotenv");
dotenv.config();

const Api = require('./api');

const moment = require("moment");

moment.locale("fr");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction,
  ],
});


client.once("ready", () => {
    console.log("Bot on !")
});

client.login(process.env.DISCORD_TOKEN);

const api = new Api(process.env.API_URL);

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || message.guild) return;

    try {
        const channel = await message.author.createDM();

        console.log(`[${message.author.tag}] [${channel.id}]: ${message.content}`);

        const client = await api.createClient(message.author.id, message.author.username);

        if (client === null) {
            console.error(`Failed to create client for ${message.author.username}.`);
            return await channel.send("Oups :/ we can't create your ticket ! 😅");
        }

        let ticket = await api.getOpenedTicket(message.author.id);

        if (ticket === null) {
            ticket = await api.createTicket(client.name, message.author.id, message.channelId);
            await channel.send(`${ticket.id} | Ticket created ! A staff will be back soon 😎`);
        }
    } catch (error) {
        console.error(`Erreur lors de la création du canal : ${error.message}`);
        console.error(error.stack);
    }
});