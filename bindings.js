// loaded last

var keymap = {
  38: "up",
  39: "right",
  40: "down",
  37: "left",
  87: "up",
  68: "right",
  83: "down",
  65: "left",
};

var userInput = [];
var mouseDown = false;
var initializeOnUp = false;

window.onresize = resizeWindow;
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    resizeWindow();
  }
});
function resizeWindow() {
  $canv.width = (window.innerWidth * devPixelRatio * quality) / 10;
  $canv.height = (window.innerHeight * devPixelRatio * quality) / 10;
  ctx = $canv.getContext("2d");
  ctx.lineJoin = "round";

  if (GAME.state === "playing") {
    GAME.spawner.resize($canv.width, $canv.height);
    GAME.levelBar.resize($canv.width, $canv.height);
    GAME.levelBalls.resize($canv.width, $canv.height);
  } else if (GAME.state === "menu") {
    if (ASSETS.loaded) drawMenu();
  } else if (GAME.state === "setting") {
    drawChangeSkin();
  }
}

function eventPos(e) {
  if (e.type.indexOf("touch") === -1) {
    // if its a mouse coord
    return {
      x: e.pageX * devPixelRatio,
      y: e.pageY * devPixelRatio,
      width: 1,
      height: 1,
    };
  }

  // touch event coord
  if (e.type === "touchend") return { x: 0, y: 0, width: 0, height: 0 };
  return {
    x: e.touches[0].pageX * devPixelRatio - 35,
    y: e.touches[0].pageY * devPixelRatio - 35,
    width: 70,
    height: 70,
  };
}

$canv.addEventListener("mousedown", touchDown);
// $canv.addEventListener("touchstart", touchDown);
function touchDown(e) {
  e.preventDefault();
  var pos = eventPos(e);
  if (GAME.state === "playing") {
    mouseDown = score > 0;
    GAME.player.updateInput(
      [pos.x - $canv.width / 2, pos.y - $canv.height / 2],
      true,
      // true
      mouseDown
    );
    if (mouseDown) {
      playBoost();
    }
  }

  // audio
  if (
    collideBox(pos, {
      x: $canv.width - 50,
      y: $canv.height - 105,
      width: 30,
      height: 30,
    })
  ) {
    toggleMute();
  }
  // sound
  if (
    collideBox(pos, {
      x: $canv.width - 100,
      y: $canv.height - 105,
      width: 20,
      height: 20,
    })
  ) {
    toggleSoundMute();
  }

  if (!about) {
    // about
    if (
      collideBox(pos, {
        x: 10,
        y: 10,
        width: 40,
        height: 20,
      })
    ) {
      showAbout();
    }
  } else {
    // zolmeister
    if (
      collideBox(pos, {
        x: 32,
        y: 10,
        width: 80,
        height: 12,
      })
    ) {
      window.open("http://zolmeister.com");
    }

    // music attribution
    if (
      collideBox(pos, {
        x: 48,
        y: 32,
        width: 48,
        height: 12,
      })
    ) {
      window.open("https://soundcloud.com/chrissij");
    }
  }
}

$canv.addEventListener("mouseup", touchUp);
// $canv.addEventListener("touchend", touchUp);
function touchUp(e) {
  e.preventDefault();
  var pos = eventPos(e);
  if (GAME.state === "playing") {
    GAME.player.updateInput([], true, false);
    mouseDown = false;
    pauseBoost();
  }
  // else if (GAME.state === "menu" && GAME.MENU.button) {
  //   drawMenuButton(initializeOnUp);
  //   if (initializeOnUp) {
  //     init();
  //     initializeOnUp = false;
  //   }
  // }
}

