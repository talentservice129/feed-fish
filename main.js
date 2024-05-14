"use strict";
var score = 0;

function checkMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    userAgent
  );
}

function setGlobals() {
  // window.ext is set by cocoonjs
  window.isMobile = checkMobile();
  window.devPixelRatio =
    (window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio) || 1;
  window.$canv = document.getElementById("mainCanv");
  window.$settingCanv = document.getElementById("settingCanv");
  $canv.width = window.innerWidth * devPixelRatio;
  $canv.height = window.innerHeight * devPixelRatio;
  window.ctx = $canv.getContext("2d");
  window.settomgCtx = $settingCanv.getContext("2d");
  ctx.lineJoin = "round";
  window.debug = false; // true

  // this probably shouldnt be a global...
  window.usingSmallLogo = false;

  // color pallet
  window.pallet = [
    [255, 0, 0], // Red
    [0, 255, 0], // Green
    [0, 0, 255], // Blue
    [255, 255, 0], // Yellow
    [255, 0, 255], // Magenta
    [0, 255, 255], // Cyan
    [128, 128, 128], // Gray
    [255, 165, 0], // Orange
    [0, 128, 0], // Dark Green
    [0, 0, 128], // Navy
    [128, 0, 0], // Maroon
    [128, 0, 128], // Purple
    [0, 128, 128], // Teal
    [255, 192, 203], // Pink
    [128, 128, 0], // Olive
  ];

  window.playerSize = [16, 17, 19, 22, 25, 28, 31, 34, 37, 40, 46];
  window.playerColors = [
    [30, 144, 255], // 1E90FF
    [15, 82, 186], // 0f52ba
    [210, 20, 4], // D21404
    [11, 102, 35], // 0B6623
    [80, 200, 120], // 50C878
    [255, 239, 0], // FFEFOO (Invalid color code)
    [252, 108, 133], // FC6C85
    [252, 142, 172], // FC8EAC
    [197, 198, 199], // C5C6C7
    [110, 111, 113], // 6E6F71
    [229, 184, 11],
  ];

  ctx.lineJoin = "round";
  window.debug = false; // true

  window.usingSmallLogo = false;

  window.lastColor = new Color();
  window.GAME = {
    MENU: {
      opacity: 1,
    },
    playerSkin: Math.ceil(Math.random() * 11),
    state: "menu",
    firstLoop: true,
    bufferLoop: true,
  };
  window.ASSETS = { loaded: false };

  if (debug) {
    window.stats = new Stats();
    document.body.appendChild(stats.domElement);
  }
  // game loop
  window.MS_PER_UPDATE = 32;
  window.previousTime = 0.0;
  window.lag = 0.0;
  window.quality = 10;

  // joystick controls
  if (window.isMobile) {
    window.$wheel = document.querySelector(".zone");
    window.$boost = document.querySelector(".fire");
    const options = {
      zone: $wheel,
      mode: "static",
      position: { left: "50%", top: "50%" },
      // color: "red",
    };
    window.$wheelManager = nipplejs.create(options);
  }
}

setGlobals();
loadAssets(fadeInMenu);

