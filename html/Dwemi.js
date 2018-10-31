

(() => {

//Everything on the server is done thinking the canvas is 1280x800, so just keeping track of that here to be used in scaling
const oWidth = 1280; 
const oHeight = 800;

//The canvas is in an article with ID "gamecontainer"
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
    newGameHeight = (newGameWidth * game.height / game.width);
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

//Object creation
var dwemi = {
  left: new Image(200,200),
  right: new Image(200,200),
  leftBlink: new Image(200,200),
  rightBlink: new Image(200,200),
  dw: 200,
  scaleWidth: 200/oWidth,
  dh: 200,
  scaleHeight: 200/oHeight,
  dx: 500,
  dy: 528/oHeight*game.height -30,
  blink: false
};
dwemi.left.src = "images/dwemiLeft.png"
dwemi.right.src = "images/dwemiRight.png"
dwemi.leftBlink.src = "images/dwemiLeftBlink.png";
dwemi.rightBlink.src = "images/dwemiRightBlink.png"
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
  scaleY: 29/oHeight,
  scaleHeight: 51/oHeight,
  filled: 0,
  textScaleX: (111 + 7)/oWidth,
  textScaleY: (29 + 36)/oHeight,
  textScaleFont: 30/oHeight
}
let joyBar = {
  scaleX: 111/oWidth,
  scaleY: 104/oHeight,
  scaleHeight: 51/oHeight,
  filled: 0,
  textScaleX: (111 + 9)/oWidth,
  textScaleY: (104 + 36)/oHeight,
  textScaleFont: 30/oHeight
}

let indicatorArray = [] //When the mouse is clicked on the canvas, an indicator is created with a lifespan of 200ms and placed here
function cleanIndicatorArray() {
  let time = new Date().getTime(); //current time
  for (var i = 0; i < indicatorArray.length; i++) {
    if (indicatorArray[i].endTime < time) { //if the endtime is in the past
      indicatorArray.splice(i, 1); //remove the indicator from the array
    }
  }
}

var lastRender = 0
window.requestAnimationFrame(loop)

function update(progress) {
  // Update the state of the world for the elapsed time since last render
  cleanIndicatorArray(); //Check if any indicators need to be removed
	drawCanvas(progress);
}


//connect to server and retain the socket
let socket = io('http://' + window.document.location.host)

let canvas = document.getElementById("canvas1") //our drawing canvas

socket.on("dwemiData", function(data) { //The server spams the client with info about dwemi
  let dwemiData = JSON.parse(data)
  dwemi.dx = dwemiData.x*game.width; //The x value is sent as a value/1280 to be scaled
  dwemi.dw = dwemi.scaleWidth*game.width;
  dwemi.dh = dwemi.scaleHeight*game.height;
  dwemi.direction = dwemiData.direction; //1 for right and -1 for left
  hungerBar.filled = dwemiData.hunger;
  joyBar.filled = dwemiData.joy;
})

//An indicator is sent
socket.on("flash", (data) => {
  let target = JSON.parse(data)
  let indicator = {
    x: target.x/oWidth *game.width,
    y: target.y/oHeight * game.height,
    endTime: new Date().getTime() + 200,
  }
  console.log(indicator.x)
  indicatorArray.push(indicator);
})

socket.on("blink", () => {
  dwemi.blink = true;
  setTimeout(() => {dwemi.blink = false}, 200)
});


function drawCanvas(progress) {
  const context = canvas.getContext("2d");
  context.canvas.width = game.width;
  context.canvas.height = game.height - 30; //-30 to make room for the textbox
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas
  //Food
  context.drawImage(foodIcon.img, foodIcon.scaleX*game.width, foodIcon.scaleY*game.height, foodIcon.scaleWidth*game.width, foodIcon.scaleHeight*game.height)
  context.fillStyle = "orange";
  context.fillRect(hungerBar.scaleX*game.width, hungerBar.scaleY*game.height, (hungerBar.filled/1600000)*1000/oWidth*game.width, hungerBar.scaleHeight*game.height)
  //Joy
  context.drawImage(joyIcon.img, joyIcon.scaleX*game.width, joyIcon.scaleY*game.height, joyIcon.scaleWidth*game.width, joyIcon.scaleHeight*game.height)
  context.fillStyle = "green";
  context.fillRect(joyBar.scaleX*game.width, joyBar.scaleY*game.height, joyBar.filled/oWidth*game.width, joyBar.scaleHeight*game.height)
  //Dwemi
  drawDwemi(context, progress);
  //Text
  context.fillStyle = "black";
  context.font = hungerBar.textScaleFont*game.height + "px Arial";
  context.fillText(Math.floor(hungerBar.filled/125) + "KB" , hungerBar.textScaleX*game.width, hungerBar.textScaleY*game.height);
  context.fillText(Math.floor(joyBar.filled/10) , joyBar.textScaleX*game.width, joyBar.textScaleY*game.height);
  //Indicators
  for (let i = 0; i < indicatorArray.length; i++) {
    console.log(indicatorArray[i].x)
    context.fillStyle = "red";
    context.beginPath();
    context.arc(indicatorArray[i].x, indicatorArray[i].y, 10/oWidth*game.width, 0, Math.PI*2, true); 
    context.closePath();
    context.fill();
  }
}

function drawDwemi(context, progress) {
  dwemi.dy = 528/oHeight*game.height -30;
  dwemiBob(progress);
  if (dwemi.direction == 1) { //Facing right
    if (dwemi.blink) {
      context.drawImage(document.getElementById('background'), dwemi.dx, dwemi.dy, dwemi.dw, dwemi.dh);
      context.drawImage(dwemi.rightBlink, dwemi.dx+dwemi.dw, dwemi.dy, -dwemi.dw, dwemi.dh);
    } else {
      context.drawImage(document.getElementById('background'), dwemi.dx, dwemi.dy, dwemi.dw, dwemi.dh);
      context.drawImage(dwemi.right, dwemi.dx+dwemi.dw, dwemi.dy, -dwemi.dw, dwemi.dh);
    }
  } else { //facing left
    if (dwemi.blink) {
      context.drawImage(document.getElementById('background'), dwemi.dx, dwemi.dy, dwemi.dw, dwemi.dh);
      context.drawImage(dwemi.leftBlink, dwemi.dx+dwemi.dw, dwemi.dy, -dwemi.dw, dwemi.dh);
    } else {
      context.drawImage(document.getElementById('background'), dwemi.dx, dwemi.dy, dwemi.dw, dwemi.dh);
      context.drawImage(dwemi.left, dwemi.dx+dwemi.dw, dwemi.dy, -dwemi.dw, dwemi.dh);
    }
  }
  
}
rad = 0
let radius =  5;
function dwemiBob(progress) { //for some reason adding/multiplying anything with progress crashes it
  prog = parseFloat(progress/16.6);
  console.log(typeof (rad + (1/48*Math.PI) + prog))
  rad = rad + (1/48*Math.PI)
  rad = rad%(2*Math.PI)
  dwemi.dy += 7/oHeight*game.height * Math.cos(rad)
}

function loop(timestamp) {
	var progress = timestamp - lastRender
  
	update(progress)
  
	lastRender = timestamp
	window.requestAnimationFrame(loop)
}

//Tells the server to make him happy
function joyButton() {
  socket.emit('joy');
}


//Makes a canvas, slaps an image on it, then encodes the canvas
function toDataURL(src, callback, outputFormat) {
  var img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function() {
    var canvas2 = document.createElement('CANVAS');
    var ctx = canvas2.getContext('2d');
    var dataURL;
    canvas2.height = this.naturalHeight;
    canvas2.width = this.naturalWidth;
    ctx.drawImage(this, 0, 0);
    dataURL = canvas2.toDataURL(outputFormat);
    console.log(dataURL)
    callback(dataURL);
  };
  img.src = src;
  if (img.complete || img.complete === undefined) {
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    img.src = src;
  }
}

//Checks if the coordinates are on Dwemi
function mouseOnDwemi(canvasX, canvasY) {
  return ((canvasX > dwemi.dx && canvasX < (dwemi.dx + dwemi.dw)) && (canvasY > dwemi.dy && canvasY < (dwemi.dy + dwemi.dh)))
}


function handleMouseDown(e){
	//get mouse location relative to canvas top left
	var rect = canvas.getBoundingClientRect();
    //var canvasX = e.clientX - rect.left;
    //var canvasY = e.clientY - rect.top;
    var canvasX = e.pageX - rect.left; //use jQuery event object pageX and pageY
    var canvasY = e.pageY - rect.top;
  console.log("mouse down:" + canvasX + ", " + canvasY);
  //If it's on dwemi, make him happy. If not, make an indicator and get dwemi to move to the x of the mouse event
	if (mouseOnDwemi(canvasX, canvasY)) { 
    joyButton();
  } else {
    let target = {
      x: (canvasX/game.width) * oWidth,
      y: (canvasY/game.height) * oHeight
    }
    console.log(target.x);
    let targetData = JSON.stringify(target);
    socket.emit("moveHere", targetData);
  }
  
  //To be used later
	//$("#canvas1").mousemove(handleMouseMove);
	//$("#canvas1").mouseup(handleMouseUp);

    e.stopPropagation();
    e.preventDefault();
  }

$(document).ready(function() {
  drawCanvas()

  document.getElementById("submitButton").addEventListener("click", function(){
    var text = document.getElementById("textBox").value;
    setInterval(function(){ 
      document.getElementById('background').src = 'images/stomachimages/background.jpg?' + (new Date()).getTime();
     }, 5000);
    socket.emit("photo", JSON.stringify(text))
    document.getElementById("textBox").value = "";
    toDataURL(
      text,
      function(dataUrl) {
        let food = JSON.stringify(dataUrl)
        socket.emit("feed", food);
      }
    )
  });

  

  document.getElementById("canvas1").addEventListener("mousedown", handleMouseDown);
})

})();