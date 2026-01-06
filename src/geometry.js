/**
 * 3D Geometry Generators for WebGL
 * Generates vertices, normals, and texture coordinates for primitive 3D shapes
 */

/**
 * Generate a cube with per-face normals
 * @param {number} size - Side length of the cube
 * @returns {object} {vertices, normals, texCoords, count}
 */
function generateCube(size) {
    const s = size / 2;
    const vertices = [];
    const normals = [];
    const texCoords = [];

    // Each face needs its own vertices for proper per-face normals
    // Front face (Z+)
    vertices.push(
        vec4(-s, -s,  s, 1.0), vec4( s, -s,  s, 1.0), vec4( s,  s,  s, 1.0),
        vec4(-s, -s,  s, 1.0), vec4( s,  s,  s, 1.0), vec4(-s,  s,  s, 1.0)
    );
    for (let i = 0; i < 6; i++) normals.push(vec3(0, 0, 1));
    texCoords.push(vec2(0,0), vec2(1,0), vec2(1,1), vec2(0,0), vec2(1,1), vec2(0,1));

    // Back face (Z-)
    vertices.push(
        vec4( s, -s, -s, 1.0), vec4(-s, -s, -s, 1.0), vec4(-s,  s, -s, 1.0),
        vec4( s, -s, -s, 1.0), vec4(-s,  s, -s, 1.0), vec4( s,  s, -s, 1.0)
    );
    for (let i = 0; i < 6; i++) normals.push(vec3(0, 0, -1));
    texCoords.push(vec2(0,0), vec2(1,0), vec2(1,1), vec2(0,0), vec2(1,1), vec2(0,1));

    // Top face (Y+)
    vertices.push(
        vec4(-s,  s,  s, 1.0), vec4( s,  s,  s, 1.0), vec4( s,  s, -s, 1.0),
        vec4(-s,  s,  s, 1.0), vec4( s,  s, -s, 1.0), vec4(-s,  s, -s, 1.0)
    );
    for (let i = 0; i < 6; i++) normals.push(vec3(0, 1, 0));
    texCoords.push(vec2(0,0), vec2(1,0), vec2(1,1), vec2(0,0), vec2(1,1), vec2(0,1));

    // Bottom face (Y-)
    vertices.push(
        vec4(-s, -s, -s, 1.0), vec4( s, -s, -s, 1.0), vec4( s, -s,  s, 1.0),
        vec4(-s, -s, -s, 1.0), vec4( s, -s,  s, 1.0), vec4(-s, -s,  s, 1.0)
    );
    for (let i = 0; i < 6; i++) normals.push(vec3(0, -1, 0));
    texCoords.push(vec2(0,0), vec2(1,0), vec2(1,1), vec2(0,0), vec2(1,1), vec2(0,1));

    // Right face (X+)
    vertices.push(
        vec4( s, -s,  s, 1.0), vec4( s, -s, -s, 1.0), vec4( s,  s, -s, 1.0),
        vec4( s, -s,  s, 1.0), vec4( s,  s, -s, 1.0), vec4( s,  s,  s, 1.0)
    );
    for (let i = 0; i < 6; i++) normals.push(vec3(1, 0, 0));
    texCoords.push(vec2(0,0), vec2(1,0), vec2(1,1), vec2(0,0), vec2(1,1), vec2(0,1));

    // Left face (X-)
    vertices.push(
        vec4(-s, -s, -s, 1.0), vec4(-s, -s,  s, 1.0), vec4(-s,  s,  s, 1.0),
        vec4(-s, -s, -s, 1.0), vec4(-s,  s,  s, 1.0), vec4(-s,  s, -s, 1.0)
    );
    for (let i = 0; i < 6; i++) normals.push(vec3(-1, 0, 0));
    texCoords.push(vec2(0,0), vec2(1,0), vec2(1,1), vec2(0,0), vec2(1,1), vec2(0,1));

    return {
        vertices: vertices,
        normals: normals,
        texCoords: texCoords,
        count: vertices.length
    };
}

/**
 * Generate a sphere with smooth normals (curved surface)
 * @param {number} radius - Radius of the sphere
 * @param {number} latitudeBands - Number of latitude divisions
 * @param {number} longitudeBands - Number of longitude divisions
 * @returns {object} {vertices, normals, texCoords, count}
 */
