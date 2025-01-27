const fishSizes = [15, 18, 21, 24, 27, 30, 33, 36, 39, 45];
function getRandomFishName() {
  const fishNames = [
    "Bubbles",
    "Finley",
    "Scales",
    "Marina",
    "Nemo",
    "Dory",
    "Splash",
    "Moby",
    "Gill",
    "Coral",
  ];
  return fishNames[Math.floor(Math.random() * fishNames.length)];
}

function randFishColor(prevColor) {
  prevColor = prevColor || lastColor;

  do {
    var color = choice(playerColors);
    var col = new Color(color[0], color[1], color[2]);
  } while (lastColor.equals(col));
  lastColor = col;

  return col;

  var r = 0;
  var g = 86;
  var b = 255;
  var offset = 100;
  var value = (r + g + b) / 3;
  var newVal = value + 2 * Math.random() * offset - offset;
  var ratio = newVal / value;

  return rgbToHex(r * ratio, g * ratio, b * ratio);
}
function Fish(AI, x, y, size, dir, frame, skin) {
  var randCol = randFishColor();

  this.dir = dir || 0; // radians
  this.AI = AI || false;
  this.targetDir = dir;
  this.arcSpeed = AI ? 0.12 : 0.14;
  this.canv = document.createElement("canvas");
  this.circles = Array.apply([], new Array(7)).map(function (cir, i) {
    return {
      x: this.x,
      y: this.y,
      r: 1,
    };
  });

  this.AIDir = 1;
  this.setSize(size || 16);

  this.frame = frame || 0;
  this.ossilation = Math.sin(frame / 5);
  this.curv = 0;

  // loaded percent is used for new colors that have been added and need to grow
  this.colors = [{ col: randCol.rgb(), thick: 4, loaded: 1 }];

  this.x = x || 0;
  this.y = y || 0;
  this.dying = false; // death animation
  this.dead = false; // remove this entity
  this.deathParticles = [];
  this.skin = skin ?? Math.ceil(Math.random() * 26);
  this.bodyColor = randCol.rgb();
  this.bodyOutline = randCol.rgb();
  this.name = AI ? getRandomFishName() : "";
  this.color = randCol;

  // is the user currently pressing a button to move?
  this.isInput = AI ? true : false;
  this.boost = false;

  // defined if user input is touch
  this.targetPos = null;

  this.velocity = [0, 0];
  this.accel = [0, 0];
  this.maxSpeed = this.AI ? 3 + Math.random() * 2 : 6;
  this.energy = this.size;

  // Bubbles
  this.bubbleParticles = [];
}
this.moveEnergy = 20;