function init() {
  GAME.state = "playing";
  GAME.player = new Fish(false);
  GAME.player.skin = GAME.playerSkin;
  GAME.fishes = [GAME.player];
  GAME.spawner = new Spawner(
    $canv.width,
    $canv.height,
    GAME.player,
    GAME.fishes
  );
  GAME.level = 0;
  GAME.levelParticles = [];
  GAME.levelBar = new LevelBar($canv.width);
  GAME.levelBalls = new LevelBalls($canv.width, $canv.height);
  GAME.levelBallParticles = [];
  GAME.endGameParticles = [];
  GAME.levelUpParticles = [];
  GAME.firstLoop = true;
  score = 0;
  // Boost
  GAME.boostDuration = 0;
  var w = $canv.width * 0.1;

  GAME.smallMap = new SmallMap($canv.width - w - 40, 40, w, w, 0.1);
  var playerNameInput = document.getElementById("menuTextInput");
  var main = document.querySelector(".main");
  if (playerNameInput && playerNameInput.value) {
    GAME.player.name = playerNameInput.value;
  } else {
    // If no name was entered, you might want to set a default name
    GAME.player.name = "Player";
  }
  main.style.display = "none";

  var scoreElement = document.querySelector(".scoreText");
  if (scoreElement) {
    scoreElement.innerText = "0";
  }

  bgSound.pause();
  bgSound.currentTime = 0; // Reset time to start

  // Update the src attribute to the new sound file for 'playing' state
  bgSound.src = "assets/Gameplay_Bg.mp3"; // Replace with the path to your in-game background sound

  // Play the new background sound if not muted
  if (!muted) {
    bgSound.loop = true;
    bgSound.volume = 0.6; // Set volume or keep it from previously set value
    bgSound.addEventListener(
      "canplaythrough",
      function () {
        bgSound.play();
      },
      { once: true }
    ); // Add event listener to play sound when it's ready, and use 'once' option to auto-remove listener after firing once
    bgSound.play(); // Attempt to play right away in case the sound is already loaded
  }
  requestAnimFrame(draw);
}

function lowerQuality() {
  if (!isMobile) return;
  if (quality >= 7) {
    quality -= 1;
    resizeWindow();
  }
}

