const canvas = document.querySelector('#canvas');
const scoreText = document.querySelector('#score');
const modalScoreText = document.querySelector('#modal-score');
const startBtn = document.querySelector('#btn-start');
const modal = document.querySelector('#modal');

const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

const friction = 0.99;

class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
  }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x, y, 10, 'white');
let projectiles = [];
let enemies = [];
let particles = [];

const init = () => {
  player = new Player(x, y, 10, 'white');
  projectiles = [];
  enemies = [];
  particles = [];
  score = 0;
  scoreText.innerText = '000';
  modalScoreText.innerText = '000';
};

const spawnEnemies = () => {
  setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4;

    let x, y;

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000);
};

let score = 0;
let animationId;

const animate = () => {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  particles.forEach((particle, particleIdx) => {
    if (particle.alpha <= 0) {
      particles.splice(particleIdx, 1);
    } else {
      particle.update();
    }
  });

  projectiles.forEach((projectile, projectileIdx) => {
    projectile.update();

    // remove projectile if they are out of canvas
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(projectileIdx, 1);
      }, 0);
    }
  });

  enemies.forEach((enemy, enemyIdx) => {
    enemy.update();

    // end game when enemy hits the player
    const playerEnemydist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    if (playerEnemydist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
      modalScoreText.innerText = score;
      modal.classList.remove('hidden');
    }

    projectiles.forEach((projectile, projectileIdx) => {
      // remove enemy if projectile hits it
      const projectileEnemydist = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );

      if (projectileEnemydist - enemy.radius - projectile.radius < 1) {
        // increase score
        score += 100;
        scoreText.innerText = score;

        // create explosion
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }

        // shrink enemies on hit
        if (enemy.radius - 10 > 5) {
          score += 100;
          scoreText.innerText = score;

          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(projectileIdx, 1);
          }, 0);
        } else {
          score += 250;
          scoreText.innerText = score;
          setTimeout(() => {
            enemies.splice(enemyIdx, 1);
            projectiles.splice(projectileIdx, 1);
          }, 0);
        }
      }
    });
  });
};

addEventListener('click', (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );

  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  };

  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity)
  );
});

startBtn.addEventListener('click', () => {
  init();
  animate();
  spawnEnemies();
  modal.classList.add('hidden');
});
