var canvas = document.getElementById("myCanvas");
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight; 

var ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.lineWidth = 50;
ctx.beginPath();
ctx.moveTo(100, 100);
ctx.lineTo(200, 200);
ctx.moveTo(100, 100);
ctx.closePath();
ctx.strokeStyle = "white";
ctx.stroke();

ctx.beginPath();
ctx.moveTo(100, 100);
ctx.lineTo(200, 200);
ctx.moveTo(100, 100);
ctx.closePath();
ctx.strokeStyle = "black";
ctx.stroke();

ctx.font = "20px Verdana";
ctx.fillStyle = "white";
ctx.fillText("Canvas Y U NO draw lines correctly???", 10, 30);
