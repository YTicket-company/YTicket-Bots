console.log("adl");
const WebSocket = require('ws');

const socket = new WebSocket(`ws://yticket-wss.mazbaz.fr`);

socket.on('open', () => {
    console.log('[Discord] Connecté au serveur WebSocket');
});

