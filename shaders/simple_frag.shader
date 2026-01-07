precision mediump float;

// variaveis vindas do vertex
varying vec3 vNormal;
varying vec3 vFragPos;
varying vec2 vTexCoord;

uniform vec4 uColor;
uniform vec3 uViewPos;

struct Light {
    vec4 position;
    vec4 color;
};

uniform sampler2D uTexture;
uniform int uHasTexture;

uniform Light uLights[2];
uniform int uIsLightSource;

struct Material {
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
    float shininess;
};

uniform Material uMaterial;

vec3 calculateBlinnPhongLight(Light light, vec3 normal, vec3 viewDir, vec3 baseColor) {

    vec3 lightColor = light.color.rgb;
    vec3 ambient = uMaterial.ambient * lightColor * baseColor;

    vec3 lightDir = normalize(light.position.xyz - vFragPos);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * baseColor * lightColor;

    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), uMaterial.shininess);
    vec3 specular = spec * uMaterial.specular * lightColor;

    return ambient + diffuse + specular;
}

void main() {

    if (uIsLightSource == 1) {
        gl_FragColor = uColor;
        return;
    }

    vec4 texColor = vec4(1.0, 1.0, 1.0, 1.0);
    if (uHasTexture == 1) {
        texColor = texture2D(uTexture, vTexCoord);
    }

    vec3 baseColor = (uHasTexture == 1) ? texColor.rgb : uMaterial.diffuse;

    vec3 lighting = vec3(0.0);
    
    vec3 norm = normalize(vNormal);
    vec3 viewDir = normalize(uViewPos - vFragPos);

    for (int i = 0; i < 2; i++) {
        lighting += calculateBlinnPhongLight(uLights[i], norm, viewDir, baseColor);
    }

    vec3 finalColor = lighting * uColor.rgb;
    gl_FragColor = vec4(finalColor, uColor.a);
}