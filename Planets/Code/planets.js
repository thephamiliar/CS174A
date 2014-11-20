var canvas;
var gl;
var program;

var numTimesToSubdivide = 3;
var numPlanets = 6;
 
var index = 0;
var indexArray = [];
var i = 0;

var flatBuffer, smoothBuffer, vNormal, vBuffer, vPosition;

var pointsArray = [];
var flatNormalsArray = [];
var smoothNormalsArray = [];

var near = 0.1;
var far = 100;
var fovy = 90;
var aspect;

//navigation system
var x = 0;
var y = -40;
var z = -40;
var theta = 0.0;
var phi = 0.0;
var deg = 30.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
    
var lightPosition = vec4(0, 0, 0, 1.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = [ 
    vec4( 1.0, 0.0, .0, 1.0 ),
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 0.5, 0.75, 0.25, 1.0 ),
    vec4( 0.5, 0.8, 1.0, 1.0 ),
    vec4( 0.75, 0.5, 0.1, 1.0 ),
    vec4( 1.0, 1.0, 0, 1.0 ),
];

var materialDiffuse = [
    vec4( 1.0, 0.0, 0.0, 1.0 ),
    vec4( 1.0, 1.0, 1.0, 1.0 ),
    vec4( 0.5, 0.75, 0.25, 1.0 ),
    vec4( 0.5, 0.8, 1.0, 1.0 ),
    vec4( 0.75, 0.5, 0.1, 1.0 ),
    vec4( 1.0, 1.0, 0.0, 1.0 ),
];

var materialSpecular = [
    vec4( 1.0, 0.8, 0.0, 1.0 ),
    vec4( 1.0, 0.8, 0.0, 1.0 ),
    vec4( 1.0, 0.8, 0.0, 1.0 ),
    vec4( 1.0, 0.8, 0.0, 1.0 ),
    vec4( 0.0, 0.0, 0.0, 0.0 ),
    vec4( 0, 1.0, 0.0, 1.0 ),
];
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix, worldSpaceMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, worldSpaceMatrixLoc, phongLoc;

var translateMatrix = [
    vec3(0, 0, 0), //sun
    vec3(-40, 0, 0), //icy
    vec3(35, 0, 0), //swamp green
    vec3(25, 0, 0), //smooth water
    vec3(-10, 0, 0), //muddy
    vec3(10, 0, 0), //moon
];
var scaleMatrix = [
    vec3(6, 6, 6),
    vec3(2, 2, 2),
    vec3(1, 1, 1),
    vec3(4, 4, 4),
    vec3(3, 3, 3),
    vec3(1, 1, 1)
];
var speedMatrix = [
    0, -1.5, 3.0, 2.5, -1.0, 7.0
];
var orbitMatrix = [
    0, 0, 0 , 0, 0, 0
];
    
function triangle(a, b, c) {

     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t1, t2));
     normal = vec4(normal);

    flatNormalsArray.push(normal);
    flatNormalsArray.push(normal);
    flatNormalsArray.push(normal);

    smoothNormalsArray.push(a);
    smoothNormalsArray.push(b);
    smoothNormalsArray.push(c);
     
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
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    aspect = canvas.width/canvas.height;
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // change the complexities of the planets
    for (i = 0; i < numPlanets; ++i) {
        switch (i) {
            case 1:
                numTimesToSubdivide = 1;    // low
                break;
            case 2:
            case 5:
                numTimesToSubdivide = 2;    // medium-low
                break;
            case 0:
            case 4:
                numTimesToSubdivide = 3;    // medium-high
                break;
            case 3:
                numTimesToSubdivide = 5;    // high
                break;
        }
        tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
        indexArray.push(index);
    }

    // flat normals
    flatBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, flatBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(flatNormalsArray), gl.STATIC_DRAW );

    // smooth normals
    smoothBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, smoothBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(smoothNormalsArray), gl.STATIC_DRAW );
    
    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    
    vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    worldSpaceMatrixLoc = gl.getUniformLocation( program, "worldSpaceMatrix" );

    //Phong Shading
    phongLoc = gl.getUniformLocation(program, "isPhong");
    gl.uniform1i(phongLoc, 0);

    // navigation system
    window.onkeydown = function (e){
        var key = e.keyCode ? e.keyCode : e.which;

        switch (key) {
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
                near = 0.1;
                far = 100;

                x = 0;
                y = -40;
                z = -40;
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
        }
    }


    render();
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // move the world space
    worldSpaceMatrix = mat4();
    worldSpaceMatrix = mult(worldSpaceMatrix, rotate(deg, 1, 0,0));
    //transform for azimuth
    worldSpaceMatrix = mult(worldSpaceMatrix, rotate(theta, 0, 1, 0));
    //transform for altitude
    worldSpaceMatrix = mult(worldSpaceMatrix, rotate(phi, 1, 0, 0));
    //translate for movements
    worldSpaceMatrix = mult(worldSpaceMatrix, translate(x,y,z));

    var j = 0;

    for (i = 0; i < numPlanets; ++i) {
        // change the shading for each planet
        switch (i) {
            // flat shading
            case 0:
            case 1:
            case 5:
                gl.uniform1i(phongLoc, 0);
                gl.bindBuffer( gl.ARRAY_BUFFER, flatBuffer );

                vNormal = gl.getAttribLocation( program, "vNormal" );
                gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( vNormal);
                break;
            // phong shading
            case 3:
                gl.bindBuffer( gl.ARRAY_BUFFER, smoothBuffer );

                vNormal = gl.getAttribLocation( program, "vNormal" );
                gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( vNormal);
                gl.uniform1i(phongLoc, 1);
                break;
            // smooth shading
            case 2:
            case 4:
                gl.uniform1i(phongLoc, 0);
                gl.bindBuffer( gl.ARRAY_BUFFER, smoothBuffer );

                vNormal = gl.getAttribLocation( program, "vNormal" );
                gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( vNormal);
                break;
        }

        modelViewMatrix = mat4();
        projectionMatrix = perspective(fovy, aspect, near, far);

        // transformation for moon
        orbitMatrix[i] += speedMatrix[i];
        if (i == 5) { 
            modelViewMatrix = mult(modelViewMatrix, rotate(orbitMatrix[3], 0, 1, 0));
            modelViewMatrix = mult(modelViewMatrix, translate(translateMatrix[3]));
        }
        
        modelViewMatrix = mult(modelViewMatrix, rotate(orbitMatrix[i], 0, 1, 0));
        modelViewMatrix = mult(modelViewMatrix, translate(translateMatrix[i]));
        modelViewMatrix = mult(modelViewMatrix, scale(scaleMatrix[i]));

        ambientProduct = mult(lightAmbient, materialAmbient[i]);
        diffuseProduct = mult(lightDiffuse, materialDiffuse[i]);
        specularProduct = mult(lightSpecular, materialSpecular[i]);

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

                
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
        gl.uniformMatrix4fv(worldSpaceMatrixLoc, false, flatten(worldSpaceMatrix) );
            
        for( ; j<indexArray[i]; j+=3) 
            gl.drawArrays( gl.TRIANGLES, j, 3 );

    }

    window.requestAnimFrame(render);
}
