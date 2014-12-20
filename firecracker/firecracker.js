// Initial setup.

var canvas = document.getElementById("myCanvas");
var boom = new Audio('boom.mp3');

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight; 

// Create gradient
var ctx = canvas.getContext("2d");
var grd = ctx.createLinearGradient(0, 0, 0, 200);
grd.addColorStop(0, "gray");
grd.addColorStop(1, "black");
ctx.fillStyle = grd;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Write text
ctx.font = "20px Verdana";
ctx.fillStyle = "white";
ctx.fillText("Sidney's Fireworks Studio", 10, 40);

flash = function(sx, sy, fade) {
  console.log("MDW: flash called with " + sx + ", " + sy + ", " + fade);
  var ctx = canvas.getContext("2d");
  var numarcs = 5 + Math.floor(Math.random() * 11);
  ctx.beginPath();
  for (i = 0; i < numarcs; i++) {
    var lx = Math.random() * 300;
    var ly = Math.random() * 300;
    var mx = 1;
    var my = 1;
    if (Math.random() < 0.5) {
      mx = -1;
    }
    if (Math.random() < 0.5) {
      my = -1;
    }
    var ex = sx + (mx * lx);
    var ey = sy + (my * ly);

    var grd = ctx.createLinearGradient(0, 0, 0, 100);
    grd.addColorStop(0, "red");
    grd.addColorStop(1, "orange");
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.moveTo(sx, sy);
  }
  ctx.closePath();
  var r = 255 * fade;
  var g = 100 * fade;
  var b = 100 * fade;
  ctx.strokeStyle = "rgb(" + r + ", " + g + ", " + b + ")";
  ctx.stroke();

  if (fade == 1.0) {
    boom.play();
  }
  if (fade > 0.0) {
    console.log("MDW: Setting timeout");
    setTimeout(function() {
      flash(sx, sy, fade - 0.1);
    }, 100);
  }
}

clickHandler = function(event) {
  console.log("MDW: clickHandler called at " + event.offsetX + ", " + event.offsetY);
  var sx = event.offsetX;
  var sy = event.offsetY;
  flash(sx, sy, 1.0);
}
canvas.addEventListener('click', clickHandler, false);
