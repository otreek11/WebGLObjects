/**
 * Main Application Entry Point
 * Initializes WebGL, creates the 3D scene, and manages the render loop
 */

let gl;
let canvas;
let program;
let renderer;
let lightManager;
let textureLoader;
let animationManager;

const objects = [];

// Shader uniform and attribute locations
const locations = {
    // Attributes
    aPosition: null,
    aNormal: null,
    aTexCoord: null,

    // Transformation matrices
    uModel: null,
    uView: null,
    uProjection: null,
    uNormalMatrix: null,

    // Camera
    uCameraPosition: null,

    // Lights (support up to 4 lights)
    'uLights[0].position': null,
    'uLights[0].ambient': null,
    'uLights[0].diffuse': null,
    'uLights[0].specular': null,
    'uLights[1].position': null,
    'uLights[1].ambient': null,
    'uLights[1].diffuse': null,
    'uLights[1].specular': null,
    'uLights[2].position': null,
    'uLights[2].ambient': null,
    'uLights[2].diffuse': null,
    'uLights[2].specular': null,
    'uLights[3].position': null,
    'uLights[3].ambient': null,
    'uLights[3].diffuse': null,
    'uLights[3].specular': null,
    uNumLights: null,

    // Material properties
    'uMaterial.ambient': null,
    'uMaterial.diffuse': null,
    'uMaterial.specular': null,
    'uMaterial.shininess': null,

    // Texture
    uHasTexture: null,
    uTexture: null
};

/**
 * Initialize shader uniform and attribute locations
 */
function initLocations(program) {
    for (const key in locations) {
        // Determine if it's a uniform or attribute based on first character
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

        if (locations[key] === null && locations[key] !== -1) {
            console.warn(`Could not find location: ${key}`);
        }
    }
}

/**
 * Setup the 3D scene with objects, lights, and animations
 */
