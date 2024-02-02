const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const moment = require("moment");
moment.locale("fr");

const token =
  "MTE5ODkyMTAzODk4NjIxNTU1NQ.GiqUZj.t4KTctKxreZL_wll8ACezoYYqfb4iqdCZ9RNbg";
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

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const prefix = "!";

  if (message.guild) {
    if (message.channel.name.startsWith("ticket-")) {
      if (!message.content.startsWith(prefix)) {
        console.log(`[${message.author.tag}]: ${message.content}`);
      }
    } else if (message.content.toLowerCase() === `${prefix}createticket`) {
      try {
        const ticketChannel = await message.guild.channels.create(
          `ticket-${message.author.id}`,
          {
            type: "text",
            permissionOverwrites: [
              {
                id: message.author.id,
                allow: [
                  Permissions.FLAGS.VIEW_CHANNEL,
                  Permissions.FLAGS.SEND_MESSAGES,
                ],
              },
              {
                id: message.guild.roles.everyone,
                deny: [Permissions.FLAGS.VIEW_CHANNEL],
              },
            ],
          }
        );

        console.log(
          `Canal créé : ${ticketChannel.name} ID : ${ticketChannel.id}`
        );

        const fetchedChannel = message.guild.channels.cache.get(
          ticketChannel.id
        );

        fetchedChannel.on("messageCreate", (msg) => {
          console.log(`[${msg.author.tag}]: ${msg.content}`);
        });

        console.log(
          `Canal créé : ${ticketChannel.name} ID : ${ticketChannel.id}`
        );

        await ticketChannel.send(
          `Bienvenue dans votre ticket, ${message.author}!`
        );
      } catch (error) {
        console.error(`Erreur lors de la création du canal : ${error.message}`);
        console.error(error.stack);
      }
    }
  } else {
    console.log(`[${message.author.tag}]: ${message.content}`);

    if (message.content.toLowerCase() === `${prefix}createticket`) {
      try {
        const ticketChannel = await message.author.createDM();

        console.log(
          `Canal créé : ${ticketChannel.name} ID : ${ticketChannel.id}`
        );

        await ticketChannel.send(
          `Bienvenue dans votre ticket, ${message.author}! `
        );
      } catch (error) {
        console.error(`Erreur lors de la création du canal : ${error.message}`);
        console.error(error.stack);
      }
    }
  }
});

client.once("ready", () => {});

client.login(token);

const rest = new REST({ version: "9" }).setToken(token);

const commands = [
  {
    name: "ping",
    description: "Pong!",
  },
];

const registerCommands = async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
  } catch (error) {
    console.error(error);
  }
};

registerCommands();
