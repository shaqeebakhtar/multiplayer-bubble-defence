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
});

server.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT}`)
);
