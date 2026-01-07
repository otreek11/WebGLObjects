function createCubeData() {
    const v = [
        // frente
        -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,
        // trás
        -0.5, -0.5, -0.5,  -0.5,  0.5, -0.5,   0.5,  0.5, -0.5,   0.5, -0.5, -0.5,
        // cima
        -0.5,  0.5, -0.5,  -0.5,  0.5,  0.5,   0.5,  0.5,  0.5,   0.5,  0.5, -0.5,
        // baixo
        -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5,  0.5,  -0.5, -0.5,  0.5,
        // direita
         0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5,  0.5,  0.5,   0.5, -0.5,  0.5,
        // esquerda
        -0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5
    ];

    const n = [
        0,0,1, 0,0,1, 0,0,1, 0,0,1,  0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
        0,1,0, 0,1,0, 0,1,0, 0,1,0,  0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
        1,0,0, 1,0,0, 1,0,0, 1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0
    ];

    const t = [
        0,0, 1,0, 1,1, 0,1,
        1,0, 1,1, 0,1, 0,0,
        0,1, 0,0, 1,0, 1,1,
        0,0, 1,0, 1,1, 0,1,
        1,0, 1,1, 0,1, 0,0,
        0,0, 1,0, 1,1, 0,1
    ];

    const i = [
        0,1,2, 0,2,3, 4,5,6, 4,6,7, 8,9,10, 8,10,11, 
        12,13,14, 12,14,15, 16,17,18, 16,18,19, 20,21,22, 20,22,23
    ];

    return { 
        vertices: new Float32Array(v), 
        normals: new Float32Array(n), 
        texCoords: new Float32Array(t),
        indices: new Uint16Array(i) 
    };
}

function createPyramidData() {
    const top = [0, 1, 0];
    const b1  = [-0.5, 0,  0.5];
    const b2  = [ 0.5, 0,  0.5];
    const b3  = [ 0.5, 0, -0.5];
    const b4  = [-0.5, 0, -0.5];

    let points = [];
    let normals = [];
    let texCoords = [];

    function calcNormal(p1, p2, p3) {
        let ux = p2[0] - p1[0], uy = p2[1] - p1[1], uz = p2[2] - p1[2];
        let vx = p3[0] - p1[0], vy = p3[1] - p1[1], vz = p3[2] - p1[2];
        let nx = uy * vz - uz * vy;
        let ny = uz * vx - ux * vz;
        let nz = ux * vy - uy * vx;
        let len = Math.sqrt(nx*nx + ny*ny + nz*nz);
        return [nx/len, ny/len, nz/len];
    }

    function addTri(p1, p2, p3, t1, t2, t3) {
        points.push(...p1, ...p2, ...p3);
        let n = calcNormal(p1, p2, p3);
        normals.push(...n, ...n, ...n);
        texCoords.push(...t1, ...t2, ...t3);
    }

    addTri(b1, b2, top, [0,0], [1,0], [0.5,1]);
    addTri(b2, b3, top, [0,0], [1,0], [0.5,1]);
    addTri(b3, b4, top, [0,0], [1,0], [0.5,1]);
    addTri(b4, b1, top, [0,0], [1,0], [0.5,1]);

    points.push(...b1, ...b4, ...b3); 
    texCoords.push(0,0,  0,1,  1,1);

    points.push(...b1, ...b3, ...b2);
    texCoords.push(0,0,  1,1,  1,0);
    
    for(let k=0; k<6; k++) normals.push(0, -1, 0);

    let indices = [];
    for(let i=0; i<points.length/3; i++) indices.push(i);

    return { 
        vertices: new Float32Array(points), 
        normals: new Float32Array(normals), 
        texCoords: new Float32Array(texCoords),
        indices: new Uint16Array(indices) 
    };
}

