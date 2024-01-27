const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const devicePixelRatio = window.devicePixelRatio || 1;

const socket = io();

canvas.width = innerWidth * devicePixelRatio;
canvas.height = innerHeight * devicePixelRatio;

const x = canvas.width / 2;
const y = canvas.height / 2;

const clientPlayers = {};

socket.on('PLAYER_UPDATE', (serverPlayers) => {
  // update players on frontend
  for (const id in serverPlayers) {
    const serverPlayer = serverPlayers[id];
    if (!clientPlayers[id]) {
      clientPlayers[id] = new Player({
        x: serverPlayer.x,
        y: serverPlayer.y,
        radius: 10,
        color: serverPlayer.color,
      });
    } else {
      if (id === socket.id) {
        // for self player position
        clientPlayers[id].x = serverPlayer.x;
        clientPlayers[id].y = serverPlayer.y;

        const lastProcessedInputIdx = playerInputs.findIndex((input) => {
          return serverPlayer.sequenceNumber === input.sequenceNumber;
        });

        if (lastProcessedInputIdx > -1)
          playerInputs.splice(0, lastProcessedInputIdx + 1);

        playerInputs.forEach((input) => {
          clientPlayers[id].x += input.dx;
          clientPlayers[id].y += input.dy;
        });
      } else {
        // for other players position
        clientPlayers[id].x = serverPlayer.x;
        clientPlayers[id].y = serverPlayer.y;
      }
    }
  }

  for (const id in clientPlayers) {
    if (!serverPlayers[id]) {
      delete clientPlayers[id];
    }
  }
});

let animationId;

const animate = () => {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const id in clientPlayers) {
    const clientPlayer = clientPlayers[id];
    clientPlayer.draw();
  }
};

animate();
