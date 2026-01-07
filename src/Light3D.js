class LightHandler {
    constructor(gl, locations, extras, program) {
        this.gl = gl;
        this.locations = locations;
        this.extras = extras;
        this.program = program;

        this.locations.uLights = [];
    }

    addLight(color, position) {
        let info = createSphereData(0.5, 20, 20);
        let lightSrc = new Obj3D(gl, 
            info.vertices, 
            info.normals, 
            info.texCoords,
            info.indices,
            vec3(0, 0, 0),
            vec3(0, 0, 0),
            vec3(0, 0, 0),
            1.0,
            color,
        );
        lightSrc.translate(position[0], position[1], position[2]);

        let i = this.locations.uLights.length;

        this.locations.uLights.push({
            position: this.gl.getUniformLocation(this.program, "uLights[" + i + "].position"),
            color: this.gl.getUniformLocation(this.program, "uLights[" + i + "].color"),
        });

        this.gl.uniform4fv(this.locations.uLights[i].position, position);
        this.gl.uniform4fv(this.locations.uLights[i].color, color);

        lightSrc.isLightSource = true;

        for (let i = 0; i < lightSrc.normals.length; i++)
            lightSrc.normals[i] = -1 * lightSrc.normals[i];

        this.extras.push(lightSrc); 
    }
}