class Renderer 
{
    constructor(objects, gl, locations, camera, near = 1.0, far = -1.0) 
    {
        if (near <= far) {
            throw new Error("'near' value should be greater than 'far'");
        }
        this.objects = objects;
        this.gl = gl;
        this.locations = locations;
        this.near = near;
        this.far = far;
        this.camera = camera;

        // upload da projeção
        let proj = ortho(0, canvas.width, 0, canvas.height, this.far, this.near);
        gl.uniformMatrix4fv(locations.uProjection, false, flatten(proj));
    }

    set_near(near) {
        if (near <= this.far) {
            throw new Error("'near' value should be greater than 'far'");
        }
        this.near = near;
        this._rebuild_proj();
    }

    set_far(far) {
        if (this.near <= far) {
            throw new Error("'near' value should be greater than 'far'");
        }
        this.far = far;
        this._rebuild_proj();
    }

    _rebuild_proj() {
        let proj = ortho(0, canvas.width, 0, canvas.height, this.far, this.near);
        gl.uniformMatrix4fv(locations.uProjection, false, flatten(proj));
    }

    run()
    {

        for(const obj of objects) {
            // posição
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, obj.positionBuffer);
            this.gl.vertexAttribPointer(this.locations.vPosition, 4, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(this.locations.vPosition);

            // cor
            this.gl.uniform4f(this.locations.uColor, obj.color[0], obj.color[1], obj.color[2], obj.color[3]);

            // matriz modelo/transformacao
            this.gl.uniformMatrix4fv(this.locations.uModel, false, flatten(obj.modelMatrix));

            this.gl.drawArrays(obj.type, 0, obj.vertices.length);
        }
    }
}