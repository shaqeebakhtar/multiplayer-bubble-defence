const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const socket = io();

canvas.width = innerWidth;
canvas.height = innerHeight;

const x = canvas.width / 2;
const y = canvas.height / 2;

// const player = new Player(x, y, 10, 'white');

const players = {};

socket.on('PLAYER_JOIN', (serverPlayers) => {
  // update players on frontend
  for (const id in serverPlayers) {
    const serverPlayer = serverPlayers[id];
    if (!players[id]) {
      players[id] = new Player(serverPlayer.x, serverPlayer.y, 10, 'white');
    }
  }
});

socket.on('PLAYER_LEAVE', (serverPlayers) => {
  for (const id in players) {
    if (!serverPlayers[id]) {
      delete players[id];
    }
  }
});

let animationId;

const animate = () => {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const id in players) {
    const player = players[id];
    player.draw();
  }
};

animate();
