scene = new THREE.Scene()
camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000)

renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setClearColorHex(0x000000, 1)

$('div.viewport').append(renderer.domElement)
$(window).resize ->
	camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000)
	renderer.setSize( window.innerWidth, window.innerHeight )

vertexSky =
"""
//
// Atmospheric scattering vertex shader
//
// Author: Sean O'Neil
//
// Copyright (c) 2004 Sean O'Neil
//

uniform vec3 v3LightPosition;	// The direction vector to the light source
uniform vec3 v3InvWavelength;	// 1 / pow(wavelength, 4) for the red, green, and blue channels
uniform float fCameraHeight;	// The camera's current height
uniform float fCameraHeight2;	// fCameraHeight^2
uniform float fOuterRadius;		// The outer (atmosphere) radius
uniform float fOuterRadius2;	// fOuterRadius^2
uniform float fInnerRadius;		// The inner (planetary) radius
uniform float fInnerRadius2;	// fInnerRadius^2
uniform float fKrESun;			// Kr * ESun
uniform float fKmESun;			// Km * ESun
uniform float fKr4PI;			// Kr * 4 * PI
uniform float fKm4PI;			// Km * 4 * PI
uniform float fScale;			// 1 / (fOuterRadius - fInnerRadius)
uniform float fScaleDepth;		// The scale depth (i.e. the altitude at which the atmosphere's average density is found)
uniform float fScaleOverScaleDepth;	// fScale / fScaleDepth

const int nSamples = 3;
const float fSamples = 3.0;

varying vec3 v3Direction;
varying vec3 c0;
varying vec3 c1;


float scale(float fCos)
{
	float x = 1.0 - fCos;
	return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));
}

void main(void)
{
	// Get the ray from the camera to the vertex and its length (which is the far point of the ray passing through the atmosphere)
	vec3 v3Ray = position - cameraPosition;
	float fFar = length(v3Ray);
	v3Ray /= fFar;

	// Calculate the closest intersection of the ray with the outer atmosphere (which is the near point of the ray passing through the atmosphere)
	float B = 2.0 * dot(cameraPosition, v3Ray);
	float C = fCameraHeight2 - fOuterRadius2;
	float fDet = max(0.0, B*B - 4.0 * C);
	float fNear = 0.5 * (-B - sqrt(fDet));

	// Calculate the ray's starting position, then calculate its scattering offset
	vec3 v3Start = cameraPosition + v3Ray * fNear;
	fFar -= fNear;
	float fStartAngle = dot(v3Ray, v3Start) / fOuterRadius;
	float fStartDepth = exp(-1.0 / fScaleDepth);
	float fStartOffset = fStartDepth * scale(fStartAngle);
	//c0 = vec3(1.0, 0, 0) * fStartAngle;

	// Initialize the scattering loop variables
	float fSampleLength = fFar / fSamples;
	float fScaledLength = fSampleLength * fScale;
	vec3 v3SampleRay = v3Ray * fSampleLength;
	vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;

	//gl_FrontColor = vec4(0.0, 0.0, 0.0, 0.0);

	// Now loop through the sample rays
	vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);
	for(int i=0; i<nSamples; i++)
	{
		float fHeight = length(v3SamplePoint);
		float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));
		float fLightAngle = dot(v3LightPosition, v3SamplePoint) / fHeight;
		float fCameraAngle = dot(v3Ray, v3SamplePoint) / fHeight;
		float fScatter = (fStartOffset + fDepth * (scale(fLightAngle) - scale(fCameraAngle)));
		vec3 v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI));

		v3FrontColor += v3Attenuate * (fDepth * fScaledLength);
		v3SamplePoint += v3SampleRay;
	}

	// Finally, scale the Mie and Rayleigh colors and set up the varying variables for the pixel shader
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	c0 = v3FrontColor * (v3InvWavelength * fKrESun);
	c1 = v3FrontColor * fKmESun;
	v3Direction = cameraPosition - position;
}
"""

fragmentSky =
"""
//
// Atmospheric scattering fragment shader
//
// Author: Sean O'Neil
//
// Copyright (c) 2004 Sean O'Neil
//

uniform vec3 v3LightPos;
uniform float g;
uniform float g2;

varying vec3 v3Direction;
varying vec3 c0;
varying vec3 c1;

// Calculates the Mie phase function
float getMiePhase(float fCos, float fCos2, float g, float g2)
{
	return 1.5 * ((1.0 - g2) / (2.0 + g2)) * (1.0 + fCos2) / pow(1.0 + g2 - 2.0 * g * fCos, 1.5);
}

// Calculates the Rayleigh phase function
float getRayleighPhase(float fCos2)
{
	return 0.75 + 0.75 * fCos2;
}

void main (void)
{
	float fCos = dot(v3LightPos, v3Direction) / length(v3Direction);
	float fCos2 = fCos * fCos;

	vec3 color =	getRayleighPhase(fCos2) * c0 +
					getMiePhase(fCos, fCos2, g, g2) * c1;

 	gl_FragColor = vec4(color, 1.0);
	gl_FragColor.a = gl_FragColor.b;
}
"""

