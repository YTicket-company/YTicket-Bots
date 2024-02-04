const { Client, GatewayIntentBits, Partials, Events} = require("discord.js");
const WebSocket = require('ws');

const Api = require('./api');

const moment = require("moment");

moment.locale("fr");


const socket = new WebSocket(`ws://${process.env.WS_URL}:${process.env.WS_PORT}`);

socket.on('open', () => {
  console.log('[Discord] Connecté au serveur WebSocket');

  socket.send(JSON.stringify({
    type : "bot"
  }));
});


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
    console.log("Bot Discord on !")
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

        msg = await api.createMessage(ticket.id, client.id, message.content);

        socket.send(JSON.stringify({
            ticket_id: ticket.id,
            message : message.content,
            name : client.name
        }));
    } catch (error) {
        console.error(`Erreur lors de la création du canal : ${error.message}`);
        console.error(error.stack);
    }
});


socket.on('message', async (message) => {
  const msg = JSON.parse(message);
  if (msg.platform_id !== 1) return;

  try {
    client.users.cache.get(`${msg.client_identifier}`).send(msg.message)
  } catch (e) {
    console.log("Socker message Error :", e);
  }
});

socket.on('close', () => {
  console.log('[Discord] Déconnecté du serveur WebSocket');
});