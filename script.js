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


canvas.addEventListener('touchstart', onTouchStart);
canvas.addEventListener('touchend', onTouchEnd);
canvas.addEventListener('touchcancle', onTouchEnd);
canvas.addEventListener('touchmove', onTouchMove);

//touch funcntions
window.ontouchstart = function(event) {
     //If there is more than one touch
        event.preventDefault();
    
}
const prevTouches = [null, null]; // up to 2 touches
        let singleTouch = false;
        let doubleTouch = false;
        function onTouchStart(event) {
            if (event.touches.length == 1) {
                singleTouch = true;
                doubleTouch = false;
            }
            if (event.touches.length >= 2) {
                singleTouch = false;
                doubleTouch = true;
            }

            // store the last touches
            prevTouches[0] = event.touches[0];
            prevTouches[1] = event.touches[1];

        }
        function onTouchMove(event) {
            // get first touch coordinates
            const touch0X = event.touches[0].pageX;
            const touch0Y = event.touches[0].pageY;
            const prevTouch0X = prevTouches[0].pageX;
            const prevTouch0Y = prevTouches[0].pageY;

            const scaledX = toTrueX(touch0X);
            const scaledY = toTrueY(touch0Y);
            const prevScaledX = toTrueX(prevTouch0X);
            const prevScaledY = toTrueY(prevTouch0Y);

            if (singleTouch) {
                // add to history
                drawings.push({
                    x0: prevScaledX,
                    y0: prevScaledY,
                    x1: scaledX,
                    y1: scaledY
                })
                drawLine(prevTouch0X, prevTouch0Y, touch0X, touch0Y);
            }

            if (doubleTouch) {
                // get second touch coordinates
                const touch1X = event.touches[1].pageX;
                const touch1Y = event.touches[1].pageY;
                const prevTouch1X = prevTouches[1].pageX;
                const prevTouch1Y = prevTouches[1].pageY;

                // get midpoints
                const midX = (touch0X + touch1X) / 2;
                const midY = (touch0Y + touch1Y) / 2;
                const prevMidX = (prevTouch0X + prevTouch1X) / 2;
                const prevMidY = (prevTouch0Y + prevTouch1Y) / 2;

                // calculate the distances between the touches
                const hypot = Math.sqrt(Math.pow((touch0X - touch1X), 2) + Math.pow((touch0Y - touch1Y), 2));
                const prevHypot = Math.sqrt(Math.pow((prevTouch0X - prevTouch1X), 2) + Math.pow((prevTouch0Y - prevTouch1Y), 2));

                // calculate the screen scale change
                var zoomAmount = hypot / prevHypot;
                scale = scale * zoomAmount;
                const scaleAmount = 1 - zoomAmount;

                // calculate how many pixels the midpoints have moved in the x and y direction
                const panX = midX - prevMidX;
                const panY = midY - prevMidY;
                // scale this movement based on the zoom level
                offsetX += (panX / scale);
                offsetY += (panY / scale);

                // Get the relative position of the middle of the zoom.
                // 0, 0 would be top left. 
                // 0, 1 would be top right etc.
                var zoomRatioX = midX / canvas.clientWidth;
                var zoomRatioY = midY / canvas.clientHeight;

                // calculate the amounts zoomed from each edge of the screen
                const unitsZoomedX = trueWidth() * scaleAmount;
                const unitsZoomedY = trueHeight() * scaleAmount;

                const unitsAddLeft = unitsZoomedX * zoomRatioX;
                const unitsAddTop = unitsZoomedY * zoomRatioY;

                offsetX += unitsAddLeft;
                offsetY += unitsAddTop;

                redrawCanvas();
            }
            prevTouches[0] = event.touches[0];
            prevTouches[1] = event.touches[1];
        }
        function onTouchEnd(event) {
            singleTouch = false;
            doubleTouch = false;
        }

//moouse fucnctions
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

    const unitsZoomedX = trueWidth() * scaleAmount;
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

function trueWidth(){
    return canvas.clientWidth/scale;
}