vertexGround =
"""
//
// Atmospheric scattering vertex shader
//
// Author: Sean O'Neil
//
// Copyright (c) 2004 Sean O'Neil
//
// Ported for use with three.js/WebGL by James Baicoianu

uniform vec3 v3LightPosition;		// The direction vector to the light source
uniform vec3 v3InvWavelength;	// 1 / pow(wavelength, 4) for the red, green, and blue channels
uniform float fCameraHeight;	// The camera's current height
uniform float fCameraHeight2;	// fCameraHeight^2
uniform float fOuterRadius;		// The outer (atmosphere) radius
uniform float fOuterRadius2;	// fOuterRadius^2
uniform float fInnerRadius;		// The inner (planetary) radius
uniform float fInnerRadius2;	// fInnerRadius^2
uniform float fKrESun;			// Kr * ESun
uniform float fKmESun;			// Km * ESun
uniform float fKr4PI;			// Kr * 4 * PI
uniform float fKm4PI;			// Km * 4 * PI
uniform float fScale;			// 1 / (fOuterRadius - fInnerRadius)
uniform float fScaleDepth;		// The scale depth (i.e. the altitude at which the atmosphere's average density is found)
uniform float fScaleOverScaleDepth;	// fScale / fScaleDepth
uniform sampler2D tDiffuse;

varying vec3 v3Direction;
varying vec3 c0;
varying vec3 c1;
varying vec3 vNormal;
varying vec2 vUv;

const int nSamples = 3;
const float fSamples = 3.0;

float scale(float fCos)
{
	float x = 1.0 - fCos;
	return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));
}

void main(void)
{
	// Get the ray from the camera to the vertex and its length (which is the far point of the ray passing through the atmosphere)
	vec3 v3Ray = position - cameraPosition;
	float fFar = length(v3Ray);
	v3Ray /= fFar;

	// Calculate the closest intersection of the ray with the outer atmosphere (which is the near point of the ray passing through the atmosphere)
	float B = 2.0 * dot(cameraPosition, v3Ray);
	float C = fCameraHeight2 - fOuterRadius2;
	float fDet = max(0.0, B*B - 4.0 * C);
	float fNear = 0.5 * (-B - sqrt(fDet));

	// Calculate the ray's starting position, then calculate its scattering offset
	vec3 v3Start = cameraPosition + v3Ray * fNear;
	fFar -= fNear;
	float fDepth = exp((fInnerRadius - fOuterRadius) / fScaleDepth);
	float fCameraAngle = dot(-v3Ray, position) / length(position);
	float fLightAngle = dot(v3LightPosition, position) / length(position);
	float fCameraScale = scale(fCameraAngle);
	float fLightScale = scale(fLightAngle);
	float fCameraOffset = fDepth*fCameraScale;
	float fTemp = (fLightScale + fCameraScale);

	// Initialize the scattering loop variables
	float fSampleLength = fFar / fSamples;
	float fScaledLength = fSampleLength * fScale;
	vec3 v3SampleRay = v3Ray * fSampleLength;
	vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;

	// Now loop through the sample rays
	vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);
	vec3 v3Attenuate;
	for(int i=0; i<nSamples; i++)
	{
		float fHeight = length(v3SamplePoint);
		float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));
		float fScatter = fDepth*fTemp - fCameraOffset;
		v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI));
		v3FrontColor += v3Attenuate * (fDepth * fScaledLength);
		v3SamplePoint += v3SampleRay;
	}

	// Calculate the attenuation factor for the ground
	c0 = v3Attenuate;
	c1 = v3FrontColor * (v3InvWavelength * fKrESun + fKmESun);

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	//gl_TexCoord[0] = gl_TextureMatrix[0] * gl_MultiTexCoord0;
	//gl_TexCoord[1] = gl_TextureMatrix[1] * gl_MultiTexCoord1;
  vUv = uv;
  vNormal = normal;
}
"""

fragmentGround =
"""
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
"""



radius = 100.0
###
atmosphere =
	Kr				: 0.0025
	Km				: 0.0010
	ESun			: 15.0
	g				: -0.990
	innerRadius 	: radius
	outerRadius		: radius * 1.05
	wavelength		: [0.650, 0.570, 0.475]
	scaleDepth		: 0.25
	mieScaleDepth	:	0.1
###
atmosphere =
	Kr				: 0.0025
	Km				: 0.0010
	ESun			: 20.0
	g				: -0.950
	innerRadius 	: 100
	outerRadius		: 102.5
	wavelength		: [0.650, 0.570, 0.475]
	scaleDepth		: 0.25
	mieScaleDepth	: 0.1


diffuse = THREE.ImageUtils.loadTexture('/map-small.jpg')
diffuseNight = THREE.ImageUtils.loadTexture('/map-lights.jpg')

