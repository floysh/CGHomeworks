// Studente: Davide Civolani    MAT:121425

// VERTEX SHADER
var VSHADER_SOURCE = 
'attribute vec4 a_Position;'	+
'attribute vec4 a_Normal;   '	+
'  '	+
'uniform mat4 u_MvpMatrix;  '	+
'uniform mat4 u_ModelMatrix;    // Model matrix'	+
'uniform mat4 u_NormalMatrix;   // Transformation matrix of the normal'	+
'uniform vec3 u_LightColor;      // Light color'	+
'uniform vec3 u_LightPosition;  // Position of the light source'	+
'uniform vec3 u_AmbientLight;   // Ambient light color'	+
'uniform vec3 u_DiffuseMat;      // Diffuse material color'	+
'uniform vec3 u_SpecularMat;     // Specular material color'	+
'uniform float u_Shininess;      // Specular material shininess'	+
'uniform vec3 u_AmbientMat;      // Ambient material color'	+
'uniform vec3 u_CameraPos;       // Camera Position'	+
''	+
'varying vec4 vertexPosition;'	+
'varying vec3 v_normal;'	+
''	+
'varying vec3 v_LightColor;      // Light color'	+
'varying vec3 v_LightPosition;  // Position of the light source'	+
'varying vec3 v_AmbientLight;   // Ambient light color'	+
'varying vec3 v_DiffuseMat;      // Diffuse material color'	+
'varying vec3 v_SpecularMat;     // Specular material color'	+
'varying float v_Shininess;      // Specular material shininess'	+
'varying vec3 v_AmbientMat;      // Ambient material color'	+
'varying vec3 v_CameraPos;       // Camera Position'	+
''	+
''	+
'void main() {                '	+
'  gl_Position = u_MvpMatrix * a_Position;'	+
''	+
'  // Calculate world coordinate of vertex'	+
'  vertexPosition = u_ModelMatrix * a_Position;'	+
''	+
'  // Calculate a normal to be fit with a model matrix, and make it 1.0 in length'	+
'  v_normal = normalize(vec3(u_NormalMatrix * a_Normal));'	+
''	+
'  //Make data accessible from the fragment shader'	+
'  v_LightColor = u_LightColor;'	+
'  v_LightPosition = u_LightPosition;'	+
'  v_AmbientLight = u_AmbientLight;'	+
'  v_DiffuseMat = u_DiffuseMat;'	+
'  v_SpecularMat = u_SpecularMat;'	+
'  v_Shininess = u_Shininess;'	+
'  v_AmbientMat = u_AmbientMat;'	+
'  v_CameraPos = u_CameraPos;'	+
'}';

//FRAGMENT SHADER
var FSHADER_SOURCE = 
'#ifdef GL_ES'	+
'precision mediump float;'	+
'#endif'	+
''	+
'varying vec4 vertexPosition;'	+
'varying vec3 v_normal;'	+
''	+
'varying vec3 v_LightColor;      // Light color'	+
'varying vec3 v_LightPosition;  // Position of the light source'	+
'varying vec3 v_AmbientLight;   // Ambient light color'	+
'varying vec3 v_DiffuseMat;      // Diffuse material color'	+
'varying vec3 v_SpecularMat;     // Specular material color'	+
'varying float v_Shininess;      // Specular material shininess'	+
'varying vec3 v_AmbientMat;      // Ambient material color'	+
'varying vec3 v_CameraPos;       // Camera Position'	+
''	+
''	+
'void main() {'	+
'  float d = length(v_LightPosition - vec3(vertexPosition)); '	+
'  float atten = 1.0/(0.01 * d*d); '	+
''	+
'  // Calculate the light direction and make it 1.0 in length'	+
'  vec3 lightDirection = normalize(v_LightPosition - vec3(vertexPosition));'	+
'  // The dot product of the light direction and the normal'	+
'  float nDotL = max(dot(lightDirection, v_normal), 0.0);'	+
'     '	+
'  // Calculate the color due to diffuse reflection'	+
'  vec3 diffuse = v_LightColor * v_DiffuseMat * nDotL;'	+
'     '	+
'  // Calculate the color due to ambient reflection'	+
'  vec3 ambient = v_AmbientLight * v_AmbientMat;'	+
'  vec3 specular = vec3(0.0,0.0,0.0);             '	+
'   '	+
'  if(nDotL > 0.0) {                             '	+
'    // Calculate specular component'	+
'    vec3 h = normalize(normalize(v_CameraPos - vec3(vertexPosition)) + lightDirection); 	'	+
'    float hDotn  = max(dot(h, v_normal), 0.0);  '	+
'    specular = v_LightColor * v_SpecularMat * pow(hDotn,v_Shininess);'	+
'  }                                            '	+
'  // Add the surface colors due to diffuse reflection and ambient reflection'	+
'  gl_FragColor = vec4(atten *(diffuse + specular)  + ambient, 1.0); '	+
'}';


