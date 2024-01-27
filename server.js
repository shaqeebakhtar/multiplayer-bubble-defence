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

const serverPlayers = {};
const SPEED = 10;

io.on('connection', (socket) => {
  serverPlayers[socket.id] = {
    x: Math.random() * 500,
    y: Math.random() * 500,
    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
  };

  io.emit('PLAYER_UPDATE', serverPlayers);

  socket.on('disconnect', () => {
    delete serverPlayers[socket.id];
    io.emit('PLAYER_UPDATE', serverPlayers);
  });

  socket.on('PLAYER_MOVE', (pressedKey) => {
    switch (pressedKey) {
      case 'KeyW':
        serverPlayers[socket.id].y -= SPEED;
        break;
      case 'KeyA':
        serverPlayers[socket.id].x -= SPEED;

        break;
      case 'KeyS':
        serverPlayers[socket.id].y += SPEED;
        break;
      case 'KeyD':
        serverPlayers[socket.id].x += SPEED;
        break;
    }
  });
});

setInterval(() => {
  io.emit('PLAYER_UPDATE', serverPlayers);
}, 15);

server.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT}`)
);
