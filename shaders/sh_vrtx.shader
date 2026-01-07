attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

varying vec3 vNormal;
varying vec3 vFragPos;
varying vec2 vTexCoord;


void main()
{
    vec4 worldPos = uModel * aPosition;
    vFragPos = worldPos.xyz;

    vNormal = mat3(uModel) * aNormal;
    
    vTexCoord = aTexCoord;

    gl_Position = uProjection * uView * worldPos; // MVP
}
