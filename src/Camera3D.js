class Camera3D {
    constructor(eye, at, up) {
        this.eye = vec3(eye);
        this.up = vec3(up);

        let dir = subtract(at, eye);
        dir = normalize(dir);

        this.at = add(eye, dir);
        
        this.phi = Math.asin(dir[1]); 
        this.theta = Math.atan2(dir[0], dir[2]);
        
        this.viewMatrix = null;
        this.update();
    }

    
    moveTowards(speed, movedir) {
        // so pra garantir
        if (length(movedir) === 0) return;

        movedir = normalize(movedir);

        let forward = normalize(subtract(this.at, this.eye));
        let right = normalize(cross(forward, this.up));

        let moveFwd = scale(speed * movedir[1], forward); // W/S
        let moveSide = scale(speed * movedir[0], right);  // A/D
        
        let displacement = add(moveFwd, moveSide);

        this.eye = add(this.eye, displacement);
        this.at  = add(this.at, displacement);

        this.update();
    }
    
    rotate(strength, anglevec) {
        // so pra garantir
        if (length(anglevec) === 0) return;

        anglevec = scale(strength, normalize(anglevec));

        let angleh = anglevec[0];
        let anglev = anglevec[1];
        
        this.theta += angleh;
        this.phi += anglev;

        // limite pra camera nao girar de ponta cabeca
        let limit = Math.PI / 2 - 0.01;
        this.phi = Math.max(-limit, Math.min(limit, this.phi));

        let frontX = Math.cos(this.phi) * Math.sin(this.theta);
        let frontY = Math.sin(this.phi);
        let frontZ = Math.cos(this.phi) * Math.cos(this.theta);

        this.at = add(this.eye, vec3(frontX, frontY, frontZ));

        this.update();
    }

    update() {
        this.viewMatrix = lookAt(this.eye, this.at, this.up);
    }

    copy() {
        return new Camera3D(this.eye, this.at, this.up);
    }
}