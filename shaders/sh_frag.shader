precision mediump float;

struct Light {
    vec4 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

uniform Light uLights[4];
uniform int uNumLights;
uniform Material uMaterial;
uniform vec3 uCameraPosition;
uniform bool uHasTexture;
uniform sampler2D uTexture;

varying vec3 vNormal;
varying vec3 vFragPos;
varying vec2 vTexCoord;

vec3 calculateBlinnPhongLight(Light light, vec3 normal, vec3 viewDir) {
    // Ambient component
    vec3 ambient = light.ambient * uMaterial.ambient;

    // Diffuse component
    vec3 lightDir = normalize(light.position.xyz - vFragPos);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = light.diffuse * (diff * uMaterial.diffuse);

    // Specular component (Blinn-Phong half-vector model)
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), uMaterial.shininess);
    vec3 specular = light.specular * (spec * uMaterial.specular);

    return ambient + diffuse + specular;
}

void main() {
    vec3 norm = normalize(vNormal);
    vec3 viewDir = normalize(uCameraPosition - vFragPos);

    // Accumulate lighting from all lights
    vec3 result = vec3(0.0);
    for (int i = 0; i < 4; i++) {
        if (i >= uNumLights) break;
        result += calculateBlinnPhongLight(uLights[i], norm, viewDir);
    }

    // Texture modulation (Modulate mode)
    if (uHasTexture) {
        vec4 texColor = texture2D(uTexture, vTexCoord);
        result *= texColor.rgb;  // Multiply lighting by texture color
        gl_FragColor = vec4(result, texColor.a);
    } else {
        gl_FragColor = vec4(result, 1.0);
    }
}
