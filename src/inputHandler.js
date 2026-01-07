class InputHandler
{
    constructor(camera, renderer, animationHandler, window, canvas, gl) {
        this.input = {
            w: false, a: false, s: false, d: false,
            l: false, j: false, i: false, k: false,
        };

        this.originalCam = camera.copy();
        this.camera = camera;
        this.renderer = renderer;
        this.animationHandler = animationHandler;
        this.window = window;
        this.canvas = canvas;
        this.gl = gl;

        this._init();
    }

    _init() {

        this.window.addEventListener("keydown", (e) => {
            const key = e.key.toLowerCase();
            if (key in this.input) this.input[key] = true;
        });

        this.window.addEventListener("keyup", (e) => {
            const key = e.key.toLowerCase();
            if (key in this.input) this.input[key] = false;
        });

        this._setupCameraControls();
        document.getElementById('camReset').onclick = () => this._resetCamera();
    }

    _resetCamera() {
        let cpy = this.originalCam.copy();
        this.camera = cpy;
        this.renderer.camera = cpy;

        // Update UI sliders
        document.getElementById('fovSlider').value = 45;
        document.getElementById('fovValue').textContent = '45';
        document.getElementById('nearSlider').value = 0.1;
        document.getElementById('nearValue').textContent = '0.1';
        document.getElementById('farSlider').value = 20;
        document.getElementById('farValue').textContent = '20';
        document.getElementById('aspectSlider').value = 1.33;
        document.getElementById('aspectValue').textContent = '1.33';
        this.renderer.setFov(45);
        this.renderer.setNear(0.1);
        this.renderer.setFar(20);
        this.renderer.setAspect(1.33);
    }

    _setupCameraControls() {
        let renderer = this.renderer;
        // FOV control
        const fovSlider = document.getElementById('fovSlider');
        const fovValue = document.getElementById('fovValue');
        if (fovSlider) {
            fovSlider.addEventListener('input', (e) => {
                const fov = parseFloat(e.target.value);
                renderer.setFov(fov);
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
        
        // Animation speed control
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                this.animationHandler.setSpeedMultiplier(speed);
                speedValue.textContent = speed.toFixed(1);
            });
        }

        // Aspect control
        const aspectSlider = document.getElementById('aspectSlider');
        const aspectValue = document.getElementById('aspectValue');
        if (aspectSlider) {
            aspectSlider.addEventListener('input', (e) => {
                const aspect = parseFloat(e.target.value);
                renderer.setAspect(aspect);
                aspectValue.textContent = aspect.toFixed(2);
            });
        }

        // Animation toggle
        const animToggle = document.getElementById('animToggle');
        if (animToggle) {
            animToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.animationHandler.resume();
                } else {
                    this.animationHandler.pause();
                }
            });
        }
    }

    run()
    {
        let camera_move = vec3();

        if (this.input.w) camera_move = add(camera_move, vec3(0, 1, 0));
        if (this.input.s) camera_move = add(camera_move, vec3(0, -1, 0));
        if (this.input.a) camera_move = add(camera_move, vec3(-1, 0, 0));
        if (this.input.d) camera_move = add(camera_move, vec3(1, 0, 0));
        
        let camera_rotate = vec3();

        if (this.input.i) camera_rotate = add(camera_rotate, vec3(0, 1, 0));
        if (this.input.k) camera_rotate = add(camera_rotate, vec3(0, -1, 0));
        if (this.input.j) camera_rotate = add(camera_rotate, vec3(1, 0, 0));
        if (this.input.l) camera_rotate = add(camera_rotate, vec3(-1, 0, 0));

        this.camera.moveTowards(0.1, camera_move);
        this.camera.rotate(0.01, camera_rotate);
    }
    
}