// Codice1.js 
// implementazione modello di blinn phong
// GDD - 2017 
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Normal;\n'   +
  'uniform mat4 u_MvpMatrix;\n'  +
  'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
  'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
  'uniform vec3 u_LightColor;\n'   +   // Light color
  'uniform vec3 u_LightPosition;\n' +  // Position of the light source
  'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
  'uniform vec3 u_DiffuseMat;\n'   +   // Diffuse material color
  'uniform vec3 u_SpecularMat;\n'  +   // Specular material color
  'uniform float u_Shininess  ;\n' +   // Specular material shininess
  'uniform vec3 u_AmbientMat;\n'   +   // Ambient material color
  'uniform vec3 u_CameraPos;\n'    +   // Camera Position
  'varying vec4 v_Color;\n'        +
  'void main() {\n'                +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
     // Calculate a normal to be fit with a model matrix, and make it 1.0 in length
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
     // Calculate world coordinate of vertex
  '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
  '  float d = length(u_LightPosition - vec3(vertexPosition));\n' + 
  '  float atten = 1.0/(0.01 * d*d);\n' + 
     // Calculate the light direction and make it 1.0 in length
  '  vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
     // The dot product of the light direction and the normal
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
     // Calculate the color due to diffuse reflection
  '  vec3 diffuse = u_LightColor * u_DiffuseMat * nDotL;\n' +
     // Calculate the color due to ambient reflection
  '  vec3 ambient = u_AmbientLight * u_AmbientMat;\n' +
  '  vec3 specular = vec3(0.0,0.0,0.0);\n'            + 
  '  if(nDotL > 0.0) {\n'                             +
       // Calculate specular component
  '       vec3 h = normalize(normalize(u_CameraPos - vec3(vertexPosition)) + lightDirection);\n' + 	
  '       float hDotn  = max(dot(h, normal), 0.0);\n' +  
  '       specular = u_LightColor * u_SpecularMat * pow(hDotn,u_Shininess);\n' +
  '  }\n'                                           + 
     // Add the surface colors due to diffuse reflection and ambient reflection
  '  v_Color = vec4(atten *(diffuse + specular)  + ambient, 1.0);\n' + 
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
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

  //TEST FUNZIONE
  // Set the vertex coordinates, the color and the normal
  var n = initVertexBuffersCylinder(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
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
  var u_AmbientLight  = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  var u_DiffuseMat    = gl.getUniformLocation(gl.program, 'u_DiffuseMat');
  var u_SpecularMat   = gl.getUniformLocation(gl.program, 'u_SpecularMat');
  var u_Shininess     = gl.getUniformLocation(gl.program, 'u_Shininess');
  var u_AmbientMat    = gl.getUniformLocation(gl.program, 'u_AmbientMat');
  var u_CameraPos     = gl.getUniformLocation(gl.program, 'u_CameraPos');
  if (!u_ModelMatrix || !u_MvpMatrix   || !u_NormalMatrix || 
      !u_LightColor || !u_LightPosition　|| !u_AmbientLight ||
	  !u_DiffuseMat  || !u_SpecularMat || !u_Shininess || !u_AmbientMat || !u_CameraPos) { 
    console.log('Failed to get the storage location');
    return;
  }
  // ******************************************************************************************
  // Set the Specular and Diffuse light color 
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // Set the light direction (in the world coordinate)
  gl.uniform3f(u_LightPosition, 1.0, 2.0, 12.0);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);
  
  // Set the ambient material
  gl.uniform3f(u_AmbientMat, 0.329412, 0.223529, 0.027451);
  // Set the diffuse material
  gl.uniform3f(u_DiffuseMat, 0.780392, 0.780392, 0.113725);
  // Set the specular material
  gl.uniform3f(u_SpecularMat, 0.992157	, 0.941176, 0.807843);

   // Set the specular material
  gl.uniform1f(u_Shininess, 0.21794872*128);
  
   var cameraPos = [1,3,8];          // camera position 
  // Set the camera position
  gl.uniform3f(u_CameraPos, cameraPos[0],cameraPos[1],cameraPos[2]);
  //********************************************************************************************
  //*********************************************************************
  // creo una GUI con dat.gui
  var gui = new dat.GUI();
  // checkbox geometry
  var materiali = {
     emerald:false,
     jade:false,
     obsidian:false,
     pearl:false,
     ruby:false,
     turquoise:false,
     brass:true,
     chrome:false,
     copper:false,
     bronze:false,
     silver:false,
     gold:false
   };
  //
   gui.add(materiali,'emerald').onFinishChange(function(value) {
       // Fires when a controller loses focus.
	   if(value == true){
         // Set the material properties
         gl.uniform3f(u_AmbientMat, 0.0215, 0.1745, 0.0215);
         gl.uniform3f(u_DiffuseMat, 0.07568, 0.61424, 0.07568);
         gl.uniform3f(u_SpecularMat, 0.633, 0.727811, 0.633);
         gl.uniform1f(u_Shininess, 0.6*128);
         //Update GUI   
         for(var i in materiali) materiali[i]=false;
         materiali.emerald=true;
         console.log("emerald");
	   }
	   // Iterate over all controllers
      for (var i in gui.__controllers) {
         gui.__controllers[i].updateDisplay();
      }
   });
   gui.add(materiali,'jade').onFinishChange(function(value) {
       // Fires when a controller loses focus.
	   if(value == true){
         // Set the material properties
         gl.uniform3f(u_AmbientMat, 0.135, 0.2225, 0.1575);
         gl.uniform3f(u_DiffuseMat, 0.54, 0.89, 0.63);
         gl.uniform3f(u_SpecularMat, 0.316228, 0.316228, 0.316228);
         gl.uniform1f(u_Shininess, 0.1*128);
         //Update GUI   
         for(var i in materiali) materiali[i]=false;
         materiali.jade=true;
         console.log("jade");		
	   }
	   // Iterate over all controllers
      for (var i in gui.__controllers) {
         gui.__controllers[i].updateDisplay();
      }
   });
   gui.add(materiali,'obsidian').onFinishChange(function(value) {
      if(value == true){
         // Set the material properties
         gl.uniform3f(u_AmbientMat, 0.05375, 0.05, 0.06625);
         gl.uniform3f(u_DiffuseMat, 0.18275, 0.17, 0.22525);
         gl.uniform3f(u_SpecularMat, 0.332741, 0.328634, 0.346435);
         gl.uniform1f(u_Shininess, 0.3*128);
         //Update GUI
         for(var i in materiali) materiali[i]=false;
         materiali.obsidian=true;
         console.log("obsidian");		   
      }
      // Iterate over all controllers
      for (var i in gui.__controllers) {
         gui.__controllers[i].updateDisplay();
      }
   });
   gui.add(materiali,'pearl').onFinishChange(function(value) {
      if(value == true){
         // Set the material properties
         gl.uniform3f(u_AmbientMat, 0.25, 0.20725, 0.20725);
         gl.uniform3f(u_DiffuseMat, 1.0, 0.829, 0.829);
         gl.uniform3f(u_SpecularMat, 0.296648, 0.296648, 0.296648);
         gl.uniform1f(u_Shininess, 0.088*128);
         //Update GUI
         for(var i in materiali) materiali[i]=false;
         materiali.pearl=true;
         console.log("pearl");		   
      }
      // Iterate over all controllers
      for (var i in gui.__controllers) {
         gui.__controllers[i].updateDisplay();
      }
   });
   gui.add(materiali,'ruby').onFinishChange(function(value) {
      if(value == true){
         // Set the material properties
         gl.uniform3f(u_AmbientMat, 0.1745, 0.01175, 0.01175);
         gl.uniform3f(u_DiffuseMat, 0.61424, 0.04136, 0.04136);
         gl.uniform3f(u_SpecularMat, 0.727811, 0.626959, 0.626959);
         gl.uniform1f(u_Shininess, 0.6*128);
         //Update GUI
         for(var i in materiali) materiali[i]=false;
         materiali.ruby=true;
         console.log("ruby");		   
      }
      // Iterate over all controllers
      for (var i in gui.__controllers) {
         gui.__controllers[i].updateDisplay();
      }
   });
   gui.add(materiali,'turquoise').onFinishChange(function(value) {
      if(value == true){
         // Set the material properties
         gl.uniform3f(u_AmbientMat, 0.1, 0.18725, 0.1745);
         gl.uniform3f(u_DiffuseMat, 0.396, 0.74151, 0.69102);
         gl.uniform3f(u_SpecularMat, 0.297254, 0.30829, 0.306678);
         gl.uniform1f(u_Shininess, 0.1*128);
         //Update GUI
         for(var i in materiali) materiali[i]=false;
         materiali.turquoise=true;
         console.log("turquoise");		   
      }
      // Iterate over all controllers
      for (var i in gui.__controllers) {
         gui.__controllers[i].updateDisplay();
      }
   });
   gui.add(materiali,'brass').onFinishChange(function(value) {
      // Fires when a controller loses focus.
	   if(value == true){
         //Set the material properties
         gl.uniform3f(u_AmbientMat, 0.329412, 0.223529, 0.027451);
         gl.uniform3f(u_DiffuseMat, 0.780392, 0.780392, 0.113725);
         gl.uniform3f(u_SpecularMat, 0.992157, 0.941176, 0.807843);
         gl.uniform1f(u_Shininess, 0.21794872*128);
         //Update GUI
         for(var i in materiali) materiali[i]=false;
         materiali.brass=true;
         console.log("brass");
	   }
	   // Iterate over all controllers
      for (var i in gui.__controllers) {
         gui.__controllers[i].updateDisplay();
      }
   });
   gui.add(materiali,'bronze').onFinishChange(function(value) {
      // Fires when a controller loses focus.
      if(value == true){
         //Set the material properties
         gl.uniform3f(u_AmbientMat, 0.2125, 0.1275, 0.054);
         gl.uniform3f(u_DiffuseMat, 0.714, 0.4284, 0.18144);
         gl.uniform3f(u_SpecularMat, 0.393548, 0.271906, 0.166721);
         gl.uniform1f(u_Shininess, 0.2*128);
         //Update GUI
         for(var i in materiali) materiali[i]=false;
         materiali.bronze=true;
         console.log("bronze");		   
      }
      // Iterate over all controllers
      for (var i in gui.__controllers) {
         gui.__controllers[i].updateDisplay();
      }
   });
   gui.add(materiali,'chrome').onFinishChange(function(value) {
      // Fires when a controller loses focus.
      if(value == true){
         //Set the material properties
         gl.uniform3f(u_AmbientMat, 0.25, 0.25, 0.25);
         gl.uniform3f(u_DiffuseMat, 0.4, 0.4, 0.4);
         gl.uniform3f(u_SpecularMat, 0.774597, 0.774597, 0.774597);
         gl.uniform1f(u_Shininess, 0.6*128);
         //Update GUI
         for(var i in materiali) materiali[i]=false;
         materiali.chrome=true;
         console.log("chrome");		   
      }
      // Iterate over all controllers
      for (var i in gui.__controllers) {
         gui.__controllers[i].updateDisplay();
      }
   });
   gui.add(materiali,'copper').onFinishChange(function(value) {
      // Fires when a controller loses focus.
      if(value == true){
         //Set the material properties
         gl.uniform3f(u_AmbientMat, 0.19125, 0.0735, 0.0225);
         gl.uniform3f(u_DiffuseMat, 0.7038, 0.27048, 0.0828);
         gl.uniform3f(u_SpecularMat, 0.256777, 0.137622, 0.086014);
         gl.uniform1f(u_Shininess, 0.1*128);
         //Update GUI
         for(var i in materiali) materiali[i]=false;
         materiali.copper=true;
         console.log("copper");		   
      }
      // Iterate over all controllers
      for (var i in gui.__controllers) {
         gui.__controllers[i].updateDisplay();
      }
   });
   gui.add(materiali,'silver').onFinishChange(function(value) {
      // Fires when a controller loses focus.
	   if(value == true){
         //Set the material properties
         gl.uniform3f(u_AmbientMat, 0.19225, 0.19225, 0.19225);
         gl.uniform3f(u_DiffuseMat, 0.50754, 0.50754, 0.50754);
         gl.uniform3f(u_SpecularMat, 0.508273, 0.508273, 0.508273);
         gl.uniform1f(u_Shininess, 0.4*128);
         //Update GUI
         for(var i in materiali)	materiali[i]=false;
         materiali.silver=true;
         console.log("silver");
	   }
	   // Iterate over all controllers
      for (var i in gui.__controllers) {
         gui.__controllers[i].updateDisplay();
      }
   });
   gui.add(materiali,'gold').onFinishChange(function(value) {
      // Fires when a controller loses focus.
	   if(value == true){
         //Set the material properties
         gl.uniform3f(u_AmbientMat, 0.24725, 0.1995, 0.0745);
         gl.uniform3f(u_DiffuseMat, 0.75164, 0.60648, 0.22648);
         gl.uniform3f(u_SpecularMat, 0.628281, 0.555802, 0.366065);
         gl.uniform1f(u_Shininess, 0.4*128);
         //Update GUI
         for(var i in materiali)	materiali[i]=false;
         materiali.gold=true;
         console.log("gold");
	   }
	   // Iterate over all controllers
      for (var i in gui.__controllers) {
         gui.__controllers[i].updateDisplay();
      }
   });
  //*********************************************************************************
  
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
   modelMatrix.setRotate(currentAngle, 1, 1, 0); // Rotate around the y-axis

	// Pass the model matrix to u_ModelMatrix
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

	mvpMatrix.set(vpMatrix).multiply(modelMatrix);
	// Pass the model view projection matrix to u_MvpMatrix
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

	// Calculate the matrix to transform the normal based on the model matrix
	normalMatrix.setInverseOf(modelMatrix);
	normalMatrix.transpose();
	// Pass the transformation matrix for normals to u_NormalMatrix
	gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

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

  // Normal
  var normals = new Float32Array([
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
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
  if (!initArrayBuffer(gl, 'a_Normal'  , new Float32Array(normals)  , gl.FLOAT, 3)) return -1;
  
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

var points = [], normals = [], indices = []; 

function initVertexBuffersOLD(gl) {
   var p = [1.0, -0.6, 0.6]; //bottom base start point
   var bottomcenter = [0.0, p[1], 0.0];
   var h = 1.4;
   
   var n = 5;
   var angleStep = 2* Math.PI / n;
 
   points = [];
   normals = [];
   indices = [];
   var x,y,z,lunghezza;
 

   //push bottom base center
   points.push(bottomcenter[0]); points.push(bottomcenter[1]); points.push(bottomcenter[2]);
   normals.push(0.0); normals.push(0.0); normals.push(-1.0);
   
   for (var i=0; i < n; i++) { //calculate all points
     x = p[0] *Math.cos(i*angleStep) - p[2] *Math.sin(i*angleStep);
     y = p[1];
     z = p[0] *Math.sin(i*angleStep) + p[2] *Math.cos(i*angleStep);

     lunghezza = Math.sqrt(x*x + y*y +z*z);

     points.push(x); points.push(y); points.push(z); //bottom base
     points.push(x); points.push(y+h); points.push(z); //top base

     //bases normals
     normals.push(0.0); normals.push(-1.0); normals.push(0.0); //bottom base normal
     normals.push(0.0); normals.push(1.0); normals.push(0.0); //top base normal
     
     //BASE Indices
     //bases triangle(s)
     if (i > 0) { //add indices only after having a complete side rectangle (2 iterations for the first triangle, 1 for others)
       //bottom base
       indices.push(0);
       indices.push(2*i-1);
       indices.push(2*i+1);
       //upper base
       indices.push(2*n+1);
       indices.push(2*i);
       indices.push(2*i+2);
     }
   }

   c = [bottomcenter[0], bottomcenter[1] + h/2, bottomcenter[2]];
   
   //SIDE Indices and Normals
   for (i=0; i<=2*n+1; i++) {
     if (i+1 <= 2*n) indices.push(i+1);
     if (i+2 <= 2*n) indices.push(i+2);
     if (i+3 <= 2*n) indices.push(i+3);

      normals.push(Math.sin(i*angleStep));
      normals.push(0.0);
      normals.push(Math.cos(i*angleStep));

   }

   //push upper base center
   points.push(bottomcenter[0]); points.push(bottomcenter[1]+h); points.push(bottomcenter[2]);
   normals.push(0.0); normals.push(0.0); normals.push(1.0);

   //push missing triangles
   indices.push(0); indices.push(2*n-1); indices.push(1);    //missing bottom base triangle
   indices.push(2*n+1); indices.push(2*n); indices.push(2);  //missing top base triangle
   indices.push(2*n-1); indices.push(1); indices.push(2);    //missing bottom side triangle
   indices.push(2* n-1); indices.push(2*n); indices.push(2); //missing top side triangle
   
/*    for (var i=0; i<3; i++) normals.pop();
   normals.push(0.0); normals.push(0.0); normals.push(-1.0); */

 
   // Write the vertex property to buffers (coordinates and normals)
   // Same data can be used for vertex and normal
   // In order to make it intelligible, another buffer is prepared separately
   if (!initArrayBuffer(gl, 'a_Position', new Float32Array(points), gl.FLOAT, 3)) return -1;
   if (!initArrayBuffer(gl, 'a_Normal'  , new Float32Array(normals)  , gl.FLOAT, 3)) return -1;
  
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

function initVertexBuffersCylinder(gl) {
   var n = 70;
   var r = 1.0;
   var h = 1.4;

	var vertices = [];
   var normals = [];
   var indices = [];
   
   var angleStep = 2 * Math.PI / n;
   var bc = [0.0, 0.0, 0.0];//bottom centre: it shares x and z components with the top centre

   //BASES
	//bottom
	vertices.push(bc[0], bc[1], bc[2]); //bottom centre
	normals.push(0.0, -1.0, 0.0);
	for(var i = 0; i <= n; i++) { //bottom vertexes
      angle = i * angleStep;
      
		vertices.push(bc[0] + r * Math.sin(angle), bc[1], bc[2] + r * Math.cos(angle));
		normals.push(0.0, -1.0, 0.0);
	} 

   //top
	vertices.push(bc[0], bc[1] + h, bc[2]); //top centre
   normals.push(0.0, 1.0, 0.0);
	for(var i = 0; i <= n; i++) { //top vertexes
      angle = i * angleStep;
      
		vertices.push(bc[0] + r * Math.sin(angle), bc[1]+h, bc[2] + r * Math.cos(angle));
		normals.push(0.0, 1.0, 0.0);
	} 


   //SIDE
   //duplicated vertices are needed as WebGL associate a normal to the point in the same position in the buffer object
   for(var i = 0; i <= n; i++) {
      angle = i * angleStep;

		//bottom
      vertices.push(bc[0] + r * Math.sin(angle), bc[1], bc[2] + r * Math.cos(angle));
		normals.push(Math.sin(angle), 0.0, Math.cos(angle));

		//top
      vertices.push(bc[0] + r * Math.sin(angle), bc[1]+h, bc[2] + r * Math.cos(angle));
		normals.push(Math.sin(angle), 0.0, Math.cos(angle));
	} 


	//INDICES
	//bottom surface
	for (var i = 0; i < n; i++) {
      indices.push(0, i+1, i+2);
   }
	indices.push(0, 1, n+1);

	//top surface
	ipsopra = n+2;
	for(var i = 0; i < n; i++) {
      indices.push(n+2, i+n+3, i+n+4);
   }
	indices.push(n+2, n+3, (2*n)+3);

   //side surface links
   var rep_offset = (n+2)*2;
	for (i=0; i < 2*n; i++) {
      indices.push(i+(n+2)*2, i+(n+2)*2 +1, i+(n+2)*2 +2);
   }


   //SEND DATA TO SHADERS
	// Write the vertex property to buffers (coordinates and normals)
	if(!initArrayBuffer(gl, 'a_Position', new Float32Array(vertices), gl.FLOAT, 3)) return -1;
   if(!initArrayBuffer(gl, 'a_Normal',   new Float32Array(normals),  gl.FLOAT, 3)) return -1;
   
	// Unbind the buffer object
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// Write the indices to the buffer object
	var indexBuffer=gl.createBuffer();
	if(!indexBuffer) {
		console.log('Failed to create the buffer object');
		return false;
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
var ANGLE_STEP = 100.0;
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

function normalize(vertices) {
   var n = [0,0,0], normals = [];
   for (var i=0; i < vertices.length - 3; i++) {
      var a = i;
      var b = i + 2;
      var c = i + 3;

      n[0] = (b[1]-a[1]) * (c[2]-b[2]) - (b[2]-a[2]) * (c[1]-b[1]);
      n[1] = (b[2]-a[2]) * (c[0]-b[0]) - (b[0]-a[0]) * (c[2]-b[2]);
      n[2] = (b[0]-a[0]) * (c[1]-b[1]) - (b[1]-a[1]) * (c[0]-b[0]);

      normals.push(n[0]); normals.push(n[1]); normals.push(n[2]);
   }
   return normals;
}