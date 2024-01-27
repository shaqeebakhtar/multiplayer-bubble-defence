addEventListener('click', (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );

  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };
});

const SPEED = 10;

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