// main game loop
function draw(time) {
  var i, l, j, dist, nextStage, fish, fish2;

  lag += time - previousTime;
  if (mouseDown && score > 0 && GAME.state === "playing") {
    GAME.boostDuration += time - previousTime;
    if (GAME.boostDuration >= 1000) {
      GAME.boostDuration -= 1000;
      score--;
      if (score == 0) {
        pauseBoost();
        if (window.isMobile) {
          window.$boost.classList.remove("active");
        }
      }
      var scoreElement = document.querySelector(".scoreText");
      if (scoreElement) {
        scoreElement.innerText = score;
      }
    }
  }
  previousTime = time;

  if (GAME.state === "playing") {
    var iframe = document.getElementById("iframe");
    iframe.style.display = "none";
    requestAnimFrame(function (t) {
      draw(t);
    });
    var setting = document.getElementById("settingButton");
    setting.style.display = "none";
  } else if (GAME.state === "menu") {
    ctx.clearRect(0, 0, $canv.width, $canv.height);
    var iframe = document.getElementById("iframe");
    iframe.style.display = "block";
    var setting = document.getElementById("settingButton");
    setting.style.display = "flex";
    bgSound.pause();
    bgSound.currentTime = 0; // Reset time to start

    // Update the src attribute to the new sound file for 'playing' state
    bgSound.src = "assets/Main_Menu_Bg.mp3"; // Replace with the path to your in-game background sound

    // Play the new background sound if not muted
    if (!muted) {
      bgSound.loop = true;
      bgSound.volume = 0.6; // Set volume or keep it from previously set value
      bgSound.addEventListener(
        "canplaythrough",
        function () {
          bgSound.play();
        },
        { once: true }
      ); // Add event listener to play sound when it's ready, and use 'once' option to auto-remove listener after firing once
      bgSound.play(); // Attempt to play right away in case the sound is already loaded
    }
    var scoreElement = document.querySelector(".scoreText");
    scoreElement.innerText = "";
    if (window.isMobile) {
      $wheel.style.visibility = "hidden";
      $boost.style.visibility = "hidden";
    }
    return fadeInMenu();
  }

  var player = GAME.player;
  var fishes = GAME.fishes;
  var spawner = GAME.spawner;
  var levelParticles = GAME.levelParticles;
  var levelUpParticles = GAME.levelUpParticles;
  var levelBar = GAME.levelBar;
  var levelBalls = GAME.levelBalls;
  var levelBallParticles = GAME.levelBallParticles;
  var endGameParticles = GAME.endGameParticles;

  if (debug) stats.begin();
  var MAX_CYCLES = 17;
  while (lag >= MS_PER_UPDATE && MAX_CYCLES) {
    physics();
    lag -= MS_PER_UPDATE;
    MAX_CYCLES--;
  }

  if (MAX_CYCLES === 0 && GAME.firstLoop) {
    GAME.firstLoop = false;
  } else if (MAX_CYCLES === 0 && GAME.bufferLoop) {
    GAME.bufferLoop = false;
  } else if (MAX_CYCLES === 0) {
    // adaptive quality
    lowerQuality();
    GAME.firstLoop = true;
    GAME.bufferLoop = true;
  }

  // if 5 frames behind, jump
  if (lag / MS_PER_UPDATE > 75) {
    lag = 0.0;
  }

  paint();
  if (debug) stats.end();

  function physics() {
    levelBarPhysics();
    levelBallPhysics();
    endGameParticlePhysics();
    // enemy spawner
    spawner.update();
    // enemy spawner debug
    fishPhysics();
    playerScore();
  }

  function paint() {
    // clear and draw background
    ctx.fillStyle = "#111";
    drawBackgroundCanvas(player);
    // static position objects
    levelBar.draw(ctx);
    paintLevelParticles();
    paintLevelUpParticles();
    paintLevelBallParticles();
    // levelBalls.draw(ctx);

    // dynamic position objects
    ctx.save();
    ctx.translate(-player.x + $canv.width / 2, -player.y + $canv.height / 2);
    paintEndGameParticles();
    paintFish();

    if (debug) spawner.debug();
    ctx.restore();
    smallmap();
    drawSoundControl();
  }

  function levelBarPhysics() {
    // levelBar level up
    nextStage = levelBar.physics();
    if (nextStage) {
      var newParticles = levelBar.toParticles({
        x: $canv.width / 2,
        y: $canv.height / 2,
      });
      // staticly position
      // for (i = 0; i < newParticles.length; i++) {
      //   newParticles[i].x += -player.x;
      //   newParticles[i].y += -player.y;
      // }

      GAME.levelUpParticles = levelUpParticles.concat(newParticles);
      // GAME.levelBallParticles = levelBallParticles.concat(
      //   levelBar.toParticles(player)
      // );
      // levelBalls.nextColors = levelBar.colors.slice(0, 2);

      // reset levelBar
      GAME.levelBar = new LevelBar($canv.width);
      GAME.level++;
    }

    // levelBar Particles physics
    i = levelParticles.length;
    while (i-- > 0) {
      dist = levelParticles[i].physics();
      if (dist < 10) {
        levelParticles.splice(i, 1);
        if (!levelBar.updating) {
          levelBar.updating = true;
          levelBar.addColor();
        }
        if (levelParticles.length === 0) {
          levelBar.updating = false;
        }
      }
    }

    for (i = levelUpParticles.length - 1; i >= 0; i--) {
      p = levelUpParticles[i];
      if (p.physics() < player.size / 8 + 10) {
        // if (p.dead === true) {
        levelUpParticles.splice(i, 1);
        if (levelUpParticles.length === 0) {
          if (GAME.level <= 10) {
            GAME.player.setSize(playerSize[GAME.level]);
          }
        }
      }
    }
  }

  function levelBallPhysics() {
    // levelBalls level up
    nextStage = levelBalls.physics();
    if (nextStage) {
      GAME.endGameParticles = levelBalls.toParticles(player);

      // un-static position
      for (i = 0; i < GAME.endGameParticles.length; i++) {
        GAME.endGameParticles[i].x += player.x - $canv.width / 2;
        GAME.endGameParticles[i].y += player.y - $canv.height / 2;
      }

      GAME.levelBalls = new LevelBalls($canv.width, $canv.height);
    }

    // i = levelBallParticles.length;
    // while (i-- > 0) {
    //   dist = levelBallParticles[i].physics();
    //   if (dist < 10) {
    //     levelBallParticles.splice(i, 1);
    //     if (!levelBalls.updating) {
    //       levelBalls.updating = true;
    //       levelBalls.addBall();
    //     }
    //     if (levelBallParticles.length === 0) {
    //       levelBalls.updating = false;
    //       levelBalls.shift();
    //     }
    //   }
    // }
  }

  function endGameParticlePhysics() {
    for (i = -1, l = endGameParticles.length; ++i < l; ) {
      endGameParticles[i].physics();
    }
  }

  function fishPhysics() {
    // physics and drawing
    i = fishes.length;
    while (i-- > 0) {
      // cleanup dead fish - in here for performance
      if (fishes[i].dead) {
        if (fishes[i] === player) {
          setTimeout(function () {
            score = 0;
            var scoreElement = document.querySelector(".scoreText");
            if (scoreElement) {
              scoreElement.innerText = score;
            }
            GAME.state = "menu";
          }, 3000);
        }
        fishes.splice(i, 1);
        continue;
      }

      fish = fishes[i];
      if (
        Math.abs(fish.x - player.x) < $canv.width &&
        Math.abs(fish.y - player.y) < $canv.height
      ) {
        fish.physics(player);

        // collision - in here for performance
        j = i;
        while (j-- > 0) {
          fish2 = fishes[j];
          if (
            Math.abs(fish2.x - player.x) < $canv.width &&
            Math.abs(fish2.y - player.y) < $canv.height
          ) {
            if (fish.collide(fish2)) {
              if (fish.size >= fish2.size) {
                score = fish2.killedBy(fish, score, false);
                const bodyOutline = fish.bodyOutline;
              } else {
                score = fish.killedBy(fish2, score, true);
                const bodyOutline = fish2.bodyOutline;
              }
            }
          }
        }
      }

      // if far enough away from player, remove
      if (distance(fish, player) > Math.max($canv.width, $canv.height) * 1.5) {
        fish.dead = true;
      }
    }
  }

  function playerScore() {
    i = player.colors.length;
    if (i <= 1) return;
    // while(i-->0) {
    //   if (player.colors[i].loaded < 1) {
    //     return
    //   }
    // }

    // player score
    // steal colors from player
    player.drawColors();
    var newParticles = player.toParticles(levelBar);

    // staticly position
    for (i = 0; i < newParticles.length; i++) {
      newParticles[i].x += -player.x + $canv.width / 2;
      newParticles[i].y += -player.y + $canv.height / 2;
    }

    GAME.levelParticles = levelParticles.concat(newParticles);
    player.colors.splice(0, 1);
  }

  function paintLevelParticles() {
    for (i = -1, l = levelParticles.length; ++i < l; ) {
      levelParticles[i].draw(ctx); // iterate levelParticles
    }
  }

  function paintLevelUpParticles() {
    for (i = -1, l = levelUpParticles.length; ++i < l; ) {
      levelUpParticles[i].draw(ctx); // iterate levelUpParticles
    }
  }

  function paintLevelBallParticles() {
    for (i = -1, l = levelBallParticles.length; ++i < l; ) {
      levelBallParticles[i].draw(ctx);
    }
  }

  function paintEndGameParticles() {
    for (i = -1, l = endGameParticles.length; ++i < l; ) {
      endGameParticles[i].draw(ctx);
    }
  }

  function paintFish() {
    // draw fish
    for (i = -1, l = fishes.length; ++i < l; ) {
      fish = fishes[i];
      if (
        Math.abs(fish.x - player.x) < $canv.width / 2 + 100 &&
        Math.abs(fish.y - player.y) < $canv.height / 2 + 100
      ) {
        fish.draw(ctx);
      }
    }
  }
  function smallmap() {
    GAME.smallMap.draw(player, fishes);
  }
}
function loadAssets(cb) {
  var imgs = [
    { name: "skin-1", src: "assets/skins/skin1.png" },
    { name: "skin-2", src: "assets/skins/skin2.png" },
    { name: "skin-3", src: "assets/skins/skin3.png" },
    { name: "skin-5", src: "assets/skins/skin4.png" },
    { name: "skin-4", src: "assets/skins/skin5.png" },
    { name: "skin-6", src: "assets/skins/skin6.png" },
    { name: "skin-7", src: "assets/skins/skin7.png" },
    { name: "skin-8", src: "assets/skins/skin8.png" },
    { name: "skin-9", src: "assets/skins/skin9.png" },
    { name: "skin-10", src: "assets/skins/skin10.png" },
    { name: "skin-11", src: "assets/skins/skin11.png" },
    { name: "logo", src: "assets/title_text.png" },
    { name: "logoSmall", src: "assets/title_text.png" },
    { name: "soundOn", src: "assets/sound-on.png" },
    { name: "soundOff", src: "assets/sound-off.png" },
    { name: "enter", src: "assets/play_text.png" },
    { name: "skinImage", src: "assets/left_bottom_fish.png" },
  ];

  function process() {
    var next = imgs.pop();
    if (next) {
      var img = new Image();
      img.onload = function () {
        ASSETS[next.name] = this;
        process();
      };
      img.src = next.src;
    } else {
      ASSETS.loaded = true;
      cb();
    }
  }

  process();
}

