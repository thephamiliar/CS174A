var canvas;
var gl;
var points = [];
var snow = [];
var NumTimesToSubdivide = 4;
var loc;
var matrix;
var deg = 0;
var type = 1;

// Requirement 3. Implement the Sierpinski Gasket algorithm
/* display one triangle*/
function triangle (a,b,c) {
	points.push(a,b,c);
}

function divideTriangle (a,b,c,count) {
	//check for end of recursion
	if (count <= 0) {
		triangle(a,b,c);
	} else {
		//bisect the sides
		var ab = mix (a,b,0.5);
		var ac = mix (a,c,0.5);
		var bc = mix (b,c,0.5);

		//three new triangles
		divideTriangle(a,ab,ac,count-1);
		divideTriangle(c,ac,bc,count-1);
		divideTriangle(b,bc,ab,count-1);
	}
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	if (type == 0) {
		gl.drawArrays(gl.TRIANGLES, 0, points.length);
    } else {
		gl.drawArrays(gl.LINES, 0, snow.length);
    }
}

//Extra Credit 1. Implement an application based color variable that can be passed
//through to the fragment shader.
function colorPicker() {
	return vec4(Math.random(), Math.random(), Math.random(), 1.0);
}

  //Extra Credit 3. Implement another fractal.
function drawSnowflake(vertices, count){
	for (i = 1; i < count; i++) {
		var j = Math.floor((Math.random()*6) + 1) + 1;
		var flake = mix(snow[i-1], vertices[j], 0.3);
		snow.push(flake);
	}
}

function gasket() {
	// Initial triangle for Sierpinski Gasket
	var vertices = [ vec2(-0.5,-0.5), vec2(0.5,-0.5), vec2(0.0,0.5) ];
	divideTriangle (vertices[0], vertices[1], vertices[2], NumTimesToSubdivide);

	// Configure WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 ); 

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    matrix = gl.getUniformLocation(program, "vMatrix");
    var rot = rotate(deg, 0, 1, 0);
    gl.uniformMatrix4fv(matrix, false, flatten(rot));

	//Extra Credit 1. Implement an application based color variable that can be passed
	//through to the fragment shader.
    loc = gl.getUniformLocation(program, "vColor");
   	var color = colorPicker();
    if (loc != -1)
    	gl.uniform4fv(loc, color);
    
    // Load the data into the GPU
    var vBufferID = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferID );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
}

function koch() {
	// Initial triangle for Sierpinski Gasket
	var vertices = [ vec2(1,0), vec2(0.5,0.866), vec2(-0.5,0.866),
					 vec2(-1,0), vec2(-0.5,-0.866), vec2(0.5, -0.866) ];
	var origin = vec2 (0.25, 0.5);
	snow.push(origin);
	snow.push(vertices[0]);
	snow.push(vertices[1]);
	snow.push(vertices[2]);

		//drawSnowflake (vertices, NumTimesToSubdivide);
	//divideTriangle (vertices[0], vertices[1], vertices[2], NumTimesToSubdivide);

	// Configure WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 ); 

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    matrix = gl.getUniformLocation(program, "vMatrix");
    var rot = rotate(deg, 0, 1, 0);
    gl.uniformMatrix4fv(matrix, false, flatten(rot));

	//Extra Credit 1. Implement an application based color variable that can be passed
	//through to the fragment shader.
    loc = gl.getUniformLocation(program, "vColor");
   	var color = colorPicker();
    if (loc != -1)
    	gl.uniform4fv(loc, color);
    
    // Load the data into the GPU
    var vBufferID = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferID );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(snow), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

}

// Initialize canvas and shaders
window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert ("WebGL isn't available"); }

    koch();

	window.onkeydown = function (e){
    	var key = e.keyCode ? e.keyCode : e.which;

    	//Extra Credit 2. Implement	a method where the keyboard is used	to
    	//change that color variable and redisplay.
		if (key == 32) {
		   	var color = colorPicker();
	 		gl.uniform4fv(loc, color);
 			render();
		} 
		// Extra Credit 3. Switch between the two fractals
		else if (key == 37) {
			gasket();
			type = 0;
			render();
		} else if (key == 39) {
			koch();
			type = 1;
			render();
		// Extra Credit 4. Rotate fractal
		}  else if (key == 82) {
			deg += 30;
			var rot = rotate(deg, 0, 0, 1);
		    gl.uniformMatrix4fv(matrix, false, flatten(rot));
		    render();
		}
	}

    render();
  }