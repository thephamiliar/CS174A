var canvas;
var gl;
var points = [];
var branches = [];
var NumTimesToSubdivide = 2;
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
		gl.drawArrays(gl.LINES, 0, branches.length);
    }
}

//Extra Credit 1. Implement an application based color variable that can be passed
//through to the fragment shader.
function colorPicker() {
	return vec4(Math.random(), Math.random(), Math.random(), 1.0);
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

function drawLine(point, point2) {
	branches.push(point);
	branches.push(point2);
}

  //Extra Credit 3. Implement another fractal.
function divideBranches(point, angle, count){
	if (count > 0){
		var x2 = point[0] + (Math.cos(radians(angle)));
		var y2 = point[1] + (Math.sin(radians(angle)));
		var point2 = vec2(x2, y2);
		var x3 = x2 * -1;
		var point3 = vec2(x3, y2);
		drawLine(point, point2);
		drawLine(point, point3);
		divideBranches(point2, angle-5, count-1);
		divideBranches(point3, angle-5, count-1);
	}
}

function tree() {
	// Initial triangle for Sierpinski Gasket
	var root = vec2(0.0, -1.0);
	var origin = vec2(0.0, -0.9);
	drawLine(root,origin);
	divideBranches(origin, 70, 4);
	//branches.push(origin);
	//branches.push(vec2(0.0, 0.0));
	//branches.push(vec2(0.5, 0.0));
	//branches.push(vec2(0.5, 0.5));

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
    gl.bufferData( gl.ARRAY_BUFFER, flatten(branches), gl.STATIC_DRAW );

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

    tree();

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
			tree();
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