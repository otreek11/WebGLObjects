/**
 * Texture Loading and Management System for WebGL
 * Handles texture image loading and WebGL texture creation
 */

class TextureLoader {
    /**
     * @param {WebGLRenderingContext} gl - WebGL context
     */
    constructor(gl) {
        this.gl = gl;
        this.textures = {}; // Dictionary of loaded textures by name
        this.loadedCount = 0;
    }

    /**
     * Load a texture from a URL
     * @param {string} name - Identifier for the texture
     * @param {string} url - URL/path to the image file
     * @param {function} callback - Optional callback function when texture is loaded
     * @returns {WebGLTexture} Texture object (may not be loaded yet)
     */
    loadTexture(name, url, callback) {
        const gl = this.gl;
        const texture = gl.createTexture();
        const image = new Image();

        // Bind a 1x1 blue pixel as placeholder until image loads
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]); // Blue placeholder
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            // Check if image is power of 2 in both dimensions
            if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
                // Yes, it's a power of 2. Generate mips.
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            } else {
                // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }

            this.textures[name] = texture;
            this.loadedCount++;

            console.log(`Texture loaded: ${name} (${image.width}x${image.height})`);

            if (callback) {
                callback();
            }
        };

        image.onerror = () => {
            console.error(`Failed to load texture: ${url}`);
            // Keep the blue placeholder texture
            this.textures[name] = texture;
        };

        image.src = url;
        return texture;
    }

    /**
     * Check if a value is a power of 2
     * @param {number} value - Value to check
     * @returns {boolean} True if power of 2
     */
    isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }

    /**
     * Bind a texture by name
     * @param {string} name - Name of the texture to bind
     * @returns {boolean} True if texture was found and bound
     */
    bindTexture(name) {
        if (this.textures[name]) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[name]);
            return true;
        }
        console.warn(`Texture not found: ${name}`);
        return false;
    }

    /**
     * Get a texture by name
     * @param {string} name - Name of the texture
     * @returns {WebGLTexture|null} Texture object or null if not found
     */
    getTexture(name) {
        return this.textures[name] || null;
    }

    /**
     * Check if a texture is loaded
     * @param {string} name - Name of the texture
     * @returns {boolean} True if texture exists
     */
    hasTexture(name) {
        return name in this.textures;
    }

    /**
     * Get number of loaded textures
     * @returns {number} Number of textures
     */
    getLoadedCount() {
        return this.loadedCount;
    }

    /**
     * Create a procedural checkerboard texture
     * @param {string} name - Name for the texture
     * @param {number} size - Size of the texture (power of 2 recommended)
     * @param {number} checkSize - Size of each checker square
     * @param {Array} color1 - First color [r, g, b, a] (0-255)
     * @param {Array} color2 - Second color [r, g, b, a] (0-255)
     * @returns {WebGLTexture} Created texture
     */
    createCheckerboardTexture(name, size = 256, checkSize = 16, color1 = [255, 255, 255, 255], color2 = [0, 0, 0, 255]) {
        const gl = this.gl;
        const texture = gl.createTexture();
        const data = new Uint8Array(size * size * 4);

        // Generate checkerboard pattern
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const isEven = (Math.floor(x / checkSize) + Math.floor(y / checkSize)) % 2 === 0;
                const color = isEven ? color1 : color2;
                const index = (y * size + x) * 4;
                data[index] = color[0];
                data[index + 1] = color[1];
                data[index + 2] = color[2];
                data[index + 3] = color[3];
            }
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.generateMipmap(gl.TEXTURE_2D);

        this.textures[name] = texture;
        this.loadedCount++;

        console.log(`Procedural checkerboard texture created: ${name}`);
        return texture;
    }
}
