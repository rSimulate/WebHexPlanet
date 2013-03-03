//
// Atmospheric scattering fragment shader
//
// Author: Sean O'Neil
//
// Copyright (c) 2004 Sean O'Neil
//
// Ported for use with three.js/WebGL by James Baicoianu

//uniform sampler2D s2Tex1;
//uniform sampler2D s2Tex2;

uniform float fNightScale;
uniform vec3 v3LightPosition;
uniform sampler2D tDiffuse;
uniform sampler2D tDiffuseNight;

varying vec3 c0;
varying vec3 c1;
varying vec3 vNormal;
varying vec2 vUv;

void main (void)
{
  //gl_FragColor = vec4(c0, 1.0);
  //gl_FragColor = vec4(0.25 * c0, 1.0);
  //gl_FragColor = gl_Color + texture2D(s2Tex1, gl_TexCoord[0].st) * texture2D(s2Tex2, gl_TexCoord[1].st) * gl_SecondaryColor;

  vec3 diffuseTex = texture2D( tDiffuse, vUv ).xyz;
  vec3 diffuseNightTex = texture2D( tDiffuseNight, vUv ).xyz;

  vec3 day = diffuseTex * c0;
  vec3 night = fNightScale * diffuseNightTex * diffuseNightTex * diffuseNightTex * (1.0 - c0);

  gl_FragColor = vec4(c1, 1.0) + vec4(day + night, 1.0);

}
