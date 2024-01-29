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
const PLAYER_RADIUS = 5;

io.on('connection', (socket) => {
  io.emit('PLAYER_UPDATE', serverPlayers);

  socket.on('PLAYER_JOIN', ({ nickname, width, height }) => {
    serverPlayers[socket.id] = {
      x: Math.random() * 1024,
      y: Math.random() * 576,
      color: `hsl(${Math.random() * 360},100%,50%)`,
      sequenceNumber: 0,
      score: 0,
      nickname,
    };

    serverPlayers[socket.id].canvas = {
      width,
      height,
    };

    serverPlayers[socket.id].radius = PLAYER_RADIUS;
  });

  socket.on('PLAYER_MOVE', ({ keyCode, sequenceNumber }) => {
    const serverPlayer = serverPlayers[socket.id];
    serverPlayer.sequenceNumber = sequenceNumber;

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

    const playerSides = {
      left: serverPlayer.x - serverPlayer.radius,
      right: serverPlayer.x + serverPlayer.radius,
      top: serverPlayer.y - serverPlayer.radius,
      bottom: serverPlayer.y + serverPlayer.radius,
    };

    if (playerSides.left < 0) serverPlayers[socket.id].x = serverPlayer.radius;

    if (playerSides.right > 1024)
      serverPlayers[socket.id].x = 1024 - serverPlayer.radius;

    if (playerSides.top < 0) serverPlayers[socket.id].y = serverPlayer.radius;

    if (playerSides.bottom > 576)
      serverPlayers[socket.id].y = 576 - serverPlayer.radius;
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
      continue;
    }

    for (const playerId in serverPlayers) {
      const serverPlayer = serverPlayers[playerId];

      const playerProjectileDist = Math.hypot(
        serverProjectiles[id]?.x - serverPlayer.x,
        serverProjectiles[id]?.y - serverPlayer.y
      );

      // projectile and player collision
      if (
        playerProjectileDist < PROJECTILE_RADIUS + serverPlayer.radius &&
        serverProjectiles[id].playerId !== playerId
      ) {
        if (serverPlayers[serverProjectiles[id].playerId])
          serverPlayers[serverProjectiles[id]?.playerId].score += 50;
        delete serverProjectiles[id];
        delete serverPlayers[playerId];

        break;
      }
    }
  }

  io.emit('PROJECTILE_UPDATE', serverProjectiles);
  io.emit('PLAYER_UPDATE', serverPlayers);
}, 15);

server.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT}`)
);
