var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

canvas.setAttribute('z-index', 0);

document.oncontextmenu = function () {
    return false;
}

const drawings = [];

let cursorX;
let cursorY;
let prevCursorY;
let prevCursorX;
let lineWidth = 2;
let strokeStyle = '#000';
let offsetY = 0;
let offsetX = 0;
let scale = 1;

function redrawCanvas(){
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    context.fillStyle = '#fff';
    context.fillRect(0,0, canvas.width, canvas.height);

    for(let i = 0; i < drawings.length; ++i){
        const line = drawings[i];
        drawLine(toScreenX(line.x0), toScreenY(line.y0), toScreenX(line.x1), toScreenY(line.y1));
    }
}

redrawCanvas();

window.addEventListener('resize', (event) => {
    redrawCanvas();
})

canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', onMouseMove, false);
canvas.addEventListener('wheel', onMouseWheel, false);

//canvas.addEventListener('touchstart', onTouchStart);
//canvas.addEventListener('touchend', onTouchEnd);
//canvas.addEventListener('touchcancle', onTouchEnd);
//canvas.addEventListener('touchmove', onTouchMove);


let leftMouseDown = false;
let rightMousedown = false;
function onMouseDown(event){

    if(event.button == 0){
        leftMouseDown = true;
        rightMousedown = false;
    }

    if(event.button == 2){
        rightMousedown = true;
        leftMouseDown = false;
    }

    cursorX = event.pageX;
    cursorY = event.pageY;
    prevCursorX = event.pageX;
    prevCursorY = event.pageY;
}

function onMouseMove(event){
    cursorX = event.pageX;
    cursorY = event.pageY;
    const scaledX = toTrueX(cursorX);
    const scaledY = toTrueY(cursorY);
    const prevScaledX = toTrueX(prevCursorX);
    const prevScaledY = toTrueY(prevCursorY);

    if(leftMouseDown){
        drawings.push({
            x0 : prevScaledX,
            y0: prevScaledY,
            x1: scaledX,
            y1: scaledY
        })

        drawLine(prevCursorX, prevCursorY, cursorX, cursorY);
    }

    if(rightMousedown){
        offsetX += (cursorX - prevCursorX)/scale;
        offsetY += (cursorY - prevCursorY)/scale;

        redrawCanvas();
    }

    prevCursorX = cursorX;
    prevCursorY = cursorY;
}

function onMouseUp(){
    leftMouseDown = false;
    rightMousedown = false;
}

function onMouseWheel(event){
    const deltaY = event.deltaY;
    const scaleAmount = -deltaY/500;
    scale = scale * (1 + scaleAmount);

    var distX = event.pageX / canvas.clientWidth;
    var distY  = event.pageY / canvas.clientHeight;

    const unitsZoomedX = truewidth() * scaleAmount;
    const unitsZoomedY = trueHeight() * scaleAmount

    const unitsAddLeft = unitsZoomedX * distX;
    const unitsAddTop = unitsZoomedY * distY;

    offsetX -= unitsAddLeft;
    offsetY -= unitsAddTop;

    redrawCanvas();
}

function drawLine(x0 , y0, x1, y1){
    context.beginPath();
    context.moveTo(x0,y0);
    context.lineTo(x1,y1);
    context.strokeStyle = strokeStyle;
    context.lineWidth = lineWidth;
    context.stroke();
}

// the pen utility
var strokeDisplay = false;
var strokeButton = document.getElementById('stroke');
strokeButton.addEventListener('change', function(event){
    lineWidth =strokeButton.value;
    context.lineWidth = lineWidth;
})
function pen(){
    context.globalAlpha = 1;
    strokeStyle = '#000';
    if(!strokeDisplay){
    strokeButton.style.display = 'inline-block';
    strokeDisplay = true;
}else{
    strokeButton.style.display = 'none';
    strokeDisplay = false;
}

console.log(strokeButton.value);
}

function eraser(){
    strokeStyle = '#fff';
}

// the color-picker utility

function colorPicker(){
    var color = document.getElementById('color');

    color.addEventListener('change', function(event){
        colorPicked = color.value;
        console.log(colorPicked);
        strokeStyle = colorPicked;
    })
}

function clearStuff(){
    context.clearRect(0,0, canvas.width,canvas.height);
    drawings = [];
}
// the distance functions
function toScreenX(xTrue){
    return (xTrue + offsetX)*scale;
}

function toScreenY(yTrue){
    return (yTrue + offsetY)*scale;
}

function toTrueX(xScreen){
    return (xScreen/scale) - offsetX;
}

function toTrueY(yScreen){
    return (yScreen/scale) - offsetY;
}

function trueHeight(){
    return canvas.clientHeight / scale;
}

function truewidth(){
    return canvas.clientWidth/scale;
}


