//FRAGMENT SHADER

#ifdef GL_ES
precision mediump float;
#endif

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
  float d = length(v_LightPosition - vec3(vertexPosition)); 
  float atten = 1.0/(0.01 * d*d); 

  // Calculate the light direction and make it 1.0 in length
  vec3 lightDirection = normalize(v_LightPosition - vec3(vertexPosition));
  // The dot product of the light direction and the normal
  float nDotL = max(dot(lightDirection, v_normal), 0.0);
     
  // Calculate the color due to diffuse reflection
  vec3 diffuse = v_LightColor * v_DiffuseMat * nDotL;
     
  // Calculate the color due to ambient reflection
  vec3 ambient = v_AmbientLight * v_AmbientMat;
  vec3 specular = vec3(0.0,0.0,0.0);             
   
  if(nDotL > 0.0) {                             
    // Calculate specular component
    vec3 h = normalize(normalize(v_CameraPos - vec3(vertexPosition)) + lightDirection); 	
    float hDotn  = max(dot(h, v_normal), 0.0);  
    specular = v_LightColor * v_SpecularMat * pow(hDotn,v_Shininess);
  }                                            
  // Add the surface colors due to diffuse reflection and ambient reflection
  gl_FragColor = vec4(atten *(diffuse + specular)  + ambient, 1.0); 
}