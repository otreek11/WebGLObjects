/**
 * Animation System for WebGL Objects
 * Provides time-based animations for object transformations
 */

/**
 * Animation class for individual object animations
 */
class Animation {
    /**
     * @param {VisualObject} object - The object to animate
     * @param {string} type - Animation type: 'rotate', 'translate', 'scale', 'orbit'
     * @param {object} params - Type-specific parameters
     */
    constructor(object, type, params) {
        this.object = object;
        this.type = type;
        this.params = params;
        this.time = 0; // Accumulated time in seconds
        this.enabled = true;

        // Store initial state
        this.initialMatrix = mat4(this.object.modelMatrix);

        // For orbit animation, store the initial position
        if (type === 'orbit') {
            this.orbitAngle = params.initialAngle || 0;
        }
    }

    /**
     * Update the animation
     * @param {number} deltaTime - Time elapsed since last update (in seconds)
     */
    update(deltaTime) {
        if (!this.enabled) return;

        this.time += deltaTime;

        switch (this.type) {
            case 'rotate':
                this.updateRotate(deltaTime);
                break;

            case 'orbit':
                this.updateOrbit(deltaTime);
                break;

            case 'scale':
                this.updateScale(deltaTime);
                break;

            case 'translate':
                this.updateTranslate(deltaTime);
                break;

            default:
                console.warn(`Unknown animation type: ${this.type}`);
        }
    }

    /**
     * Continuous rotation around an axis
     * Params: speed (degrees/sec), axis (vec3)
     */
    updateRotate(deltaTime) {
        const angle = this.params.speed * deltaTime;
        const axis = this.params.axis || vec3(0, 1, 0);

        // Apply rotation
        this.object.rotate(angle, axis);
    }

    /**
     * Circular orbital motion around a center point
     * Params: center (vec3), radius (number), speed (rad/sec)
     */
    updateOrbit(deltaTime) {
        const center = this.params.center || vec3(0, 0, 0);
        const speed = this.params.speed || 1.0;
        const axis = this.params.axis || vec3(0, 1, 0)


        this.object.rotate(speed * deltaTime, axis, center);
    }

    /**
     * Pulsating scale animation
     * Params: amplitude (number), frequency (Hz), baseScale (number)
     */
    updateScale(deltaTime) {
        const amplitude = this.params.amplitude || 0.2;
        const frequency = this.params.frequency || 1.0;
        const baseScale = this.params.baseScale || 1.0;

        // Calculate scale factor using sine wave
        const scaleFactor = baseScale + amplitude * Math.sin(this.time * frequency * 2 * Math.PI);

        // Apply scale to initial matrix
        this.object.scale(scaleFactor);
    }

    /**
     * Oscillating translation along an axis
     * Params: axis (vec3), amplitude (number), frequency (Hz)
     */
    updateTranslate(deltaTime) {
        const axis = this.params.axis || vec3(0, 1, 0);
        const amplitude = this.params.amplitude || 1.0;
        const frequency = this.params.frequency || 1.0;

        // Calculate offset using sine wave
        const offset = amplitude * Math.sin(this.time * frequency * 2 * Math.PI);

        // Apply translation to initial matrix
        this.object.translate(scale(offset, axis));
    }

    /**
     * Enable or disable the animation
     * @param {boolean} enabled - Enable state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Reset the animation to initial state
     */
    reset() {
        this.time = 0;
        this.object.modelMatrix = mat4(this.initialMatrix);
        if (this.type === 'orbit') {
            this.orbitAngle = this.params.initialAngle || 0;
        }
    }
}

/**
 * AnimationManager class to manage multiple animations
 */
class AnimationManager {
    constructor() {
        this.animations = [];
        this.lastTime = 0;
        this.speedMultiplier = 1.0; // Global animation speed control
        this.paused = false;
    }

    /**
     * Add an animation to the manager
     * @param {Animation} animation - Animation to add
     * @returns {number} Index of the added animation
     */
    addAnimation(animation) {
        this.animations.push(animation);
        return this.animations.length - 1;
    }

    /**
     * Remove an animation by index
     * @param {number} index - Index of animation to remove
     * @returns {boolean} Success status
     */
    removeAnimation(index) {
        if (index >= 0 && index < this.animations.length) {
            this.animations.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * Update all animations
     * @param {number} currentTime - Current time in milliseconds
     */
    update(currentTime) {
        if (this.paused) {
            this.lastTime = currentTime;
            return;
        }

        // Calculate delta time in seconds
        const deltaTime = (currentTime - this.lastTime) * 0.001 * this.speedMultiplier;
        this.lastTime = currentTime;

        // Update all animations
        for (const anim of this.animations) {
            anim.update(deltaTime);
        }
    }

    /**
     * Set global animation speed multiplier
     * @param {number} multiplier - Speed multiplier (1.0 = normal, 0.5 = half speed, 2.0 = double speed)
     */
    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = Math.max(0, multiplier);
    }

    /**
     * Pause all animations
     */
    pause() {
        this.paused = true;
    }

    /**
     * Resume all animations
     */
    resume() {
        this.paused = false;
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        this.paused = !this.paused;
    }

    /**
     * Enable or disable a specific animation
     * @param {number} index - Index of animation
     * @param {boolean} enabled - Enable state
     */
    setAnimationEnabled(index, enabled) {
        if (index >= 0 && index < this.animations.length) {
            this.animations[index].setEnabled(enabled);
        }
    }

    /**
     * Reset all animations
     */
    resetAll() {
        for (const anim of this.animations) {
            anim.reset();
        }
        this.lastTime = 0;
    }

    /**
     * Get number of animations
     * @returns {number} Number of animations
     */
    getCount() {
        return this.animations.length;
    }

    /**
     * Clear all animations
     */
    clearAll() {
        this.animations = [];
        this.lastTime = 0;
    }
}
