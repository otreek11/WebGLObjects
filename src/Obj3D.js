function multmatvec(mat, vec) {
    return vec4(
        mat[0][0] * vec[0] + mat[0][1] * vec[1] + mat[0][2] * vec[2] + mat[0][3] * vec[3],
        mat[1][0] * vec[0] + mat[1][1] * vec[1] + mat[1][2] * vec[2] + mat[1][3] * vec[3],
        mat[2][0] * vec[0] + mat[2][1] * vec[1] + mat[2][2] * vec[2] + mat[2][3] * vec[3],
        mat[3][0] * vec[0] + mat[3][1] * vec[1] + mat[3][2] * vec[2] + mat[3][3] * vec[3]
    );
}


class Obj3D {
    constructor(gl, vertices, normals, texCoords, indices, ambient, diffuse, specular, shininess, color = null) {
        this.gl = gl;
        this.vertices = vertices;
        this.normals = normals;
        this.texCoords = texCoords;
        this.indices = indices;
        this.center = vec4();
        this.modelMatrix = mat4();

        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;

        this.color = color || vec4(1.0, 1.0, 1.0, 1.0);

        this.posVbo = null;
        this.nrmVbo = null;
        this.texVbo = null;
        this.ibo = null;

        this.isLightSource = false;
        this.texture = null;

        this._initBuffers();
    }

    _initBuffers() {
        let gl = this.gl;

        // inicialisa vbo de posicao
        this.posVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.posVbo);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

        // inicializa vbo de normais
        this.nrmVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nrmVbo);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normals), gl.STATIC_DRAW);

        this.texVbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texVbo);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.texCoords), gl.STATIC_DRAW);
            
        // inicializa ibo
        this.ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }

    translate(x, y, z) {
        this.modelMatrix = mult(translate(x, y, z), this.modelMatrix);
    }

    rotate(angle, axis, point = null) {
        if (point === null) point = multmatvec(this.modelMatrix, this.center);

        let centralize = translate(-point[0], -point[1], -point[2]);
        let back = translate(point[0], point[1], point[2]);

        this.modelMatrix = mult(back, mult(rotate(angle, normalize(axis)), mult(centralize, this.modelMatrix)));
    }

    scale(factor, point = null) {
        if (point === null) point = multmatvec(this.modelMatrix, this.center);

        let centralize = translate(-point[0], -point[1], -point[2]);
        let back = translate(point[0], point[1], point[2]);

        this.modelMatrix = mult(back, mult(scalem(factor, factor, factor), mult(centralize, this.modelMatrix)));
    }
}