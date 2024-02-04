const TelegramBot = require("node-telegram-bot-api");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server);

const bot = new TelegramBot("6712736801:AAFNsvtXi7T1XYupSdxY0bSM2Tx8ZFs1Ef0", {
  polling: true,
});

//bot.sendMessage("6874239099", "Hello").then(r => console.log(r));
let waitingForTicketName = false;
bot.on("message", (msg) => {
  fetch(`${process.env.API_URL}client/ident/${msg.from.id}`, {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => console.log(data));

  if (msg.text === "/create") {
    fetch(`${process.env.API_URL}GetTicketByClientIdentifier/${msg.from.id}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.length === 0) {
          bot.sendMessage(msg.chat.id, "Quel est le nom de votre ticket ?");
          waitingForTicketName = true;
        } else {
          bot.sendMessage(msg.chat.id, "Vous avez déjà un ticket ouvert.");
        }
      });
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
    fetch(`${process.env.API_URL}ticket`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return;
  }

  //io.emit("sendMessage", msg);
});

io.on("connection", (socket) => {
  socket.on("sendMessage", (res) => {
    bot
      .sendMessage("6874239099", `Bonjour ${res.Name}`)
      .then((r) => console.log(r));
  });
});