function generateSphere(radius, latitudeBands, longitudeBands) {
    const vertices = [];
    const normals = [];
    const texCoords = [];

    // Generate vertices using spherical coordinates
    for (let lat = 0; lat <= latitudeBands; lat++) {
        const theta = lat * Math.PI / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= longitudeBands; lon++) {
            const phi = lon * 2 * Math.PI / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            // Position
            const x = radius * sinTheta * cosPhi;
            const y = radius * cosTheta;
            const z = radius * sinTheta * sinPhi;

            // Normal (normalized position vector for sphere)
            const nx = sinTheta * cosPhi;
            const ny = cosTheta;
            const nz = sinTheta * sinPhi;

            // Texture coordinates
            const u = 1 - (lon / longitudeBands);
            const v = 1 - (lat / latitudeBands);

            vertices.push(vec4(x, y, z, 1.0));
            normals.push(vec3(nx, ny, nz));
            texCoords.push(vec2(u, v));
        }
    }

    // Generate triangle indices and create final arrays
    const finalVertices = [];
    const finalNormals = [];
    const finalTexCoords = [];

    for (let lat = 0; lat < latitudeBands; lat++) {
        for (let lon = 0; lon < longitudeBands; lon++) {
            const first = (lat * (longitudeBands + 1)) + lon;
            const second = first + longitudeBands + 1;

            // Triangle 1
            finalVertices.push(vertices[first]);
            finalNormals.push(normals[first]);
            finalTexCoords.push(texCoords[first]);

            finalVertices.push(vertices[second]);
            finalNormals.push(normals[second]);
            finalTexCoords.push(texCoords[second]);

            finalVertices.push(vertices[first + 1]);
            finalNormals.push(normals[first + 1]);
            finalTexCoords.push(texCoords[first + 1]);

            // Triangle 2
            finalVertices.push(vertices[second]);
            finalNormals.push(normals[second]);
            finalTexCoords.push(texCoords[second]);

            finalVertices.push(vertices[second + 1]);
            finalNormals.push(normals[second + 1]);
            finalTexCoords.push(texCoords[second + 1]);

            finalVertices.push(vertices[first + 1]);
            finalNormals.push(normals[first + 1]);
            finalTexCoords.push(texCoords[first + 1]);
        }
    }

    return {
        vertices: finalVertices,
        normals: finalNormals,
        texCoords: finalTexCoords,
        count: finalVertices.length
    };
}

/**
 * Generate a cylinder with curved sides (curved surface)
 * @param {number} radius - Radius of the cylinder
 * @param {number} height - Height of the cylinder
 * @param {number} segments - Number of segments around the circumference
 * @returns {object} {vertices, normals, texCoords, count}
 */
function generateCylinder(radius, height, segments) {
    const vertices = [];
    const normals = [];
    const texCoords = [];
    const h = height / 2;

    // Side surface
    for (let i = 0; i <= segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const u = i / segments;

        // Normal points radially outward
        const nx = Math.cos(angle);
        const nz = Math.sin(angle);

        vertices.push(vec4(x, -h, z, 1.0));
        normals.push(vec3(nx, 0, nz));
        texCoords.push(vec2(u, 0));

        vertices.push(vec4(x, h, z, 1.0));
        normals.push(vec3(nx, 0, nz));
        texCoords.push(vec2(u, 1));
    }

    // Generate side triangles
    const sideVertices = [];
    const sideNormals = [];
    const sideTexCoords = [];

    for (let i = 0; i < segments; i++) {
        const idx = i * 2;

        // Triangle 1
        sideVertices.push(vertices[idx], vertices[idx + 2], vertices[idx + 1]);
        sideNormals.push(normals[idx], normals[idx + 2], normals[idx + 1]);
        sideTexCoords.push(texCoords[idx], texCoords[idx + 2], texCoords[idx + 1]);

        // Triangle 2
        sideVertices.push(vertices[idx + 1], vertices[idx + 2], vertices[idx + 3]);
        sideNormals.push(normals[idx + 1], normals[idx + 2], normals[idx + 3]);
        sideTexCoords.push(texCoords[idx + 1], texCoords[idx + 2], texCoords[idx + 3]);
    }

    // Top cap (Y+)
    for (let i = 0; i < segments; i++) {
        const angle1 = (i * 2 * Math.PI) / segments;
        const angle2 = ((i + 1) * 2 * Math.PI) / segments;

        sideVertices.push(
            vec4(0, h, 0, 1.0),
            vec4(radius * Math.cos(angle2), h, radius * Math.sin(angle2), 1.0),
            vec4(radius * Math.cos(angle1), h, radius * Math.sin(angle1), 1.0)
        );
        sideNormals.push(vec3(0, 1, 0), vec3(0, 1, 0), vec3(0, 1, 0));
        sideTexCoords.push(vec2(0.5, 0.5), vec2(0.5, 0.5), vec2(0.5, 0.5));
    }

    // Bottom cap (Y-)
    for (let i = 0; i < segments; i++) {
        const angle1 = (i * 2 * Math.PI) / segments;
        const angle2 = ((i + 1) * 2 * Math.PI) / segments;

        sideVertices.push(
            vec4(0, -h, 0, 1.0),
            vec4(radius * Math.cos(angle1), -h, radius * Math.sin(angle1), 1.0),
            vec4(radius * Math.cos(angle2), -h, radius * Math.sin(angle2), 1.0)
        );
        sideNormals.push(vec3(0, -1, 0), vec3(0, -1, 0), vec3(0, -1, 0));
        sideTexCoords.push(vec2(0.5, 0.5), vec2(0.5, 0.5), vec2(0.5, 0.5));
    }

    return {
        vertices: sideVertices,
        normals: sideNormals,
        texCoords: sideTexCoords,
        count: sideVertices.length
    };
}

/**
 * Generate a pyramid with square base
 * @param {number} baseSize - Size of the square base
 * @param {number} height - Height of the pyramid
 * @returns {object} {vertices, normals, texCoords, count}
 */
