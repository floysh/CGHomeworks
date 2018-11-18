"use strict";
// hw2.js
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n'      + // Vertex coordinates
  'attribute vec4 a_Color;\n'  +        // Vertex Color 
  'uniform mat4 u_MvpMatrix;\n'       + // Model-View-Projection Matrix
  'varying vec4 v_Color;\n'           + // vertex color 
  'void main() {\n'                   +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' + 
  '   gl_PointSize = 5.0;\n' +
  '}\n';
//******************************************************************************************
// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
//*****************************************************************************************
var gl,colore;
var RENDERING_MODE;

function main() {
  // creo una GUI con dat.gui
  //var gui = new dat.GUI();

  //color picker
  colore = {color0:[0,120,255]}; //must be initialized before calling any initVertex function
/*   gui.addColor(colore,'color0').name("figure color").listen().onChange(function(value) {
    for (var figure in geometria) {
      if (geometria[figure] == true) {
        var func2call = "initVertexBuffers"+figure.charAt(0).toUpperCase() + figure.slice(1); //retrive function name
        window[func2call](gl); //calls a global function given its name
      }
    }
  }); */

  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0, 0, 0, 0.1);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables and so on
  var u_MvpMatrix      = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix ) { 
    console.log('Failed to get the storage location');
    return;
  }

  var vpMatrix = new Matrix4();   // View projection matrix
  var camPos = new Vector3([0.0, 6.2, 6.0]);

  // Calculate the view projection matrix
  vpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 1000);
  vpMatrix.lookAt(camPos.elements[0],camPos.elements[1],camPos.elements[2], 0, 0, 0, 0, 1, 0);
     
  var currentAngle = 0.0;  // Current rotation angle
  var modelMatrix = new Matrix4();  // Model matrix
  var mvpMatrix = new Matrix4();    // Model view projection matrix
  
  //*********************************************************************
  RENDERING_MODE = gl.LINE_LOOP;

  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  //*********************************************************************************

  var renderer = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle
    // Calculate the model matrix
    modelMatrix.setRotate(currentAngle, 0, 1, 0); // Rotate around the y-axis
	
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw
    gl.drawElements(RENDERING_MODE, n, gl.UNSIGNED_SHORT, 0); //test
    gl.drawElements(gl.POINTS, n, gl.UNSIGNED_SHORT, 0); //test

    requestAnimationFrame(renderer, canvas); // Request that the browser calls renderer()
  };
  renderer();
}

function initVertexBuffers(gl) {
  var r = 1.5;
  
  var n = 50;
  var anglestep = 2* Math.PI / n;

  // Calculate points and colors
  var normColor = {"red": colore.color0[0] / 255, "green": colore.color0[1] / 255, "blue": colore.color0[2] / 255};
  var colors = [];
  var points = [];
  var indices = [];
  var x,y,z;

  // Vertices
  for (var i=0; i<n; i++) {
    var angleX = i * 2 * Math.PI / n;
    var sinX = Math.sin(angleX);
    var cosX = Math.cos(angleX);
    for (var j=0; j<=n; j++) {
      var angleY = j * anglestep;
      var sinY = Math.sin(angleY);
      var cosY = Math.cos(angleY);

      x = r * cosX * sinY;
      y = r * sinX * cosY;
      z = r * cosY;

      points.push(x); points.push(y); points.push(z);

      colors.push(normColor.red);
      colors.push(normColor.green);
      colors.push(normColor.blue);

      indices.push(i*n+j);
    }
  }

  //Send data to shaders
  points = new Float32Array(points);
  colors = new Float32Array(colors);
  var pindices = new Uint16Array(indices);
  
  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', points, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color'   , colors  , 3, gl.FLOAT)) return -1;
   
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, pindices, gl.STATIC_DRAW);
  
  return indices.length;
}


function initArrayBuffer(gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);
  return true;
}

// Rotation angle (degrees/second)
var ANGLE_STEP = 120.0;
// Last time that this function was called
var g_last = Date.now();
function animate(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}