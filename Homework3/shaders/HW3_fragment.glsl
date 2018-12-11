//FRAGMENT SHADER

#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;

varying vec4 vertexPosition;
varying vec3 v_normal;

varying vec3 v_LightColor;     // Light color
varying vec3 v_LightPosition;  // Position of the light source
//varying vec3 v_DiffuseMat;     // Diffuse material color

void main() {
    //Apply Texture
    vec4 texture = texture2D(u_Sampler, v_TexCoord);

    //Apply Lighting per-fragment

    float d = length(v_LightPosition - vec3(vertexPosition)); 
    float atten = 1.0/(0.01 * d*d); 
    // Calculate the light direction and make it 1.0 in length
    vec3 lightDirection = normalize(v_LightPosition - vec3(vertexPosition));
    // The dot product of the light direction and the normal
    float nDotL = max(dot(lightDirection, v_normal), 0.0);

    // Calculate the color due to diffuse reflection
    vec3 kD = texture.rgb; //use texture color as DiffuseMaterial
    vec3 diffuse = v_LightColor * kD * nDotL;

    // Add the surface colors due to diffuse reflection and texture as a material
    gl_FragColor = vec4(diffuse, 1.0); 
}