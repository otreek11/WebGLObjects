class Renderer3D {
    constructor(gl, program, locations, objects, camera, extras,
        projFov = 45, 
        projAspect = 2.0,
        projNear = 0.1, 
        projFar = 20.0
    ) {
        this.gl = gl;
        this.program = program;
        this.locations = locations;
        this.objects = objects;
        this.extras = extras;
        this.camera = camera;

        this.projection = {
            fov: projFov,
            aspect: projAspect,
            near: projNear,
            far: projFar,
            matrix: perspective(projFov, projAspect, projNear, projFar),
        };
    }

    setFov(fov) { this.projection.fov = fov; this._updateProjection(); }
    setAspect(aspect) { this.projection.aspect = aspect; this._updateProjection(); }
    setNear(near) { this.projection.near = near; this._updateProjection(); }
    setFar(far) { this.projection.far = far; this._updateProjection(); }
    _updateProjection() {
        this.projection.matrix = perspective(this.projection.fov, this.projection.aspect, this.projection.near, this.projection.far);
    }

    draw() {
        let gl = this.gl;
        gl.useProgram(this.program);

        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // envia projection
        gl.uniformMatrix4fv(this.locations.uProjection, false, flatten(this.projection.matrix));

        // envia cameraview
        if (this.camera && this.camera.viewMatrix) {
            gl.uniformMatrix4fv(this.locations.uView, false, flatten(this.camera.viewMatrix));
            gl.uniform3fv(this.locations.uViewPos, flatten(this.camera.eye));
        }

        // pros objetos
        for (let obj of this.objects) {
            
            gl.uniform4fv(this.locations.uColor, flatten(obj.color));
            gl.uniform1i(this.locations.uIsLightSource, 0);

            gl.uniform3fv(this.locations['uMaterial.ambient'], flatten(obj.ambient));
            gl.uniform3fv(this.locations['uMaterial.diffuse'], flatten(obj.diffuse));
            gl.uniform3fv(this.locations['uMaterial.specular'], flatten(obj.specular));
            gl.uniform1f(this.locations['uMaterial.shininess'], obj.shininess);

            // binda as posicoes dos vertices
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.posVbo);
            gl.vertexAttribPointer(this.locations.aPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.locations.aPosition);

            // binda as normais dos vertices
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.nrmVbo);
            gl.vertexAttribPointer(this.locations.aNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.locations.aNormal);

            gl.bindBuffer(gl.ARRAY_BUFFER, obj.texVbo);
            gl.vertexAttribPointer(this.locations.aTexCoord, 2, gl.FLOAT, false, 0, 0); // Note o '2' (u,v)
            gl.enableVertexAttribArray(this.locations.aTexCoord);

            // envia matriz modelo
            gl.uniformMatrix4fv(this.locations.uModel, false, flatten(obj.modelMatrix));

            // binda os indices e desenha
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibo);
            gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
        }

        // pras coisas auxiliares (tipo iluminacao)
        for (let obj of this.extras) {
            
            gl.uniform4fv(this.locations.uColor, flatten(obj.color));
            gl.uniform1i(this.locations.uIsLightSource, 1);

            // binda as posicoes dos vertices
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.posVbo);
            gl.vertexAttribPointer(this.locations.aPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.locations.aPosition);

            // binda as normais dos vertices
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.nrmVbo);
            gl.vertexAttribPointer(this.locations.aNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(this.locations.aNormal);

            // envia matriz modelo
            gl.uniformMatrix4fv(this.locations.uModel, false, flatten(obj.modelMatrix));

            // binda os indices e desenha
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.ibo);
            gl.drawElements(gl.TRIANGLES, obj.indices.length, gl.UNSIGNED_SHORT, 0);
        }
    }
}