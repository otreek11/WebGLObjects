const COLORS = {
    default: vec4(0.1, 0.2, 0.3, 1.0),
    selected: vec4(0.2, 0.6, 1.0, 1.0),
    auxiliary: vec4(1.0, 0.4, 0.4, 1.0)
}

// a implementacao padrao do mult nao consegue multiplicar mat4 por vec4
// isso me deu muita dor de cabeca
// tipo. muita..
// eu to aqui acho que faz 1 hora
// Deus ajude nos todos
function multmatvec(mat, vec)
{
    return vec4(
        mat[0][0] * vec[0] + mat[0][1] * vec[1] + mat[0][2] * vec[2] + mat[0][3] * vec[3],
        mat[1][0] * vec[0] + mat[1][1] * vec[1] + mat[1][2] * vec[2] + mat[1][3] * vec[3],
        mat[2][0] * vec[0] + mat[2][1] * vec[1] + mat[2][2] * vec[2] + mat[2][3] * vec[3],
        mat[3][0] * vec[0] + mat[3][1] * vec[1] + mat[3][2] * vec[2] + mat[3][3] * vec[3]
    );
}

class VisualObject {
    constructor(gl, vertices, normalsOrColor, texCoords = null, type = null, mode = "default") {
        // Backward compatibility: if texCoords is null, assume old 2D constructor
        const is3D = texCoords !== null;

        if (!type)
            type = gl.TRIANGLES

        this.type = type;
        this.mode = mode;
        this.gl = gl;

        // Position data
        this.vertices = vertices;
        this.count = vertices.length;
        this.modelMatrix = mat4();

        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

        if (is3D) {
            // 3D mode: second parameter is normals, third is texCoords
            this.normals = normalsOrColor;
            this.texCoords = texCoords;

            // Create normal buffer
            this.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);

            // Create texture coordinate buffer
            this.texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoords), gl.STATIC_DRAW);

            // Default material properties (Blinn-Phong)
            this.material = {
                ambient: vec3(0.2, 0.2, 0.2),
                diffuse: vec3(0.8, 0.8, 0.8),
                specular: vec3(1.0, 1.0, 1.0),
                shininess: 32.0
            };

            // Texture properties
            this.hasTexture = false;
            this.textureId = null;

            // Light object flag
            this.isLight = false;

            this.color = null; // Not used in 3D mode
        } else {
            // 2D mode: second parameter is color
            this.color = normalsOrColor;
            this.normals = null;
            this.texCoords = null;
            this.normalBuffer = null;
            this.texCoordBuffer = null;
            this.material = null;
            this.hasTexture = false;
            this.textureId = null;
            this.isLight = false;
        }
    }

    applyTranslation(x, y) 
    {
        this.modelMatrix = mult(translate(x, y, 0), this.modelMatrix);
    }

    applyRotation(angle, point) 
    {
        if (!point) point = multmatvec(this.modelMatrix, this.vertices[0]); // centro

        let centralize = translate(-point[0], -point[1], 0);
        let back = translate(point[0], point[1], 0);
        
        // coloca em (0, 0), rotaciona e retorna
        this.modelMatrix = mult(back, mult(rotate(angle, [0, 0, 1]), mult(centralize, this.modelMatrix)));

        // this.updateCenter();
    }

    applyScale(factor, point)
    {
        if (!point) point = multmatvec(this.modelMatrix, this.vertices[0]); // centro

        let centralize = translate(-point[0], -point[1], 0);
        let back = translate(point[0], point[1], 0);

        this.modelMatrix = mult(back, mult(scalem(factor, factor, 1), mult(centralize, this.modelMatrix)));
        // this.updateCenter();
    }

    applyMirror(p1, p2)
    {
        // vetor da reta
        let dx = p2[0] - p1[0];
        let dy = p2[1] - p1[1];

        let angle = Math.atan2(dy, dx);

        let t = translate(-p1[0], -p1[1], 0);
        let it = translate(p1[0], p1[1], 0);

        let r = rotate(-angle*180/Math.PI, [0, 0, 1]);
        let ir = rotate(angle*180/Math.PI, [0, 0, 1]);

        // espelhamento em Y
        let mirror = scalem(1, -1, 1);

        // transforma
        let transform = mult(it, mult(ir, mult(mirror, mult(r, t))));
        this.modelMatrix = mult(transform, this.modelMatrix);
    }

    recolor(color)
    {
        this.color = color;
    }

    updateBuffers()
    {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.vertices), this.gl.STATIC_DRAW);

        // Update normal buffer if it exists (3D mode)
        if (this.normalBuffer && this.normals) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.normals), this.gl.STATIC_DRAW);
        }

        // Update texture coordinate buffer if it exists (3D mode)
        if (this.texCoordBuffer && this.texCoords) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.texCoords), this.gl.STATIC_DRAW);
        }
    }

    finishFreeDraw()
    {
        if (this.mode !== 'freedraw')
        {
            console.log("finishFreeDraw called on a non-freedraw object");
        }

        if (this.vertices.length < 3) 
        {
            console.log("Number of vertices are insufficient to form a polygon");
        }

        this.mode = 'default';
        // this.vertices.push(this.vertices[1]);
        this.updateBuffers();

        this.recolor(COLORS.default);
        this.updateCenter();

    }

    updateCenter()
    {
        let sum = [0, 0];

        for (const v of this.vertices)
        {
            let vert = multmatvec(this.modelMatrix, v);
            sum[0] += vert[0];
            sum[1] += vert[1];
        }

        sum = [sum[0] / this.vertices.length, sum[1] / this.vertices.length];

        this.center = [sum[0], sum[1]];
    }

    isPointInside(x, y)
    {
        let ni = 0;
        let fst = this.vertices.length - 1;
        let p1, p2, xc, dx;

        for (let i = 1; i < this.vertices.length; i++)
        {
            p1 = this.vertices[i];
            p2 = this.vertices[fst];
            p1 = multmatvec(this.modelMatrix, p1);
            p2 = multmatvec(this.modelMatrix, p2);

            if (!(p1[1] === p2[1]) &&
                !((p1[1] > y) && (p2[1] > y)) &&
                !((p1[1] < y) && (p2[1] < y)) &&
                !((p1[0] < x) && (p2[0] < x)))
            {
                if (p1[1] === y)
                {
                    if ((p1[0] > x) && (p2[1] > y)) ni++;
                }
                else if (p2[1] === y)
                {
                    if ((p2[0] > x) && (p1[1] > y)) ni++;
                }
                else if ((p1[0] > x) && (p2[0] > x))
                {
                    ni++;
                }
                else
                {
                    dx = p1[0] - p2[0];
                    xc = p1[0];

                    if (dx !== 0.0)
                        xc += (y - p1[1]) * dx / (p1[1] - p2[1]);

                    if (xc > x)
                        ni++;
                }
            }

            fst = i;
        }

        return (ni % 2) === 1;
    }
}

function makeSquare(gl, center, size, colors)
{
    size = size/2.0;
    let vertices = [
        vec4(center[0], center[1], 0.0, 1.0),
        vec4(center[0] - size, center[1] - size, 0.0, 1.0),
        vec4(center[0] + size, center[1] - size, 0.0, 1.0),
        vec4(center[0] + size, center[1] + size, 0.0, 1.0),
        vec4(center[0] - size, center[1] + size, 0.0, 1.0),
        vec4(center[0] - size, center[1] - size, 0.0, 1.0),
    ];

    return new VisualObject(gl, vertices, colors, gl.TRIANGLE_FAN);
}

function makeTriangle(gl, center, size, colors)
{
    size = size/2.0;
    let vertices = [
        vec4(center[0], center[1], 0.0, 1.0),
        vec4(center[0] - size, center[1] - size, 0.0, 1.0),
        vec4(center[0] + size, center[1] - size, 0.0, 1.0),
        vec4(center[0], center[1] + size, 0.0, 1.0),
        vec4(center[0] - size, center[1] - size, 0.0, 1.0),
    ];

    return new VisualObject(gl, vertices, colors, gl.TRIANGLE_FAN);
}