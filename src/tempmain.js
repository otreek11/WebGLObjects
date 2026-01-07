let gl, renderer;
let time = 0;

const camera = new Camera3D(vec3(0, 5, 10), vec3(0, 0, 0), vec3(0, 1, 0));

function initLocations(program) {
    for (const key in locations) {
        switch (key[0]) {
            case 'u':
                locations[key] = gl.getUniformLocation(program, key);
                break;
            case 'a':
                locations[key] = gl.getAttribLocation(program, key);
                break;
            default:
                console.warn(`Could not resolve key type: ${key}`);
        }

        if (locations[key] === null) {
            console.warn(`Could not find location: ${key}`);
        }
    }
}


function randVal(min, max) {
    return Math.random() * (max - min) + min;
}

function randColor() {
    return vec3(Math.random(), Math.random(), Math.random());
}

function randColor4() {
    return vec4(Math.random(), Math.random(), Math.random(), 1.0);
}

const locations = {
    aPosition: null,
    aNormal: null,
    aTexCoord: null,
    uModel: null,
    uView: null,
    uProjection: null,
    uColor: null,
    uViewPos: null,
    uIsLightSource: null,
    'uMaterial.ambient': null,
    'uMaterial.diffuse': null,
    'uMaterial.specular': null,
    'uMaterial.shininess': null,
    uTexture: null,
    uHasTexture: null,
};

const shaders = {
    vertex: "shaders/sh_vrtx.shader",
    fragment: "shaders/sh_frag.shader",
}

let ih;
let cubeObj, sphereObj, pyramidObj, cylinderObj;
let animManager;
let lightHandler;
let textureLoader;

function initObjects(gl) {

    let crateTex = textureLoader.loadTexture("Test", './textures/wood.jpg');

    let cubeD = createCubeData();
    cubeObj = new Obj3D(
        gl, 
        cubeD.vertices, 
        cubeD.normals, 
        cubeD.texCoords,
        cubeD.indices,
        vec3(0.1, 0.1, 0.1),
        vec3(1, 1, 1),
        vec3(1.0, 1.0, 1.0),
        10.0,
        vec4(1, 1, 1, 1)
    );

    cubeObj.texture = crateTex;

    let sphereD = createSphereData(0.7, 30, 30);
    sphereObj = new Obj3D(
        gl, 
        sphereD.vertices, 
        sphereD.normals,
        sphereD.texCoords,
        sphereD.indices,
        vec3(0.1, 0.1, 0.1),
        vec3(1, 1, 1),
        vec3(1.0, 1.0, 1.0),
        40.0,
        vec4(1, 1, 1, 1)
    );
    sphereObj.translate(3, 0, 0);

    let pyrD = createPyramidData();
    pyramidObj = new Obj3D(
        gl, 
        pyrD.vertices, 
        pyrD.normals, 
        pyrD.texCoords,
        pyrD.indices,
        vec3(randVal(0, 0.3), 0.0, 0.0),
        vec3(randVal(0.5, 1), 0.0, 0.0),
        vec3(1.0, 1.0, 0.0),
        randVal(5, 50), 
        randColor4()
    );
    pyramidObj.translate(-3, -1, -3);

    let cylD = createCylinderData(0.5, 2, 20);
    cylinderObj = new Obj3D(
        gl, 
        cylD.vertices, 
        cylD.normals, 
        cylD.texCoords,
        cylD.indices,
        randColor(), 
        randColor(), 
        vec3(1.0, 1.0, 1.0), 
        randVal(10, 100),
        randColor4()
    );
    cylinderObj.translate(3, 1, 3);
}

window.onload = function init() {

    const canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); return; }

    gl.viewport(0, 0, canvas.width, canvas.height);

    const program = initShaders(gl, shaders.vertex, shaders.fragment);
    gl.useProgram(program);
    
    initLocations(program);

    textureLoader = new TextureLoader(gl);
    initObjects(gl);

    const objects = [cubeObj, sphereObj, pyramidObj, cylinderObj];
    const extras = [];

    const aspect = canvas.width / canvas.height;
    
    renderer = new Renderer3D(
        gl, 
        program, 
        locations, 
        objects, 
        camera,
        extras, 
        45,
        aspect,
        0.1,
        20.0
    );

    animManager = new AnimationManager();
    ih = new InputHandler(camera, renderer, animManager, window, canvas, gl);

    animManager.addAnimation(new Animation(cubeObj, 'rotate', {
        axis: vec3(1, 1, 1),
        speed: 40,
    }));

    // sphereObj.translate(0, 5, 0)
    animManager.addAnimation(new Animation(sphereObj, 'orbit', {
        center: vec3(0, 0, 0),
        radius: 4.0,
        speed: 80,
        axis: vec3(0, 1, 1),
    }));

    animManager.addAnimation(new Animation(cylinderObj, 'orbit', {
        center: vec3(0, 0, 0),
        radius: 4.0,
        speed: 100,
        axis: vec3(0, -1, 0),
        heightOffset: 0,
    }));

    animManager.addAnimation(new Animation(cylinderObj, 'rotate', {
        axis: vec3(0, 1, 2),
        speed: 60,
    }));

    animManager.addAnimation(new Animation(pyramidObj, 'rotate', {
        axis: vec3(4, 1, 2), 
        speed: 60,
    }));

    animManager.addAnimation(new Animation(pyramidObj, 'orbit', {
        center: vec3(0, 0, 0),
        radius: 1.0,
        speed: 120,
        axis: vec3(0, 1, -2),
        heightOffset: 0,
    }));

    lightHandler = new LightHandler(gl, locations, extras, program);

    lightHandler.addLight(vec4(1.0, 1.0, 1.0, 1.0), vec4(2.0, 4.0, 3.0, 1.0));
    lightHandler.addLight(vec4(0.4, 0.1, 0.4, 1.0), vec4(-2.0, -4.0, -3.0, 1.0));


    renderLoop(0);
};

function renderLoop(time) {
    ih.run();
    animManager.update(time)
    renderer.draw();

    requestAnimationFrame(renderLoop);
}