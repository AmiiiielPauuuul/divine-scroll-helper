import http from 'http';
import { WebSocketServer } from 'ws';

const port = Number(process.env.PORT || 5174);

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
});

const wss = new WebSocketServer({ server });

wss.on('connection', socket => {
  socket.on('message', data => {
    for (const client of wss.clients) {
      if (client.readyState === 1) {
        client.send(data);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Sync server running on ws://localhost:${port}`);
});
