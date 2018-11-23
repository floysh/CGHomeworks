//VERTEX SHADER 

attribute vec4 a_Position;
attribute vec4 a_Normal;   
  
uniform mat4 u_MvpMatrix;  
uniform mat4 u_ModelMatrix;    // Model matrix
uniform mat4 u_NormalMatrix;   // Transformation matrix of the normal
uniform vec3 u_LightColor;      // Light color
uniform vec3 u_LightPosition;  // Position of the light source
uniform vec3 u_AmbientLight;   // Ambient light color
uniform vec3 u_DiffuseMat;      // Diffuse material color
uniform vec3 u_SpecularMat;     // Specular material color
uniform float u_Shininess;      // Specular material shininess
uniform vec3 u_AmbientMat;      // Ambient material color
uniform vec3 u_CameraPos;       // Camera Position

varying vec4 vertexPosition;
varying vec3 v_normal;
 
varying vec3 v_LightColor;      // Light color
varying vec3 v_LightPosition;  // Position of the light source
varying vec3 v_AmbientLight;   // Ambient light color
varying vec3 v_DiffuseMat;      // Diffuse material color
varying vec3 v_SpecularMat;     // Specular material color
varying float v_Shininess;      // Specular material shininess
varying vec3 v_AmbientMat;      // Ambient material color
varying vec3 v_CameraPos;       // Camera Position

  
void main() {                
  gl_Position = u_MvpMatrix * a_Position;

  // Calculate world coordinate of vertex
  vertexPosition = u_ModelMatrix * a_Position;

  // Calculate a normal to be fit with a model matrix, and make it 1.0 in length
  v_normal = normalize(vec3(u_NormalMatrix * a_Normal));

  //Make data accessible from the fragment shader
  v_LightColor = u_LightColor;
  v_LightPosition = u_LightPosition;
  v_AmbientLight = u_AmbientLight;
  v_DiffuseMat = u_DiffuseMat;
  v_SpecularMat = u_SpecularMat;
  v_Shininess = u_Shininess;
  v_AmbientMat = u_AmbientMat;
  v_CameraPos = u_CameraPos;
}