Fish.prototype.draw = function (outputCtx) {
  if (this.dying) return this.drawDeath(outputCtx);
  this.ctx.clearRect(
    -this.canv.width,
    -this.canv.height,
    this.canv.width * 2,
    this.canv.height * 2
  );

  this.ctx.beginPath();

  // draw main body
  this.drawBody();

  // draw inner colors
  // this.drawColors();
  if (this.boost) {
    this.drawBubbles(outputCtx);
  }

  // output to main canvas
  outputCtx.save();
  outputCtx.translate(this.x, this.y);
  outputCtx.rotate(this.dir);
  outputCtx.drawImage(
    this.canv,
    -this.canv.width / 2 - this.size,
    -this.canv.height / 2
  );
  outputCtx.restore();

  if (this === GAME.player && GAME.state === "playing") {
    // Ensure the text is aligned correctly relative to the canvas
    outputCtx.save();
    outputCtx.textAlign = "center"; // Center the text horizontally
    outputCtx.textBaseline = "bottom"; // Align the text bottom
    outputCtx.fillStyle = "#FFF"; // White color text
    outputCtx.font = "20px Arial"; // Set font size and family
    outputCtx.fillText(this.name, this.x, this.y - this.size * 0.6); // Position text above fish
    outputCtx.restore();
  }

  if (this.AI && this.name) {
    // Ensure the text is aligned correctly relative to the canvas
    outputCtx.save();
    outputCtx.fillStyle = "white"; // Text color
    outputCtx.font = "28px Arial"; // Text font and size
    outputCtx.textAlign = "center"; // Center the text horizontally
    outputCtx.fillText(this.name, this.x, this.y - this.size - 10); // Draw the name above the fish
    outputCtx.restore();
  }

  if (debug) {
    // collision body
    var ctx = outputCtx;

    ctx.strokeStyle = "#0f0";
    ctx.fillStyle = "#0f0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.save();
    if (!this.dying) {
      for (var i = 0; i < this.circles.length; i++) {
        var cir = this.circles[i];
        ctx.arc(cir.x, cir.y, cir.r, 0, 2 * Math.PI, false);
      }
    }

    // draw collision body circles

    ctx.strokeStyle = "#0f0";
    ctx.stroke();
    ctx.closePath();

    // draw dir as line, and target dir as line
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x + this.size * 2 * Math.cos(this.dir),
      this.y + this.size * 2 * Math.sin(this.dir)
    );
    ctx.strokeStyle = "#ff0";
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x + this.size * 2 * Math.cos(this.targetDir),
      this.y + this.size * 2 * Math.sin(this.targetDir)
    );
    ctx.strokeStyle = "#f00";
    ctx.stroke();
    ctx.closePath();

    if (this.targetPos) {
      ctx.fillRect(this.targetPos.x, this.targetPos.y, 10, 10);
    }
    ctx.restore();
  }
};
Fish.prototype.drawBody = function () {
  this.ctx.drawImage(
    ASSETS["skin-" + this.skin],
    -this.size * 3.5,
    -this.size * 1.5,
    this.size * 5,
    this.size * 3
  );
  // var o = this.ossilation;
  // this.ctx.strokeStyle = this.bodyOutline;
  // this.ctx.fillStyle = this.bodyColor;
  // this.ctx.lineWidth = 6;

  // for (var i = -1; i < 2; i += 2) {
  //   this.ctx.moveTo(this.size, 0);

  //   this.ctx.bezierCurveTo(
  //     this.size * (14 / 15),
  //     (i * this.size) / 2 + (this.size / 30) * o + this.curv / 3,
  //     -this.size * (3 / 15),
  //     (i * this.size * 9) / 15 + (this.size / 30) * o + this.curv / 2,
  //     (-this.size * 1) / 4,
  //     (i * this.size * 10) / 15 + (this.size / 15) * o + this.curv / 2
  //   );

  //   this.ctx.bezierCurveTo(
  //     (-this.size * 9) / 15,
  //     (i * this.size * 11) / 15 + (this.size / 30) * o + this.curv / 3,
  //     (-this.size * 2) / 3,
  //     (i * this.size * 5) / 5 + (this.size / 30) * o + this.curv / 2,
  //     -this.size * 1,
  //     (i * this.size * 16) / 15 + (this.size / 15) * o + this.curv
  //   );

  //   this.ctx.bezierCurveTo(
  //     (-this.size * 14) / 15,
  //     (i * this.size * 10) / 15 + (this.size / 30) * o + this.curv / 3,
  //     (-this.size * 16) / 15,
  //     (i * this.size * 6) / 15 + (this.size / 30) * o + this.curv / 2,
  //     (-this.size * 16) / 15,
  //     (i * this.size * 8) / 15 + (this.size / 15) * o + this.curv
  //   );

  //   this.ctx.bezierCurveTo(
  //     -this.size * 2.5,
  //     (i * this.size) / 6 + (this.size / 10) * o + this.curv / 3,
  //     -this.size * 2.6,
  //     (i * this.size * 4) / 15 + (this.size / 15) * o + this.curv / 2,
  //     -this.size * 3 - Math.sin((i * this.size) / Math.PI) * o * 2,
  //     (i * this.size * 3) / 15 +
  //       Math.cos((i * this.size) / Math.PI) * o * 2 +
  //       (this.size / 15) * o +
  //       this.curv / 3
  //   );

  //   this.ctx.bezierCurveTo(
  //     -this.size * 3.2,
  //     (i * this.size * 3) / 15 + (this.size / 10) * o + this.curv / 3,
  //     -this.size * 3.3,
  //     (i * this.size * 9) / 15 + (this.size / 15) * o + this.curv / 2,
  //     -this.size * 3.5 - Math.sin((i * this.size) / Math.PI) * o * 3,
  //     (i * this.size * 8) / 15 +
  //       Math.cos((i * this.size) / Math.PI) * o * 2 +
  //       (this.size / 15) * o +
  //       this.curv / 3
  //   );

  //   this.ctx.bezierCurveTo(
  //     -this.size * 3.5,
  //     (i * this.size * 5) / 15 + (this.size / 10) * o + this.curv / 3,
  //     -this.size * 3.5,
  //     (i * this.size * 3) / 15 + (this.size / 15) * o + this.curv / 2,
  //     -this.size * 3.3,
  //     (-this.size / 15) * o +
  //       Math.cos((i * this.size) / Math.PI) * o * 4 +
  //       (this.size / 15) * o +
  //       this.curv / 3
  //   );

  //   // this.ctx.bezierCurveTo(
  //   //   -this.size * 2.5,
  //   //   (i * this.size) / 6 + (this.size / 10) * o + this.curv,
  //   //   -this.size * 3,
  //   //   (i * this.size) / 4 - (this.size / 15) * o + this.curv / 2,
  //   //   -this.size * 15 / 3,
  //   //   (-this.size / 15) * o + this.curv / 3
  //   // );
  // }
  // this.ctx.stroke();
  // this.ctx.fill();

  // Draw eyes
  // this.ctx.drawImage(
  //   ASSETS["eye-" + this.eye],
  //   this.size * (5 / 15),
  //   -this.size * (7 / 15),
  //   this.size / 3,
  //   this.size / 3
  // );
  // this.ctx.drawImage(
  //   ASSETS["eye-" + this.eye],
  //   this.size * (5 / 15),
  //   this.size * (2 / 15),
  //   this.size / 3,
  //   this.size / 3
  // );
};
Fish.prototype.drawColors = function () {
  var i, l, c;
  // inner colors
  var o = this.ossilation;
  this.ctx.lineWidth = 2;

  var colorSize = this.size - this.size / 4;

  var thicknessSum = 0;
  for (i = 0, l = this.colors.length; i < l; i++) {
    thicknessSum += this.colors[i].thick * this.colors[i].loaded;
  }

  var width = [];
  for (i = 0, l = this.colors.length; i < l; i++) {
    width.push((this.colors[i].thick / thicknessSum) * colorSize);
  }

  for (c = 0, l = this.colors.length; c < l && colorSize >= 0; c++) {
    this.ctx.beginPath();
    for (i = -1; i < 2; i += 2) {
      this.ctx.moveTo(colorSize, 0);
      this.ctx.bezierCurveTo(
        colorSize * (14 / 15),
        i * colorSize + (this.size / 30) * o + this.curv / 3,
        -colorSize / 2,
        i * colorSize + (this.size / 30) * o + this.curv / 2,
        -colorSize * 2.75,
        (this.size / 15) * o * this.colors[c].loaded + this.curv
      );
    }

    this.ctx.strokeStyle = this.colors[c].col;
    this.ctx.stroke();

    // resize for next color drawn (outside -> in)
    colorSize -= width[c];
  }
};
Fish.prototype.drawDeath = function (outputCtx) {
  for (var i = 0; i < this.deathParticles.length; i++) {
    this.deathParticles[i].draw(outputCtx);
  }
};
Fish.prototype.drawBubbles = function (outputCtx) {
  outputCtx.save();
  outputCtx.globalAlpha = 0.2;
  for (var i = 0; i < this.bubbleParticles.length; i++) {
    this.bubbleParticles[i].draw(outputCtx);
  }
  outputCtx.restore();
};
Fish.prototype.collide = function (fish) {
  // the fish has been killed and is being removed
  if (
    this.dying ||
    fish.dying ||
    distance(this, fish) > this.size * 5 + fish.size * 5 + 12
  ) {
    return false;
  }

  // there are 6 circles that make up the collision box of each fish
  // check if they collide
  var c1, c2;
  for (var i = -1, l = this.circles.length; ++i < l; ) {
    c1 = this.circles[i];

    for (var j = -1, n = fish.circles.length; ++j < n; ) {
      c2 = fish.circles[j];

      // check if they touch
      if (distance(c1, c2) <= c2.r + c1.r + 6) {
        //if ( Math.pow(c2.x - c1.x, 2) + Math.pow(c2.y - c1.y, 2) <= Math.pow(c2.r + c1.r, 2)) {
        return true;
      }
    }
  }

  return false;
};
Fish.prototype.killedBy = function (target, score, user) {
  this.dying = true;
  if (!this.AI || !target.AI) {
    playPop();
    if (user) {
      score += 5 + fishSizes.findIndex((size) => size == this.size);
      var scoreElement = document.querySelector(".scoreText");
      if (scoreElement) {
        scoreElement.innerText = score;
      }
    }
  }
  this.deathParticles = this.toParticles(target);

  return score;

  const bodyOutline = target.bodyOutline;
  target.bodyOutline = new Color(255, 255, 255).rgb();
  setTimeout(function () {
    target.bodyOutline = bodyOutline;
  }, 300);
};
var r, g, b;
Fish.prototype.toParticles = function (target) {
  var particles = [];

  var pixels = this.ctx.getImageData(
    0,
    0,
    this.canv.width,
    this.canv.height
  ).data;
  for (
    var i = 0;
    i < pixels.length;
    i += 36 * Math.ceil(this.size / 20) * (isMobile ? 6 : 1)
  ) {
    r = pixels[i];
    g = pixels[i + 1];
    b = pixels[i + 2];

    // black pixel - no data
    if (!r && !g && !b) {
      continue;
    }

    var x = (i / 4) % this.canv.width;
    var y = Math.floor(i / 4 / this.canv.width);
    x -= this.canv.width / 2 + this.size;
    y -= this.canv.height / 2;
    var relativePos = rot(x, y, this.dir);
    x = this.x + relativePos[0];
    y = this.y + relativePos[1];

    var col = new Color(r, g, b);
    var dir = directionTowards({ x: x, y: y }, this);
    const new_particle = new Particle(
      x,
      y,
      col,
      target,
      Math.PI * Math.random() * 2 - Math.PI,
      this.size / 20
    );
    setTimeout(function () {
      new_particle.dead = true;
    }, Math.random() * 700 + 100);
    particles.push(new_particle);
  }
  return particles;
};

