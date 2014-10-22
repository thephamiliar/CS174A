var canvas;
var gl;
var loc;
var matrix;
var numVertices = 36;
var indices = [
    1, 0, 3,
    3, 2, 1,
    2, 3, 7,
    7, 6, 2,
    3, 0, 4,
    4, 7, 3,
    6, 5, 1,
    1, 2, 6,
    4, 5, 6,
    6, 7, 4,
    5, 4, 0,
    0, 1, 5
  ];
  var iBuffer;

window.onload = function init() {
	canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) { alert("WebGL isn't available"); }

var vertices = [
    vec3(-0.5, -0.5, 0.5),
    vec3(-0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(-0.5, 0.5, -0.5),
    vec3(0.5, 0.5, -0.5),
    vec3(0.5, -0.5, -0.5),
  ];

  var vertexColors = [
    [ 0.0, 0.0, 0.0, 1.0 ],
    [ 1.0, 0.0, 0.0, 1.0 ],
    [ 1.0, 1.0, 0.0, 1.0 ],
    [ 0.0, 1.0, 0.0, 1.0 ],
    [ 0.0, 0.0, 1.0, 1.0 ],
    [ 1.0, 0.0, 1.0, 1.0 ],
    [ 1.0, 1.0, 1.0, 1.0 ],
    [ 0.0, 1.0, 1.0, 1.0 ]
  ];
  
	// Configure WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 ); 

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    var vBufferID = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferID );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );

    iBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, flatten(indices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0);
}