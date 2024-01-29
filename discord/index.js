const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const token =
  "MTE5ODkyMTAzODk4NjIxNTU1NQ.GiqUZj.t4KTctKxreZL_wll8ACezoYYqfb4iqdCZ9RNbg";
const clientId = "1198921038986215555";
const guildId = "1198927880076410921";

// Création du client Discord
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

client.on("messageCreate", (message) => {
  if (message.author.id === client.user.id) {
    console.log(`Message envoyé par vous : ${message.content}`);
    return;
  }

  console.log(`Message reçu de ${message.author.tag} : ${message.content}`);

  const prefix = "!";

  // Vérifier si le message commence par le préfixe "!ping"
  if (message.content.toLowerCase().startsWith(`${prefix}ping`)) {
    console.log("Commande ping détectée");

    // Envoyer "Pong!" indépendamment du contexte (serveur ou message privé)
    message.channel.send("Pong!");
  } else {
    console.log("Commande inconnue");
  }
});

client.once("ready", () => {
  console.log("Connecté !");
});

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

client.on("interactionCreate", async (interaction) => {
  console.log(
    `${interaction.user.tag} a exécuté la commande ${interaction.commandName}`
  );

  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    console.log("Commande ping détectée");
    interaction.reply("Pong!");
  }
});
