// Studente: Davide Civolani       MAT: 121425
// HW3_Code3.js
// Implementazione Texture Mapping e Phong Shading (modello ridotto)
// GDD - 2017
"use strict";

// Vertex shader program
var VSHADER_SOURCE;
// Fragment shader program
var FSHADER_SOURCE;

function loadShaderFromFile(filePath) { //Requires an HTTP server running
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET",filePath,false);
    xmlhttp.send(null);
    var fileContent = xmlhttp.responseText;
    
 
/*    //print the GLSL file as string to embedd into a javascript source
    var fileArray = fileContent.split('\n');
    var SHADER_SOURCE = "";
    for (var i in fileArray) VSHADER_SOURCE = VSHADER_SOURCE + "'"+fileArray[i]+"'\t+\n";
    VSHADER_SOURCE = VSHADER_SOURCE + ";";
    console.log(VSHADER_SOURCE);  */
 
 
    return fileContent;
}

function main() {
  // Get the rendering context for WebGL
  var canvas = document.getElementById('webgl');
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  VSHADER_SOURCE = loadShaderFromFile("../Homework3/shaders/HW3_vertex.glsl");
  FSHADER_SOURCE = loadShaderFromFile("../Homework3/shaders/HW3_fragment.glsl");
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
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
  var u_ModelMatrix   = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  var u_MvpMatrix     = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix  = gl.getUniformLocation(gl.program, 'u_NormalMatrix');

  var u_LightColor    = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  
   if (!u_ModelMatrix || !u_MvpMatrix   || !u_NormalMatrix || 
      !u_LightColor || !u_LightPosition ) { 
    console.log('Failed to get the storage location');
    return;
  } 

  // *******************************************************************************************
  var cameraPos = [1,3,8];          // camera position
  //********************************************************************************************

  // Set the Specular and Diffuse light color 
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition, 1.0, 2.0, 12.0);

  //TEST FUNZIONE
  // Set the vertex coordinates, uvs and normals
  var n = initVertexBuffersEhm(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  //CALCOLA MATRICI & RENDERER
  var currentAngle = 0.0;         // Current rotation angle
  var vpMatrix = new Matrix4();   // View projection matrix

  // Calculate the view projection matrix
  vpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  vpMatrix.lookAt(cameraPos[0],cameraPos[1],cameraPos[2], 0, 0, 0, 0, 1, 0);

  var modelMatrix = new Matrix4();    // Model matrix
  var mvpMatrix = new Matrix4();      // Model-View-Projection matrix
  var normalMatrix = new Matrix4();   // Transformation matrix for normals

  var render = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle

    // Calculate the MODEL MATRIX
    modelMatrix.setRotate(currentAngle, 1, 0, 0);
    // Pass the model matrix to u_ModelMatrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    
    // Calculate the MODEL-VIEW-PROJECTION MATRIX
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    // Pass the model-view-projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    
    // Calculate the MATRIX TO TRANSFORM THE NORMALS based on the model matrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    // Pass the transformation matrix for normals to u_NormalMatrix
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the cube(Note that the 3rd argument is the gl.UNSIGNED_SHORT)
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(render, canvas); // Request that the browser calls render
  };
  render();
}


function initVertexBuffersEhm(gl) { // Create a Ehm...
  //Stavo provando a visualizzare le normali di un toro, quando....
  var Rhole = 1.0;
  var r = 0.3;
  var n = 60;

  var angleStep = 2* Math.PI / n;
  var points = [];
  var normals = [];
  var uvs = [];
  var indices = [];
  
  var p = [Rhole+r, 0, 0];
  for (var i = 0; i <= n; i++) { //rotazione del cerchio intorno al buco
    var angleTHETA = i * angleStep;
    var sinTHETA = Math.sin(angleTHETA);
    var cosTHETA = Math.cos(angleTHETA);
    
    //centro del cerchio (per le normali)
    var cx = p[0] *Math.cos(angleTHETA) - p[2] *Math.sin(angleTHETA);
    var cy = p[1];
    var cz = p[0] *Math.sin(angleTHETA) + p[2] *Math.cos(angleTHETA);

    for (var j = 0; j <= n; j++) { //rotazione pti sull'anello
      var anglePHI = j * angleStep;
      var sinPHI = Math.sin(anglePHI);
      var cosPHI = Math.cos(anglePHI);

      //Vertici

      var x = (Rhole + r * cosPHI) * cosTHETA;
      var y = (Rhole + r * cosPHI) * sinTHETA;
      var z = r * sinPHI;

      //points.push(x,y,z);
      points.push(x-cx,y-cy,z-cz); //ehm figura strana :/
      
      //Normali
      var norm2 = Math.sqrt((x-cx)*(x-cx) + (y-cy)*(y-cy) + (z-cz)*(z-cz));
      //normals.push(r*sinTHETA, Rhole*cosPHI, r*cosTHETA);
      //normals.push((x-cx)/r, (y-cy)/r, (z-cz)/r);
      normals.push(x/r, y/r, z/r);

      //Texture
      uvs.push(i/n, j/n);

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

  //SEND DATA TO SHADERS
  // Write the vertex property to buffers (coordinates and uvs)
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(points), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(normals), gl.FLOAT, 3)) return -1;
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
  image.src = '../Homework3/textures/03a.jpg';
  image.src = '../Homework3/textures/ash_uvgrid01.jpg';
  image.src = '../Homework3/textures/lightingtest.png';

  return true;
}

function loadTexture(gl, texture, u_Sampler, image) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, 0);
  
  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
}