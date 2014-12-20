// Initial setup.

var canvas = document.getElementById("myCanvas");
var boom = new Audio('boom.mp3');

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight; 

// Create gradient
var ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Write text
ctx.font = "20px Verdana";
ctx.fillStyle = "white";
ctx.fillText("Sidney's Fireworks Studio", 10, 40);

function Point(x, y) {
  this.x = Math.floor(x);
  this.y = Math.floor(y);
}

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
    var ex = this.sx + (mx * lx);
    var ey = this.sy + (my * ly);
    console.log("MDW: Adding arc: " + ex + ", " + ey);
    var p = new Point(ex, ey);
    this.arcs.push(p);
  }
  console.log("MDW: Constructor arcs: " + this.arcs);
}

Flash.prototype.boom = function() {
  this.draw(1.0);
  boom.play();
}

Flash.prototype.draw = function(fade) {
  var ctx = canvas.getContext("2d");
  ctx.lineWidth = 50;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (i = 0; i < this.arcs.length; i++) {
    console.log("MDW: drawing arc " + this.arcs[i].x + ", " + this.arcs[i].y);
    ctx.moveTo(this.sx, this.sy);
    ctx.lineTo(this.arcs[i].x, this.arcs[i].y);
    ctx.moveTo(this.sx, this.sy);
  }
  ctx.closePath();

  var grd = ctx.createRadialGradient(this.sx, this.sy, 20, this.sx, this.sy, 500);
  grd.addColorStop(0, "red");

  var r = Math.floor(255.0 * fade);
  var g = Math.floor(40.0 * fade);
  var b = Math.floor(40.0 * fade);
  grd.addColorStop(0, "rgb(" + r + ", " + g + ", " + b + ")");
  grd.addColorStop(1, "black");
  ctx.strokeStyle = grd;

  console.log("MDW: flash drawing with " + ctx.strokeStyle);
  ctx.stroke();
  if (fade > 0.0) {
    var f = this;
    setTimeout(function() {
      f.draw(fade - 0.1);
    }, 100);
  }
}

flash = function(sx, sy, fade) {
  console.log("MDW: flash called with " + sx + ", " + sy + ", " + fade);
  var f = new Flash(sx, sy);
  console.log("MDW: Created arcs: " + f.arcs);
  f.boom();
}

clickHandler = function(event) {
  console.log("MDW: clickHandler called at " + event.offsetX + ", " + event.offsetY);
  var sx = event.offsetX;
  var sy = event.offsetY;
  flash(sx, sy, 1.0);
}
canvas.addEventListener('click', clickHandler, false);
