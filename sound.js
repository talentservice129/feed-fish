var muted = localStorage.muted == "true";
var soundMuted = localStorage.soundMuted == "true";
var about = false;

popSound = document.createElement("audio");
popSound.src = "assets/drop1.ogg";
popSound.volume = 0.6;

boostSound = document.createElement("audio");
boostSound.src = "assets/boost_final.mp3";
boostSound.volume = 0.6;
boostSound.loop = true;

bgSound = document.createElement("audio");
bgSound.src = "assets/Main_Menu_Bg.mp3";
bgSound.loop = true;
bgSound.volume = 0.4;

// if (localStorage.muted == "true") toggleMute();

function toggleMute() {
  if (!muted) {
    // popSound.volume = 0;
    // boostSound.volume = 0;
    bgSound.volume = 0;
    muted = true;
    localStorage.muted = "true";
    drawSoundControl();
  } else {
    // popSound.volume = 0.6;
    // boostSound.volume = 0.6;
    bgSound.volume = 0.4;
    muted = false;
    localStorage.muted = "false";
    bgSound.play();
    drawSoundControl();
  }
}

function toggleSoundMute() {
  if (!soundMuted) {
    popSound.volume = 0;
    boostSound.volume = 0;
    soundMuted = true;
    localStorage.soundMuted = "true";
    drawSoundControl();
  } else {
    popSound.volume = 0.6;
    boostSound.volume = 0.6;
    soundMuted = false;
    localStorage.soundMuted = "false";
    drawSoundControl();
  }
}

function playPop() {
  popSound.play();
}

function playBoost() {
  boostSound.play();
}

function playBG() {
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
}

function pauseBoost() {
  boostSound.pause();
  // boostSound.currentTime = 0;
}

function drawSoundControl() {
  if (typeof ctx === "undefined") return;
  if (GAME.state !== "playing") {
    // ctx.fillStyle = "#0E151D";
    // ctx.clearRect($canv.width - 100, $canv.height - 105, 80, 30);
    if (muted)
      ctx.drawImage(
        ASSETS.soundOff,
        $canv.width - 50,
        $canv.height - 105,
        30,
        30
      );
    else
      ctx.drawImage(
        ASSETS.soundOn,
        $canv.width - 50,
        $canv.height - 105,
        30,
        30
      );

    if (soundMuted)
      ctx.drawImage(
        ASSETS.volumnOff,
        $canv.width - 100,
        $canv.height - 105,
        30,
        30
      );
    else
      ctx.drawImage(
        ASSETS.volumnOn,
        $canv.width - 100,
        $canv.height - 105,
        30,
        30
      );
  }

  // if (GAME.state === "menu" && about) {
  //   ctx.fillStyle = "#0E151D";
  //   ctx.font = "normal 14px sans";
  //   ctx.fillText("By: Zolmeister", 10, 20);
  //   ctx.font = "normal 12px sans";
  //   ctx.fillText("Music: Chrissi J", 10, 42);
  // } else if (GAME.state === "menu") {
  //   ctx.fillStyle = "#0E151D";
  //   ctx.font = "normal 12px sans";
  //   ctx.fillText("About", 10, 20);
  // }
}

function showAbout() {
  about = true;
  drawSoundControl();
}
