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
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  
   //Estende la canvas per occupare più spazio possibile
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
   //ridimensiona canvas insieme alla finestra
   function resize() {
     var canvas = document.getElementById('webgl');
     var canvasRatio = canvas.height / canvas.width;
     var windowRatio = window.innerHeight / window.innerWidth;
     var width;
     var height;
     
     //mantiene l'aspect ratio al ridimensionamento
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
  /* VSHADER_SOURCE = loadShaderFromFile("shaders/phong_vertex.glsl");
  FSHADER_SOURCE = loadShaderFromFile("shaders/phong_fragment.glsl"); */
  VSHADER_SOURCE = loadShaderFromFile("shaders/HW3_vertex.glsl");
  FSHADER_SOURCE = loadShaderFromFile("shaders/HW3_fragment.glsl");
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
  //gl.uniform3f(u_LightPosition, cameraPos[0],cameraPos[1],cameraPos[2]); //TEST

  //TEST FUNZIONE
  // Set the vertex coordinates, uvs and normals
  var n = initVertexBuffersCube(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }
  
//********************************************************************************************
  // creo una GUI con dat.gui
  var gui = new dat.GUI();
  // checkbox geometry
  var geometria = {cube:true,cone:false,cylinder:false,sphere:false,torus:false};
  //
  gui.add(geometria,'cube').onFinishChange(function(value) {
    // Fires when a controller loses focus.
	   if(value == true){
		geometria.cube = value;
		geometria.cone = false;
		geometria.cylinder = false;
		geometria.sphere = false;
		geometria.torus = false;
		console.log(geometria.cube + " " +geometria.cone);
    
    // Set the vertex coordinates, the color and the normal
		n = initVertexBuffersCube(gl);
		if (n < 0) {
			console.log('Failed to set the vertex information');
			return;
		}
	   }
	   // Iterate over all controllers
       for (var i in gui.__controllers) {
          gui.__controllers[i].updateDisplay();
       }
  });
  gui.add(geometria,'cone').onFinishChange(function(value) {
    // Fires when a controller loses focus.
	  if(value == true){
      geometria.cube = false;
      geometria.cone = value;
      geometria.cylinder = false;
      geometria.sphere = false;
      geometria.torus = false;
    }
    // Set the vertex coordinates, the color and the normal
		n = initVertexBuffersCone(gl);
		if (n < 0) {
			console.log('Failed to set the vertex information');
			return;
    } 
	  // Iterate over all controllers
    for (var i in gui.__controllers) {
      gui.__controllers[i].updateDisplay();
    }
  });
  gui.add(geometria,'cylinder').onFinishChange(function(value) {
      // Fires when a controller loses focus.
      if(value == true){
        geometria.cube = false;
        geometria.cone = false;
        geometria.cylinder = value;
        geometria.sphere = false;
        geometria.torus = false;
      }
      // Set the vertex coordinates, the color and the normal
      n = initVertexBuffersCylinder(gl);
      if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
      } 
      // Iterate over all controllers
      for (var i in gui.__controllers) {
        gui.__controllers[i].updateDisplay();
      }
  });
  gui.add(geometria,'sphere').onFinishChange(function(value) {
      // Fires when a controller loses focus.
      if(value == true){
        geometria.cube = false;
        geometria.cone = false;
        geometria.cylinder = false;
        geometria.sphere = value;
        geometria.torus = false;
      }
      // Set the vertex coordinates, the color and the normal
      n = initVertexBuffersSphere(gl);
      if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
      } 
      // Iterate over all controllers
      for (var i in gui.__controllers) {
        gui.__controllers[i].updateDisplay();
      }
  });
  gui.add(geometria,'torus').onFinishChange(function(value) {
      // Fires when a controller loses focus.
      if(value == true){
        geometria.cube = false;
        geometria.cone = false;
        geometria.cylinder = false;
        geometria.sphere = false;
        geometria.torus = value;
      }
      // Set the vertex coordinates, the color and the normal
      n = initVertexBuffersTorus(gl);
      if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
      } 
      // Iterate over all controllers
      for (var i in gui.__controllers) {
        gui.__controllers[i].updateDisplay();
      }
  });  
