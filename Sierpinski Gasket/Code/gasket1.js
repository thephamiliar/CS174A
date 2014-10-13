var canvas;
var gl;
var points = [];
var NumTimesToSubdivide = 5;

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
	gl.drawArrays(gl.TRIANGLES, 0, points.length);
	gl.flush();
}

// Initialize canvas and shaders
window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert ("WebGL isn't available"); }

	// Initial triangle for Sierpinski Gasket
	var vertices = [ vec2(-0.5,-0.5), vec2(0.5,-0.5), vec2(0.0,0.5) ];
	var colors = [ vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0) ];
	//triangle(vertices[0], vertices[1], vertices[2]);
	divideTriangle (vertices[0], vertices[1], vertices[2], NumTimesToSubdivide);

	// Configure WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 ); 

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    var vBufferID = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferID );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    /* // Load the data into the GPU
    var cBufferID = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBufferID );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor ); */

    render();
  }