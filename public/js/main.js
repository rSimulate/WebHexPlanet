 
function createPlanet(size) {
		

	var vertexSky = "//\n// Atmospheric scattering vertex shader\n//\n// Author: Sean O'Neil\n//\n// Copyright (c) 2004 Sean O'Neil\n//\n\nuniform vec3 v3LightPosition;	// The direction vector to the light source\nuniform vec3 v3InvWavelength;	// 1 / pow(wavelength, 4) for the red, green, and blue channels\nuniform float fCameraHeight;	// The camera's current height\nuniform float fCameraHeight2;	// fCameraHeight^2\nuniform float fOuterRadius;		// The outer (atmosphere) radius\nuniform float fOuterRadius2;	// fOuterRadius^2\nuniform float fInnerRadius;		// The inner (planetary) radius\nuniform float fInnerRadius2;	// fInnerRadius^2\nuniform float fKrESun;			// Kr * ESun\nuniform float fKmESun;			// Km * ESun\nuniform float fKr4PI;			// Kr * 4 * PI\nuniform float fKm4PI;			// Km * 4 * PI\nuniform float fScale;			// 1 / (fOuterRadius - fInnerRadius)\nuniform float fScaleDepth;		// The scale depth (i.e. the altitude at which the atmosphere's average density is found)\nuniform float fScaleOverScaleDepth;	// fScale / fScaleDepth\n\nconst int nSamples = 3;\nconst float fSamples = 3.0;\n\nvarying vec3 v3Direction;\nvarying vec3 c0;\nvarying vec3 c1;\n\n\nfloat scale(float fCos)\n{\n	float x = 1.0 - fCos;\n	return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));\n}\n\nvoid main(void)\n{\n	// Get the ray from the camera to the vertex and its length (which is the far point of the ray passing through the atmosphere)\n	vec3 v3Ray = position - cameraPosition;\n	float fFar = length(v3Ray);\n	v3Ray /= fFar;\n\n	// Calculate the closest intersection of the ray with the outer atmosphere (which is the near point of the ray passing through the atmosphere)\n	float B = 2.0 * dot(cameraPosition, v3Ray);\n	float C = fCameraHeight2 - fOuterRadius2;\n	float fDet = max(0.0, B*B - 4.0 * C);\n	float fNear = 0.5 * (-B - sqrt(fDet));\n\n	// Calculate the ray's starting position, then calculate its scattering offset\n	vec3 v3Start = cameraPosition + v3Ray * fNear;\n	fFar -= fNear;\n	float fStartAngle = dot(v3Ray, v3Start) / fOuterRadius;\n	float fStartDepth = exp(-1.0 / fScaleDepth);\n	float fStartOffset = fStartDepth * scale(fStartAngle);\n	//c0 = vec3(1.0, 0, 0) * fStartAngle;\n\n	// Initialize the scattering loop variables\n	float fSampleLength = fFar / fSamples;\n	float fScaledLength = fSampleLength * fScale;\n	vec3 v3SampleRay = v3Ray * fSampleLength;\n	vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;\n\n	//gl_FrontColor = vec4(0.0, 0.0, 0.0, 0.0);\n\n	// Now loop through the sample rays\n	vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);\n	for(int i=0; i<nSamples; i++)\n	{\n		float fHeight = length(v3SamplePoint);\n		float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));\n		float fLightAngle = dot(v3LightPosition, v3SamplePoint) / fHeight;\n		float fCameraAngle = dot(v3Ray, v3SamplePoint) / fHeight;\n		float fScatter = (fStartOffset + fDepth * (scale(fLightAngle) - scale(fCameraAngle)));\n		vec3 v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI));\n\n		v3FrontColor += v3Attenuate * (fDepth * fScaledLength);\n		v3SamplePoint += v3SampleRay;\n	}\n\n	// Finally, scale the Mie and Rayleigh colors and set up the varying variables for the pixel shader\n	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n	c0 = v3FrontColor * (v3InvWavelength * fKrESun);\n	c1 = v3FrontColor * fKmESun;\n	v3Direction = cameraPosition - position;\n}";
	
	var fragmentSky = "//\n// Atmospheric scattering fragment shader\n//\n// Author: Sean O'Neil\n//\n// Copyright (c) 2004 Sean O'Neil\n//\n\nuniform vec3 v3LightPos;\nuniform float g;\nuniform float g2;\n\nvarying vec3 v3Direction;\nvarying vec3 c0;\nvarying vec3 c1;\n\n// Calculates the Mie phase function\nfloat getMiePhase(float fCos, float fCos2, float g, float g2)\n{\n	return 1.5 * ((1.0 - g2) / (2.0 + g2)) * (1.0 + fCos2) / pow(1.0 + g2 - 2.0 * g * fCos, 1.5);\n}\n\n// Calculates the Rayleigh phase function\nfloat getRayleighPhase(float fCos2)\n{\n	return 0.75 + 0.75 * fCos2;\n}\n\nvoid main (void)\n{\n	float fCos = dot(v3LightPos, v3Direction) / length(v3Direction);\n	float fCos2 = fCos * fCos;\n\n	vec3 color =	getRayleighPhase(fCos2) * c0 +\n					getMiePhase(fCos, fCos2, g, g2) * c1;\n\n 	gl_FragColor = vec4(color, 1.0);\n	gl_FragColor.a = gl_FragColor.b;\n}";
	
vertexGround = "//\n// Atmospheric scattering vertex shader\n//\n// Author: Sean O'Neil\n//\n// Copyright (c) 2004 Sean O'Neil\n//\n// Ported for use with three.js/WebGL by James Baicoianu\n\nuniform vec3 v3LightPosition;		// The direction vector to the light source\nuniform vec3 v3InvWavelength;	// 1 / pow(wavelength, 4) for the red, green, and blue channels\nuniform float fCameraHeight;	// The camera's current height\nuniform float fCameraHeight2;	// fCameraHeight^2\nuniform float fOuterRadius;		// The outer (atmosphere) radius\nuniform float fOuterRadius2;	// fOuterRadius^2\nuniform float fInnerRadius;		// The inner (planetary) radius\nuniform float fInnerRadius2;	// fInnerRadius^2\nuniform float fKrESun;			// Kr * ESun\nuniform float fKmESun;			// Km * ESun\nuniform float fKr4PI;			// Kr * 4 * PI\nuniform float fKm4PI;			// Km * 4 * PI\nuniform float fScale;			// 1 / (fOuterRadius - fInnerRadius)\nuniform float fScaleDepth;		// The scale depth (i.e. the altitude at which the atmosphere's average density is found)\nuniform float fScaleOverScaleDepth;	// fScale / fScaleDepth\nuniform sampler2D tDiffuse;\n\nvarying vec3 v3Direction;\nvarying vec3 c0;\nvarying vec3 c1;\nvarying vec3 vNormal;\nvarying vec2 vUv;\n\nconst int nSamples = 3;\nconst float fSamples = 3.0;\n\nfloat scale(float fCos)\n{\n	float x = 1.0 - fCos;\n	return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));\n}\n\nvoid main(void)\n{\n	// Get the ray from the camera to the vertex and its length (which is the far point of the ray passing through the atmosphere)\n	vec3 v3Ray = position - cameraPosition;\n	float fFar = length(v3Ray);\n	v3Ray /= fFar;\n\n	// Calculate the closest intersection of the ray with the outer atmosphere (which is the near point of the ray passing through the atmosphere)\n	float B = 2.0 * dot(cameraPosition, v3Ray);\n	float C = fCameraHeight2 - fOuterRadius2;\n	float fDet = max(0.0, B*B - 4.0 * C);\n	float fNear = 0.5 * (-B - sqrt(fDet));\n\n	// Calculate the ray's starting position, then calculate its scattering offset\n	vec3 v3Start = cameraPosition + v3Ray * fNear;\n	fFar -= fNear;\n	float fDepth = exp((fInnerRadius - fOuterRadius) / fScaleDepth);\n	float fCameraAngle = dot(-v3Ray, position) / length(position);\n	float fLightAngle = dot(v3LightPosition, position) / length(position);\n	float fCameraScale = scale(fCameraAngle);\n	float fLightScale = scale(fLightAngle);\n	float fCameraOffset = fDepth*fCameraScale;\n	float fTemp = (fLightScale + fCameraScale);\n\n	// Initialize the scattering loop variables\n	float fSampleLength = fFar / fSamples;\n	float fScaledLength = fSampleLength * fScale;\n	vec3 v3SampleRay = v3Ray * fSampleLength;\n	vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;\n\n	// Now loop through the sample rays\n	vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);\n	vec3 v3Attenuate;\n	for(int i=0; i<nSamples; i++)\n	{\n		float fHeight = length(v3SamplePoint);\n		float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));\n		float fScatter = fDepth*fTemp - fCameraOffset;\n		v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI));\n		v3FrontColor += v3Attenuate * (fDepth * fScaledLength);\n		v3SamplePoint += v3SampleRay;\n	}\n\n	// Calculate the attenuation factor for the ground\n	c0 = v3Attenuate;\n	c1 = v3FrontColor * (v3InvWavelength * fKrESun + fKmESun);\n\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n	//gl_TexCoord[0] = gl_TextureMatrix[0] * gl_MultiTexCoord0;\n	//gl_TexCoord[1] = gl_TextureMatrix[1] * gl_MultiTexCoord1;\n  vUv = uv;\n  vNormal = normal;\n}";

fragmentGround = "//\n// Atmospheric scattering fragment shader\n//\n// Author: Sean O'Neil\n//\n// Copyright (c) 2004 Sean O'Neil\n//\n// Ported for use with three.js/WebGL by James Baicoianu\n\n//uniform sampler2D s2Tex1;\n//uniform sampler2D s2Tex2;\n\nuniform float fNightScale;\nuniform vec3 v3LightPosition;\nuniform sampler2D tDiffuse;\nuniform sampler2D tDiffuseNight;\n\nvarying vec3 c0;\nvarying vec3 c1;\nvarying vec3 vNormal;\nvarying vec2 vUv;\n\nvoid main (void)\n{\n	//gl_FragColor = vec4(c0, 1.0);\n	//gl_FragColor = vec4(0.25 * c0, 1.0);\n	//gl_FragColor = gl_Color + texture2D(s2Tex1, gl_TexCoord[0].st) * texture2D(s2Tex2, gl_TexCoord[1].st) * gl_SecondaryColor;\n\n\n	vec3 diffuseTex = texture2D( tDiffuse, vUv ).xyz;\n	vec3 diffuseNightTex = texture2D( tDiffuseNight, vUv ).xyz;\n\n	vec3 day = diffuseTex * c0;\n	vec3 night = fNightScale * diffuseNightTex * diffuseNightTex * diffuseNightTex * (1.0 - c0);\n\n	gl_FragColor = vec4(c1, 1.0) + vec4(day + night, 1.0);\n\n}";

	var diffuse = THREE.ImageUtils.loadTexture('images/TEWworld.jpg');
	var diffuseNight = THREE.ImageUtils.loadTexture('images/TEWworld-night.jpg');
	var maxAnisotropy = renderer.getMaxAnisotropy();
	
	diffuse.anisotropy = maxAnisotropy;
	
	diffuseNight.anisotropy = maxAnisotropy;


	var radius = size;
	var atmosphere = {
	  Kr: 0.0025,
	  Km: 0.0010,
	  ESun: 20.0,
	  g: -0.950,
	  innerRadius: size,
	  outerRadius: size * 1.025,
	  wavelength: [0.650, 0.570, 0.475],
	  scaleDepth: 0.25,
	  mieScaleDepth: 0.1
	};

	var uniforms = {
	  v3LightPosition: {
	    type: "v3",
	    value: new THREE.Vector3(1e8, 0, 1e8).normalize()
	  },
	  v3InvWavelength: {
	    type: "v3",
	    value: new THREE.Vector3(1 / Math.pow(atmosphere.wavelength[0], 4), 1 / Math.pow(atmosphere.wavelength[1], 4), 1 / Math.pow(atmosphere.wavelength[2], 4))
	  },
	  fCameraHeight: {
	    type: "f",
	    value: 0
	  },
	  fCameraHeight2: {
	    type: "f",
	    value: 0
	  },
	  fInnerRadius: {
	    type: "f",
	    value: atmosphere.innerRadius
	  },
	  fInnerRadius2: {
	    type: "f",
	    value: atmosphere.innerRadius * atmosphere.innerRadius
	  },
	  fOuterRadius: {
	    type: "f",
	    value: atmosphere.outerRadius
	  },
	  fOuterRadius2: {
	    type: "f",
	    value: atmosphere.outerRadius * atmosphere.outerRadius
	  },
	  fKrESun: {
	    type: "f",
	    value: atmosphere.Kr * atmosphere.ESun
	  },
	  fKmESun: {
	    type: "f",
	    value: atmosphere.Km * atmosphere.ESun
	  },
	  fKr4PI: {
	    type: "f",
	    value: atmosphere.Kr * 4.0 * Math.PI
	  },
	  fKm4PI: {
	    type: "f",
	    value: atmosphere.Km * 4.0 * Math.PI
	  },
	  fScale: {
	    type: "f",
	    value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius)
	  },
	  fScaleDepth: {
	    type: "f",
	    value: atmosphere.scaleDepth
	  },
	  fScaleOverScaleDepth: {
	    type: "f",
	    value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius) / atmosphere.scaleDepth
	  },
	  g: {
	    type: "f",
	    value: atmosphere.g
	  },
	  g2: {
	    type: "f",
	    value: atmosphere.g * atmosphere.g
	  },
	  nSamples: {
	    type: "i",
	    value: 3
	  },
	  fSamples: {
	    type: "f",
	    value: 3.0
	  },
	  tDiffuse: {
	    type: "t",
	    value: diffuse
	  },
	  tDiffuseNight: {
	    type: "t",
	    value: diffuseNight
	  },
	  tDisplacement: {
	    type: "t",
	    value: 0
	  },
	  tSkyboxDiffuse: {
	    type: "t",
	    value: 0
	  },
	  fNightScale: {
	    type: "f",
	    value: 1
	  }
	};

	var planetgeometry	= new THREE.SphereGeometry(size, 50, 50);
	var material	= new THREE.ShaderMaterial({
		uniforms: uniforms,
    	vertexShader: vertexGround,
    	fragmentShader: fragmentGround});
	var mesh	= new THREE.Mesh( planetgeometry, material ); 
	scene.add( mesh );
	mesh.rotation.y += 0.02;

	var cloudgeometry	= new THREE.SphereGeometry(size + 0.02, 50, 50);
	var cloudmaterial	= new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture("images/clouds.png"),
		color: 0xFFFFFF,
		transparent: true,
		opacity: 1.0});
	var cloudmesh	= new THREE.Mesh( cloudgeometry, cloudmaterial ); 
	scene.add( cloudmesh );

	var hexgeometry	= new THREE.IcosahedronGeometry(size + 0.01, 3);
	setHexUVs(hexgeometry);
	var material	= new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture("images/hex02.png"),
		color: 0xFFFFFF,
		transparent: true,
		opacity: 0.25
		});
	var hexmesh	= new THREE.Mesh( hexgeometry, material ); 
	scene.add( hexmesh );

	var atmopheregeometry	= new THREE.SphereGeometry(atmosphere.outerRadius, 500, 500);
	var atmospherematerial	= new THREE.ShaderMaterial({
		uniforms: uniforms,
    	vertexShader: vertexSky,
    	fragmentShader: fragmentSky
		} );
	var vector = new THREE.Vector3(1, 0, 0)
	var cameraHeight = camera.position.length()
	var atmospheremesh	= new THREE.Mesh( atmopheregeometry, atmospherematerial ); 
	atmospheremesh.material.side = THREE.BackSide;
	atmospheremesh.material.transparent = true;	
	scene.add( atmospheremesh );

	return {planet: mesh,
		atmosphere: atmospheremesh};
}
		