//*********************************************************************************************

  var currentAngle = 0.0;         // Current rotation angle
  var vpMatrix = new Matrix4();   // View projection matrix

  // Calculate the view projection matrix
  vpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  vpMatrix.lookAt(cameraPos[0],cameraPos[1],cameraPos[2], 0, 0, 0, 0, 1, 0);

  var modelMatrix = new Matrix4();    // Model matrix
  var mvpMatrix = new Matrix4();      // Model-View-Projection matrix
  var normalMatrix = new Matrix4();   // Transformation matrix for normals

  var tick = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle

    // Calculate the MODEL MATRIX
    modelMatrix.setRotate(currentAngle, 1, 0, 0); // Rotate around the y-axis
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

    requestAnimationFrame(tick, canvas); // Request that the browser calls tick
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
  var positions = new Float32Array([
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
  ]);

  // Normals
  var normals = new Float32Array([
     0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0, // v0-v1-v2-v3 front
     1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0, // v0-v3-v4-v5 right
     0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0, // v0-v5-v6-v1 up
    -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0, // v1-v6-v7-v2 left
     0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0, // v7-v4-v3-v2 down
     0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0  // v4-v7-v6-v5 back
  ]);

  // TexCoord
  var uvs = new Float32Array([
    1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,  // v0-v1-v2-v3 front
    0.0, 1.0,   0.0, 0.0,   1.0, 0.0,   1.0, 1.0,  // v0-v3-v4-v5 right
    1.0, 0.0,   1.0, 1.0,   0.0, 1.0,   0.0, 0.0,  // v0-v5-v6-v1 up
    1.0, 1.0,   0.0, 1.0,   0.0, 0.0,   1.0, 0.0,  // v1-v6-v7-v2 left
    0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0,  // v7-v4-v3-v2 down
    0.0, 0.0,   1.0, 0.0,   1.0, 1.0,   0.0, 1.0   // v4-v7-v6-v5 back
  ]);
  
  // Indices of the vertices
  var indices = new Uint16Array([
     0, 1, 2,   0, 2, 3,    // front
     4, 5, 6,   4, 6, 7,    // right
     8, 9,10,   8,10,11,    // up
    12,13,14,  12,14,15,    // left
    16,17,18,  16,18,19,    // down
    20,21,22,  20,22,23     // back
 ]);

  // Write the vertex property to buffers (coordinates and normals)
  // Same data can be used for vertex and normal
  // In order to make it intelligible, another buffer is prepared separately
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(positions), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(normals), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_TexCoord', new Float32Array(uvs)      , gl.FLOAT, 2)) return -1;

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



