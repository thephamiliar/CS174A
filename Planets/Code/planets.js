var canvas;
var gl;
var program;

var numTimesToSubdivide = 5;
 
var index = 0;
var numPlanets = 5;
var pointsArray = [];
var normalsArray = [];

var near = 0.1;
var far = 100.0;
var fovy = 90.0;
var aspect;

var x = 0;
var y = 0;
var z = -30;
var theta = 0;
var phi = 0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
    
var ambientColor, diffuseColor, specularColor;
var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var reflectAmbient, reflectDiffuse, reflectSpecular;
var color, ambient, diffuse, specular;
var ambientProduct, diffuseProduct, specularProduct;

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

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

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var normalMatrix;

var vBuffer, nBuffer, vNormal, vBuffer, cBuffer;
var modelViewLoc, projectionMatrixLoc;

var translateMatrix = [
    vec3(0, 0, 0), //upper right
    vec3(-30, 0, 0), //upper middle
    vec3(10, 0, 0), //upper left
    vec3(24, 0, 0), //lower right
    vec3(-15, 0, 0), //lower left
];
var scaleMatrix = [
    vec3(6, 6, 6),
    vec3(2, 2, 2),
    vec3(1, 1, 1),
    vec3(4, 4, 4),
    vec3(3, 3, 3)
];
var speedMatrix = [
    0, -15, 30, 25, -10
];
var orbitMatrix = [
    0, 0, 0 , 0, 0
];
    
function triangle(a, b, c) {

     normalsArray.push(a);
     normalsArray.push(b);
     normalsArray.push(c);
     
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);

     index += 3;
}


function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}


function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    aspect = canvas.width/canvas.height;
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    //color array
    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);
    colorLoc = gl.getUniformLocation(program, "vColor");

    nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );


    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );   
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );

    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   /* eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);*/
    for (var i = 0; i < numPlanets; ++i) {
        modelViewMatrix = mat4();
        projectionMatrix = mat4();

        orbitMatrix[i] += speedMatrix[i];
        modelViewMatrix = mult(modelViewMatrix, rotate(orbitMatrix[i], 0, 0, 1));
        modelViewMatrix = mult(modelViewMatrix, translate(translateMatrix[i]));
        modelViewMatrix = mult(modelViewMatrix, translate(0,0,-70));
        modelViewMatrix = mult(modelViewMatrix, scale(scaleMatrix[i]));
        projectionMatrix = mult(projectionMatrix, perspective(fovy, aspect, near, far));
                
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
            
        for( var j=0; j<index; j+=3) 
            gl.drawArrays( gl.TRIANGLES, j, 3 );
    }

    window.requestAnimFrame(render);
}