function setupScene() {
    // === LIGHTS ===

    // Light 1: Bright white main light (top-right)
    const light1 = new Light(
        vec4(5, 8, 5, 1),
        vec3(0.2, 0.2, 0.2),   // Ambient
        vec3(1.0, 1.0, 1.0),   // Diffuse
        vec3(1.0, 1.0, 1.0)    // Specular
    );

    // Light 2: Warm reddish accent light (left)
    const light2 = new Light(
        vec4(-5, 3, 3, 1),
        vec3(0.1, 0.05, 0.05), // Ambient
        vec3(0.8, 0.3, 0.3),   // Diffuse
        vec3(0.5, 0.2, 0.2)    // Specular
    );

    lightManager.addLight(light1);
    lightManager.addLight(light2);

    // Light visualization objects (small spheres)
    const lightBulb1 = createSphere(gl, [light1.position[0], light1.position[1], light1.position[2]], 0.2, 10, 10);
    lightBulb1.isLight = true;
    lightBulb1.material.ambient = vec3(1, 1, 1);
    lightBulb1.material.diffuse = vec3(0, 0, 0);
    objects.push(lightBulb1);

    const lightBulb2 = createSphere(gl, [light2.position[0], light2.position[1], light2.position[2]], 0.2, 10, 10);
    lightBulb2.isLight = true;
    lightBulb2.material.ambient = vec3(1, 0.3, 0.3);
    lightBulb2.material.diffuse = vec3(0, 0, 0);
    objects.push(lightBulb2);

    // === OBJECT 1: TEXTURED CUBE ===
    const cube = createCube(gl, [0, 0, 0], 1.5);
    cube.material = {
        ambient: vec3(0.3, 0.2, 0.1),
        diffuse: vec3(0.8, 0.6, 0.4),
        specular: vec3(0.5, 0.5, 0.5),
        shininess: 32.0
    };
    cube.hasTexture = true;
    cube.textureId = 'wood';
    objects.push(cube);

    // Animation: Rotate cube around diagonal axis
    animationManager.addAnimation(new Animation(cube, 'rotate', {
        speed: 45,
        axis: normalize(vec3(0, 1, 1))
    }));

    // === OBJECT 2: SPHERE (CURVED SURFACE) ===
    const sphere = createSphere(gl, [3, 0.5, 0], 1.0, 30, 30);
    sphere.material = {
        ambient: vec3(0.1, 0.3, 0.1),
        diffuse: vec3(0.3, 0.8, 0.3),
        specular: vec3(0.8, 0.8, 0.8),
        shininess: 64.0
    };
    objects.push(sphere);

    // Animation: Pulsating scale
    animationManager.addAnimation(new Animation(sphere, 'scale', {
        amplitude: 0.2,
        frequency: 2.0,
        baseScale: 1.0
    }));

    // === OBJECT 3: CYLINDER (CURVED SURFACE) ===
    const cylinder = createCylinder(gl, [-3, 0, 0], 0.5, 2.0, 24);
    cylinder.material = {
        ambient: vec3(0.2, 0.2, 0.25),
        diffuse: vec3(0.5, 0.5, 0.6),
        specular: vec3(0.9, 0.9, 1.0),
        shininess: 128.0
    };
    objects.push(cylinder);

    // Animation: Orbit around origin
    animationManager.addAnimation(new Animation(cylinder, 'orbit', {
        center: vec3(0, 0, 0),
        radius: 4.0,
        speed: 0.5,
        heightOffset: 0,
        faceDirection: false
    }));

    // === OBJECT 4: PYRAMID ===
    const pyramid = createPyramid(gl, [0, -2, 3], 1.5, 2.0);
    pyramid.material = {
        ambient: vec3(0.3, 0.1, 0.1),
        diffuse: vec3(0.8, 0.3, 0.3),
        specular: vec3(1.0, 0.7, 0.7),
        shininess: 16.0
    };
    objects.push(pyramid);

    // Animation: Rotate around X-axis
    animationManager.addAnimation(new Animation(pyramid, 'rotate', {
        speed: 30,
        axis: vec3(1, 0, 0)
    }));

    console.log(`Scene setup complete: ${objects.length} objects, ${lightManager.getLightCount()} lights`);
}

/**
 * Setup camera control event listeners
 */
function setupCameraControls() {
    // FOV control
    const fovSlider = document.getElementById('fovSlider');
    const fovValue = document.getElementById('fovValue');
    if (fovSlider) {
        fovSlider.addEventListener('input', (e) => {
            const fov = parseFloat(e.target.value);
            renderer.setFOV(fov);
            fovValue.textContent = fov.toFixed(0);
        });
    }

    // Near plane control
    const nearSlider = document.getElementById('nearSlider');
    const nearValue = document.getElementById('nearValue');
    if (nearSlider) {
        nearSlider.addEventListener('input', (e) => {
            const near = parseFloat(e.target.value);
            renderer.setNear(near);
            nearValue.textContent = near.toFixed(1);
        });
    }

    // Far plane control
    const farSlider = document.getElementById('farSlider');
    const farValue = document.getElementById('farValue');
    if (farSlider) {
        farSlider.addEventListener('input', (e) => {
            const far = parseFloat(e.target.value);
            renderer.setFar(far);
            farValue.textContent = far.toFixed(0);
        });
    }

    // Camera distance control
    const radiusSlider = document.getElementById('radiusSlider');
    const radiusValue = document.getElementById('radiusValue');
    if (radiusSlider) {
        radiusSlider.addEventListener('input', (e) => {
            renderer.cameraRadius = parseFloat(e.target.value);
            renderer.updateViewMatrix();
            radiusValue.textContent = e.target.value;
        });
    }

    // Horizontal angle control
    const thetaSlider = document.getElementById('thetaSlider');
    const thetaValue = document.getElementById('thetaValue');
    if (thetaSlider) {
        thetaSlider.addEventListener('input', (e) => {
            renderer.cameraTheta = parseFloat(e.target.value);
            renderer.updateViewMatrix();
            thetaValue.textContent = e.target.value;
        });
    }

    // Vertical angle control
    const phiSlider = document.getElementById('phiSlider');
    const phiValue = document.getElementById('phiValue');
    if (phiSlider) {
        phiSlider.addEventListener('input', (e) => {
            renderer.cameraPhi = parseFloat(e.target.value);
            renderer.updateViewMatrix();
            phiValue.textContent = e.target.value;
        });
    }

    // Animation speed control
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    if (speedSlider) {
        speedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            animationManager.setSpeedMultiplier(speed);
            speedValue.textContent = speed.toFixed(1);
        });
    }

    // Animation toggle
    const animToggle = document.getElementById('animToggle');
    if (animToggle) {
        animToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                animationManager.resume();
            } else {
                animationManager.pause();
            }
        });
    }
}