function loadShaderFromFile(filePath) { //Requires an HTTP server running
   xmlhttp = new XMLHttpRequest();
   xmlhttp.open("GET",filePath,false);
   xmlhttp.send(null);
   var fileContent = xmlhttp.responseText;
   
/*
   //print the GLSL file as string to embedd into a javascript source
   var fileArray = fileContent.split('\n');
   var SHADER_SOURCE = "";
   for (var i in fileArray) VSHADER_SOURCE = VSHADER_SOURCE + "'"+fileArray[i]+"'\t+\n";
   VSHADER_SOURCE = VSHADER_SOURCE + ";";
   console.log(VSHADER_SOURCE); 
*/

   return fileContent;
}


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
   VSHADER_SOURCE = loadShaderFromFile("shaders/HW3_vertex.glsl");
   FSHADER_SOURCE = loadShaderFromFile("shaders/HW3_fragment.glsl");
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
   modelMatrix.setRotate(currentAngle, 1, 1, 1); // Rotate around the y-axis

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

function initVertexBuffersCylinder(gl) {
   var n = 170;
   var r = 1.0;
   var h = 1.4;

	var vertices = [];
   var normals = [];
   var indices = [];
   
   var angleStep = 2 * Math.PI / n;
   var bc = [0.0, 0.0, 0.0]; //centro base inferiore

   //BASI
   //base inferiore
   //faccio n+1 rotazioni così è più semplice calcolare gli indici per disegnare l'ultima faccia
   //il consumo di di memoria è minimo (4 vertici) ma il codice è molto più chiaro e compatto
	vertices.push(bc[0], bc[1], bc[2]); //centro base inferiore -> indice 0
	normals.push(0.0, -1.0, 0.0);
	for(var i = 0; i <= n; i++) { //calcola i vertici inferiori
      angle = i * angleStep;
      
		vertices.push(bc[0] + r * Math.sin(angle), bc[1], bc[2] + r * Math.cos(angle));
		normals.push(0.0, -1.0, 0.0);
	} //ora ci sono 1 + n+1 = n+2 vertici

   //base superiore
	vertices.push(bc[0], bc[1] + h, bc[2]); //centro base superiore -> indice 1+n+1 = n+2
   normals.push(0.0, 1.0, 0.0);
	for(var i = 0; i <= n; i++) { //calcola i vertici superiori
      angle = i * angleStep;
      
		vertices.push(bc[0] + r * Math.sin(angle), bc[1]+h, bc[2] + r * Math.cos(angle));
		normals.push(0.0, 1.0, 0.0);
	}

   //SUPERFICIE LATERALE
   //WebGL associa le normali ai vertici con lo stesso indice nel buffer object
   //Bisogna inserirli più volte nel buffer object per poter usare più normali per lo stesso punto
   for(var i = 0; i <= n; i++) { //indici iniziano da 1+(n+1)+1+(n+1) = 2n+4 = 2(n+2)
      angle = i * angleStep;

		//giù
      vertices.push(bc[0] + r * Math.sin(angle), bc[1], bc[2] + r * Math.cos(angle));
		normals.push(Math.sin(angle), 0.0, Math.cos(angle));

		//su
      vertices.push(bc[0] + r * Math.sin(angle), bc[1]+h, bc[2] + r * Math.cos(angle));
		normals.push(Math.sin(angle), 0.0, Math.cos(angle));
	} 


	//INDICI
	//base inferiore
	for (var i = 1; i <= n; i++) {
      indices.push(0, i, i+1);
   }

	//base superiore
	TOP_FAN_OFFSET = n+2; //è anche l'indice del centro della base superiore
	for(var i = 1; i <= n; i++) {
      indices.push(TOP_FAN_OFFSET, TOP_FAN_OFFSET+i, TOP_FAN_OFFSET+i+1);
   }

   //superficie laterale
   var SIDE_OFFSET = (n+2)*2;
	for (i=0; i < 2*n; i++) {
      indices.push(SIDE_OFFSET+i, SIDE_OFFSET+i+1, SIDE_OFFSET+i+2);
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