'use strict';

$(function() {

  var socket = io();
  var canvas = document.getElementsByClassName('whiteboard')[0];
  // var colors = document.getElementsByClassName('color');
  var context = canvas.getContext('2d');
  var color = "#000";
  var line = 3;

  $("#test").on("change", function() {
    current.color = $(test).val();
  });



  var current = {
    color: color,
    line: line
  };
  var drawing = false;

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

  // for (var i = 0; i < colors.length; i++){
  //   colors[i].addEventListener('click', onColorUpdate, false);
  // }




  socket.on('drawing', onDrawingEvent);


  //画面サイズの変更
  window.addEventListener('resize', onResize, false);
  onResize();


  function drawLine(x0, y0, x1, y1, color, line, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    // console.log(color)
    context.lineWidth = line;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
      line: line
    });
  }

  function onMouseDown(e){
    drawing = true;
    current.x = e.clientX;
    current.y = e.clientY;
  }

  function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, current.line, true);
  }

  function onMouseMove(e){
    if (!drawing) { return; }
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, current.line, true);
    current.x = e.clientX;
    current.y = e.clientY;
  }

  // function onColorUpdate(e){
  //   current.color = e.target.className.split(' ')[1];
  // }



  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  //文字の太さの変更
  $("#slide").on("change", function() {
    current.line = $(slide).val();
  });

  //文字の太さの数字の表示
  $("#slide").on("change", function() {
    $("#slide_value").html($(this).val());
  });


  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.line);
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

});
