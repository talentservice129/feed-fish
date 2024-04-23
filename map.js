function SmallMap(x, y, w, h, scale) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.scale = scale;
  this.playerColor = "green";
  this.eatfishColor = "blue";
  this.neatfishColor = "red";
}

SmallMap.prototype.draw = function (player, fishs) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(this.x, this.y, this.w, this.h);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 0.1;
  ctx.stroke();
  ctx.translate(this.x, this.y + this.h / 4);

  for (var i = 0; i < fishs.length; i++) {
    let fish = fishs[i];
    if (Math.abs(fish.x - player.x) < $canv.height) {
      if (Math.abs(fish.y - player.y) < $canv.height) {
        ctx.save();
        ctx.translate(
          (fish.x + $canv.width / 2 - player.x) * this.scale,
          (fish.y + $canv.height / 2 - player.y) * this.scale
        );
        ctx.rotate(fish.targetDir);
        ctx.beginPath();
        ctx.moveTo(-4, -2);
        ctx.lineTo(4, 0);
        ctx.lineTo(-4, 2);
        ctx.closePath();
        if (fishs[i].AI) {
          ctx.fillStyle =
            player.size < fish.size ? this.neatfishColor : this.eatfishColor;
        } else {
          ctx.fillStyle = this.playerColor;
        }
        ctx.fill();
        ctx.restore();
      }
    }
  }

  ctx.restore();
};