function initVertexBuffersCone(gl) { // Create a cone
  var r = 1.2;
  var h = 2.4;
  var n = 100;

  var angleStep = 2* Math.PI / n;
  var p = [r, -1.0, 0.0];
  var spike = [0.0, h-p[1], 0.0]; //asse cono = asse y
  
  var points = [];
  var uvs = [];
  var normals = [];
  var indices = [];
  
  
  //SUPERFICIE LATERALE
  //La punta viene replicata ad ogni step per poter mantenere "dritta" la texture
  for (var i=0; i <= n; i++) {
    var angle = i* angleStep;

    //Coordinate
    var x = r * Math.sin(angle);
    var y = p[1];
    var z = r * Math.cos(angle);    
    points.push(x, y, z);
    points.push(spike[0], spike[1]-2, spike[2]);
    
    //Texture
    uvs.push(i/n, 0);
    uvs.push(i/n, 1);


    //Normali
    var alpha = Math.atan(h/r); //angolo formato dal lato col raggio della base
    var b = Math.sin(alpha);    //base del triangolo formato da normale e raggio della base
    x = b * Math.sin(angle);
    y = Math.cos(alpha); //se alpha = PI/2 -> cilindro -> y = 0;
    z = b * Math.cos(angle);

    normals.push(x, y, z);
    normals.push(x, y, z);

    //Indices
    indices.push(2*i, 2*i+1, 2*i+2);
  }
  indices[indices.length-1] = 0; //collega l'ultimo triangolo con il primo


  //BASE
  //bisogna replicare i punti perchè le uv della base sono diverse da quelle nella sup. laterale
  var BASE_OFFSET = n*2+2;

  //inserisco centro
  points.push(spike[0], p[1], spike[2]);
  uvs.push(0.5, 0.5);
  normals.push(0, -1, 0);

  //Inserisco gli altri punti (stesse coordinate della sup. laterale)
  for (var i=1; i <=n; i++) {
    var angle = i*angleStep;

    //Coordinate
    var x = r * Math.cos(angle);
    var y = p[1];
    var z = r * Math.sin(angle);
    points.push(x, y, z);

    //Texture
    uvs.push(0.5 + Math.cos(angle)/2 , 0.5 + Math.sin(angle)/2);
    
    //Normali
    normals.push(0, -1, 0);

    //Indici
    indices.push(BASE_OFFSET); //centro della base
    indices.push(BASE_OFFSET + i);
    indices.push(BASE_OFFSET + i+1);
  }
  indices[indices.length-1] = BASE_OFFSET + 1; //collega l'ultimo triangolo con il primo


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

function initVertexBuffersCylinder(gl) { // Create a cylinder
  var n = 170;
  var r = 1.0;
  var h = 1.8;

  var vertices = [];
  var uvs = [];
  var normals = [];
  var indices = [];
   
  var angleStep = 2 * Math.PI / n;
  var bc = [0.0, -h/2, 0.0]; //centro base inferiore

  //BASI
  //Base INFERIORE
  //faccio n+1 rotazioni così è più semplice calcolare gli indici per disegnare l'ultima faccia
  //il consumo di di memoria è minimo (4 vertici) ma il codice è molto più chiaro e compatto
  vertices.push(bc[0], bc[1], bc[2]); //centro base inferiore -> indice 0
	normals.push(0.0, -1.0, 0.0);
  uvs.push(0.5, 0.5);
  
  for(var i = 0; i <= n; i++) { //calcola i vertici inferiori
    var angle = i * angleStep;

	  vertices.push(bc[0] + r * Math.cos(angle), bc[1], bc[0] + r * Math.sin(angle));
    normals.push(0.0, -1.0, 0.0);
    uvs.push(0.5 + Math.cos(angle)/2, 0.5 + Math.sin(angle)/2);
	} //ora ci sono 1 + n+1 = n+2 vertici
  
  //Base SUPERIORE
	vertices.push(bc[0], bc[1] + h, bc[2]); //centro base superiore -> indice 1+n+1 = n+2
  normals.push(0.0, 1.0, 0.0);
  uvs.push(0.5, 0.5);
  
  for(var i = 0; i <= n; i++) { //calcola i vertici superiori
    var angle = i * angleStep;

		vertices.push(bc[0] + r * Math.cos(angle), bc[1]+h, bc[2] + r * Math.sin(angle));
		normals.push(0.0, 1.0, 0.0);
    uvs.push(0.5 + Math.cos(angle)/2, 0.5 - Math.sin(angle)/2);
	}

  //SUPERFICIE LATERALE
  //WebGL associa le normali ai vertici con lo stesso indice nel buffer object
  //Bisogna inserirli più volte nel buffer object per poter usare più normali per lo stesso punto
  for(var i = 0; i <= n; i++) { //indici iniziano da 1+(n+1)+1+(n+1) = 2n+4 = 2(n+2)
    angle = i * angleStep;

    //giù
    vertices.push(bc[0] + r * Math.sin(angle), bc[1], bc[2] + r * Math.cos(angle));
    normals.push(Math.sin(angle), 0.0, Math.cos(angle));
    uvs.push(i/n, 0);
    
		//su
    vertices.push(bc[0] + r * Math.sin(angle), bc[1]+h, bc[2] + r * Math.cos(angle));
		normals.push(Math.sin(angle), 0.0, Math.cos(angle));
    uvs.push(i/n, 1);
	} 


	//INDICI
  var TOP_FAN_OFFSET = n+2; //è anche l'indice del centro della base superiore
  //basi
	for (var i = 1; i <= n; i++) {
    indices.push(0, i, i+1); //base inferiore
    indices.push(TOP_FAN_OFFSET, TOP_FAN_OFFSET+i, TOP_FAN_OFFSET+i+1); //base superiore
  }
  //superficie laterale
  var SIDE_OFFSET = (n+2)*2;
	for (i=0; i < 2*n; i++) {
    indices.push(SIDE_OFFSET+i, SIDE_OFFSET+i+1, SIDE_OFFSET+i+2);
  }
  
  
  //SEND DATA TO SHADERS
  // Write the vertex property to buffers (coordinates and uvs)
  if (!initArrayBuffer(gl, 'a_Position', new Float32Array(vertices), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', new Float32Array(normals), gl.FLOAT, 3)) return -1;
  if (!initArrayBuffer(gl, 'a_TexCoord', new Float32Array(uvs), gl.FLOAT, 2)) return -1;

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


function initVertexBuffersSphere(gl) { // Create a sphere
  var r = 1.5;
  var n = 70;

  var angleStep = Math.PI / n;
  var points = [];
  var normals = [];
  var uvs = [];
  var indices = [];
  
  for (var i = 0; i <= n; i++) { //rotazione XY
    var angleXY = i * 2*angleStep
    var sinXY = Math.sin(angleXY);
    var cosXY = Math.cos(angleXY);
    for (var j = 0; j <= n; j++) { //rotazione Z
      var angleZ = j * angleStep; //con 2*PI/n disegna due diagonali nelle facce perchè il cerchio ruota attorno al diametro
      var sinZ = Math.sin(angleZ);
      var cosZ = Math.cos(angleZ);

      //Vertici
      var x = r * cosXY * sinZ;
      var z = r * sinXY * sinZ;
      var y = r * cosZ; //scambio y e z per tenere i poli in verticale
      points.push(x, y, z)

      //Normali
      //le normali ai pti hanno la stessa direzione del raggio, ma modulo unitario
      //posso trovarle facilmente calcolando il vett. raggio e dividendolo per il modulo, che è noto: r
      //In generale:
      //vett_raggio = pto - centro;                 -> normale = (pto-centro)/r
      //normals.push((x-c[0])/r, (y-c[0])/r, (z-c[0])/r);
      
      //Ma questa sfera è centrata nell'origine     -> normale = pto/r
      normals.push(x/r, y/r, z/r);
    
      //Texture
      uvs.push(1-i/n, 1-j/n); //Inverto le coordinate per mantenere "dritta" la texture sulla sup. esterna

      //Indici
      var p1 = i * (n+1) + j; //i*(n) è il primo pto dello strato i-esimo. +j per iterare su tutti i pti di quello strato
      var p2 = p1 + (n+1);  //pto sopra a p1 = pto in posizione analoga a p1 nello strato successivo

      //indices.push(i*n+j) //test punti
      if (i < n && j < n) { //mi fermo prima altrimenti drawElements va fuori dal buffer
        indices.push(p1, p2, p1 + 1);
        indices.push(p1 + 1, p2, p2 + 1);
      }
    }
  }

  //SEND DATA TO SHADERS
  // Write the vertex property to buffers (coordinates and normals)
  // Same data can be used for vertex and normal
  // In order to make it intelligible, another buffer is prepared separately
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


function initVertexBuffersTorus(gl) { // Create a torus
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
      points.push(x,y,z);
      //points.push(x-cx,y-cy,z-cz); //ehm figura strana :/
      
      //Normali
      
      // Alternativa casalinga al metodo delle derivate parziali alle eq parametriche
      // Idea originale: https://www.gamedev.net/forums/topic/437251-calculate-surface-normal-vector/ (Zipster, 3o post)
      // Possiamo visualizzare le normali a una superficie toroidale come un toro con raggio dell'anello = 1
      // Il loro orientamento nello spazio non cambia al variare del raggio del buco, perciò
      // se le applichiamo tutte all'origine esse descrivono una sfera unitaria (in realtà, due sfere sovrapposte)
      // Possiamo quindi usare l'equazione parametrica della sfera per trovarle.
      // Inoltre fissando r=1.0 evitiamo di dover normalizzare il vettore risultante
      x = (1.0 * cosPHI) * cosTHETA; //metto r = 1.0 per rendere più chiara la formula
      y = (1.0 * cosPHI) * sinTHETA;
      z = 1.0 * sinPHI;
      //var norm2 = Math.sqrt(x*x + y*y + z*z); //se r=1, non serve la normalizzazione
      //normals.push(x/norm2, y/norm2, z/norm2);
      normals.push(x, y, z);

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
  image.src = './textures/03a.jpg';
  image.src = './textures/lightingtest.png';
  image.src = './textures/ash_uvgrid01.jpg';
  
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