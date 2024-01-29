class Player {
  constructor({ x, y, radius, color, nickname }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.nickname = nickname;
  }

  draw() {
    ctx.font = '12px Play';
    ctx.fillStyle = 'white';
    ctx.fillText(this.nickname, this.x - 25, this.y + 25);
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}