// level debug
function levelUp() {
  var levelBar = GAME.levelBar;
  for (var i = 0; i < 9; i++) levelBar.addColor();

  levelBar.colors.forEach(function (col) {
    col.loaded = 1;
  });
  levelBar.x = levelBar.targetX;
  levelBar.addColor();
}
function levelUp2() {
  var levelBalls = GAME.levelBalls;
  for (var i = 0; i < 8; i++) {
    levelBalls.addBall();
    levelBalls.shift();
  }
  levelBalls.balls.forEach(function (b) {
    b.size = b.targetSize;
  });
  levelBalls.addBall();
}
//setTimeout(levelUp, 3000)
//setTimeout(function(){GAME.levelBar.addColor()}, 10000)
//setTimeout(levelUp2, 3000)

function drawBackgroundCanvas(player) {
  drawGrid($canv.width, $canv.height, player);
}

const angle = (2 * Math.PI) / 6;
let radius = parseInt($canv.width / 15);
function drawGrid(width, height, player) {
  let sinRadius = radius * Math.sin(angle);
  const yoffset =
    -parseInt(player.y / (2 * sinRadius)) * 2 * sinRadius + sinRadius * 2;
  const xoffset = -parseInt(player.x / (3 * radius)) * 3 * radius + 3 * radius;
  ctx.translate(-xoffset, -yoffset);

  for (let y = 0; y <= 2 * height + sinRadius; y += 2 * sinRadius) {
    let cnt = 0;
    for (let x = 0; x <= 2 * width + radius; x += 1.5 * radius) {
      drawHexagon(x - player.x, y + (cnt % 2) * sinRadius - player.y);
      cnt++;
    }
  }
  ctx.translate(xoffset, yoffset);
}

function drawHexagon(x, y) {
  const gradient = ctx.createLinearGradient(
    x - radius,
    y - radius,
    x + radius,
    y + radius
  );
  // Night gradient
  gradient.addColorStop(1, "#1a1a1a"); // Dark blue
  gradient.addColorStop(0, "#000000"); // Black
  ctx.beginPath();
  ctx.strokeStyle = "#00000C"; // Set line color to white
  ctx.fillStyle = gradient; // Set fill color to gradient
  for (let i = 0; i < 8; i++) {
    ctx.lineTo(
      x + radius * Math.cos(angle * i),
      y + radius * Math.sin(angle * i)
    );
  }
  ctx.closePath();
  ctx.fill(); // Fill hexagon with gradient color
  ctx.stroke(); // Draw hexagon outline with white lines
}

function drawChangeSkin() {
  var fish = new Fish(
    false,
    $canv.width / 2,
    $canv.height / 2,
    30,
    0,
    0,
    GAME.playerSkin
  );
  drawBackgroundCanvas(fish);

  // Draw the fish onto the setting canvas
  fish.draw(ctx);
  fish.drawBody(ctx);
}