/**
 * Global reset camera function (called by HTML button)
 */
function resetCamera() {
    renderer.resetCamera();

    // Update UI sliders
    document.getElementById('fovSlider').value = 45;
    document.getElementById('fovValue').textContent = '45';
    document.getElementById('nearSlider').value = 0.1;
    document.getElementById('nearValue').textContent = '0.1';
    document.getElementById('farSlider').value = 100;
    document.getElementById('farValue').textContent = '100';
    document.getElementById('radiusSlider').value = 10;
    document.getElementById('radiusValue').textContent = '10';
    document.getElementById('thetaSlider').value = 45;
    document.getElementById('thetaValue').textContent = '45';
    document.getElementById('phiSlider').value = 30;
    document.getElementById('phiValue').textContent = '30';
}

/**
 * Main initialization function
 */
function main() {
    // Get canvas and setup WebGL
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL not initialized!");
        return;
    }

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.1, 0.15, 1.0); // Dark blue background
    gl.enable(gl.DEPTH_TEST);

    // Load and compile shaders
    program = initShaders(gl, "shaders/sh_vrtx.shader", "shaders/sh_frag.shader");
    gl.useProgram(program);

    // Initialize shader locations
    initLocations(program);

    // Initialize managers
    lightManager = new LightManager(gl, locations);
    textureLoader = new TextureLoader(gl);
    animationManager = new AnimationManager();

    // Load textures
    // Try to load a texture from the textures directory
    // If it fails, create a procedural checkerboard as fallback
    textureLoader.loadTexture('wood', './textures/wood.jpg', () => {
        console.log('Wood texture loaded successfully');
    });

    // Create a fallback procedural texture in case file loading fails
    textureLoader.createCheckerboardTexture('checkerboard', 256, 32,
        [139, 90, 43, 255],  // Brown
        [205, 133, 63, 255]  // Light brown
    );

    // Setup scene
    setupScene();

    // Calculate aspect ratio
    const aspect = canvas.width / canvas.height;

    // Initialize renderer
    renderer = new Renderer(objects, gl, locations, lightManager, textureLoader,
        45, aspect, 0.1, 100.0);

    // Setup camera controls
    setupCameraControls();

    // Update scene info
    document.getElementById('objectCount').textContent = objects.length;
    document.getElementById('lightCount').textContent = lightManager.getLightCount();

    // Start render loop
    render(0);

    console.log("Application initialized successfully");
}

/**
 * Render loop
 */
let lastFpsUpdate = 0;
let frameCount = 0;

function render(time) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update animations
    animationManager.update(time);

    // Render scene
    renderer.run();

    // Update FPS counter
    frameCount++;
    if (time - lastFpsUpdate >= 1000) {
        const fps = Math.round(frameCount / ((time - lastFpsUpdate) / 1000));
        document.getElementById('fpsCounter').textContent = fps;
        frameCount = 0;
        lastFpsUpdate = time;
    }

    requestAnimationFrame(render);
}

// Start application when page loads
window.onload = main;
