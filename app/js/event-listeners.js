const nicknameForm = document.querySelector('#nickname-form');

addEventListener('click', (event) => {
  const canvas = document.querySelector('#canvas');
  const { top, left } = canvas.getBoundingClientRect();

  if (clientPlayers[socket.id] && clientPlayers[socket.id]) {
    const playerPosition = {
      x: clientPlayers[socket?.id]?.x,
      y: clientPlayers[socket?.id]?.y,
    };

    const angle = Math.atan2(
      event.clientY - top - playerPosition.y,
      event.clientX - left - playerPosition.x
    );

    socket.emit('PLAYER_SHOOT', {
      x: playerPosition.x,
      y: playerPosition.y,
      angle,
    });
  }
});

const SPEED = 6;

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

const playerInputs = [];
let sequenceNumber = 0;

// dx - velocity in horizontal direction
// dy - velocity in vertical direction

setInterval(() => {
  if (keys.w.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED });
    clientPlayers[socket.id].y -= SPEED;
    socket.emit('PLAYER_MOVE', { keyCode: 'KeyW', sequenceNumber });
  }

  if (keys.a.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 });
    clientPlayers[socket.id].x -= SPEED;
    socket.emit('PLAYER_MOVE', { keyCode: 'KeyA', sequenceNumber });
  }

  if (keys.s.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED });
    clientPlayers[socket.id].y += SPEED;
    socket.emit('PLAYER_MOVE', { keyCode: 'KeyS', sequenceNumber });
  }

  if (keys.d.pressed) {
    sequenceNumber++;
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 });
    clientPlayers[socket.id].x += SPEED;
    socket.emit('PLAYER_MOVE', { keyCode: 'KeyD', sequenceNumber });
  }
}, 15);

addEventListener('keydown', (event) => {
  if (!clientPlayers[socket.id]) return;

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = true;
      break;
    case 'KeyA':
      keys.a.pressed = true;
      break;
    case 'KeyS':
      keys.s.pressed = true;
      break;
    case 'KeyD':
      keys.d.pressed = true;
      break;
  }
});

addEventListener('keyup', (event) => {
  if (!clientPlayers[socket.id]) return;

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = false;
      break;
    case 'KeyA':
      keys.a.pressed = false;
      break;
    case 'KeyS':
      keys.s.pressed = false;
      break;
    case 'KeyD':
      keys.d.pressed = false;
      break;
  }
});

let playerJoiningTime;
let playerDisconnetionTime;

nicknameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const playerNickname = nicknameForm.querySelector('#nickname').value;

  if (!playerNickname) return;

  socket.emit('PLAYER_JOIN', {
    nickname: playerNickname,
    width: canvas.width,
    height: canvas.height,
  });

  playerJoiningTime = new Date();

  document.querySelector('#player-nickname').classList.add('hidden');
  document.querySelector('#player-score').classList.remove('hidden');
  document.querySelector('#player-leaderboard').classList.remove('hidden');
});
