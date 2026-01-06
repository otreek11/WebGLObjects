/**
 * Lighting System for WebGL
 * Manages light sources and uploads light data to shaders
 */

/**
 * Light class representing a point light source
 */
class Light {
    /**
     * @param {vec4} position - Position of the light (x, y, z, w=1 for point light)
     * @param {vec3} ambient - Ambient light color contribution
     * @param {vec3} diffuse - Diffuse light color (main light color)
     * @param {vec3} specular - Specular highlight color
     */
    constructor(position, ambient, diffuse, specular) {
        this.position = position;
        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
    }
}

/**
 * LightManager class to manage multiple lights and upload to shaders
 */
class LightManager {
    /**
     * @param {WebGLRenderingContext} gl - WebGL context
     * @param {object} locations - Shader uniform/attribute locations
     */
    constructor(gl, locations) {
        this.gl = gl;
        this.locations = locations;
        this.lights = [];
        this.maxLights = 4; // Maximum number of lights supported by shader
    }

    /**
     * Add a light to the scene
     * @param {Light} light - Light object to add
     * @returns {boolean} Success status
     */
    addLight(light) {
        if (this.lights.length >= this.maxLights) {
            console.warn(`Maximum ${this.maxLights} lights supported. Cannot add more lights.`);
            return false;
        }
        this.lights.push(light);
        return true;
    }

    /**
     * Remove a light from the scene
     * @param {number} index - Index of light to remove
     * @returns {boolean} Success status
     */
    removeLight(index) {
        if (index >= 0 && index < this.lights.length) {
            this.lights.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Upload all light data to shader uniforms
     */
    uploadToShader() {
        const gl = this.gl;
        const locations = this.locations;

        // Upload number of active lights
        gl.uniform1i(locations.uNumLights, this.lights.length);

        // Upload each light's properties
        for (let i = 0; i < this.lights.length; i++) {
            const light = this.lights[i];

            // Upload position
            if (locations[`uLights[${i}].position`]) {
                gl.uniform4fv(locations[`uLights[${i}].position`], flatten(light.position));
            }

            // Upload ambient color
            if (locations[`uLights[${i}].ambient`]) {
                gl.uniform3fv(locations[`uLights[${i}].ambient`], flatten(light.ambient));
            }

            // Upload diffuse color
            if (locations[`uLights[${i}].diffuse`]) {
                gl.uniform3fv(locations[`uLights[${i}].diffuse`], flatten(light.diffuse));
            }

            // Upload specular color
            if (locations[`uLights[${i}].specular`]) {
                gl.uniform3fv(locations[`uLights[${i}].specular`], flatten(light.specular));
            }
        }
    }

    /**
     * Get light by index
     * @param {number} index - Index of light
     * @returns {Light|null} Light object or null if not found
     */
    getLight(index) {
        if (index >= 0 && index < this.lights.length) {
            return this.lights[index];
        }
        return null;
    }

    /**
     * Get number of lights
     * @returns {number} Number of lights in the scene
     */
    getLightCount() {
        return this.lights.length;
    }

    /**
     * Clear all lights
     */
    clearLights() {
        this.lights = [];
    }
}
