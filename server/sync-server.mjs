import { WebSocketServer } from 'ws';

const port = Number(process.env.PORT || 5174);
const wss = new WebSocketServer({ port });

wss.on('connection', socket => {
  socket.on('message', data => {
    for (const client of wss.clients) {
      if (client.readyState === 1) {
        client.send(data);
      }
    }
  });
});

console.log(`Sync server running on ws://localhost:${port}`);
