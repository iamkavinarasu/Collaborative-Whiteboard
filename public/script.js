// Creating a socket
var socket = io()

/*** GUI Part ***/
var tool = 0 
var tools = document.querySelectorAll(".tool")
var drawColor = null
var radius = 5

var coords = []

setColor([50, 50, 60])

for (var i = 0; i < tools.length; i++) {
  tools[i].onclick = function (id) {
    return function () {
      setTool(id)
    }
  }(i)
}

function setTool(id) {
  tool = id
  for (var i = 0; i < tools.length; i++) {
    tools[i].classList.remove("tool-selected")
    if (id == i)
      tools[i].classList.add("tool-selected")
  }
}

function setColor(c) {
  drawColor = c
}

document.onwheel = function (e) {
  if (e.deltaY < 0)
    radius+=2
  if (e.deltaY > 0)
    radius-=2
}

document.querySelector("#download").onclick = function () {
  graphic.save("Drawing.png")
}

/*** Drawing part ***/
var lastPoint = null
var graphic = null

var squareOrigin = null
var circleOrigin = null

function setup() {
  createCanvas(document.body.clientWidth, document.body.clientHeight - 50).parent("#canvas")
  ellipseMode(CENTER)
  graphic = createGraphics(document.body.clientWidth, document.body.clientHeight - 50)
  graphic.background(255)
}

function draw() {
  background(255)
  image(graphic, 0, 0)
  
  if (tool == 0 || tool == 3)
    tool0Preview()
  
  if (mouseIsPressed) {
      drawOnGraphic()
  } else {
    lastPoint = null
    onMouseQuit()
  }
 
}

function tool0Preview()
{
  noFill()
  stroke(200)
  strokeWeight(2)
  ellipse(mouseX, mouseY, radius, radius)
}

function drawOnGraphic() {
  if (lastPoint == null)
    lastPoint = [mouseX, mouseY]
  
  if (tool == 0) {
    graphic.noFill()
    graphic.stroke(drawColor)
    graphic.strokeWeight(radius)
    graphic.line(mouseX, mouseY, lastPoint[0], lastPoint[1])
  }
  
  if (tool == 1) {
    if (squareOrigin == null) {
      squareOrigin = [mouseX, mouseY]
    } else {
      noStroke()
      rect(squareOrigin[0], squareOrigin[1], mouseX - squareOrigin[0], mouseY - squareOrigin[1])
    }
  }
  
  if (tool == 2) {
    if (circleOrigin == null) {
      circleOrigin = [mouseX, mouseY]
    } else {
      noStroke()
      let d = createVector(mouseX - circleOrigin[0], mouseY - circleOrigin[1]).mag()
      ellipseMode(CENTER)
      ellipse(circleOrigin[0], circleOrigin[1], d * 2, d * 2)
    }
  }
    
  lastPoint = [mouseX, mouseY]
}

function onMouseQuit() {
  if (squareOrigin != null) {
      graphic.rect(squareOrigin[0], squareOrigin[1], mouseX - squareOrigin[0], mouseY - squareOrigin[1])
      captureRectangleCoordinates(squareOrigin[0], squareOrigin[1], mouseX - squareOrigin[0], mouseY - squareOrigin[1], radius)
      console.log(squareOrigin[0], squareOrigin[1], mouseX - squareOrigin[0], mouseY - squareOrigin[1], strokeWeight)
      squareOrigin = null
  }
  if (circleOrigin != null) {
    let d = createVector(mouseX - circleOrigin[0], mouseY - circleOrigin[1]).mag()
    graphic.ellipseMode(CENTER)
    graphic.ellipse(circleOrigin[0], circleOrigin[1], d * 2, d * 2)
    captureCircleDimensions(circleOrigin[0], circleOrigin[1], d * 2, d * 2, radius)
    console.log(circleOrigin[0], circleOrigin[1], d * 2, d * 2)
    circleOrigin = null
  }
}

function captureRectangleCoordinates(x,y,width,height,strokeWeight)
{
  coords = {
    'x': x,
    'y': y,
    'width': width,
    'height': height,
    'strokeWeight': strokeWeight 
  }
  if(socket.connected)
    socket.emit('rectangleCoordinates', coords)
}

function captureCircleDimensions(x,y,width,height, strokeWeight)
{
  coords = {
    'x': x,
    'y': y,
    'width': width,
    'height': height,
    'strokeWeight' : strokeWeight
  }
  if(socket.connected)
    socket.emit('circleDimensions', coords)
}

function drawRectangleOnClient(x,y,width,height, strokeWeight)
{
  graphic.strokeWeight(strokeWeight)
  graphic.rect(x,y,width,height)
}

function drawCircleOnClient(x,y,width,height, strokeWeight)
{
  graphic.strokeWeight(strokeWeight)
  graphic.ellipseMode(CENTER)
  graphic.ellipse(x,y,width,height)
}

function addThisUser(username,index){
  var node=document.createElement("LI");
  var textnode=document.createTextNode(username);;
  node.appendChild(textnode);
  document.getElementById("Users").appendChild(node);
}

socket.on('connect', () => {

    socket.on('redrawEverything', (history) =>{
      console.log(history)
      history.forEach( (element) => {
        console.log(element.shape)
        if (element.shape == "Rectangle")
        {
          drawRectangleOnClient(element.x,element.y,element.width,element.height,element.strokeWeight)
        }
        else if(element.shape == "Circle")
        {
          drawCircleOnClient(element.x,element.y,element.width,element.height,element.strokeWeight)
        }
      });
      });

    socket.on('drawRectangle', (receivedCoords) => {
      const {x,y,width,height,strokeWeight} = receivedCoords
      console.log(`Received coordinates: ${x} ${y} ${width} ${height} ${strokeWeight}`)

      drawRectangleOnClient(x,y,width,height,strokeWeight)

    });

    socket.on('drawCircle', (receivedCoords) => {
      const {x,y,width,height,strokeWeight} = receivedCoords
      console.log(`Received coordinates: ${x} ${y} ${width} ${height} ${strokeWeight}`)

      drawCircleOnClient(x,y,width,height, strokeWeight)

    });

});
