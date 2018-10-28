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
  '  gl_PointSize = 5.0;\n' + // set point size
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
var colore; 
function main() {

  // creo una GUI con dat.gui
  var gui = new dat.GUI();
  // checkbox geometry
  var geometria = {triangle:true,square:false,circle:false,pentagon:false,hexagon:false};
  // color selector
  colore = {color0:[255,0,0]};
	
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

  // Set the clear color and enable the depth test
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables and so on
  var u_MvpMatrix      = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix ) { 
    console.log('Failed to get the storage location');
    return;
  }

  var vpMatrix = new Matrix4();   // View projection matrix
  var camPos = new Vector3([0.0,0.0,6.0]);
  // Calculate the view projection matrix
  vpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 1000);
  vpMatrix.lookAt(camPos.elements[0],camPos.elements[1],camPos.elements[2], 0, 0, 0, 0, 1, 0);
     
  var currentAngle = 0.0;  // Current rotation angle
  var modelMatrix = new Matrix4();  // Model matrix
  var mvpMatrix = new Matrix4();    // Model view projection matrix
  //*********************************************************************
  //
  // 
  // TEST FUNCTION
  var n = initVertexBuffersTriangle(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  gui.addColor(colore,'color0').onFinishChange(function(value) {
	console.log(colore.color0);
  });
  //
  gui.add(geometria,'triangle').onFinishChange(function(value) {
    // Fires when a controller loses focus.
	   if(value == true){
		geometria.triangle = value;
		geometria.square = false;
		geometria.circle = false;
		geometria.pentagon = false;
		geometria.hexagon = false;
		n = initVertexBuffersTriangle(gl);
	   }
	   // Iterate over all controllers
       for (var i in gui.__controllers) {
          gui.__controllers[i].updateDisplay();
       }
   });
  gui.add(geometria,'square').onFinishChange(function(value) {
    // Fires when a controller loses focus.
       // Fires when a controller loses focus.
	   if(value == true){
		geometria.triangle = false;
		geometria.square   = value;
		geometria.circle   = false;
		geometria.pentagon = false;
		geometria.hexagon  = false;
		n = initVertexBuffersSquare(gl);
	   }
	   // Iterate over all controllers
       for (var i in gui.__controllers) {
          gui.__controllers[i].updateDisplay();
       }
   });
  gui.add(geometria,'circle').onFinishChange(function(value) {
    // Fires when a controller loses focus.
       // Fires when a controller loses focus.
	   if(value == true){
		geometria.traingle = false;
		geometria.square   = false;
		geometria.circle   = value;
		geometria.pentagon = false;
		geometria.hexagon  = false;
		n = initVertexBuffersCircle(gl);
	   }
	   // Iterate over all controllers
       for (var i in gui.__controllers) {
          gui.__controllers[i].updateDisplay();
       }
   });
  gui.add(geometria,'pentagon').onFinishChange(function(value) {
    // Fires when a controller loses focus.
       // Fires when a controller loses focus.
	   if(value == true){
		geometria.traingle = false;
		geometria.square   = false;
		geometria.circle   = false;
		geometria.pentagon = value;
		geometria.hexagon  = false;
		n = initVertexBuffersPentagon(gl);
	   }
	   // Iterate over all controllers
       for (var i in gui.__controllers) {
          gui.__controllers[i].updateDisplay();
       }
   });
  gui.add(geometria,'hexagon').onFinishChange(function(value) {
    // Fires when a controller loses focus.
       // Fires when a controller loses focus.
	   if(value == true){
		geometria.traingle = false;
		geometria.square   = false;
		geometria.circle   = false;
		geometria.pentagon = false;
		geometria.hexagon  = value;
		n = initVertexBuffersHexagon(gl);
	   }
	   // Iterate over all controllers
       for (var i in gui.__controllers) {
          gui.__controllers[i].updateDisplay();
       }
   });
  //*********************************************************************************
  var tick = function() {
	  	
    currentAngle = animate(currentAngle);  // Update the rotation angle
    //currentAngle = 0; //TEST
    // Calculate the model matrix
    modelMatrix.setRotate(currentAngle, 0, 1, 0); // Rotate around the y-axis
	
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the cube
    //gl.drawElements(gl.POINTS, n, gl.UNSIGNED_SHORT, 0); //test
    //gl.drawElements(gl.LINE_LOOP, n, gl.UNSIGNED_SHORT, 0); //test
    gl.drawElements(gl.TRIANGLE_FAN, n, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(tick, canvas); // Request that the browser ?calls tick
  };
  tick();
}
/************************************************************/
/* initVertexBuffersTriangle(gl): create triangle */
/************************************************************/
function initVertexBuffersTriangle(gl) {
	
  // Coordinates
  var vertices = new Float32Array([
	 0.0, 2.0*Math.sqrt(3.0)/3.0, 0.0, //v0
	-1.0,    -Math.sqrt(3.0)/3.0, 0.0, //v1
	 1.0,    -Math.sqrt(3.0)/3.0, 0.0  //v2
   ]);
   var n = 3;

  // Colors
  var vertexcolor = [];
  for (var i=0; i< n ; i++) {
    vertexcolor.push(colore.color0[0] / 255); //red
    vertexcolor.push(colore.color0[1] / 255); //green
    vertexcolor.push(colore.color0[2] / 255); //blue
  }
  var colors = new Float32Array(vertexcolor);

  // Indices of the vertices
  var indices = new Uint16Array([
	0,1,2
  ]);

  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
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
/************************************************************/
/* initVertexBuffersSquare(gl): create square */
/************************************************************/
function initVertexBuffersSquare(gl) {
    // Coordinates
    var vertices = new Float32Array([
       1.0,  1.0 ,0.0, //v0 upper right
      -1.0,  1.0, 0.0, //v1 upper left
      -1.0, -1.0, 0.0, //v2 bottom left
       1.0, -1.0, 0.0 //v3 bottom right
      ]);
    var n = 4;
    
    // Colors
    var vertexcolor = [];
    for (var i=0; i < n ; i++) {
      vertexcolor.push(colore.color0[0] / 255); //red
      vertexcolor.push(colore.color0[1] / 255); //green
      vertexcolor.push(colore.color0[2] / 255); //blue
    }
    var colors = new Float32Array(vertexcolor);
   
     // Indices of the vertices
     var indices = new Uint16Array([
     0,1,2, 
     0,3,2
     ]);
   
     // Write the vertex property to buffers (coordinates, colors and normals)
     if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
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
/************************************************************/
/* initVertexBuffersCircle(gl): create circle */
/************************************************************/
function initVertexBuffersCircle(gl) {
  var p = [1.0, 0.0];
  var n = 360;
  var anglestep = 2* Math.PI / n;

  // Calculate points and colors
  var colors = [];
  var points = [];
  var indices = [];
  for (var i=0; i < n ; i++) {
    //Find points coordinates rotating a known one by 360/n degrees each step
    points.push( p[0] *Math.cos(i*anglestep) - p[1] *Math.sin(i*anglestep));
    points.push( p[0] *Math.sin(i*anglestep) + p[1] *Math.cos(i*anglestep));
    points.push(0.0);
    //Colors
    colors.push(colore.color0[0] / 255); //red
    colors.push(colore.color0[1] / 255); //green
    colors.push(colore.color0[2] / 255); //blue
    //Indexes (for using TRIANGLE_FAN)
    indices.push(i);
  }
  points = new Float32Array(points);
  colors = new Float32Array(colors);

  // Indices of the "triangle fan"
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
/************************************************************/
/* initVertexBuffersPentagon(gl): create pentagon */
/************************************************************/
function initVertexBuffersPentagon(gl) {
  var R = 1/(2*Math.cos(54 * Math.PI/180)); //radius
  var a = R * Math.cos(36 * Math.PI/180); //apotema
  var v0 = [-0.5,-a]; //known vertex position (bottom left)

/*   var WRONGvertices = new Float32Array([
     0.0, R, 0.0,    //v0 top vertex
     a*Math.sin(72*Math.PI/180), a*Math.cos(72*Math.PI/180), 0.0,    //v1 top right vertex (rotate top vertex left for 360/5 = 72 degrees)
      0.5, -a, 0.0,   //v2 bottom right vertex
     -0.5, -a, 0.0,   //v3 bottom left vertex
     -a*Math.sin(72*Math.PI/180), a*Math.cos(72*Math.PI/180), 0.0,   //v4 top left vertex
   ]); */
  var n = 5;

 // Calculate coordinates and colors
 var vertexcolor = [];
 var vertices = []; 
 for (var i=0; i < n ; i++) {
   //Find vertices coordinates rotating a known vertex by 360/n degrees each step
   vertices.push(v0[0] *Math.cos(i*72 *Math.PI/180) + v0[1] *Math.sin(i*72 *Math.PI/180));
   vertices.push(-v0[0] *Math.sin(i*72 *Math.PI/180) + v0[1] *Math.cos(i*72 *Math.PI/180));
   vertices.push(0.0);
   //Colors
   vertexcolor.push(colore.color0[0] / 255); //red
   vertexcolor.push(colore.color0[1] / 255); //green
   vertexcolor.push(colore.color0[2] / 255); //blue
 }
 //console.log(vertices);
 var testcolors = [
  //TEST
  1,0,0, //v0 rosso
  0,1,0, //v1 verde
  0,0,1, //v2 blu
  1,1,1, //v3 bianco biango piango
  1,1,0 //v4 giallo 
  ];

 var vertices = new Float32Array(vertices);
 var colors = new Float32Array(vertexcolor);

  // Indices of the vertices
  var indices = new Uint16Array([
    //TEST gl.TRIANGLES
    /* 0,1,2, //left triangle
    2,0,4, //middle triangle
    4,3,2  //right triangle */
    
    //TEST gl.TRIANGLE_FAN
    0,1,2,3,4

  ]);

  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
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
/************************************************************/
/* initVertexBuffersHexagon(gl): create hexagon */
/************************************************************/
function initVertexBuffersHexagon(gl) {
  // Calculate vertices coordinates
  var v0 = [1.0, 0.0];
  var v1 = [0.5, Math.sqrt(3)/2 ];

  var vertices = [
     v0[0],  v0[1], 0.0, //v0 far right
     v1[0],  v1[1], 0.0, //v1 top right
    -v1[0],  v1[1], 0.0, //v2 top left
    -v0[0],  v0[1], 0.0, //v3 far left
    -v1[0], -v1[1], 0.0, //v4 bottom left
     v1[0], -v1[1], 0.0  //v5 bottom right

  ]; 
  var n = 6;

  //Colors
  var vertexcolor = [];
  for (var i=0; i < n ; i++) {
    vertexcolor.push(colore.color0[0] / 255); //red
    vertexcolor.push(colore.color0[1] / 255); //green
    vertexcolor.push(colore.color0[2] / 255); //blue
  }

  var vertices = new Float32Array(vertices);
  var colors = new Float32Array(vertexcolor);

  // Indices of the vertices
  var indices = new Uint16Array([
     0,1,2,3,4,5
  ]);

  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
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
//*****************************************************************************
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
var ANGLE_STEP = 10.0;
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
