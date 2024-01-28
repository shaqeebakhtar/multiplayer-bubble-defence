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

const serverProjectiles = {};
let projectileId = 0;

const PROJECTILE_RADIUS = 5;

io.on('connection', (socket) => {
  serverPlayers[socket.id] = {
    x: Math.random() * 500,
    y: Math.random() * 500,
    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    sequenceNumber: 0,
  };

  io.emit('PLAYER_UPDATE', serverPlayers);

  socket.on('CANVAS_INIT', ({ width, height }) => {
    serverPlayers[socket.id].canvas = {
      width,
      height,
    };
  });

  socket.on('PLAYER_MOVE', ({ keyCode, sequenceNumber }) => {
    serverPlayers[socket.id].sequenceNumber = sequenceNumber;
    switch (keyCode) {
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

  socket.on('PLAYER_SHOOT', ({ x, y, angle }) => {
    projectileId++;

    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5,
    };

    serverProjectiles[projectileId] = {
      x,
      y,
      velocity,
      playerId: socket.id,
    };
  });

  socket.on('disconnect', () => {
    delete serverPlayers[socket.id];
    io.emit('PLAYER_UPDATE', serverPlayers);
  });
});

setInterval(() => {
  // update projectile positions
  for (const id in serverProjectiles) {
    serverProjectiles[id].x += serverProjectiles[id].velocity.x;
    serverProjectiles[id].y += serverProjectiles[id].velocity.y;

    if (
      serverProjectiles[id].x - PROJECTILE_RADIUS >=
        serverPlayers[serverProjectiles[id].playerId]?.canvas.width ||
      serverProjectiles[id].y - PROJECTILE_RADIUS >=
        serverPlayers[serverProjectiles[id].playerId]?.canvas.height ||
      serverProjectiles[id].x + PROJECTILE_RADIUS <= 0 ||
      serverProjectiles[id].y + PROJECTILE_RADIUS <= 0
    ) {
      delete serverProjectiles[id];
    }
  }

  io.emit('PROJECTILE_UPDATE', serverProjectiles);
  io.emit('PLAYER_UPDATE', serverPlayers);
}, 15);

server.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT}`)
);
