
var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/dwemidb";

MongoClient.connect(url, function(err, db) { //Not currently using this but will later
  if (err) throw err;
  var dbo = db.db("dwemidb");

  var express = require('express');
  var app = express();
  var http = require('http').Server(app);
  var io = require('socket.io')(http);
  var fs = require('fs');
  const download = require('image-downloader')

  const PORT = process.env.PORT || 8080

  app.use(express.static('html'))
  app.get('/', function(req, res){
    res.sendFile(__dirname + '/');
  });
  http.listen(8080, function(){});

  var sockets = { };
  let interval; //To be used for looping through the sockets
  io.on("connection", socket => {
    console.log("New client connected");
    if (interval) { //If someone connects, restart the interval
      clearInterval(interval);
    }
    sockets[socket.id] = socket;
    interval = setInterval(() => dwemiUpdate(sockets), 10);
    socket.on('feed', (data) => {upFood(data)});
    socket.on("photo", (data) => {savePicture(data)})
    socket.on('joy', () => {upJoy()});
    socket.on("moveHere", (data) => {moveHere(data)})
    socket.on("disconnect", () => {
      console.log("Client disconnected");
      delete sockets[socket.id];
    });
  });

  const canvas = {width: 1280, height: 800}
  const middle = canvas.width/2;

  //Creates Dwemi
  var dwemi = {dw: 100, dh: 180, dx: 500, dy: 528};
  dwemi.name = "dwemi";
  dwemi.direction = 1;
  dwemi.destination = getWanderDestination();
  dwemi.defaultSpeed = 10;
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

  function dwemiUpdate(sockets) {
    
    timedif = new Date().getTime() - time;
    time = new Date().getTime();
    updateHunger(timedif)
    updateJoy(timedif);
    if (dwemi.hunger > 1 && dwemi.joy > 1) { //Don't move if he's not out of food or joy
      if (!dwemi.pause) { //Don't move if pause is true
          //All cases where dwemi needs to stop and move the other direction
          if (dwemi.dx <= 5 || dwemi.dx >= canvas.width-190) {
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
        checkPause(); //Check if it's time to unpause
      }
    }
    
    dwemiDataEmit(sockets)

  }

  //Sends the info about dwemi the clients need to know
  function dwemiDataEmit(sockets) {
    let dwemiData = {x: dwemi.dx/canvas.width, y: dwemi.dy/canvas.height, hunger: dwemi.stomach.length, joy: dwemi.joy,}
    dwemiData.direction = dwemi.direction
    //console.log(dwemiData.direction)
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
    dwemi.speed = dwemi.defaultSpeed;
    dwemi.destination = getWanderDestination();
    dwemi.pause = true;
    dwemi.pauseStart = new Date().getTime();
    dwemi.pauseLength = getRandomArbitrary(200, 1500);
  }

  //If dwemi's x means he hit a border, turn him around
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
      dwemi.joy -= (dif/3000);
    }
    if (dwemi.joy < 1) {
      dwemi.joy == 0;
    }
  }

  function upFood(data) {
    food = JSON.parse(data);
    console.log("Food: " + food.length)
    if ((dwemi.stomach.length + food.length) < 1600000) {
      console.log("fed: " + food.length)
      dwemi.stomach += food;
    } else {
      let trim = (dwemi.stomach.length + food.length) - 1600000
      dwemi.stomach += food.substring(0, food.length - trim);
      console.log("fed: " + food.length - trim)
    }
  }

  function upJoy() {
    if (dwemi.joy+100 >= 1000) {
      dwemi.joy = 1000;
    } else if (dwemi.joy < 1000) {
      dwemi.joy += 100;
    }
  }

  function moveHere(data) {
    dwemi.pause = false;
    dwemi.speed = 3;
    for (id in sockets) {
      sockets[id].emit("flash", data)
    }
    target = JSON.parse(data);
    console.log("Move here:  " + target.x);
    if (dwemi.dx > target.x) {
      dwemi.direction = -1;
    } else {
      target.x -= 190;
      dwemi.direction = 1;
    }
    dwemi.destination = target.x;
  }

  function savePicture(data) {
    let imgurl = JSON.parse(data);
    options = {
      url: imgurl,
      dest: 'html/images/stomachImages/test.jpg'        
    }
    download.image(options)
    .then(({ filename, image }) => {
      console.log('File saved to', filename)
    })
    .catch((err) => {
      console.error(err)
    })
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

});