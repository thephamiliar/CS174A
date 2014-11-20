var canvas;
var gl;
var program;
var length = 0.5;
var time = 0.0;
var timer = new Timer();
var omega = 360;
var rotation = false;
var texture = false;
var countTexture = 0;
var scrolling = false;
var countScroll = 0;

var UNIFORM_mvpMatrix;
var UNIFORM_lightPosition;
var UNIFORM_shininess;
var ATTRIBUTE_position;
var ATTRIBUTE_normal;

var positionBuffer; 
var normalBuffer;

var myTexture;

var viewMatrix;
var projectionMatrix;
var mvpMatrix;

var shininess = 50;
var lightPosition = vec3(0.0, 0.0, 0.0);

var eye = vec3(0, 0, 0);
var at = vec3(0, 0, 0);
var up = vec3(0, 1, 0);

var z = -2;

var uv = [];
var uv1 = [];
var uvS1 = [];
var uvS2 = [];
var uvS3 = [];
var uvT1 = [];
var uvT2 = [];
var uvT3 = [];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    vertices = [
        vec3(  length,   length, length ), //vertex 0
        vec3(  length,  -length, length ), //vertex 1
        vec3( -length,   length, length ), //vertex 2
        vec3( -length,  -length, length ),  //vertex 3 
        vec3(  length,   length, -length ), //vertex 4
        vec3(  length,  -length, -length ), //vertex 5
        vec3( -length,   length, -length ), //vertex 6
        vec3( -length,  -length, -length )  //vertex 7   
    ];

    var points = [];
    var normals = [];
    Cube(vertices, points, normals, uv, uv1);

    myTexture = gl.createTexture();
    myTexture.image = new Image();
    myTexture.image.onload = function(){
	gl.bindTexture(gl.TEXTURE_2D, myTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, myTexture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);
    }

    myTexture.image.src = "/Images/baymax.jpg";

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    positionBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    normalBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );

    uvBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(uv), gl.STATIC_DRAW );

    uvBufferS1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBufferS1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(uvS1), gl.STATIC_DRAW );

    uvBufferS2 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBufferS2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(uvS2), gl.STATIC_DRAW );

    uvBufferS3 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBufferS3 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(uvS3), gl.STATIC_DRAW );

    uvBuffer1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(uv1), gl.STATIC_DRAW );

    uvBufferT1 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, uvBufferT1 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(uvT1), gl.STATIC_DRAW );

    uvBufferT2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, uvBufferT2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(uvT2), gl.STATIC_DRAW );

    uvBufferT3 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, uvBufferT3 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(uvT3), gl.STATIC_DRAW );

    ATTRIBUTE_position = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( ATTRIBUTE_position );

    ATTRIBUTE_normal = gl.getAttribLocation( program, "vNormal" );
    gl.enableVertexAttribArray( ATTRIBUTE_normal );

    ATTRIBUTE_uv = gl.getAttribLocation( program, "vUV" );
    gl.enableVertexAttribArray( ATTRIBUTE_uv);

    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
    gl.vertexAttribPointer( ATTRIBUTE_position, 3, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.vertexAttribPointer( ATTRIBUTE_normal, 3, gl.FLOAT, false, 0, 0 );

    gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer );
    gl.vertexAttribPointer( ATTRIBUTE_uv, 2, gl.FLOAT, false, 0, 0 );


    UNIFORM_mvMatrix = gl.getUniformLocation(program, "mvMatrix");
    UNIFORM_pMatrix = gl.getUniformLocation(program, "pMatrix");
    UNIFORM_lightPosition = gl.getUniformLocation(program, "lightPosition");
    UNIFORM_shininess = gl.getUniformLocation(program, "shininess");
    UNIFORM_sampler = gl.getUniformLocation(program, "uSampler");

    viewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(90, 1, 0.001, 1000);

    timer.reset();
    gl.enable(gl.DEPTH_TEST);

    window.onkeydown = function (e){
        var key = e.keyCode ? e.keyCode : e.which;
        switch (key) {
            // press 'i' for closer view
            case 73:
                z += 1;
                break;
            //press 'o' for farther view
            case 79:
                z -= 1;
                break;
            // press 'r' for rotation
            case 82:
                rotation = !rotation;
                break;
            // press 't' for texture rotation
            case 84:
                if (texture) {
                    countTexture = 0;
                    texture = false;
                } else {
                    texture = true;
                }
                break;
            // press 's' for scrolling
            case 83:
                if (scrolling) {
                    countScroll = 0;
                    scrolling = false;
                } else {
                    scrolling = true;
                }
                break;
        }
    }

    render();
}

function Cube(vertices, points, normals){
    Quad(vertices, points, normals, 0, 1, 2, 3, vec3(0, 0, 1));
    Quad(vertices, points, normals, 4, 0, 6, 2, vec3(0, 1, 0));
    Quad(vertices, points, normals, 4, 5, 0, 1, vec3(1, 0, 0));
    Quad(vertices, points, normals, 2, 3, 6, 7, vec3(1, 0, 1));
    Quad(vertices, points, normals, 6, 7, 4, 5, vec3(0, 1, 1));
    Quad(vertices, points, normals, 1, 5, 3, 7, vec3(1, 1, 0 ));
}

