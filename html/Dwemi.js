const oWidth = 1280;
const oHeight = 800;

var game = {
  element: document.getElementById("gameContainer"),
  width: oWidth,
  height: oHeight
},

resizeGame = function() {
  
  // Get the dimensions of the viewport
  var viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  // Determine game size
  if (game.height / game.width > viewport.height / viewport.width) {
    newGameHeight = viewport.height;
    newGameWidth = newGameHeight * game.width / game.height;
  } else {
    newGameWidth = viewport.width;
    newGameHeight = newGameWidth * game.height / game.width;
  }

  newGameX = (viewport.width - newGameWidth) / 2;
  newGameY = (viewport.height - newGameHeight) / 2;
  
  // Center the game by setting the padding of the game
  game.element.style.padding = newGameY + "px " + newGameX + "px";

  // Resize game
  game.width = newGameWidth;
  game.height = newGameHeight;
   
};

window.addEventListener("resize", resizeGame);
resizeGame();

var dwemi = {
  img: new Image(100,181),
  dw: 100,
  scaleWidth: 100/oWidth,
  dh: 181,
  scaleHeight: 181/oHeight,
  dx: 500,
  dy: 800
};
dwemi.img.src = "images/pet.png"
dwemi.img.alt = "My pet";
foodImage = new Image(83, 78)
foodImage.src = "images/food.png"
foodIcon = {
  img: foodImage,
  scaleX: 20/oWidth,
  scaleY: 20/oHeight,
  scaleWidth: 83/oWidth,
  scaleHeight: 78/oHeight
}
joyImage = new Image(83, 78)
joyImage.src = "images/joy.png"
joyIcon = {
  img: joyImage,
  scaleX: 20/oWidth,
  scaleY: 90/oHeight,
  scaleWidth: 83/oWidth,
  scaleHeight: 78/oHeight
}



let hungerBar = {
  scaleX: 111/oWidth,
  scaleY: 33/oHeight,
  scaleHeight: 51/oHeight,
  filled: 0
}

let joyBar = {
  scaleX: 111/oWidth,
  scaleY: 103/oHeight,
  scaleHeight: 51/oHeight,
  filled: 0
}

var lastRender = 0
window.requestAnimationFrame(loop)

function update(progress) {
	// Update the state of the world for the elapsed time since last render
	drawCanvas();
}


//connect to server and retain the socket
let socket = io('http://' + window.document.location.host)
//let socket = io('http://localhost:3000')

let canvas = document.getElementById("canvas1") //our drawing canvas

socket.on("dwemiData", function(data) {
  //console.log("data: " + data)
  //console.log("typeof: " + typeof data)
  let dwemiData = JSON.parse(data)
  dwemi.dx = dwemiData.x*game.width
  dwemi.dy = dwemiData.y*game.height
  hungerBar.filled = dwemiData.hunger;
  joyBar.filled = dwemiData.joy;
})


function drawCanvas() {
  const context = canvas.getContext("2d");
  context.canvas.width = game.width;
  context.canvas.height = game.height;
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas

  context.drawImage(foodIcon.img, foodIcon.scaleX*game.width, foodIcon.scaleY*game.height, foodIcon.scaleWidth*game.width, foodIcon.scaleHeight*game.height)
  context.fillStyle = "orange";
  context.fillRect(hungerBar.scaleX*game.width, hungerBar.scaleY*game.height, hungerBar.filled/oWidth*game.width, hungerBar.scaleHeight*game.height)
  context.drawImage(joyIcon.img, joyIcon.scaleX*game.width, joyIcon.scaleY*game.height, joyIcon.scaleWidth*game.width, joyIcon.scaleHeight*game.height)
  context.fillStyle = "green";
  context.fillRect(joyBar.scaleX*game.width, joyBar.scaleY*game.height, joyBar.filled/oWidth*game.width, joyBar.scaleHeight*game.height)
  context.drawImage(dwemi.img, dwemi.dx, dwemi.dy, dwemi.scaleWidth*game.width*1.5, dwemi.scaleHeight*game.height*1.5);
}

function loop(timestamp) {
	var progress = timestamp - lastRender
  
	update(progress)
  
	lastRender = timestamp
	window.requestAnimationFrame(loop)
}

function feedButton() {
  socket.emit('feed');
}

function joyButton() {
  socket.emit('joy');
}

$(document).ready(function() {
  drawCanvas()
})
