const TelegramBot = require("node-telegram-bot-api");

const WebSocket = require('ws');

const socket = new WebSocket(`ws://${process.env.WS_URL}`);

socket.on('open', () => {
  console.log('[Telegram] Connecté au serveur WebSocket');

  // Envoyer un message au serveur lors de la connexion
  socket.send(JSON.stringify({
    type : "bot"
  }));
});

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {
  polling: true,
});

//bot.sendMessage("6874239099", "Hello").then(r => console.log(r));
let waitingForTicketName = false;
const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};
bot.on("message", async (msg) => {
  let client = null;
  let body = {
    name: msg.from.first_name,
    identifier: msg.from.id,
    platform_id: 2,
  };

  await fetch(`${process.env.API_URL}/client`, {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  })
    .then((res) => res.json())
    .then(async (data) => {
      if (data?.message?.length > 0) {
        client = await fetch(
          `${process.env.API_URL}/client/ident/${msg.from.id}`,
          {
            method: "GET",
            headers,
          }
        )
          .then((res) => res.json())
          .then((d) => {
            return d;
          });
      } else {
        if (client === null) client = data;
      }
    });

  fetch(`${process.env.API_URL}/ticket/opened/ident/${msg.from.id}`, {
    method: "GET",
    headers,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data?.code === 404) return;
      fetch(`${process.env.API_URL}/message`, {
        method: "POST",
        body: JSON.stringify({
          ticket_id: data.id,
          client_id: client.id,
          message: msg.text,
        }),
        headers,
      });

      socket.send(JSON.stringify({
        ticket_id: data.id,
        message : msg.text,
        name : client.name
      }));
    });

  if (msg.text === "/create") {
    if (msg.chat.type !== "private") return;

    fetch(`${process.env.API_URL}/ticket/ident/${msg.from.id}`, {
      method: "GET",
      headers,
    })
      .then((res) => res.json())
      .then(
        /**
         * @param {Array} data
         * */
        (data) => {
          data = data.filter(
            (ticket) =>
              ticket.status_id === 1 && ticket.channel_id === msg.chat.id
          );
          if (data.length > 0) {
            bot.sendMessage(msg.chat.id, "Vous avez déjà un ticket ouvert.");
            return;
          }
          bot.sendMessage(msg.chat.id, "Quel est le nom de votre ticket ?");
          waitingForTicketName = true;
        }
      );
    return;
  }

  if (waitingForTicketName) {
    waitingForTicketName = false;
    const body = {
      name: msg.text,
      status_id: 1,
      client_identifier: msg.from.id,
      channel_id: msg.chat.id,
    };
    const ticket = await fetch(`${process.env.API_URL}/ticket`, {
      method: "POST",
      body: JSON.stringify(body),
      headers,
    }).then((res) => res.json())

    bot.sendMessage(msg.chat.id, "Votre ticket a été créé.");
    return;
  }
});

socket.on('message', async (message) => {
  const msg = JSON.parse(message);
  if (msg.platform_id !== 2) return;

  msgToSend = msg.message

  if (msg?.action === "close") {
    msgToSend = "Ticket closed !"
  }

  try {
    bot.sendMessage(msg.client_identifier, msg.message)
  } catch (e) {
    console.log("Socker message Error :", e);
  }
});
socket.on('close', () => {
  console.log('[Telegram] Déconnecté du serveur WebSocket');
});
