// Studente: Davide Civolani    MAT:121425

// Vertex shader program
"use strict";
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
var gl = null, colore = null;
var RENDERING_MODE = null;
var TEST = false;

function main() {
  colore = {color0:[13,63,119]}; //must be initialized before calling any initVertex function
  //0,105,255
  //0,120,255

  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError, logAndValidate); //enable debug
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
  var camPos = new Vector3([0.0, 3.0, 6.0]);
  // Calculate the view projection matrix
  vpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 1000);
  vpMatrix.lookAt(camPos.elements[0],camPos.elements[1],camPos.elements[2], 0, 0, 0, 0, 1, 0);
     
  var currentAngle = 0.0;  // Current rotation angle
  var modelMatrix = new Matrix4();  // Model matrix
  var mvpMatrix = new Matrix4();    // Model view projection matrix
  //*********************************************************************

  // TEST FUNCTION
  if (TEST) var n = initVertexBuffersTorus(gl);
  else var n = initVertexBuffersCube(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // creo una GUI con dat.gui
  var gui = new dat.GUI();

  //color picker
  gui.addColor(colore,'color0').name("figure color").listen().onChange(function(value) {
    for (var figure in geometria) {
      if (geometria[figure] == true) {
        var func2call = "initVertexBuffers"+figure.charAt(0).toUpperCase() + figure.slice(1); //ottieni il nome della funzione da invocare
        window[func2call](gl); //chiama la funzione globale il cui nome è contenuto nella stringa func2call
      }
    }
  });

  // checkbox geometry
  if (TEST) var geometria = {cube:false,cone:false,cylinder:false,sphere:false,torus:true};
  else var geometria = {cube:true,cone:false,cylinder:false,sphere:false,torus:false};
  //
  gui.add(geometria,'cube').listen().onFinishChange(function(value) {
    // Fires when a controller loses focus.
	   if(value == true){
		geometria.cube = value;
		geometria.cone = false;
		geometria.cylinder = false;
		geometria.sphere = false;
    geometria.torus = false;
    n = initVertexBuffersCube(gl);
	   }
	   // Iterate over all controllers
       for (var i in gui.__controllers) {
          gui.__controllers[i].updateDisplay();
       }
   });
  gui.add(geometria,'cone').listen().onFinishChange(function(value) {
    // Fires when a controller loses focus.
       // Fires when a controller loses focus.
	   if(value == true){
		geometria.cube = false;
		geometria.cone = value;
		geometria.cylinder = false;
		geometria.sphere = false;
    geometria.torus = false;
    n = initVertexBuffersCone(gl);
	   }
	   // Iterate over all controllers
       for (var i in gui.__controllers) {
          gui.__controllers[i].updateDisplay();
       }
   });
  gui.add(geometria,'cylinder').listen().onFinishChange(function(value) {
    // Fires when a controller loses focus.
       // Fires when a controller loses focus.
	   if(value == true){
		geometria.cube = false;
		geometria.cone = false;
		geometria.cylinder = value;
		geometria.sphere = false;
    geometria.torus = false;
    n = initVertexBuffersCylinder(gl);
	   }
	   // Iterate over all controllers
       for (var i in gui.__controllers) {
          gui.__controllers[i].updateDisplay();
       }
   });
  gui.add(geometria,'sphere').listen().onFinishChange(function(value) {
    // Fires when a controller loses focus.
       // Fires when a controller loses focus.
	   if(value == true){
		geometria.cube = false;
		geometria.cone = false;
		geometria.cylinder = false;
		geometria.sphere = value;
    geometria.torus = false;
    n = initVertexBuffersSphere(gl);
	   }
	   // Iterate over all controllers
       for (var i in gui.__controllers) {
          gui.__controllers[i].updateDisplay();
       }
   });
  gui.add(geometria,'torus').listen().onFinishChange(function(value) {
    // Fires when a controller loses focus.
       // Fires when a controller loses focus.
	   if(value == true){
		geometria.cube = false;
		geometria.cone = false;
		geometria.cylinder = false;
		geometria.sphere = false;
    geometria.torus = value;
    n = initVertexBuffersTorus(gl);
	   }
	   // Iterate over all controllers
       for (var i in gui.__controllers) {
          gui.__controllers[i].updateDisplay();
       }
   });
  //*********************************************************************************
  if (TEST) RENDERING_MODE = gl.LINE_STRIP;
  else RENDERING_MODE = gl.TRIANGLES;
  var tick = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle
    // Calculate the model matrix
    modelMatrix.setRotate(currentAngle, 0, 1, 0); // Rotate around the y-axis
	
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the cube
    //gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    gl.drawElements(RENDERING_MODE, n, gl.UNSIGNED_SHORT, 0); //test
    //gl.drawElements(gl.POINTS, n, gl.UNSIGNED_SHORT, 0); //test

    requestAnimationFrame(tick, canvas); // Request that the browser ?calls tick
  };
  tick();
}

