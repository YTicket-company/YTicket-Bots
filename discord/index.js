const { Client, GatewayIntentBits, Partials, Events} = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const Api = require('./api');
const moment = require("moment");

moment.locale("fr");


const token = "MTE5ODkyMTAzODk4NjIxNTU1NQ.GiqUZj.t4KTctKxreZL_wll8ACezoYYqfb4iqdCZ9RNbg";
const clientId = "1198921038986215555";
const guildId = "1198927880076410921";

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

client.login(token);

const api = new Api();

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