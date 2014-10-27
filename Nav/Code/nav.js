//program variables
var canvas;
var gl;
var program;

//cube variables
var numCubes = 8;
var numVertices = 14;
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
var indices = [
    0, 1, 3,
    2, 6, 1,
    5, 0, 4, 
    3, 7, 6,
    4, 5
];

//crosshair vertices
var crossXY = [
    vec3(-1, 0, -1),
    vec3(1, 0, -1),
    vec3(0, -1, -1),
    vec3(0, 1, -1)
];
var crosshair = false;

//color variables
var vertexColors = [
    [ 0.0, 0.0, 0.0, 1.0 ], //black
    [ 1.0, 0.0, 0.0, 1.0 ], //red
    [ 1.0, 1.0, 0.0, 1.0 ], //yellow
    [ 0.0, 1.0, 0.0, 1.0 ], //green
    [ 0.0, 0.0, 1.0, 1.0 ], //blue
    [ 1.0, 0.0, 1.0, 1.0 ], //magenta
    [ 1.0, 0.5, 0.5, 1.0 ], //pink
    [ 0.0, 1.0, 1.0, 1.0 ] //cyan
];
var colorRotation = 0;

//perspective & position variables
var near = 0.1;
var far = 100.0;
var fovy = 90.0;
var aspect;
var x = 0;
var y = 0;
var z = -30;
var theta = 0.0;
var phi = 0.0;
var deg = 0.0;

//transformation variables
var scale_cube = vec3(0.01, 0.01, 0.01);
var scale_cross = vec3(0.1, 0.1, 0.1);
var translateMatrix = [
    vec3(10, 10, 10), //upper right
    vec3(-10, 10, 10), //upper middle
    vec3(10, -10, 10), //upper left
    vec3(10, 10, -10), //lower right
    vec3(-10, -10, -10), //lower left
    vec3(-10, -10, 10), //middle right
    vec3(10, -10, -10), //lower middle
    vec3(-10, 10, -10) //middle left
];

//buffer variables
var vBuffer, crossBuffer, iBuffer, cBuffer;

//uniform variables
var modelView, projection;
var modelViewLoc, projLoc, colorLoc;

window.onload = function init() {
    // Requirement 1. Get a simple WebGL window to display without error.
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    aspect = canvas.width/canvas.height;
    gl.enable(gl.DEPTH_TEST);

    // Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // array element buffer
    iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

    // color array attribute buffer
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);

    colorLoc = gl.getUniformLocation(program, "vColor");

    // vertex array attribute buffer
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // create crosshair buffer
    crossBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, crossBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(crossXY), gl.STATIC_DRAW );

    // uniform variables
    modelViewLoc = gl.getUniformLocation(program, "modelView");
    projLoc = gl.getUniformLocation(program, "projection");

    window.onkeydown = function (e){
        var key = e.keyCode ? e.keyCode : e.which;

        switch (key) {
            //color rotation
            case 67:
                if (colorRotation != 7)
                    colorRotation += 1;
                else
                    colorRotation = 0;
                break;
            //altitude of camera
            case 38:
                phi -= 1;
                break;
            case 40:
                phi += 1;
                break;
            //azimuth of camera
            case 37:
                theta -= 1;
                break;
            case 39:
                theta += 1;
                break;
            //forward
            case 73:
                z += 0.25;
                break;
            //left
            case 74:
                x += 0.25;
                break;
            //right
            case 75:
                x -= 0.25;
                break;
            //backwards
            case 77:
                z -= 0.25;
                break;
            //reset
            case 82:
                fovy = 90;
                aspect = canvas.width/canvas.height;
                near = -1;
                far = 1;

                x = 0;
                y = 0;
                z = -30;
                phi = 0;
                theta = 0;
                break;
            //narrow
            case 78:
                fovy -= 0.25;
                break;
            //wide
            case 87:
                fovy += 0.25;
                break;
            //cross hair and ortho projection
            case 32:
                crosshair = !crosshair;
                break;
        }
    }

    render();
}

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //continuously rotate the cubes
    deg +=10;

    //render each cube
    for (var i=0; i < numCubes; ++i) {
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );

        vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        //cycle through the colors
        var cVector = (i+colorRotation) % numCubes;
        var color = vertexColors[cVector];
        if (colorLoc != -1)
            gl.uniform4fv(colorLoc, color);

        var ctm = mat4();
        //transform for azimuth
        ctm = mult(ctm, rotate(theta, 0, 1, 0));
        //transform for altitude
        ctm = mult(ctm, rotate(phi, 1, 0, 0));
        //move the cubes to (+-10, +-10, +-10)
        ctm = mult(ctm, translate(translateMatrix[i]));
        //translate for movements
        ctm = mult(ctm, translate(x,y,z));
        ctm = mult(ctm, rotate(deg, 1, 0, 0));
        gl.uniformMatrix4fv(modelViewLoc, false, flatten(ctm));

        projection = perspective(fovy, aspect, near, far);
        gl.uniformMatrix4fv(projLoc, false, flatten(projection));
        gl.drawElements(gl.TRIANGLE_STRIP, numVertices, gl.UNSIGNED_BYTE, 0);
    }

    //render cross-hair
    if (crosshair) {
        gl.bindBuffer( gl.ARRAY_BUFFER, crossBuffer );

        vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );

        if (colorLoc != -1)
            gl.uniform4fv(colorLoc, vertexColors[1]);

        var ctm1 = mat4();
        ctm1 = (ctm1, scale(scale_cross));
        gl.uniformMatrix4fv(modelViewLoc, false, flatten(ctm1));

        projection = ortho(-1,1,-1,1,-1,1);
        gl.uniformMatrix4fv(projLoc, false, flatten(projection));

        gl.drawArrays(gl.LINES, 0, crossXY.length);
    }

    window.requestAnimFrame( render );
}