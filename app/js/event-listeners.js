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

addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW':
      socket.emit('PLAYER_MOVE', 'KeyW');
      break;
    case 'KeyA':
      socket.emit('PLAYER_MOVE', 'KeyA');
      break;
    case 'KeyS':
      socket.emit('PLAYER_MOVE', 'KeyS');
      break;
    case 'KeyD':
      socket.emit('PLAYER_MOVE', 'KeyD');
      break;
  }
});
