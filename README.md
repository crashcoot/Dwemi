# Dwemi
Virtual Pet that multiple clients can connect to, interact with, and take care of. Created to play with Socket.io
Uses an Express http server in Node.js.

To run:
  clone repository and navigate to project root
  run "npm install" 
  start server with "node server.js"
  
  -Go to http://localhost:8080 in a browser

Click anywhere on the screen to have him move towards that spot. Click on him to make him happier.

Open another browser window to see the movements are shared 

The text inputs at the bottom used to be able to trigger a web crawler that would find an image from a search query, and feed him the pixel data, as well as using numpy image editing to slowly transform his background image to the one he just ate. The python modules required have since changed and are causing the program to crash, so they are currently disabled.
 
