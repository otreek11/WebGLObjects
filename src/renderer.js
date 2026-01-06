/**
 * 3D Renderer with Perspective Projection and Camera Controls
 */
class Renderer {
    /**
     * @param {Array} objects - Array of VisualObject instances to render
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {object} locations - Shader uniform/attribute locations
     * @param {LightManager} lightManager - Light manager instance
     * @param {TextureLoader} textureLoader - Texture loader instance
     * @param {number} fov - Field of view in degrees (default 45)
     * @param {number} aspect - Aspect ratio width/height (default 2.0)
     * @param {number} near - Near clipping plane (default 0.1)
     * @param {number} far - Far clipping plane (default 100.0)
     */
    constructor(objects, gl, locations, lightManager, textureLoader,
                fov = 45, aspect = 2.0, near = 0.1, far = 100.0) {
        this.objects = objects;
        this.gl = gl;
        this.locations = locations;
        this.lightManager = lightManager;
        this.textureLoader = textureLoader;

        // Projection parameters
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        // Camera state (spherical coordinates)
        this.cameraRadius = 10.0;      // Distance from origin
        this.cameraTheta = 45.0;       // Horizontal angle (degrees)
        this.cameraPhi = 30.0;         // Vertical angle (degrees)
        this.cameraTarget = vec3(0, 0, 0); // Look-at point

        // Initialize projection matrix
        this._rebuildProjection();

        // Initialize view matrix
        this.updateViewMatrix();
    }

    /**
     * Rebuild and upload projection matrix
     */
    _rebuildProjection() {
        const proj = perspective(this.fov, this.aspect, this.near, this.far);
        this.gl.uniformMatrix4fv(this.locations.uProjection, false, flatten(proj));
    }

    /**
     * Update and upload view matrix based on camera position
     */
    updateViewMatrix() {
        // Convert spherical to cartesian coordinates
        const phi_rad = this.cameraPhi * Math.PI / 180.0;
        const theta_rad = this.cameraTheta * Math.PI / 180.0;

        const eye = vec3(
            this.cameraRadius * Math.sin(phi_rad) * Math.cos(theta_rad),
            this.cameraRadius * Math.cos(phi_rad),
            this.cameraRadius * Math.sin(phi_rad) * Math.sin(theta_rad)
        );

        const up = vec3(0, 1, 0);
        const view = lookAt(eye, this.cameraTarget, up);

        this.gl.uniformMatrix4fv(this.locations.uView, false, flatten(view));

        // Upload camera position for lighting calculations
        if (this.locations.uCameraPosition) {
            this.gl.uniform3fv(this.locations.uCameraPosition, flatten(eye));
        }
    }

    /**
     * Orbit camera around the scene
     * @param {number} deltaTheta - Change in horizontal angle (degrees)
     * @param {number} deltaPhi - Change in vertical angle (degrees)
     */
    orbitCamera(deltaTheta, deltaPhi) {
        this.cameraTheta += deltaTheta;
        this.cameraPhi = Math.max(1, Math.min(179, this.cameraPhi + deltaPhi));
        this.updateViewMatrix();
    }

    /**
     * Zoom camera in/out
     * @param {number} deltaRadius - Change in camera distance
     */
    zoomCamera(deltaRadius) {
        this.cameraRadius = Math.max(2, Math.min(50, this.cameraRadius + deltaRadius));
        this.updateViewMatrix();
    }

    /**
     * Pan camera by moving the look-at target
     * @param {number} deltaX - Change in X position
     * @param {number} deltaY - Change in Y position
     * @param {number} deltaZ - Change in Z position
     */
    panCamera(deltaX, deltaY, deltaZ) {
        this.cameraTarget[0] += deltaX;
        this.cameraTarget[1] += deltaY;
        this.cameraTarget[2] += deltaZ;
        this.updateViewMatrix();
    }

    /**
     * Set field of view
     * @param {number} fov - Field of view in degrees
     */
    setFOV(fov) {
        this.fov = Math.max(20, Math.min(120, fov));
        this._rebuildProjection();
    }

    /**
     * Set near clipping plane
     * @param {number} near - Near plane distance
     */
    setNear(near) {
        this.near = Math.max(0.1, Math.min(5.0, near));
        if (this.near >= this.far) {
            this.near = this.far - 0.1;
        }
        this._rebuildProjection();
    }

    /**
     * Set far clipping plane
     * @param {number} far - Far plane distance
     */
    setFar(far) {
        this.far = Math.max(10, Math.min(200, far));
        if (this.far <= this.near) {
            this.far = this.near + 0.1;
        }
        this._rebuildProjection();
    }

    /**
     * Set aspect ratio
     * @param {number} aspect - Aspect ratio (width/height)
     */
    setAspect(aspect) {
        this.aspect = aspect;
        this._rebuildProjection();
    }

    /**
     * Reset camera to default position
     */
    resetCamera() {
        this.cameraRadius = 10.0;
        this.cameraTheta = 45.0;
        this.cameraPhi = 30.0;
        this.cameraTarget = vec3(0, 0, 0);
        this.updateViewMatrix();
    }

    /**
     * Main render loop - draw all objects
     */
    run() {
        const gl = this.gl;
        const locations = this.locations;

        // Upload lights to shader
        this.lightManager.uploadToShader();

        // Render each object
        for (const obj of this.objects) {
            // Bind position attribute
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.positionBuffer);
            gl.vertexAttribPointer(locations.aPosition, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(locations.aPosition);

            // Handle 3D objects with normals and textures
            if (obj.normalBuffer) {
                // Bind normal attribute
                gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
                gl.vertexAttribPointer(locations.aNormal, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(locations.aNormal);

                // Bind texture coordinate attribute
                gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
                gl.vertexAttribPointer(locations.aTexCoord, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(locations.aTexCoord);

                // Upload model matrix
                gl.uniformMatrix4fv(locations.uModel, false, flatten(obj.modelMatrix));

                // Calculate and upload normal matrix (inverse transpose of model matrix)
                const normalMat = normalMatrix(obj.modelMatrix, true);
                gl.uniformMatrix3fv(locations.uNormalMatrix, false, flatten(normalMat));

                // Upload material properties
                if (obj.material) {
                    if (!obj.isLight) {
                        // Normal objects: full lighting
                        gl.uniform3fv(locations['uMaterial.ambient'], flatten(obj.material.ambient));
                        gl.uniform3fv(locations['uMaterial.diffuse'], flatten(obj.material.diffuse));
                        gl.uniform3fv(locations['uMaterial.specular'], flatten(obj.material.specular));
                        gl.uniform1f(locations['uMaterial.shininess'], obj.material.shininess);
                    } else {
                        // Light objects: full bright, no lighting calculation
                        gl.uniform3fv(locations['uMaterial.ambient'], flatten(obj.material.ambient));
                        gl.uniform3fv(locations['uMaterial.diffuse'], vec3(0, 0, 0));
                        gl.uniform3fv(locations['uMaterial.specular'], vec3(0, 0, 0));
                        gl.uniform1f(locations['uMaterial.shininess'], 0.0);
                    }
                }

                // Handle texture
                if (obj.hasTexture && obj.textureId) {
                    gl.activeTexture(gl.TEXTURE0);
                    this.textureLoader.bindTexture(obj.textureId);
                    gl.uniform1i(locations.uTexture, 0);
                    gl.uniform1i(locations.uHasTexture, 1);
                } else {
                    gl.uniform1i(locations.uHasTexture, 0);
                }
            }

            // Draw the object
            gl.drawArrays(obj.type, 0, obj.count);
        }
    }
}
