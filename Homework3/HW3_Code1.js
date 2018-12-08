// HW3_Code1.js
// implementazione texture mapping
// GDD - 2017
// Vertex shader program
"use strict";

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
  var n = initVertexBuffersCone(gl);
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
  
  //********************************************************************************************
// creo una GUI con dat.gui
  var gui = new dat.GUI();
  // checkbox geometry
  var geometria = {cube:false,cone:true,cylinder:false,sphere:false,torus:false};
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

	// Calculate the model matrix
	modelMatrix.setRotate(currentAngle, 1, 0, 0); // Rotate around the y-axis

	mvpMatrix.set(vpMatrix).multiply(modelMatrix);
	// Pass the model view projection matrix to u_MvpMatrix
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

	// Clear color and depth buffer
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Draw the cube(Note that the 3rd argument is the gl.UNSIGNED_SHORT)
	gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);

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
  var positions = new Float32Array([
     1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0, // v0-v1-v2-v3 front
     1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0, // v0-v3-v4-v5 right
     1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0, // v1-v6-v7-v2 left
    -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0, // v7-v4-v3-v2 down
     1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0  // v4-v7-v6-v5 back
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
  var p = [1.0, -0.6, 0.0]; //p[0] -> raggio r
  var spike = [0.0, 1.5, 0.0];
  var n = 100;
  var angleStep = 2* Math.PI / n;

  var points = [];
  var uvs = [];
  var indices = [];


  //SUPERFICIE LATERALE
  //La punta viene replicata ad ogni step per poter mantenere "dritta" la texture
  for (var i=0; i <= n; i++) {
    var angle = -i*angleStep;
    var x = p[0] *Math.cos(angle) - p[2] *Math.sin(angle);
    var y = p[1];
    var z = p[0] *Math.sin(angle) + p[2] *Math.cos(angle);

    //Coordinate
    points.push(x, y, z);
    points.push(spike[0], spike[1], spike[2]);
    
    //Texture
    uvs.push(i/n, 0);
    uvs.push(i/n, 1);

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

  //Inserisco gli altri punti (stesse coordinate della sup. laterale)
  for (var i=1; i <=n; i++) {
    var angle = i*angleStep;

    //Coordinate
    points.push( p[0] *Math.cos(angle) - p[2] *Math.sin(angle));
    points.push( p[1]);
    points.push( p[0] *Math.sin(angle) + p[2] *Math.cos(angle));

    //Texture
    uvs.push(0.5 + (p[0]*Math.cos(angle))/2 , 0.5 + (p[0]*Math.sin(angle))/2);
    
    //Indici
    indices.push(BASE_OFFSET); //centro della base
    indices.push(BASE_OFFSET + i);
    indices.push(BASE_OFFSET + i+1);
  }
  indices[indices.length-1] = BASE_OFFSET + 1; //collega l'ultimo triangolo con il primo


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


function initVertexBuffersCylinder(gl) { // Create a cylinder
  var n = 170;
  var r = 1.0;
  var h = 1.4;

  var vertices = [];
  var uvs = [];
  var normals = [];
  var indices = [];
   
  var angleStep = 2 * Math.PI / n;
  var bc = [0.0, 0.0, 0.0]; //centro base inferiore

  //BASI
  //Base INFERIORE
  //faccio n+1 rotazioni così è più semplice calcolare gli indici per disegnare l'ultima faccia
  //il consumo di di memoria è minimo (4 vertici) ma il codice è molto più chiaro e compatto
  vertices.push(bc[0], bc[1], bc[2]); //centro base inferiore -> indice 0
	normals.push(0.0, -1.0, 0.0);
  uvs.push(0.5, 0.5);
  
  for(var i = 0; i <= n; i++) { //calcola i vertici inferiori
    var angle = i * angleStep;

	  vertices.push(bc[0] + r * Math.sin(angle), bc[1], bc[0] + r * Math.cos(angle));
    normals.push(0.0, -1.0, 0.0);
    uvs.push(0.5 + (r*Math.sin(angle))/2, 0.5 + (r*Math.cos(angle))/2);
	} //ora ci sono 1 + n+1 = n+2 vertici
  
  //Base SUPERIORE
	vertices.push(bc[0], bc[1] + h, bc[2]); //centro base superiore -> indice 1+n+1 = n+2
  normals.push(0.0, 1.0, 0.0);
  uvs.push(0.5, 0.5);
  
  for(var i = 0; i <= n; i++) { //calcola i vertici superiori
    var angle = i * angleStep;

		vertices.push(bc[0] + r * Math.sin(angle), bc[1]+h, bc[2] + r * Math.cos(angle));
		normals.push(0.0, 1.0, 0.0);
    uvs.push(0.5 + (r*Math.sin(angle))/2, 0.5 + (r*Math.cos(angle))/2);
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

  //SEND DATA TO SHADERS
  // Write the vertex property to buffers (coordinates and normals)
  // Same data can be used for vertex and normal
  // In order to make it intelligible, another buffer is prepared separately
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


function initVertexBuffersTorus(gl) { // Create a torus

  //SEND DATA TO SHADERS
  // Write the vertex property to buffers (coordinates and normals)
  // Same data can be used for vertex and normal
  // In order to make it intelligible, another buffer is prepared separately
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
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, 0);
  
  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
}