var friction = 0.1;
var t1, t2, moveDir, diff, ossilation, curv, p, i, l, pos, arcSpeed;

Fish.prototype.physics = function (player) {
  this.ossilation = Math.sin(this.frame / 3);
  ossilation = this.ossilation;

  t1 = this.dir;
  t2 = this.targetDir;
  moveDir = 1;
  diff = 0;
  if (Math.abs(t1 - t2) > Math.PI) {
    moveDir = -1;
  }
  if (t1 > t2) {
    diff = t1 - t2 * moveDir;
  } else if (t1 < t2) {
    diff = t2 - t1 * moveDir;
  }
  curv = (this.size / 15) * diff;
  this.curv = curv || 0;

  // grow inner colors
  for (var i = 0, l = this.colors.length; i < l; i++) {
    if (this.colors[i].loaded < 1) {
      this.colors[i].loaded += 0.01;
    }
  }

  // fish is now particles
  if (this.dying) {
    for (i = this.deathParticles.length - 1; i >= 0; i--) {
      p = this.deathParticles[i];
      // if (p.physics() < p.target.size / 8 + 10) {
      if (p.dead === true) {
        this.deathParticles.splice(i, 1);

        // p.target.setSize(p.target.size + 0.001 * (isMobile ? 6 : 1));
        if (this.colors.length > 0) {
          for (var i = this.colors.length - 1; i >= 0; i--) {
            this.colors[i].loaded = 0;
            p.target.colors.push(this.colors.pop());
          }
        }
      }
    }
    if (!this.deathParticles.length) {
      this.dead = true;
      if (this == player) {
        // Save best score and level to local storage
        let currentScore = localStorage.score ?? 0,
          currentLvl = localStorage.level ?? 1;
        localStorage.score = Math.max(currentScore, score);
        localStorage.level = Math.max(currentLvl, 1.0 * GAME.level + 1);
        pauseBoost();

        GAME.state = "menu";
        var play = document.querySelector(".play.loading");
        if (play) {
          play.innerHTML = "Play";
          play.classList.remove("loading");
        }
      }
    }
  } else {
    // update collision circles
    for (i = 0, l = this.circles.length; i < l; i++) {
      pos = rot(
        this.circleMap[i][0],
        this.circleMap[i][1] * ossilation,
        this.dir
      );
      this.circles[i].x = pos[0] + this.x;
      this.circles[i].y = pos[1] + this.y;
    }

    // movement

    // mouse/touch input has a target location
    if (this.targetPos) {
      this.targetDir = directionTowards(this.targetPos, this);
    }

    if (this.AI) {
      if (
        !player.dead &&
        distance(this, player) < Math.min($canv.width, $canv.height) * 0.35
      ) {
        if (this.size > player.size) {
          this.targetDir = directionTowards(player, this);
        } else {
          this.targetDir = directionTowards(
            {
              x: this.x + (this.x - player.x) / 2,
              y: this.y + (this.y - player.y) / 2,
            },
            this
          );
        }
      } else {
        // random walk
        if (Math.random() < 0.05) this.AIDir *= -1; // 5% chance to change directions every frame
      }
      diff = (Math.random() / 100) * this.AIDir;
      this.targetDir = this.targetDir + diff;
      this.targetDir %= Math.PI;
    }

    t1 = this.dir;
    t2 = typeof this.targetDir === "undefined" ? this.dir : this.targetDir;
    arcSpeed = this.arcSpeed;

    moveDir = 1;
    if (Math.abs(t1 - t2) > Math.PI) {
      moveDir = -1;
    }

    if (t1 > t2) {
      this.dir -= moveDir * Math.min(arcSpeed, Math.abs(t1 - t2));
    } else if (t1 < t2) {
      this.dir += moveDir * Math.min(arcSpeed, Math.abs(t1 - t2));
    }
    if (this.dir > Math.PI) {
      this.dir = this.dir - Math.PI * 2;
    }
    if (this.dir < -Math.PI) {
      this.dir = this.dir + Math.PI * 2;
    }

    this.accel[0] = Math.cos(this.dir);
    this.accel[1] = Math.sin(this.dir);

    // if(!this.isInput) {

    // user is not applying input
    this.accel[0] = Math.cos(this.dir);
    this.accel[1] = Math.sin(this.dir);
    // } else {
    // this.accel[0] = Math.cos(this.dir)
    // this.accel[1] = Math.sin(this.dir)
    // }

    // if(!this.isInput) {

    //   // user is not applying input
    //   this.accel[0] = 0
    //   this.accel[1] = 0
    // } else {
    //   this.accel[0] = Math.cos(this.dir) * 10
    //   this.accel[1] = Math.sin(this.dir) * 10
    // }

    // update velocity vector
    this.velocity[0] += this.accel[0];
    this.velocity[1] += this.accel[1];

    this.velocity[0] = Math.max(
      -this.maxSpeed,
      Math.min(this.maxSpeed, this.velocity[0])
    );
    this.velocity[1] = Math.max(
      -this.maxSpeed,
      Math.min(this.maxSpeed, this.velocity[1])
    );

    // apply friction
    if (this.velocity[0] > 0) {
      this.velocity[0] -= Math.min(friction, this.velocity[0]);
    }
    if (this.velocity[0] < 0) {
      this.velocity[0] -= Math.max(-friction, this.velocity[0]);
    }
    if (this.velocity[1] > 0) {
      this.velocity[1] -= Math.min(friction, this.velocity[1]);
    }
    if (this.velocity[1] < 0) {
      this.velocity[1] -= Math.max(-friction, this.velocity[1]);
    }

    // update position vector
    if (!this.boost) {
      this.x += this.velocity[0] * Math.abs(Math.cos(this.dir));
      this.y += this.velocity[1] * Math.abs(Math.sin(this.dir));
    } else {
      this.x += this.velocity[0] * Math.abs(Math.cos(this.dir)) * 1.5;
      this.y += this.velocity[1] * Math.abs(Math.sin(this.dir)) * 1.5;
    }
  }

  if (this.boost) {
    for (i = this.bubbleParticles.length - 1; i >= 0; i--) {
      p = this.bubbleParticles[i];

      if (p.dead === true) {
        this.bubbleParticles.splice(i, 1);
      }
    }

    if (this.bubbleParticles.length == 0) {
      this.bubbleParticles = this.toBubbles();
    }
  }

  this.frame++;
};
var pi = Math.PI;
var dirMap = {
  up: -pi / 2,
  "right up": -pi / 4,
  right: 0,
  "down right": pi / 4,
  down: pi / 2,
  "down left": (3 * pi) / 4,
  left: pi,
  "left up": (-3 * pi) / 4,
};
Fish.prototype.toBubbles = function () {
  var particles = [];

  var pixels = this.ctx.getImageData(
    0,
    0,
    this.canv.width,
    this.canv.height
  ).data;
  for (
    var i = 0;
    i < pixels.length;
    i += 36 * Math.ceil(this.size / 20) * (isMobile ? 6 : 1)
  ) {
    r = pixels[i];
    g = pixels[i + 1];
    b = pixels[i + 2];

    // black pixel - no data
    if (!r && !g && !b) {
      continue;
    }

    var x = (i / 4) % this.canv.width;
    var y = Math.floor(i / 4 / this.canv.width);
    x -= this.canv.width / 2 + this.size;
    y -= this.canv.height / 2;
    var relativePos = rot(x, y, this.dir);
    x = this.x + relativePos[0];
    y = this.y + relativePos[1];

    var dir = directionTowards({ x: x, y: y }, this);
    var col = new Color(r, g, b);
    const new_particle = new Particle(
      x,
      y,
      col,
      {
        x: this.x,
        y: this.y,
      },
      Math.PI * Math.random() * 2 - Math.PI,
      1.5
    );
    setTimeout(function () {
      new_particle.dead = true;
    }, Math.random() * 700 + 100);
    particles.push(new_particle);
  }
  return particles;
};
Fish.prototype.updateInput = function (input, isTouch, isBoost) {
  // remember that up is down and down is up because of coordinate system
  if (this.boost == false && this.isBoost == true) {
    this.bubbleParticles = this.toBubbles();
  }

  this.boost = isBoost;

  if (isTouch) {
    // touch input
    // if valid
    if (typeof input[0] === "undefined" || typeof input[1] === "undefined") {
      this.isInput = false;
      this.targetPos = null;
      return (this.targetDir = this.dir);
    }
    this.isInput = true;
    this.targetDir = directionTowards(
      { x: this.x + input[0], y: this.y + input[1] },
      this
    );
    //this.targetPos = {x: targetX, y: targetY}
  } else {
    // keyboard input
    var inputDirection = input.slice(0, 2).sort().join(" ");

    // if valid
    if (!(typeof dirMap[inputDirection] !== "undefined")) this.isInput = false;
    else this.isInput = true;

    this.targetDir = valid ? dirMap[inputDirection] : this.dir;

    // remove pos from touch
    this.targetPos = null;
  }
};
Fish.prototype.setSize = function (size) {
  this.size = size;
  this.canv.width = this.size * 5;
  this.canv.height = ~~this.size * 3;
  // this.canv.width = this.size * 6.6;
  // this.canv.height = ~~this.size * 2.5;
  this.ctx = this.canv.getContext("2d");
  this.ctx.translate(this.canv.width / 2 + this.size, this.canv.height / 2);

  var ratios = [
    10 / 14,
    11 / 14,
    12 / 15,
    10 / 15,
    7 / 15,
    4 / 14,
    3 / 14,
    4 / 14,
  ];
  for (var i = 0; i < this.circles.length; i++) {
    this.circles[i].r = this.size * ratios[i];
  }

  this.circleMap = [
    [this.size, this.size / 10],
    [this.size / 5, this.size / 40],
    [-this.size / 3, this.size / 30],
    [-this.size, this.size / 20],
    [-this.size * 1.6, this.size / 15],
    [-this.size * 2.2, this.size / 12],
    [-this.size * 2.8, -this.size / 30],
    // [-this.size * 2.8, -this.size / 30],
    // [-this.size * 2.8, -this.size / 30],
    // [-this.size * 2.8, -this.size / 30],
  ];
};
