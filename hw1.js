//Esercitazione 1-1
"use strict;"

// VERTEX SHADER
var VSHADER_SOURCE = 
'attribute vec4 a_Position;\n' +
'attribute vec4 a_Color;\n' +
'varying vec4 v_Color;\n' + 
'void main() {\n' + 
'   gl_Position = a_Position;\n' + // Coordinates
'   v_Color = a_Color;\n' + // pass the color to the fragment shader
'   gl_PointSize = 5.0;\n' + // set point size
'}\n';

// FRAGMENT SHADER
var FSHADER_SOURCE = 
'#ifdef GL_ES\n' +
'precision mediump float;\n' +
'#endif\n' +
'varying vec4 v_Color;\n' +
'void main() {\n' + 
'   gl_FragColor = v_Color;\n' +
'}\n';

function main() {
  // Creating the color picker GUI
  var gui = new dat.GUI();
  var color = {color0:[255,0,0]};
  gui.addColor(color,'color0').onFinishChange(function(value) {
    //console.log(color.color0);
    });

	// Prepare the WebGL environment
	var canvas = document.getElementById('webgl');
	var gl = getWebGLContext(canvas);
	if(!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	// Initialize shaders
	if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)) {
		console.log('Failed to Initialize shaders.');
		return;
	}
	
	//Set the mouse click event to invoke the click() function
  canvas.onmousedown = function(ev) {click(ev,gl,canvas,color);}
  
  document.onkeypress = function(ev) { //Enable CTRL+Z
    if (ev.ctrlKey && ev.code == "KeyZ") {
      var len = g_vertex.length;
      if (len % (5*2) != 0) { //there is a spare vertex
        //keep the last vertex
        var sparevertex = [g_vertex[len-5],g_vertex[len-4], g_vertex[len-3],g_vertex[len-2],g_vertex[len-1]];
        
        //for (var i = 0; i < 3; i++) 
          undoPoint(ev,gl,canvas);
        //restore spare vertex
        //for (var i = 0; i < sparevertex.length; i++) g_vertex.push(sparevertex[i]);
      }
      else {//there are only complete triangles
        for (var i = 0; i < 2; i++) undoPoint(ev,gl,canvas);
      }
      // refresh scene
      gl.clear(gl.COLOR_BUFFER_BIT); //wipe all
      drawRectangle(gl); //re-draw all the rectangles!
    }
  }
	
	// specify the color for clearing <canvas>
	gl.clearColor(0.0,0.0,0.0,1.0);

	// clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  
}

//Global buffer to stores position and color of clicked points. 
var g_vertex = []; // 1 vertex = 5 fields [X,Y,R,G,B]

function click(ev,gl,canvas,color) {
	var x = ev.clientX;
	var y = ev.clientY;
	var rect = ev.target.getBoundingClientRect();
	
	//Align canvas coordinates to WebGL's reference system
	x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
	y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);

	//store the coords in g_points array
  g_vertex.push(x); g_vertex.push(y);
  
  //Normalize colors as WebGL color range is [0:1] instead of [0:255]
  var red = color.color0[0] / 255;
  var green = color.color0[1] / 255;
  var blue = color.color0[2] / 255;
  //console.log("red "+color.color0[0]+"green "+color.color0[1]+"blue "+color.color0[2]);
  
  //store the color in g_colors array
  g_vertex.push(red); g_vertex.push(green); g_vertex.push(blue);

  gl.clear(gl.COLOR_BUFFER_BIT); //empty canvas outside the for loop to prevent existing points to be wiped

  //drawPoints(gl,a_Position,a_Color); //test
  drawRectangle(gl);
}

function drawRectangle(gl) {
  // Get the storage location of attribute variables
	var a_Position = gl.getAttribLocation(gl.program,'a_Position');
	if(a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return;
  }
  var a_Color = gl.getAttribLocation(gl.program,'a_Color');
	if(a_Color < 0) {
		console.log('Failed to get the storage location of a_Color');
		return;
  }
  
  for (var j = 0; j < g_vertex.length; j += 5*2) {
    var n = 6;
    var rectangleVertex = new Float32Array ([
      //    X         Y        |      R           G           B
      g_vertex[j+0],g_vertex[j+1],    g_vertex[j+2],g_vertex[j+3],g_vertex[j+4], //upper sx
      g_vertex[j+5],g_vertex[j+1],    g_vertex[j+2],g_vertex[j+3],g_vertex[j+4],//g_vertex[j+2],g_vertex[j+3],g_vertex[j+4], //upper dx
      g_vertex[j+0],g_vertex[j+6],    g_vertex[j+2],g_vertex[j+3],g_vertex[j+4],//g_vertex[j+7],g_vertex[j+8],g_vertex[j+9], //bottom sx
      g_vertex[j+5],g_vertex[j+6],    g_vertex[j+2],g_vertex[j+3],g_vertex[j+4]//g_vertex[j+7],g_vertex[j+8],g_vertex[j+9],  //bottom dx
  
    ]);

    var rectangleIndex = new Uint8Array ([
      0,1,2, //left triangle
      3,1,2  //rigth triangle
    ]);

    //Create buffer objects (required to draw triangles!)
    var FSIZE = rectangleVertex.BYTES_PER_ELEMENT;
    var vertexBuffer = gl.createBuffer();
    var indexBuffer = gl.createBuffer();
    if(!vertexBuffer || !indexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); //bind the buffer object to target

    //Write data into buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,rectangleVertex,gl.STATIC_DRAW);

    //Assign buffer object to a_Position and a_Color
    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE * 5, 0);
    gl.vertexAttribPointer(a_Color,3,gl.FLOAT,false, FSIZE * 5, FSIZE * 2);
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Color);

    // Unbind the coordinates buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Write indexes into the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rectangleIndex, gl.STATIC_DRAW);

    //Draw the new rectangle
    gl.drawElements(gl.POINTS, n, gl.UNSIGNED_BYTE, 0); //show vertexes
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

  }
}

function undoPoint(ev,gl,canvas) { //CTRL + Z
  //console.log("Premuto ctrl+z");
  for (var i=0; i < 5; i++) g_vertex.pop();
  //update scene
  drawRectangle(gl);
}