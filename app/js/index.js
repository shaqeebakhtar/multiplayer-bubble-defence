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
        nickname: serverPlayer.nickname,
      });

      leaderboard.innerHTML += `
        <li data-player='${id}'>
          <div class="flex items-center justify-between gap-3">
            <span class="w-44 truncate">${serverPlayer.nickname}</span>
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

      document.querySelector('#total-players').innerHTML = `${
        Object.keys(serverPlayers).length
      }`;

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

      const rank = leaderboardPlayers.findIndex(
        (player) => player.dataset.player === socket.id
      );

      document.querySelector('#rank').innerHTML = `${rank + 1}`;

      clientPlayers[id].target = {
        x: serverPlayer.x,
        y: serverPlayer.y,
      };

      if (id === socket.id) {
        const lastProcessedInputIdx = playerInputs.findIndex((input) => {
          return serverPlayer.sequenceNumber === input.sequenceNumber;
        });

        if (lastProcessedInputIdx > -1)
          playerInputs.splice(0, lastProcessedInputIdx + 1);

        playerInputs.forEach((input) => {
          clientPlayers[id].target.x += input.dx;
          clientPlayers[id].target.y += input.dy;
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const id in clientPlayers) {
    const clientPlayer = clientPlayers[id];

    if (clientPlayer.target) {
      clientPlayers[id].x +=
        (clientPlayers[id].target.x - clientPlayers[id].x) * 0.5;

      clientPlayers[id].y +=
        (clientPlayers[id].target.y - clientPlayers[id].y) * 0.5;
    }

    clientPlayer.draw();
  }

  for (const id in clientProjectiles) {
    const clientProjectile = clientProjectiles[id];
    clientProjectile.draw();
  }
};

animate();
