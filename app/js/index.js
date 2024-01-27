const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');

const socket = io();

canvas.width = innerWidth;
canvas.height = innerHeight;

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 10, 'white');

socket.on('PLAYER_JOINED', (players) => {
  console.log(players);
});

let animationId;

const animate = () => {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
};

animate();