function createSphereData(radius, latBands, longBands) {
    let v = [], n = [], t = [], i = [];
    
    for (let lat = 0; lat <= latBands; lat++) {
        let theta = lat * Math.PI / latBands;
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= longBands; lon++) {
            let phi = lon * 2 * Math.PI / longBands;
            let x = Math.cos(phi) * sinTheta;
            let y = cosTheta;
            let z = Math.sin(phi) * sinTheta;

            let u = 1 - (lon / longBands); 
            let vv = 1 - (lat / latBands);

            n.push(x, y, z);
            v.push(radius * x, radius * y, radius * z);
            t.push(u, vv);
        }
    }

    for (let lat = 0; lat < latBands; lat++) {
        for (let lon = 0; lon < longBands; lon++) {
            let first = (lat * (longBands + 1)) + lon;
            let second = first + longBands + 1;
            i.push(first, second, first + 1);
            i.push(second, second + 1, first + 1);
        }
    }

    return { 
        vertices: new Float32Array(v), 
        normals: new Float32Array(n), 
        texCoords: new Float32Array(t), 
        indices: new Uint16Array(i) 
    };
}

function createCylinderData(radius, height, segments) {
    let v = [], n = [], t = [], i = [];
    let halfH = height / 2;

    for (let s = 0; s <= segments; s++) {
        let theta = (s / segments) * 2 * Math.PI;
        let nextTheta = ((s + 1) / segments) * 2 * Math.PI;

        let x = Math.cos(theta) * radius;
        let z = Math.sin(theta) * radius;
        let nx = Math.cos(nextTheta) * radius;
        let nz = Math.sin(nextTheta) * radius;

        let u = s / segments;
        let nextU = (s + 1) / segments;

        let n1 = [Math.cos(theta), 0, Math.sin(theta)];
        let n2 = [Math.cos(nextTheta), 0, Math.sin(nextTheta)];

        v.push(x, -halfH, z);    n.push(...n1); t.push(u, 1.0);
        v.push(nx, halfH, nz);   n.push(...n2); t.push(nextU, 0.0);
        v.push(x, halfH, z);     n.push(...n1); t.push(u, 0.0);

        v.push(x, -halfH, z);    n.push(...n1); t.push(u, 1.0);
        v.push(nx, -halfH, nz);  n.push(...n2); t.push(nextU, 1.0);
        v.push(nx, halfH, nz);   n.push(...n2); t.push(nextU, 0.0);
    }

    const mapCapUV = (x, z) => [ (x/radius + 1)/2, (z/radius + 1)/2 ];

    let topCenterIndex = v.length / 3;
    v.push(0, halfH, 0); 
    n.push(0, 1, 0); 
    t.push(0.5, 0.5);

    for (let s = 0; s <= segments; s++) {
        let theta = (s / segments) * 2 * Math.PI;
        let x = Math.cos(theta) * radius;
        let z = Math.sin(theta) * radius;
        v.push(x, halfH, z); 
        n.push(0, 1, 0);
        t.push(...mapCapUV(x, z));
    }
    
    for (let s = 0; s < segments; s++) {
        i.push(topCenterIndex, topCenterIndex + 1 + s, topCenterIndex + 1 + s + 1);
    }

    let botCenterIndex = v.length / 3;
    v.push(0, -halfH, 0); 
    n.push(0, -1, 0); 
    t.push(0.5, 0.5);

    for (let s = 0; s <= segments; s++) {
        let theta = (s / segments) * 2 * Math.PI;
        let x = Math.cos(theta) * radius;
        let z = Math.sin(theta) * radius;
        v.push(x, -halfH, z); 
        n.push(0, -1, 0);
        t.push(...mapCapUV(x, z));
    }

    for (let s = 0; s < segments; s++) {
        i.push(botCenterIndex, botCenterIndex + 1 + s + 1, botCenterIndex + 1 + s);
    }

    let sideCount = (segments + 1) * 6;
    let sideIndices = [];
    for(let k=0; k<sideCount; k++) sideIndices.push(k);
    
    return { 
        vertices: new Float32Array(v), 
        normals: new Float32Array(n), 
        texCoords: new Float32Array(t), 
        indices: new Uint16Array([...sideIndices, ...i]) 
    };
}