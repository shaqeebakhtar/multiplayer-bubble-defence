import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.static('app')); // 'app' here is folder

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/index.html');
});

const players = {};

io.on('connection', (socket) => {
  console.log('player connected: ', socket.id);

  players[socket.id] = {
    x: 55,
    y: 955,
    color: 'red',
  };

  io.emit('PLAYER_JOINED', players);
});

server.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT}`)
);
