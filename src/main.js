let gl;
let canvas;
let program;
let renderer;

const locations = {
    aPosition: null,
    uColor: null,
    uModel: null,
    uProjection: null,
    uView: null,
}

const objects = [];

function init_locations(program) {
    for (key in locations) {
        // console.log(`Searching key: ${key}...`);
        switch(key[0]) {
            case 'u':
                locations[key] = gl.getUniformLocation(program, key);
                break;
            case 'a':
                locations[key] = gl.getAttribLocation(program, key);
                break;
            default:
                console.log(`Could not resolve key type: ${key}`);
        }
        if (locations[key] === null) { console.log(`Could not find key location: ${key}`); }
    }
}

function main() {
    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) alert("WebGL não foi inicializado!");

    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1, 1, 1, 1);
    gl.enable(gl.DEPTH_TEST);
    
    program = initShaders(gl, "shaders/sh_vrtx.shader", "shaders/sh_frag.shader");
    gl.useProgram(program);

    init_locations(program);
    renderer = new Renderer(objects, gl, locations, makeSquare(gl, [100, 0], 10, COLORS.auxiliary));

    objects.push(makeTriangle(gl, [10, 10], 10, COLORS.default));

    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    renderer.run();
    requestAnimationFrame(render);
}

window.onload = main;