function generatePyramid(baseSize, height) {
    const vertices = [];
    const normals = [];
    const texCoords = [];
    const s = baseSize / 2;
    const apex = vec4(0, height / 2, 0, 1.0);

    // Helper function to calculate face normal
    function calcNormal(v1, v2, v3) {
        const p1 = vec3(v1[0], v1[1], v1[2]);
        const p2 = vec3(v2[0], v2[1], v2[2]);
        const p3 = vec3(v3[0], v3[1], v3[2]);

        const u = subtract(p2, p1);
        const v = subtract(p3, p1);
        return normalize(cross(u, v));
    }

    // Base vertices
    const base = [
        vec4(-s, -height/2, -s, 1.0),
        vec4( s, -height/2, -s, 1.0),
        vec4( s, -height/2,  s, 1.0),
        vec4(-s, -height/2,  s, 1.0)
    ];

    // Bottom face (base) - 2 triangles
    const baseNormal = vec3(0, -1, 0);
    vertices.push(base[0], base[2], base[1]);
    normals.push(baseNormal, baseNormal, baseNormal);
    texCoords.push(vec2(0, 0), vec2(1, 1), vec2(1, 0));

    vertices.push(base[0], base[3], base[2]);
    normals.push(baseNormal, baseNormal, baseNormal);
    texCoords.push(vec2(0, 0), vec2(0, 1), vec2(1, 1));

    // Front face
    let n = calcNormal(base[1], base[2], apex);
    vertices.push(base[1], base[2], apex);
    normals.push(n, n, n);
    texCoords.push(vec2(0, 0), vec2(1, 0), vec2(0.5, 1));

    // Right face
    n = calcNormal(base[2], base[3], apex);
    vertices.push(base[2], base[3], apex);
    normals.push(n, n, n);
    texCoords.push(vec2(0, 0), vec2(1, 0), vec2(0.5, 1));

    // Back face
    n = calcNormal(base[3], base[0], apex);
    vertices.push(base[3], base[0], apex);
    normals.push(n, n, n);
    texCoords.push(vec2(0, 0), vec2(1, 0), vec2(0.5, 1));

    // Left face
    n = calcNormal(base[0], base[1], apex);
    vertices.push(base[0], base[1], apex);
    normals.push(n, n, n);
    texCoords.push(vec2(0, 0), vec2(1, 0), vec2(0.5, 1));

    return {
        vertices: vertices,
        normals: normals,
        texCoords: texCoords,
        count: vertices.length
    };
}

/**
 * Factory function to create a VisualObject cube
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {vec3} position - Position of the cube center
 * @param {number} size - Side length
 * @returns {VisualObject} Configured cube object
 */
function createCube(gl, position, size) {
    const geom = generateCube(size);
    const obj = new VisualObject(
        gl,
        geom.vertices,
        geom.normals,
        geom.texCoords,
        gl.TRIANGLES
    );

    // Apply translation to position
    obj.modelMatrix = translate(position[0], position[1], position[2]);

    return obj;
}

/**
 * Factory function to create a VisualObject sphere
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {vec3} position - Position of the sphere center
 * @param {number} radius - Sphere radius
 * @param {number} latBands - Latitude bands (default 30)
 * @param {number} lonBands - Longitude bands (default 30)
 * @returns {VisualObject} Configured sphere object
 */
function createSphere(gl, position, radius, latBands = 30, lonBands = 30) {
    const geom = generateSphere(radius, latBands, lonBands);
    const obj = new VisualObject(
        gl,
        geom.vertices,
        geom.normals,
        geom.texCoords,
        gl.TRIANGLES
    );

    // Apply translation to position
    obj.modelMatrix = translate(position[0], position[1], position[2]);

    return obj;
}

/**
 * Factory function to create a VisualObject cylinder
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {vec3} position - Position of the cylinder center
 * @param {number} radius - Cylinder radius
 * @param {number} height - Cylinder height
 * @param {number} segments - Circumference segments (default 24)
 * @returns {VisualObject} Configured cylinder object
 */
function createCylinder(gl, position, radius, height, segments = 24) {
    const geom = generateCylinder(radius, height, segments);
    const obj = new VisualObject(
        gl,
        geom.vertices,
        geom.normals,
        geom.texCoords,
        gl.TRIANGLES
    );

    // Apply translation to position
    obj.modelMatrix = translate(position[0], position[1], position[2]);

    return obj;
}

/**
 * Factory function to create a VisualObject pyramid
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {vec3} position - Position of the pyramid center
 * @param {number} baseSize - Size of the square base
 * @param {number} height - Height of the pyramid
 * @returns {VisualObject} Configured pyramid object
 */
function createPyramid(gl, position, baseSize, height) {
    const geom = generatePyramid(baseSize, height);
    const obj = new VisualObject(
        gl,
        geom.vertices,
        geom.normals,
        geom.texCoords,
        gl.TRIANGLES
    );

    // Apply translation to position
    obj.modelMatrix = translate(position[0], position[1], position[2]);

    return obj;
}