function initVertexBuffersCube(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3
  // Coordinates
  var vertices = new Float32Array([
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
  ]);

  // Colors
  var colors = [];
  var normColor = { //normalize colorpicker's color components as WebGL color range is [0,1] instead of [0,255]
    "red": colore.color0[0] / 255, 
    "green": colore.color0[1] / 255, 
    "blue": colore.color0[2] / 255
  };
  for (var i = 0; i < vertices.length; i++) {
    colors.push(normColor.red);
    colors.push(normColor.green);
    colors.push(normColor.blue);
  }
  colors = new Float32Array(colors);

  // Indices of the vertices
  var indices = new Uint16Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);

  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices,       3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color',    colors,  3, gl.FLOAT)) return -1;
 
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

var points = [],colors = [],indices = []; //test
function initVertexBuffersCone(gl) {
  var p = [1.0, -0.6, 0.6];
  var spike = [0.0, 1.5, 0.0];
  var n = 100;
  var angleStep = 2* Math.PI / n;

  var colors = [];
  var points = [];
  var indices = [];
  var normColor = {
    "red": colore.color0[0] / 255, 
    "green": colore.color0[1] / 255, 
    "blue": colore.color0[2] / 255
  };


  //SUPERFICIE LATERALE
  //inserisco punta
  points.push(spike[0]); points.push(spike[1]); points.push(spike[2]);
  colors.push(normColor.red);
  colors.push(normColor.green);
  colors.push(normColor.blue);
  
  //Inserisco gli altri punti (sono condivisi con la base)
  for (var i=0; i < n; i++) {
    points.push( p[0] *Math.cos(i*angleStep) - p[2] *Math.sin(i*angleStep));
    points.push(p[1]);
    points.push( p[0] *Math.sin(i*angleStep) + p[2] *Math.cos(i*angleStep));
    //Colori
    colors.push(normColor.red);
    colors.push(normColor.green);
    colors.push(normColor.blue);
    //Indici
    indices.push(0);
    indices.push(i+1);
    indices.push(i+2);
  }
  indices[indices.length-1] = 1;

  //indices = []; //test rendering base

  //BASE
  //è sufficiente inserire solo il centro
  points.push(spike[0]); points.push(p[1]); points.push(spike[2]);
  if (TEST) {
    //TRIANGLE ORDER TEST
    colors.push(0); //red
    colors.push(1); //green
    colors.push(0); //blue
  } else {
    colors.push(normColor.red);
    colors.push(normColor.green);
    colors.push(normColor.blue);
  }

  for (var i=1; i <=n; i++) {
      indices.push(n+1); //centro della base
      indices.push(i);
      indices.push(i+1);
  }
  indices[indices.length-1] = 1; //collega l'ultimo triangolo con il primo

  points = new Float32Array(points);
  colors = new Float32Array(colors);
  indices = new Uint16Array(indices);

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
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

return indices.length;
}

function initVertexBuffersCylinder(gl) {
  var h = 1.6;
  var n = 70;
  var p = [0.6, -0.8, 0.6]; //punto noto della base inferiore
  var bottomcenter = [0.0, p[1], 0.0];
  
  var angleStep = 2* Math.PI / n;
  var normColor = {
    "red": colore.color0[0] / 255, 
    "green": colore.color0[1] / 255, 
    "blue": colore.color0[2] / 255
  };
  var colors = [];
  var points = [];
  var indices = [];
  var x,y,z;

  //Vertici & Colori
  //centri delle basi
  points.push(bottomcenter[0], bottomcenter[1], bottomcenter[2]); //base inferiore -> 0
  colors.push(normColor.red, normColor.green, normColor.blue);

  points.push(bottomcenter[0], bottomcenter[1]+h, bottomcenter[2]); //base superiore -> 1
  colors.push(normColor.red, normColor.green, normColor.blue);
  
  for (var i=0; i < n; i++) {
    x = p[0] *Math.cos(i*angleStep) - p[2] *Math.sin(i*angleStep);
    y = p[1];
    z = p[0] *Math.sin(i*angleStep) + p[2] *Math.cos(i*angleStep);
    
    //vertici inferiori
    points.push(x, y, z);
    colors.push(normColor.red, normColor.green, normColor.blue);

    //vertici superiori
    points.push(x, y+h, z);
    colors.push(normColor.red, normColor.green, normColor.blue);

  }
  
  //Indici
  //Basi
  //Gli indici della base superiore sono dispari, quelli della base inferiore sono pari
  var FAN_OFFSET = 2;
  for (var i=0; i<2*n; i++) {
    if (i%2==0) indices.push(0); //centro base superiore
    else indices.push(1); //centro base inferiore
    indices.push(FAN_OFFSET + i%(2*n), FAN_OFFSET + (i+2)%(2*n));
  }

  //Superficie laterale
  for (var i=FAN_OFFSET; i<2*n; i++) {
    indices.push(i, i+2, i+1);
    indices.push(i+1, i-1, i);
  }
  //collego gli ultimi vertici ai primi
  indices.push(2*n, FAN_OFFSET, FAN_OFFSET+1); //triangolo sotto
  indices.push(FAN_OFFSET+1, 2*n+1, 2*n); //triangolo sopra
  

  //Send data to shaders
  points = new Float32Array(points);
  colors = new Float32Array(colors);
  indices = new Uint16Array(indices);

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
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

return indices.length;
}

