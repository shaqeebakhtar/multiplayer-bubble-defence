import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const PORT = 3000;

app.use(express.static('app')); // 'app' here is folder

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/index.html');
});

const players = {};

io.on('connection', (socket) => {
  console.log('player connected: ', socket.id);

  players[socket.id] = {
    x: Math.random() * 500,
    y: Math.random() * 500,
  };

  io.emit('PLAYER_JOIN', players);

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('PLAYER_LEAVE', players);
  });
});

server.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT}`)
);
