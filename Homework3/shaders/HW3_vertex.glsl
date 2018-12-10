//VERTEX SHADER

attribute vec4 a_Position;
attribute vec4 a_Normal;
attribute vec2 a_TexCoord;

uniform mat4 u_ModelMatrix;    // Model matrix
uniform mat4 u_MvpMatrix;      // Model-view-projection matrix
uniform mat4 u_NormalMatrix;   // Transformation matrix of the normal
uniform vec3 u_LightColor;     // Light color
uniform vec3 u_LightPosition;  // Position of the light source
uniform vec3 u_DiffuseMat;     // Diffuse material color

varying vec4 vertexPosition;
varying vec3 v_normal;
varying vec2 v_TexCoord;

varying vec3 v_LightColor;     // Light color
varying vec3 v_LightPosition;  // Position of the light source
//varying vec3 v_DiffuseMat;     // Diffuse material color
varying vec3 v_CameraPos;      // Camera Position

void main() {             
    gl_Position = u_MvpMatrix * a_Position;
    v_TexCoord = a_TexCoord;

    // Calculate world coordinate of vertex
    vertexPosition = u_ModelMatrix * a_Position;
    
    // Calculate a normal to be fit with a model matrix, and make it 1.0 in length
    v_normal = normalize(vec3(u_NormalMatrix * a_Normal));

    //Per-Fragment Lighting
    //Make data accessible from the fragment shader
    v_LightColor = u_LightColor;
    v_LightPosition = u_LightPosition;
    //v_DiffuseMat = u_DiffuseMat;
}