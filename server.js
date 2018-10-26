var dwemi = {dw: 150, dh: 272, dx: 500, dy: 320};
dwemi.state = "wander";
dwemi.direction = 1
dwemi.destination = getWanderDestination();
dwemi.speed = 10; //Higher the slower

let time = new Date().getTime();
let timedif = 0
//console.log(time)

const canvas = {width: 1200, height: 600}

function getWanderDestination() {
	return Math.floor(dwemi.direction * getRandomArbitrary(50, 200) + dwemi.dx);
}

function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

//Cntl+C to stop server

const app = require('http').createServer(handler)
const io = require('socket.io')(app) //wrap server app in socket io capability
const fs = require("fs") //need to read static files
const url = require("url") //to parse url strings

const PORT = process.env.PORT || 3000
app.listen(PORT) //start server listening on PORT

function handler(request, response) {
  let urlObj = url.parse(request.url, true, false)
  console.log("\n============================")
  console.log("PATHNAME: " + urlObj.pathname)
  console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
  console.log("METHOD: " + request.method)

  let receivedData = ""

  //attached event handlers to collect the message data
  request.on("data", function(chunk) {
    receivedData += chunk
  })

  //event handler for the end of the message
  request.on("end", function() {
    console.log("REQUEST END: ")
    console.log("received data: ", receivedData)
    console.log("type: ", typeof receivedData)

   

    if (request.method == "GET") {
      //handle GET requests as static file requests
      fs.readFile(ROOT_DIR + urlObj.pathname, function(err, data) {
        if (err) {
          //report error to console
          console.log("ERROR: " + JSON.stringify(err))
          //respond with not found 404 to client
          response.writeHead(404)
          response.end(JSON.stringify(err))
          return
        }
        response.writeHead(200, {
          "Content-Type": get_mime(urlObj.pathname)
        })
        response.end(data)
      })
    }
  })
}

//server maintained location of moving box
let movingBoxLocation = {
  x: 100,
  y: 100
} //will be over-written by clients


const ROOT_DIR = "html" //dir to serve static files from

const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain"
}

function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES["txt"]
}

function dwemiUpdate(sockets) {
  
  timedif = new Date().getTime() - time;
  time = new Date().getTime();
  //console.log(timedif);

  dwemi.dx += Math.floor(timedif/dwemi.speed) * dwemi.direction;

	if ((dwemi.direction == 1 && dwemi.dx > dwemi.destination) || dwemi.dx > canvas.width - 150) {
		dwemi.direction = dwemi.direction*-1;
    dwemi.destination = getWanderDestination();
	} else if ((dwemi.direction == -1 && dwemi.dx < dwemi.destination) || dwemi.dx < 0){
		dwemi.direction = dwemi.direction*-1;
		dwemi.destination = getWanderDestination();
	}
	
	if (dwemi.dx > canvas.width*2 || dwemi.dx < -200) {
		dwemi.dx = canvas.width/2
		dwemi.direction = dwemi.direction*-1;
		dwemi.destination = getWanderDestination();
	}

  dwemiDataEmit(sockets)

}

function dwemiDataEmit(sockets) {
  let dwemiData = {x: dwemi.dx, y: dwemi.dy}
  dwemiData = JSON.stringify(dwemiData)
  for (id in sockets) {
    sockets[id].emit("dwemiData", dwemiData)
  }
}

var sockets = { };
let interval;
io.on("connection", socket => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  sockets[socket.id] = socket;
  interval = setInterval(() => dwemiUpdate(sockets), 10);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    delete sockets[socket.id];
  });
});




console.log("Server Running at PORT: 3000  CNTL-C to quit")
console.log("To Test:")
console.log("Open several browsers at: http://localhost:3000/dwemi.html")
