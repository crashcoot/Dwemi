

var newimg = new Image(100,181);
var dwemi = {img: newimg, dw: 150, dh: 272, dx: 500, dy: 800};
dwemi.img.src = "images/pet.jpg"
dwemi.img.alt = "My pet";

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
})


function drawCanvas() {
  const context = canvas.getContext("2d");

  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas

  context.drawImage(dwemi.img, dwemi.dx, dwemi.dy, dwemi.dw, dwemi.dh);
  console.log(dwemi.dx)
}

function loop(timestamp) {
	var progress = timestamp - lastRender
  
	update(progress)
  
	lastRender = timestamp
	window.requestAnimationFrame(loop)
}


$(document).ready(function() {
  drawCanvas()
})
