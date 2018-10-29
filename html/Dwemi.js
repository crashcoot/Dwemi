

(() => {



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

var dwemi = {
  img: new Image(100,181),
  dw: 100,
  scaleWidth: 100/oWidth,
  dh: 181,
  scaleHeight: 181/oHeight,
  dx: 500,
  dy: 9000
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
  scaleY: 29/oHeight,
  scaleHeight: 51/oHeight,
  filled: 0,
  textScaleX: (111 + 5)/oWidth,
  textScaleY: (29 + 36)/oHeight,
  textScaleFont: 30/oHeight
}

let joyBar = {
  scaleX: 111/oWidth,
  scaleY: 104/oHeight,
  scaleHeight: 51/oHeight,
  filled: 0,
  textScaleX: (111 + 5)/oWidth,
  textScaleY: (104 + 36)/oHeight,
  textScaleFont: 30/oHeight
}

let indicatorArray = []
function cleanIndicatorArray() {
  let time = new Date().getTime();
  for (var i = 0; i < indicatorArray.length; i++) {
    if (indicatorArray[i].endTime < time) {
      indicatorArray.splice(i, 1);
    }
  }
}

var lastRender = 0
window.requestAnimationFrame(loop)

function update(progress) {
  // Update the state of the world for the elapsed time since last render
  cleanIndicatorArray();
	drawCanvas();
}


//connect to server and retain the socket
let socket = io('http://' + window.document.location.host)
//let socket = io('http://localhost:3000')

let deltaX, deltaY //location where mouse is pressed
let canvas = document.getElementById("canvas1") //our drawing canvas

socket.on("dwemiData", function(data) {
  //console.log("data: " + data)
  //console.log("typeof: " + typeof data)
  let dwemiData = JSON.parse(data)
  dwemi.dx = dwemiData.x*game.width;
  dwemi.dy = dwemiData.y*game.height -30;
  dwemi.dw = dwemi.scaleWidth*game.width*1.5;
  dwemi.dh = dwemi.scaleHeight*game.height*1.5;
  hungerBar.filled = dwemiData.hunger;
  joyBar.filled = dwemiData.joy;
})

socket.on("flash", function(data) {
  let target = JSON.parse(data)
  let indicator = {
    x: target.x/oWidth *game.width,
    y: target.y/oHeight * game.height,
    endTime: new Date().getTime() + 200,
  }
  console.log(indicator.x)
  indicatorArray.push(indicator);
})


function drawCanvas() {
  const context = canvas.getContext("2d");
  context.canvas.width = game.width;
  context.canvas.height = game.height - 30;
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas

  context.drawImage(foodIcon.img, foodIcon.scaleX*game.width, foodIcon.scaleY*game.height, foodIcon.scaleWidth*game.width, foodIcon.scaleHeight*game.height)
  context.fillStyle = "orange";
  context.fillRect(hungerBar.scaleX*game.width, hungerBar.scaleY*game.height, (hungerBar.filled/100000)*1000/oWidth*game.width, hungerBar.scaleHeight*game.height)
  context.drawImage(joyIcon.img, joyIcon.scaleX*game.width, joyIcon.scaleY*game.height, joyIcon.scaleWidth*game.width, joyIcon.scaleHeight*game.height)
  context.fillStyle = "green";
  context.fillRect(joyBar.scaleX*game.width, joyBar.scaleY*game.height, joyBar.filled/oWidth*game.width, joyBar.scaleHeight*game.height)
  context.drawImage(dwemi.img, dwemi.dx, dwemi.dy, dwemi.dw, dwemi.dh);
  context.fillStyle = "black";
  context.font = hungerBar.textScaleFont*game.height + "px Arial";
  context.fillText(Math.floor(hungerBar.filled/100) + "KB" , hungerBar.textScaleX*game.width, hungerBar.textScaleY*game.height);
  context.fillText(Math.floor(joyBar.filled/10) , joyBar.textScaleX*game.width, joyBar.textScaleY*game.height);
  for (let i = 0; i < indicatorArray.length; i++) {
    console.log(indicatorArray[i].x)
    context.fillStyle = "red";
    context.beginPath();
    context.arc(indicatorArray[i].x, indicatorArray[i].y, 10/oWidth*game.width, 0, Math.PI*2, true); 
    context.closePath();
    context.fill();
  }
}

function loop(timestamp) {
	var progress = timestamp - lastRender
  
	update(progress)
  
	lastRender = timestamp
	window.requestAnimationFrame(loop)
}


function joyButton() {
  socket.emit('joy');
}



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
    callback(dataURL);
  };
  img.src = src;
  if (img.complete || img.complete === undefined) {
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    img.src = src;
  }
}

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
	
	$("#canvas1").mousemove(handleMouseMove);
	$("#canvas1").mouseup(handleMouseUp);
	   
	

    // Stop propagation of the event and stop any default 
    //  browser action

    e.stopPropagation();
    e.preventDefault();
	
	drawCanvas();
  }
  
  function handleMouseMove(e) {
    
  }

  function handleMouseUp() {

  }

$(document).ready(function() {
  drawCanvas()

  document.getElementById("submitButton").addEventListener("click", function(){
    var text = document.getElementById("textBox").value;
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