function drawSkyBox()  {
	var stargeometry = new THREE.IcosahedronGeometry(5000 , 2);
	var starmaterial	= new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture("images/MilkyWay.jpg"),
		side: THREE.BackSide,
		} );
	var starmesh	= new THREE.Mesh( stargeometry, starmaterial ); 
	scene.add( starmesh );
	
	return starmesh;
}



function lights() {
	var textureFlare0 = THREE.ImageUtils.loadTexture( "images/lensflare/lensflare0.png" );
	var textureFlare2 = THREE.ImageUtils.loadTexture( "images/lensflare/lensflare2.png" );
	var textureFlare3 = THREE.ImageUtils.loadTexture( "images/lensflare/lensflare3.png" );

	return addLight( 0.995, 0.025, 0.99, -500, 0, -1000 );

	function addLight( h, s, v, x, y, z ) {

		var light = new THREE.PointLight( 0xffffff, 1.5, 4500 );
		light.color.setHSL( h, s, v );
		light.position.set( x, y, z );
		scene.add( light );

		var flareColor = new THREE.Color( 0xffffff );
		flareColor.setHSL( h, s - 0.5, v + 0.5 );

		var lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );

		lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
		lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
		lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

		lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
		lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
		lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
		lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

		lensFlare.customUpdateCallback = function lensFlareUpdateCallback( object ) {

			var f, fl = object.lensFlares.length;
			var flare;
			var vecX = -object.positionScreen.x * 2;
			var vecY = -object.positionScreen.y * 2;


			for( f = 0; f < fl; f++ ) {

				   flare = object.lensFlares[ f ];

				   flare.x = object.positionScreen.x + vecX * flare.distance;
				   flare.y = object.positionScreen.y + vecY * flare.distance;

				   flare.rotation = 0;

			}

			object.lensFlares[ 2 ].y += 0.025;
			object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );

		}
		lensFlare.position = light.position;

		scene.add( lensFlare );
		return lensFlare;
	}		
}

