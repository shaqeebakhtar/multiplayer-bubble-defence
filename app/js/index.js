const leaderboard = document.querySelector('#leaderboard');

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const devicePixelRatio = window.devicePixelRatio || 1;

const socket = io();

canvas.width = 1024 * devicePixelRatio;
canvas.height = 576 * devicePixelRatio;

ctx.scale(devicePixelRatio, devicePixelRatio);

const x = canvas.width / 2;
const y = canvas.height / 2;

const clientPlayers = {};
const clientProjectiles = {};

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

      leaderboard.innerHTML += `
        <li data-player='${id}'>
          <div class="flex items-center justify-between gap-3">
            <span class="max-w-40 truncate">${serverPlayer.nickname}</span>
            <span data-score>${serverPlayer.score}</span>
          </div>
        </li>
      `;
    } else {
      const playerScoreToUpdate = leaderboard.querySelector(
        `[data-player='${id}'] [data-score]`
      );
      playerScoreToUpdate.innerHTML = `${serverPlayers[id].score}`;

      document.querySelector(
        '#self-score'
      ).innerHTML = `${serverPlayers[id].score}`;

      // sort leaderboard
      const leaderboardPlayers = Array.from(
        document.querySelectorAll('#leaderboard li')
      );
      leaderboardPlayers.sort((a, b) => {
        const scoreA = parseInt(a.querySelector('[data-score]').textContent);
        const scoreB = parseInt(b.querySelector('[data-score]').textContent);

        return scoreB - scoreA;
      });

      leaderboard.innerHTML = '';
      leaderboardPlayers.forEach((player) => leaderboard.appendChild(player));

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
        gsap.to(clientPlayers[id], {
          x: serverPlayer.x,
          y: serverPlayer.y,
          duration: 0.015,
          ease: 'linear',
        });
      }
    }
  }

  // handle player disconnection
  for (const id in clientPlayers) {
    if (!serverPlayers[id]) {
      const playerToRemove = leaderboard.querySelector(`[data-player='${id}']`);
      leaderboard.removeChild(playerToRemove);

      if (id === socket.id) {
        console.log('me');
        document.querySelector('#player-nickname').classList.remove('hidden');
        document.querySelector('#player-score').classList.add('hidden');
        document.querySelector('#player-leaderboard').classList.add('hidden');
      }

      delete clientPlayers[id];
    }
  }
});

socket.on('PROJECTILE_UPDATE', (serverProjectiles) => {
  for (const id in serverProjectiles) {
    const serverProjectile = serverProjectiles[id];

    if (!clientProjectiles[id]) {
      clientProjectiles[id] = new Projectile({
        x: serverProjectile.x,
        y: serverProjectile.y,
        radius: 5,
        color: clientPlayers[serverProjectile.playerId]?.color,
        velocity: serverProjectile.velocity,
      });
    } else {
      clientProjectiles[id].x += serverProjectile.velocity.x;
      clientProjectiles[id].y += serverProjectile.velocity.y;
    }
  }

  for (const clientProjectileId in clientProjectiles) {
    if (!serverProjectiles[clientProjectileId]) {
      delete clientProjectiles[clientProjectileId];
    }
  }
});

let animationId;

const animate = () => {
  animationId = requestAnimationFrame(animate);
  // ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in clientPlayers) {
    const clientPlayer = clientPlayers[id];
    clientPlayer.draw();
  }

  for (const id in clientProjectiles) {
    const clientProjectile = clientProjectiles[id];
    clientProjectile.draw();
  }
};

animate();
