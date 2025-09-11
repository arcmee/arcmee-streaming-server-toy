const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 9000 });

const rooms = {};

console.log('Tracker server started on port 9000');

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', message => {
    // Handle messages for joining rooms and requesting peers
    console.log(`Received message: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    // Handle cleanup: remove user from any rooms
  });
});