$canv.addEventListener("mousemove", touchMove);
// $canv.addEventListener("touchmove", touchMove);
function touchMove(e) {
  e.preventDefault();
  var pos = eventPos(e);
  if (GAME.state === "playing") {
    // GAME.player.updateInput(
    //   [pos.x - $canv.width / 2, pos.y - $canv.height / 2],
    //   true,
    //   false
    // );
    // if (mouseDown && score > 0) {
    // if (mouseDown) {
    GAME.player.updateInput(
      [pos.x - $canv.width / 2, pos.y - $canv.height / 2],
      true,
      mouseDown && score > 0
    );
    // }
  }
}

window.onkeydown = function (e) {
  if (GAME.state === "playing") {
    var k = keymap[e.which];
    if (!k) return;

    // remove from input list if it was there already
    if (userInput.indexOf(k) != -1) {
      userInput.splice(userInput.indexOf(k), 1);
    }

    // add to front of input list
    userInput.unshift(k);

    GAME.player.updateInput(userInput, false);
  }
};

window.onkeyup = function (e) {
  if (GAME.state === "playing") {
    var k = keymap[e.which];
    if (!k) return;

    // remove from input list if it was there already
    if (userInput.indexOf(k) != -1) {
      userInput.splice(userInput.indexOf(k), 1);
    }

    GAME.player.updateInput(userInput, false);
  }
};

// Joystick
if (window.isMobile) {
  window.$wheelManager.on("move", (_, data) => {
    const { distance, angle } = data;
    const pos = [
      distance * Math.cos(angle.radian),
      -distance * Math.sin(angle.radian),
    ];
    if (GAME.state === "playing") {
      GAME.player.updateInput(pos, true, false);
      if (mouseDown && score > 0) {
        GAME.player.updateInput(pos, true, true);
      }
    }
  });
  window.$boost.addEventListener("touchstart", (_) => {
    mouseDown = score > 0;
    if (mouseDown) {
      playBoost();
      window.$boost.classList.add("active");
    }
    GAME.player.updateInput([], true, mouseDown);
  });
  window.$boost.addEventListener("touchend", (e) => {
    e.preventDefault();
    pauseBoost();
    window.$boost.classList.remove("active");
    GAME.player.updateInput([], true, false);
    mouseDown = false;
  });
}

// Player name
var textInput = document.getElementById("menuTextInput");
textInput.addEventListener("input", function (event) {
  if (GAME && GAME.player) {
    GAME.player.name = event.target.value;
  }
});

// Play button
var play = document.querySelector(".play");
play.addEventListener("click", function (e) {
  e.target.innerHTML = "Loading";
  e.target.classList.add("loading");
  if (GAME.state === "menu") {
    if (window.isMobile) {
      $wheel.style.visibility = "visible";
      $boost.style.visibility = "visible";
    }
    init();
  }
});

// Change Skin
changeSkinElement = document.getElementById("settingButton");
changeSkinElement.addEventListener("click", function (e) {
  GAME.state = "setting";
  var main = document.querySelector(".main");
  main.style.display = "none";
  changeSkinElement.style.display = "none";
  document.querySelector(".change-skin").style.display = "block";

  drawChangeSkin();
});

document.querySelector(".prev-skin").addEventListener("click", function (e) {
  GAME.playerSkin = ((GAME.playerSkin - 2 + 26) % 26) + 1;

  drawChangeSkin();
});

document.querySelector(".next-skin").addEventListener("click", function (e) {
  GAME.playerSkin = (GAME.playerSkin % 26) + 1;

  drawChangeSkin();
});

document.querySelector(".select-skin").addEventListener("click", function () {
  document.querySelector(".change-skin").style.display = "none";
  localStorage.skin = GAME.playerSkin;
  GAME.state = "menu";
  changeSkinElement.style.display = "flex";
  var main = document.querySelector(".main");
  main.style.display = "block";
  ctx.clearRect(0, 0, $canv.width, $canv.height);
  drawMenu();
});

// Splash Screen
var playBtn = document.querySelector(".play-btn");
playBtn.addEventListener("click", function (e) {
  document.querySelector(".splash-bg").style.display = "none";
  playBG();
});
