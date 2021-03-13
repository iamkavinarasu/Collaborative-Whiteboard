var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use(express.static("public"))

// default URL for website
app.use('/', function(req,res){
    res.sendFile(path.join(__dirname+'/public/index.html'));
    //__dirname : It will resolve to your project folder.
  });

// Starts the server.
server.listen(5000, function() {
    console.log('Starting server on port 5000');
  });


const users = {}

var history = []

io.on('connection',(socket) => {
  
    // For state management.
    socket.emit('redrawEverything', history)
        
    socket.on('rectangleCoordinates', (coords) => {
        const {x, y, width, height, strokeWeight} = coords
        const rectangleObject = {'shape':'Rectangle',
                                  'x':x,
                                  'y':y,
                                  'width':width,
                                  'height':height,
                                  'strokeWeight':strokeWeight}
        history.push(rectangleObject)
        io.sockets.emit('drawRectangle',coords); // This includes every socket
    });

    socket.on('circleDimensions', (coords) => {
      const {x, y, width, height, strokeWeight} = coords
      const circleObject = {'shape':'Circle',
                                  'x':x,
                                  'y':y,
                                  'width':width,
                                  'height':height,
                                  'strokeWeight':strokeWeight}
      history.push(circleObject)
      io.sockets.emit('drawCircle',coords);
  });

});