console.log("adl");
const WebSocket = require('ws');

const socket = new WebSocket(`ws://yticket-wss.mazbaz.fr:8080`);

socket.on('open', () => {
    console.log('[Discord] Connecté au serveur WebSocket');
});