function Quad( vertices, points, normals, v1, v2, v3, v4, normal){

    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);

    uv.push(vec2(-1,-1));
    uv.push(vec2(2,-1));
    uv.push(vec2(2,2));
    uv.push(vec2(-1,-1));
    uv.push(vec2(2,2));
    uv.push(vec2(-1,2));

    uvS1.push(vec2(-1,-0.75));
    uvS1.push(vec2(2,-0.75));
    uvS1.push(vec2(2,2.25));
    uvS1.push(vec2(-1,-0.75));
    uvS1.push(vec2(2,2.25));
    uvS1.push(vec2(-1,2.25));

    uvS2.push(vec2(-1,-0.5));
    uvS2.push(vec2(2,-0.5));
    uvS2.push(vec2(2,2.5));
    uvS2.push(vec2(-1,-0.5));
    uvS2.push(vec2(2,2.5));
    uvS2.push(vec2(-1,2.5));

    uvS3.push(vec2(-1,-0.25));
    uvS3.push(vec2(2,-0.25));
    uvS3.push(vec2(2,2.75));
    uvS3.push(vec2(-1,-0.25));
    uvS3.push(vec2(2,2.75));
    uvS3.push(vec2(-1,2.75));

    uv1.push(vec2(0,0));
    uv1.push(vec2(1,0));
    uv1.push(vec2(1,1));
    uv1.push(vec2(0,0));
    uv1.push(vec2(1,1));
    uv1.push(vec2(0,1));

    uvT1.push(vec2(0,1));
    uvT1.push(vec2(0,0));
    uvT1.push(vec2(1,0));
    uvT1.push(vec2(0,1));
    uvT1.push(vec2(1,0));
    uvT1.push(vec2(1,1));

    uvT2.push(vec2(1,1));
    uvT2.push(vec2(0,1));
    uvT2.push(vec2(0,0));
    uvT2.push(vec2(1,1));
    uvT2.push(vec2(0,0));
    uvT2.push(vec2(1,0));

    uvT3.push(vec2(1,0));
    uvT3.push(vec2(1,1));
    uvT3.push(vec2(0,1));
    uvT3.push(vec2(1,0));
    uvT3.push(vec2(0,1));
    uvT3.push(vec2(0,0));

    points.push(vertices[v1]);
    points.push(vertices[v3]);
    points.push(vertices[v4]);
    points.push(vertices[v1]);
    points.push(vertices[v4]);
    points.push(vertices[v2]);
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    time += timer.getElapsedTime() / 1000;

    // cube from step 3
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    ATTRIBUTE_uv = gl.getAttribLocation( program, "vUV" );
    gl.enableVertexAttribArray( ATTRIBUTE_uv);
    if (texture) {
        if (countTexture < 6) {
            gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer1 );
            countTexture += 1;
        } else if (countTexture < 12) {
            gl.bindBuffer( gl.ARRAY_BUFFER, uvBufferT1 );
            countTexture += 1;
        } else if (countTexture < 18) {
            gl.bindBuffer( gl.ARRAY_BUFFER, uvBufferT2 );
            countTexture += 1;
        } else if (countTexture < 24) {
            gl.bindBuffer( gl.ARRAY_BUFFER, uvBufferT3 );
            countTexture += 1;
        } else {
            gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer1 );
            countTexture = 0;
        }
    } else {
        gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer1 );
    }
    gl.vertexAttribPointer( ATTRIBUTE_uv, 2, gl.FLOAT, false, 0, 0 );

    mvMatrix = mult(viewMatrix, translate(-1, 0, z));
    if (rotation)
        mvMatrix = mult(mvMatrix, rotate(time * omega, [0, 1, 0]));
    gl.uniformMatrix4fv(UNIFORM_mvMatrix, false, flatten(mvMatrix));
    gl.uniformMatrix4fv(UNIFORM_pMatrix, false, flatten(projectionMatrix));

    gl.drawArrays( gl.TRIANGLES, 0, 36);

    // cube from step 4
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);    
    ATTRIBUTE_uv = gl.getAttribLocation( program, "vUV" );
    gl.enableVertexAttribArray( ATTRIBUTE_uv);
    if (scrolling) {
        switch (countScroll) {
            case 0:
                gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer );
                countScroll += 1;
                break;
            case 1:
                gl.bindBuffer( gl.ARRAY_BUFFER, uvBufferS1 );
                countScroll += 1;
                break;
            case 2:
                gl.bindBuffer( gl.ARRAY_BUFFER, uvBufferS2 );
                countScroll += 1;
                break;
            case 3:
                gl.bindBuffer( gl.ARRAY_BUFFER, uvBufferS3 );
                countScroll = 0;
                break;
        }
    } else {
        gl.bindBuffer( gl.ARRAY_BUFFER, uvBuffer );
    }
    gl.vertexAttribPointer( ATTRIBUTE_uv, 2, gl.FLOAT, false, 0, 0 );

    mvMatrix = mult(viewMatrix, translate(1, 0, z));
    if (rotation)
        mvMatrix = mult(mvMatrix, rotate(time * omega / 2, [1, 0, 0]));

    gl.uniformMatrix4fv(UNIFORM_mvMatrix, false, flatten(mvMatrix));
    gl.uniformMatrix4fv(UNIFORM_pMatrix, false, flatten(projectionMatrix));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, myTexture);

    gl.uniform3fv(UNIFORM_lightPosition,  flatten(lightPosition));
    gl.uniform1f(UNIFORM_shininess,  shininess);
    gl.uniform1i(UNIFORM_sampler, 0)

    gl.drawArrays( gl.TRIANGLES, 0, 36);

    window.requestAnimFrame( render );
}