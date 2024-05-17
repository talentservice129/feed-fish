function createTextInput() {
  // Check if the input already exists to avoid creating duplicates
  var textInput = document.getElementById("menuTextInput");
  if (!textInput) {
    textInput = document.createElement("input");
    var style = document.createElement("style");
    style.textContent = `
      #menuTextInput::placeholder {
        color: #ffffff;
        opacity: .7;
      }
    `;

    // Append the <style> element to the <head> so it takes effect
    document.head.appendChild(style);
    textInput.type = "text";
    textInput.id = "menuTextInput";
    textInput.placeholder = "Enter your name..."; // Example placeholder text
    textInput.style.color = "#ffffff";

    // Style the input to match the canvas/menu appearance
    textInput.style.position = "absolute";
    textInput.style.zIndex = "2"; // Ensure it's above the canvas

    // Center horizontally in the x-axis within the whole screen width
    textInput.style.left = "50%";
    textInput.style.transform = "translateX(-50%)";

    // Adjust the style further as needed:
    textInput.style.fontSize = "15px";
    textInput.style.padding = "10px";
    textInput.style.borderRadius = "30px 30px 30px 30px";
    textInput.style.background = "#539C7F";
    textInput.style.border = "#539C7F";

    textInput.addEventListener("input", function (event) {
      if (GAME && GAME.player) {
        GAME.player.name = event.target.value;
      }
    });

    document.body.appendChild(textInput); // Add to the page
  }

  // Now we need to position the text element above the canvas correctly
  // positionTextInput(textInput);
}

function positionTextInput(textInput) {
  textInput.style.top = "50%";
  textInput.style.left = "50%";
}

function drawMenu() {
  sizeMenu();
  drawMenuLogo();
  drawSoundControl();
  drawBestScore();
}

function drawMenuLogo() {
  var title = GAME.MENU.title;
  ctx.drawImage(
    ASSETS[usingSmallLogo ? "logoSmall" : "logo"],
    title.x,
    title.y,
    title.width,
    title.height
  );
}

function fadeInMenu() {
  GAME.state = "menu";
  GAME.MENU.opacity = 0;
  requestAnimFrame(menuFade);
  // drawMenu();

  // You may want to show and hide the text input along with the menu
  var main = document.querySelector(".main");
  if (main) {
    main.style.display = "block";
  }
}

function menuFade() {
  GAME.MENU.opacity += 0.02;
  drawMenu();
  var alpha = 1 - GAME.MENU.opacity;
  // ctx.fillStyle = "rgba(17,17,17," + (alpha > 0 ? alpha : 0) + ")";
  // ctx.fillRect(0, 0, $canv.width, $canv.height);
  if (GAME.MENU.opacity < 1 && GAME.state === "menu") {
    requestAnimFrame(menuFade);
  }
}

function drawMenuButton(hitting) {
  var button = GAME.MENU.button;
  // button
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.stroke();
  var width = ASSETS.enter.width;
  var height = ASSETS.enter.height;
  var scale = scaleSize(width, height, button.width - 5, button.height - 5);
  width *= scale;
  height *= scale;
  var x = button.x + button.width / 2 - width / 2;
  var y = button.y + button.height / 2 - height / 2;
  ctx.drawImage(ASSETS.enter, x, y, width, height);
}

function sizeMenu() {
  var title = {
    width: ASSETS[usingSmallLogo ? "logoSmall" : "logo"].width,
    height: ASSETS[usingSmallLogo ? "logoSmall" : "logo"].height,
    minPaddingX: 50,
    minPaddingY: 30,
    x: null,
    y: null,
  };

  var button = {
    x: null,
    y: $canv.height / 1.8,
    width: $canv.width * 0.5,
    height: $canv.height / 6,
  };
  button.x = $canv.width / 2 - button.width / 2;

  // title
  var scale = scaleSize(
    title.width,
    title.height,
    $canv.width - title.minPaddingX,
    $canv.height - $canv.height / 1.8 - title.minPaddingY * 2
  );
  title.width *= scale;
  title.height *= scale;
  title.x = $canv.width / 2 - title.width / 2;
  title.y = $canv.height / 1.8 - title.height - title.minPaddingY;

  GAME.MENU.title = title;
  GAME.MENU.button = button;

  // check to see if we should use lower resolution logo
  if (title.width <= 300 && !usingSmallLogo) {
    usingSmallLogo = true;
    sizeMenu();
  } else if (scale === 1 && usingSmallLogo) {
    usingSmallLogo = false;
    sizeMenu();
  }
}

// Best Score
function drawBestScore() {
  ctx.save();
  ctx.font = "normal 24px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ececec";

  let level = localStorage.level ?? 1;
  let score = localStorage.score ?? 0;

  ctx.fillText("Level: " + level, 20, 12);
  ctx.textAlign = "right";
  ctx.fillText("Score: " + score, $canv.width - 40, 12);

  ctx.restore();
}
