var express = require('express');
var app = express();
var http = require('http').Server(app);
var uuid = require('uuid/v1');
var io = require('socket.io')(http);
var fs = require('fs');
var cacheControl = require("express-cache-controller")
const download = require('image-downloader');
const { spawn } = require('child_process');
  
  const PORT = process.env.PORT || 8080;

  app.use(express.static('html'));
  app.use(cacheControl({
    noCache: true
  }));
  app.get('/', function(req, res){
    res.sendFile(__dirname + '/');
  });
  http.listen(8080, function(){});

  //setInterval(() => {let pyProg = spawn('python', ['dwemiimage.py']);}, 2000); //Runs the python script every 5 seconds

  var sockets = { };
  let interval; //To be used for looping through the sockets
  io.on("connection", socket => {
    console.log("New client connected");
    if (interval) { //If someone connects, restart the interval
      clearInterval(interval);
    }
    sockets[socket.id] = socket;
    interval = setInterval(() => dwemiUpdate(sockets), 10);
    socket.on("photo", (data) => savePicture(data));
    socket.on('joy', () => upJoy());
    socket.on("moveHere", (data) => moveHere(data));
    socket.on("search", (data) => searchImage(data));
    socket.on("disconnect", () => {
      console.log("Client disconnected");
      delete sockets[socket.id];
    });
  });

  const canvas = {width: 1280, height: 800};
  const middle = 480;
  let stomach = "";
  stomach = fs.readFileSync('C:/Dev/Dwemi/html/digestion/stomach.txt', 'utf8');;

  setInterval(() => {
    fs.writeFileSync('C:/Dev/Dwemi/html/digestion/stomach.txt', dwemi.stomach, 'utf8');
    //fs.writeFileSync('C:/Dev/Dwemi/html/digestion/waste.txt', dwemi.waste, 'utf8');
  }, 10000);

  //Creates Dwemi
  var dwemi = {dw: 100, dh: 180, dx: 300, dy: 528};
  dwemi.name = "dwemi";
  dwemi.direction = 1;
  dwemi.destination = getWanderDestination();
  dwemi.defaultSpeed = 10;
  dwemi.speed = 10; //Higher the slower
  dwemi.pause = false;
  dwemi.pauseLength = null;
  dwemi.pauseStart = null;
  dwemi.stomach = stomach;
  dwemi.waste = "";
  dwemi.hunger = dwemi.stomach.length/8;
  dwemi.joy = 500;
  dwemi.id = uuid();

  let time = new Date().getTime();
  let timedif = 0;
  function dwemiUpdate(sockets) {
    timedif = new Date().getTime() - time;
    time = new Date().getTime();
    updateHunger(timedif);
    updateJoy(timedif);
    if (dwemi.hunger > 1 && dwemi.joy > 1) { //Don't move if he's not out of food or joy
      if (!dwemi.pause) { //Don't move if pause is true
          //All cases where dwemi needs to stop and move the other direction
          if (dwemi.dx <= 5 || dwemi.dx >= canvas.width-380 || dwemi.dx < -100 || (dwemi.dx + 380) > canvas.width + 100) {
            hitBorder();
          }
          if ((dwemi.direction == 1 && dwemi.dx > dwemi.destination) || (dwemi.direction == -1 && dwemi.dx < dwemi.destination)) {
            destinationReached();
          }
          dwemi.dx += Math.floor(timedif/dwemi.speed) * dwemi.direction;
      } else {
        checkPause(); //Check if it's time to unpause
      }
    }

    dwemiDataEmit(sockets);
  }

  //Sends the info about dwemi the clients need to know
  function dwemiDataEmit(sockets) {
    let dwemiData = {x: dwemi.dx/canvas.width, hunger: dwemi.stomach.length, joy: dwemi.joy};
    dwemiData.direction = dwemi.direction;
    //console.log(dwemiData.direction)
    dwemiData = JSON.stringify(dwemiData);
    for (id in sockets) {
      sockets[id].emit("dwemiData", dwemiData);
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
    dwemi.pauseLength = getRandomArbitrary(500, 2000);
  }

  //If dwemi's x means he hit a border, turn him around
  function hitBorder() {
    faceMiddle();
    dwemi.destination = dwemi.dx + (dwemi.direction * 100);
  }

  function updateHunger(dif) {
    dwemi.stomach = dwemi.stomach.substring(0, dwemi.stomach.length-1);
    //dwemi.waste = dwemi.waste += dwemi.stomach.slice(-Math.floor(dif/10));
    dwemi.hunger = dwemi.stomach.length;
  }

  function updateJoy(dif) {
    if (dwemi.joy >= 1) {
      dwemi.joy -= (dif/5000);
    }
    if (dwemi.joy < 1) {
      dwemi.joy = 0;
    }
  }

  function upFood(food) {
    console.log("Food: " + food.length);
    if ((dwemi.stomach.length + food.length) < 1600000) {
      console.log("fed: " + food.length);
      dwemi.stomach += food;
    } else {
      let trim = (dwemi.stomach.length + food.length) - 1600000;
      dwemi.stomach += food.substring(0, food.length - trim);
      console.log("fed: " + food.length - trim);
    }
  }

  function upJoy() {
    if (dwemi.joy+100 >= 1000) {
      dwemi.joy = 1000;
    } else if (dwemi.joy < 1000) {
      dwemi.joy += 100;
    }
    for (id in sockets) {
      sockets[id].emit("blink");
    }
  }

  function moveHere(data) {
    dwemi.pause = false;
    dwemi.speed = 3;
    for (id in sockets) {
      sockets[id].emit("flash", data);
    }
    target = JSON.parse(data);
    console.log("Move here:  " + target.x);
    if (dwemi.dx > target.x) {
      dwemi.direction = -1;
    } else {
      target.x -= 380;
      dwemi.direction = 1;
    }
    dwemi.destination = target.x;
  }

  function searchImage(foodData) {
    query = JSON.parse(foodData);
    console.log(query)
    //let pyProg = spawn('python', ['dwemicrawler.py', query]);
    setTimeout(function(){
      let imageData = fs.readFileSync("../dwemi/html/images/stomachImages/stomach.jpg", { encoding: 'base64' })
      upFood(imageData);
    }, 5000);
  }

  function savePicture(data) {
    let imgurl = JSON.parse(data);
    options = {
      url: imgurl,
      dest: 'html/images/stomachImages/stomach.jpg'
    };
    download.image(options)
    .then(({ filename, image }) => {
      console.log('File saved to', filename);
      let imageData = fs.readFileSync("../dwemi/html/images/stomachImages/stomach.jpg", { encoding: 'base64' })
      upFood(imageData);
    })
    .catch((err) => {
      console.error(err);
    });
  }

  console.log("Server Running at PORT: " + PORT + "  CNTL-C to quit");
  console.log("Open several browsers at: http://localhost:8080");



  function pickDirection() {
    let percentFromCenter = Math.floor(Math.abs(middle - dwemi.dx)/(middle)*100);
    let ran1 = getRandomArbitrary(percentFromCenter, 100);
    let ran2 = getRandomArbitrary(40, 90);
    if (ran1 > ran2 && !checkMovingToMiddle()) {
      dwemi.direction = dwemi.direction * -1;
    }
  }

  function getWanderDestination() {
    pickDirection();
    return Math.floor(dwemi.direction * getRandomArbitrary(80, 180) + dwemi.dx);
  }

  function checkMovingToMiddle() {
    return ((dwemi.dx <= middle && dwemi.direction ==1) || dwemi.dx > middle && dwemi.direction == -1);
  }

  function faceMiddle() {
    if (dwemi.dx > 640) {
      dwemi.direction = -1;
    } else {
      dwemi.direction = 1;
    }
  }

  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
