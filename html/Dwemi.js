

let newimg = new Image(100,181);
var dwemi = {img: newimg, dw: 150, dh: 272, dx: 500, dy: 800};
foodImage = new Image(72, 52)
joyImage = new Image(72, 52)
foodImage.src = "images/food.png"
joyImage.src = "images/joy.png"
dwemi.img.src = "images/pet.jpg"
dwemi.img.alt = "My pet";

let hungerBar = {
  x: 0,
  y: 0,
  filled: 0
}

let joyBar = {
  x: 0,
  y: 0,
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
  dwemi.dx = dwemiData.x
  dwemi.dy = dwemiData.y
  hungerBar.filled = dwemiData.hunger;
  joyBar.filled = dwemiData.joy;
})


function drawCanvas() {
  const context = canvas.getContext("2d");
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas

  context.drawImage(foodImage, 20, 20)
  context.fillStyle = "green";
  context.fillRect(90, 25, hungerBar.filled*5, 30)
  context.drawImage(joyImage, 20, 70)
  context.fillStyle = "orange";
  context.fillRect(90, 80, joyBar.filled*5, 30)
  context.drawImage(dwemi.img, dwemi.dx, dwemi.dy, dwemi.dw, dwemi.dh);
  console.log(dwemi.dx)
}

function loop(timestamp) {
	var progress = timestamp - lastRender
  
	update(progress)
  
	lastRender = timestamp
	window.requestAnimationFrame(loop)
}

function feedButton() {

}

function joyButton() {

}


$(document).ready(function() {
  drawCanvas()
})