function initVertexBuffersSphere(gl) {
  //L'index buffer deve essere inizializzato con un Uint16Array o si verificano glitch con n>20
  //drawElements() richiede gl.UNSIGNED_SHORT nel campo "type" quando si usano indici a 16 bit

  var r = 1.5;
  var n = 70;

  var angleStep = 2* Math.PI / n;
  var normColor = {
    "red": colore.color0[0] / 255, 
    "green": colore.color0[1] / 255, 
    "blue": colore.color0[2] / 255
  };
  var colors = [];
  var points = [];
  var indices = [];
  var x,y,z;
  

  for (var i = 0; i <= n; i++) { //rotazione XY
    var angleXY = i * Math.PI/n; //con 2*PI/n disegna due diagonali nelle facce perchè il cerchio ruota attorno al diametro
    var sinXY = Math.sin(angleXY);
    var cosXY = Math.cos(angleXY);
    for (var j = 0; j <= n; j++) { //rotazione Z
      var angleZ = j * angleStep;
      var sinZ = Math.sin(angleZ);
      var cosZ = Math.cos(angleZ);

      //Vertici
      x = r * cosXY * sinZ;
      y = r * sinXY * sinZ;
      z = r * cosZ;

      points.push(x,z,y); //scambio y e z per tenere i poli in verticale

      //Colori
      colors.push(normColor.red, normColor.green, normColor.blue);

      //Indici
      var p1 = i * (n+1) + j; //i*(n) è il primo pto dello strato i-esimo. +j per iterare su tutti i pti di quello strato
      var p2 = p1 + (n+1); //pto sopra a p1 = pto in posizione analoga a p1 nello strato successivo

      //indices.push(i*n+j) //test punti
      if (i < n && j < n) { //mi fermo prima altrimenti drawElements va fuori dal buffer
        indices.push(p1, p2, p1 + 1);
        indices.push(p1 + 1, p2, p2 + 1);
      }
    }
  }


  //Send data to shaders
  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(points), 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color'   , new Float32Array(colors)  , 3, gl.FLOAT)) return -1;
   
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  
  return indices.length;
}

function initVertexBuffersTorus(gl) {
  var Rhole = 1.0;
  var r = 0.3;
  var n = 60;

  var angleStep = 2* Math.PI / n;
  var normColor = {"red": colore.color0[0] / 255, "green": colore.color0[1] / 255, "blue": colore.color0[2] / 255};
  var colors = [];
  var points = [];
  var indices = [];
  var x,y,z;
  

  for (var i = 0; i <= n; i++) { //rotazione del cerchio intorno al buco
    var angleTHETA = i * angleStep;
    var sinTHETA = Math.sin(angleTHETA);
    var cosTHETA = Math.cos(angleTHETA);
    for (var j = 0; j <= n; j++) { //rotazione pti sull'anello
      var anglePHI = j * angleStep;
      var sinPHI = Math.sin(anglePHI);
      var cosPHI = Math.cos(anglePHI);

      //Vertici
      x = (Rhole + r * cosPHI) * cosTHETA;
      y = (Rhole + r * cosPHI) * sinTHETA;
      z = r * sinPHI;

      points.push(x,y,z);

      //Colori
      colors.push(normColor.red, normColor.green, normColor.blue);

      //Indici
      var p1 = i * (n+1) + j; //i*(n) è il primo pto dello strato i-esimo. +j per iterare su tutti i pti di quello strato
      var p2 = p1 + (n+1); //pto sopra a p1 = pto in posizione analoga a p1 nello strato successivo

      //indices.push(i*n+j) //test punti
      if (i < n && j < n) { //mi fermo prima altrimenti drawElements va fuori dal buffer
        indices.push(p1, p2, p1 + 1);
        indices.push(p1 + 1, p2, p2 + 1);
      }
    }
  }


  //Send data to shaders
  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(points), 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color'   , new Float32Array(colors)  , 3, gl.FLOAT)) return -1;
   
  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  
  return indices.length;
}

/*-----------------------------------------------------------*/
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
var ANGLE_STEP = 150.0;
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


//////////////////////////////////////
//DEBUG///////////////////////////////
//////////////////////////////////////

function throwOnGLError(err, funcName, args) {
  throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
};

function validateNoneOfTheArgsAreUndefined(functionName, args) {
  for (var ii = 0; ii < args.length; ++ii) {
    if (args[ii] === undefined) {
      console.error("undefined passed to gl." + functionName + "(" +
                     WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
    }
  }
}

function logGLCall(functionName, args) {   
  console.log("gl." + functionName + "(" + 
     WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");   
}

function logAndValidate(functionName, args) {
  logGLCall(functionName, args);
  validateNoneOfTheArgsAreUndefined (functionName, args);
}