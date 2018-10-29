

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const PORT = process.env.PORT || 8080

app.use(express.static('html'))

app.get('/', function(req, res){
  res.sendFile(__dirname + '/');
});

http.listen(8080, function(){
  
});

var sockets = { };
let interval;
io.on("connection", socket => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  sockets[socket.id] = socket;
  interval = setInterval(() => dwemiUpdate(sockets), 10);
  socket.on('feed', (data) => {upFood(data)});
  socket.on('joy', () => {upJoy()});
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    delete sockets[socket.id];
  });
});

const canvas = {width: 1280, height: 800}
const middle = canvas.width/2;

var dwemi = {dw: 100, dh: 181, dx: 500, dy: 528};
dwemi.direction = 1
dwemi.destination = getWanderDestination();
dwemi.speed = 10; //Higher the slower
dwemi.pause = false;
dwemi.pauseLength;
dwemi.pauseStart;
dwemi.stomach = "";
dwemi.waste = "";

dwemi.hunger = dwemi.stomach.length/8;
dwemi.joy = 500;

let time = new Date().getTime();
let timedif = 0
//console.log(time)


function dwemiUpdate(sockets) {
  
  timedif = new Date().getTime() - time;
  time = new Date().getTime();
  //console.log(timedif);

  updateHunger(timedif)
  updateJoy(timedif);
  if (dwemi.hunger > 1 && dwemi.joy > 1) {
    if (!dwemi.pause) {
        //All cases where dwemi needs to stop and move the other direction
        if (dwemi.dx <= 5 || dwemi.dx >= canvas.width-150) {
          destinationReached()
        }
        if (dwemi.dx < -100 || dwemi.dx > canvas.width + 100) {
          dwemi.dx = 500;
          destinationReached();
        }
        if ((dwemi.direction == 1 && dwemi.dx > dwemi.destination) || (dwemi.direction == -1 && dwemi.dx < dwemi.destination)) {
          destinationReached()
        }
        dwemi.dx += Math.floor(timedif/dwemi.speed) * dwemi.direction;
    } else {
      checkPause();
    }
  }
  
  dwemiDataEmit(sockets)

}

function dwemiDataEmit(sockets) {
  let dwemiData = {x: dwemi.dx/canvas.width, y: dwemi.dy/canvas.height, hunger: dwemi.stomach.length/8, joy: dwemi.joy}
  dwemiData = JSON.stringify(dwemiData)
  for (id in sockets) {
    sockets[id].emit("dwemiData", dwemiData)
  }
}

function checkPause() {
  if (new Date().getTime() - dwemi.pauseStart > dwemi.pauseLength) {
    dwemi.pause = false;
  }
}

//What to do when Dwemi has reached his destination
function destinationReached() {
  dwemi.destination = getWanderDestination();
  dwemi.pause = true;
  dwemi.pauseStart = new Date().getTime();
  dwemi.pauseLength = getRandomArbitrary(200, 1500);
}

function hitBorder() {
  if (!checkMovingToMiddle) {
    dwemi.direction = dwemi.direction * -1;
  }
  dwemi.destination = dwemi.dx + (dwemi.direction * 100);
}

function updateHunger(dif) {
  dwemi.stomach = dwemi.stomach.substring(0, dwemi.stomach.length-dif);
  dwemi.waste = dwemi.waste += dwemi.stomach.slice(-dif);
  dwemi.hunger = dwemi.stomach.length;
}

function updateJoy(dif) {
  if (dwemi.joy >= 1) {
    dwemi.joy -= (dif/1000);
  }
  if (dwemi.joy < 1) {
    dwemi.joy == 0;
  }
}

function upFood(data) {
  food = JSON.parse(data);
  if ((dwemi.stomach.length + food.length) < 800000) {
    dwemi.stomach += food;
  } else {
    let trim = (dwemi.stomach.length + food.length) - 800000
    dwemi.stomach += food.substring(0, food.length - trim);
  }
}

function upJoy() {
  if (dwemi.joy+100 >= 1000) {
    dwemi.joy = 1000;
  } else if (dwemi.joy < 1000) {
    dwemi.joy += 100;
  }
}






console.log("Server Running at PORT: " + PORT + "  CNTL-C to quit");
console.log("Open several browsers at: http://localhost:8080/dwemi.html")

function pickDirection() {
  let percentFromCenter = Math.floor(Math.abs(middle - dwemi.dx)/(middle)*100);
  let ran1 = getRandomArbitrary(percentFromCenter, 100);
  let ran2 = getRandomArbitrary(75, 85)
  //console.log("ran1: "+ ran1)
  //console.log("ran2: " + ran2)
  if (ran1 > ran2 && !checkMovingToMiddle()) {
    dwemi.direction = dwemi.direction * -1;
    //console.log("switch")
  }
}

function getWanderDestination() {
  pickDirection();
	return Math.floor(dwemi.direction * getRandomArbitrary(80, 180) + dwemi.dx);
}

function checkMovingToMiddle() {
  return ((dwemi.dx <= middle && dwemi.direction ==1) || dwemi.dx > middle && dwemi.direction == -1)
}

function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}