maxAnisotropy = renderer.getMaxAnisotropy();
diffuse.anisotropy = maxAnisotropy;
diffuseNight.anisotropy = maxAnisotropy;

uniforms =
	v3LightPosition:
		type:	"v3"
		value:	new THREE.Vector3(1e8, 0, 1e8).normalize()
	v3InvWavelength:
		type:	"v3"
		value:	new THREE.Vector3(1 / Math.pow(atmosphere.wavelength[0], 4), 1 / Math.pow(atmosphere.wavelength[1], 4), 1 / Math.pow(atmosphere.wavelength[2], 4))
	fCameraHeight:
		type:	"f"
		value:	0
	fCameraHeight2:
		type:	"f"
		value:	0
	fInnerRadius:
		type:	"f"
		value:	atmosphere.innerRadius
	fInnerRadius2:
		type:	"f"
		value:	atmosphere.innerRadius * atmosphere.innerRadius
	fOuterRadius:
		type:	"f"
		value:	atmosphere.outerRadius
	fOuterRadius2:
		type:	"f"
		value:	atmosphere.outerRadius * atmosphere.outerRadius
	fKrESun:
		type:	"f"
		value:	atmosphere.Kr * atmosphere.ESun
	fKmESun:
		type:	"f"
		value:	atmosphere.Km * atmosphere.ESun
	fKr4PI:
		type:	"f"
		value:	atmosphere.Kr * 4.0 * Math.PI
	fKm4PI:
		type:	"f"
		value:	atmosphere.Km * 4.0 * Math.PI
	fScale:
		type:	"f"
		value:	1 / (atmosphere.outerRadius - atmosphere.innerRadius)
	fScaleDepth:
		type:	"f"
		value:	atmosphere.scaleDepth
	fScaleOverScaleDepth:
		type:	"f"
		value:	1 / (atmosphere.outerRadius - atmosphere.innerRadius) / atmosphere.scaleDepth
	g:
		type:	"f"
		value:	atmosphere.g
	g2:
		type:	"f"
		value:	atmosphere.g * atmosphere.g
	nSamples:
		type:	"i"
		value:	3
	fSamples:
		type:	"f"
		value:	3.0
	tDiffuse:
		type:	"t"
		value:	diffuse
	tDiffuseNight:
		type:	"t"
		value:	diffuseNight
	tDisplacement:
		type:	"t"
		value:	0
	tSkyboxDiffuse:
		type:	"t"
		value:	0
	fNightScale:
		type:	"f"
		value:	1;

ground =
	geometry:	new THREE.SphereGeometry(atmosphere.innerRadius, 50, 50)
	material:	new THREE.ShaderMaterial
		uniforms:		uniforms
		vertexShader:	vertexGround
		fragmentShader:	fragmentGround

ground.mesh = new THREE.Mesh(ground.geometry, ground.material)
scene.add(ground.mesh)

sky =
	geometry:	new THREE.SphereGeometry(atmosphere.outerRadius, 500, 500)
	material:	new THREE.ShaderMaterial
		uniforms:		uniforms
		vertexShader:	vertexSky
		fragmentShader:	fragmentSky

sky.mesh = new THREE.Mesh(sky.geometry, sky.material)
sky.material.side = THREE.BackSide
sky.material.transparent = true;
scene.add(sky.mesh)

c = null
f = 0
g = 0




render = ->
	requestAnimationFrame(render)
	# material.uniforms.v3LightPos.value.y += 0.01

	f += 0.0002
	g += 0.008


	vector = new THREE.Vector3(radius * 1.9, 0, 0)
	euler = new THREE.Vector3(g / 60 + 12, -f * 10 + 20, 0)
	matrix = new THREE.Matrix4().setRotationFromEuler(euler)
	eye = matrix.multiplyVector3(vector)

	camera.position = eye;
	# camera.position = new THREE.Vector3(radius * 1.9, radius * 1.9 * Math.sin(g), radius * 1.9 * Math.cos(g))
	camera.lookAt(new THREE.Vector3(0, 0, 0))


	# ground.mesh.rotation.z += 0.005;
	# ground.mesh.rotation.x += 0.001;
	# sky.mesh.rotation.z += 0.005;
	# sky.mesh.rotation.x += 0.001;

	vector = new THREE.Vector3(1, 0, 0)
	euler = new THREE.Vector3(f, g, 0)
	matrix = new THREE.Matrix4().setRotationFromEuler(euler)
	light = matrix.multiplyVector3(vector)

	cameraHeight = camera.position.length()



	sky.material.uniforms.v3LightPosition.value = light
	sky.material.uniforms.fCameraHeight.value = cameraHeight
	sky.material.uniforms.fCameraHeight2.value = cameraHeight * cameraHeight

	ground.material.uniforms.v3LightPosition.value = light
	ground.material.uniforms.fCameraHeight.value = cameraHeight
	ground.material.uniforms.fCameraHeight2.value = cameraHeight * cameraHeight

	renderer.render(scene, camera)

render()