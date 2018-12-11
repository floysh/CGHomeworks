// Studente: Davide Civolani       MAT: 121425
// HW3_Code2.js
// Implementazione del Texture Mapping sulla superficie interna di una semifera
// GDD - 2017
"use strict";

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n'   +
  'uniform mat4 u_MvpMatrix;\n'    +
  'attribute vec2 a_TexCoord;\n'   +
  'varying vec2 v_TexCoord;\n'     +
  'void main() {\n'                +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
   '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
  '}\n';

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');
  
  //Resize canvas along with the browser window's size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  function resize() {
    var canvas = document.getElementById('webgl');
    var canvasRatio = canvas.height / canvas.width;
    var windowRatio = window.innerHeight / window.innerWidth;
    var width;
    var height;
    
    //do not stretch the canvas image!
    if (windowRatio < canvasRatio) {
        height = window.innerHeight;
        width = height / canvasRatio;
    } 
    else {
        width = window.innerWidth;
        height = width * canvasRatio;
    }

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  };
  window.addEventListener('load', resize, false);
  window.addEventListener('resize', resize, false);

 // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex coordinates, the color and the normal
  //TEST FUNZIONE
  var n = initVertexBuffersSemiSphere(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

   // Set texture
  if (!initTextures(gl)) {
    console.log('Failed to intialize the texture.');
    return;
  }
  
  // Set the clear color and enable the depth test
  gl.clearColor(0.5, 0.5, 0.5, 1);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables and so on
  var u_MvpMatrix     = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  
//  var u_CameraPos     = gl.getUniformLocation(gl.program, 'u_CameraPos');
  if (!u_MvpMatrix ) {
    console.log('Failed to get the storage location');
    return;
  }
  // *******************************************************************************************
  var cameraPos = [1,3,8];          // camera position
  //********************************************************************************************
  
  var currentAngle = 0.0;           // Current rotation angle
  var vpMatrix = new Matrix4();   // View projection matrix

  // Calculate the view projection matrix
  vpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  vpMatrix.lookAt(cameraPos[0],cameraPos[1],cameraPos[2], 0, 0, 0, 0, 1, 0);

  var modelMatrix = new Matrix4();  // Model matrix
  var mvpMatrix = new Matrix4(); 　  // Model view projection matrix
  var normalMatrix = new Matrix4(); // Transformation matrix for normals

  var tick = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle

    // Calculate the MODEL MATRIX (calcola ma non passa agli shader perchè non serve per texture mappping)
    modelMatrix.setRotate(currentAngle, 0, 1, 0); // Rotate around the y-axis
    // Pass the model matrix to u_ModelMatrix
    //gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    
    // Calculate the MODEL-VIEW-PROJECTION MATRIX
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    // Pass the model-view-projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    
    /* Non servono le normali per il texture mapping!
    
    // Calculate the MATRIX TO TRANSFORM THE NORMALS based on the model matrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    // Pass the transformation matrix for normals to u_NormalMatrix
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements); */

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the cube(Note that the 3rd argument is the gl.UNSIGNED_SHORT)
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(tick, canvas); // Request that the browser calls tick
  };
  tick();
}


function initVertexBuffersSemiSphere(gl) { // Create a semisphere
  var r = 1.2;
  var n = 70;

  var angleStep = Math.PI / n;
  var points = [];
  var uvs = [];
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
      z = r * sinXY * sinZ;
      y = r * cosZ; //scambio y e z per tenere i poli in verticale
      points.push(x,y,z)

      //Texture
      //inverto l'asse u per mappare correttamente la texture all'interno dell'oggetto
      uvs.push(i/n, -j/n);

      //Indici
      var p1 = i * (n+1) + j; //i*(n) è il primo pto dello strato i-esimo. +j per iterare su tutti i pti di quello strato
      var p2 = p1 + (n+1); //pto sopra a p1 = pto in posizione analoga a p1 nello strato successivo

      if (i < n && j < n) { //mi fermo prima altrimenti drawElements va fuori dal buffer
        indices.push(p1, p2, p1 + 1);
        indices.push(p1 + 1, p2, p2 + 1);
      }
    }
  }

  //SEND DATA TO SHADERS
  // Write the vertex property to buffers (coordinates and uvs)
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(points), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_TexCoord', new Float32Array(uvs)   , gl.FLOAT, 2)) return -1;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  return indices.length;
}


function initArrayBuffer(gl, attribute, data, type, num) {
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

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}
// Rotation angle (degrees/second)
var ANGLE_STEP = 80.0;
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

function initTextures(gl) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of u_Sampler
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to create the Sampler object');
    return false;
  }
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ loadTexture(gl, texture, u_Sampler, image); };
  // Tell the browser to load an image
  image.src = './textures/ash_uvgrid01.jpg'; //TEST
  image.src = './textures/03a.jpg';
  return true;
}

function loadTexture(gl, texture, u_Sampler, image) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, 0);
  
  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
}