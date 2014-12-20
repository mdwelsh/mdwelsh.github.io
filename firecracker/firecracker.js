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

function Flash(sx, sy) {
  this.sx = sx;
  this.sy = sy;
  this.numarcs = 5 + Math.floor(Math.random() * 11);

  this.arcs = [];
  for (i = 0; i < this.numarcs; i++) {
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
    console.log("MDW: mx " + mx);
    console.log("MDW: my " + my);
    console.log("MDW: lx " + lx);
    console.log("MDW: ly " + ly);
    console.log("MDW: sx " + this.sx);
    console.log("MDW: sy " + this.sy);

    var ex = this.sx + (mx * lx);
    var ey = this.sy + (my * ly);
    console.log("MDW: Adding arc: " + ex + ", " + ey);
    this.arcs = this.arcs + [ex, ey];
  }
  console.log("MDW: Constructor arcs: " + this.arcs);
}

flash = function(sx, sy, fade) {
  console.log("MDW: flash called with " + sx + ", " + sy + ", " + fade);

  var f = new Flash(sx, sy);
  console.log("MDW: Created arcs: " + f.arcs);

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
  var r = Math.floor(255.0 * fade);
  var g = Math.floor(40.0 * fade);
  var b = Math.floor(40.0 * fade);
  ctx.strokeStyle = "rgb(" + r + ", " + g + ", " + b + ")";
  console.log("MDW: flash drawing with " + ctx.strokeStyle);
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
