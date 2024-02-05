// const dotenv = require("dotenv")
// dotenv.config()

const WebSocket = require('ws');
const wss = new WebSocket.Server({ host: process.env.WS_HOST, port: process.env.WS_PORT });

var clients = new Array();
var bots = new Array();

wss.on('connection', (socket) => {
  socket.on('message', (message) => {
    // Login des bots & clients
    handCheck = JSON.parse(message);
    if(handCheck.type) {
        if (handCheck.type == "bot") {
            bots.push(socket);
            console.log("Bot logged !");
        } else if (handCheck.type == "client") {
            clients.push(socket)
            console.log("Client logged !");
        }
        return;
    }

    if (clients.includes(socket)) {
        bots.forEach(bot => {
            bot.send(message)
        });
        return;
    }

    if (bots.includes(socket)) {
        clients.forEach(client => {
            client.send(message)
        });
        return;
    }
  });

  socket.on('close', () => {
    console.log('[SERVER] Client déconnecté');
  });
});



// {
//     plat_id 
//     client_identifier 
//     message
// }

// {
//     ticket_id
//     name
//     message
// }