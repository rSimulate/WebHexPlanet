function createPlanet(size) {
	var vertexSky = $("#vertexSky").text();
	var fragmentSky = $("#fragmentSky").text();
	var vertexGround = $("#vertexGround").text();
	var fragmentGround = $("#fragmentGround").text();

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
	  v3CameraPosition: {
	    type: "v3",
	    value: new THREE.Vector3(0, 0, 15)
	  },
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
	  },
	  m4ModelInverse: {
		type: "m4",
		value: THREE.Matrix4()
	  }
	};

	var planetgeometry	= new THREE.SphereGeometry(size, 50, 250);
	var material = new THREE.ShaderMaterial({
		uniforms: uniforms,
    	vertexShader: vertexGround,
    	fragmentShader: fragmentGround});
	var planetmesh	= new THREE.Mesh(planetgeometry, material); 
	scene.add(planetmesh);

	var cloudgeometry	= new THREE.SphereGeometry(size + 0.02, 50, 50);
	var cloudmaterial	= new THREE.MeshLambertMaterial({
		map: THREE.ImageUtils.loadTexture("images/clouds.png"),
		color: 0xFFFFFF,
		transparent: true,
		opacity: 1.0});
	var cloudmesh	= new THREE.Mesh(cloudgeometry, cloudmaterial); 
	planetmesh.add(cloudmesh);

	var hexgeometry	= new THREE.IcosahedronGeometry(size + 0.01, 3);
	setHexUVs(hexgeometry);
	var material	= new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture("images/hex02.png"),
		color: 0xFFFF00,
		transparent: true,
		opacity: 0.25
		});
	var hexmesh	= new THREE.Mesh(hexgeometry, material); 
	planetmesh.add(hexmesh);

	var atmopheregeometry	= new THREE.SphereGeometry(atmosphere.outerRadius, 50, 50);
	var atmospherematerial	= new THREE.ShaderMaterial({
		uniforms: uniforms,
    	vertexShader: vertexSky,
    	fragmentShader: fragmentSky
		});
	var vector = new THREE.Vector3(1, 0, 0)
	var cameraHeight = camera.position.length()
	var atmospheremesh	= new THREE.Mesh(atmopheregeometry, atmospherematerial); 
	atmospheremesh.material.side = THREE.BackSide;
	atmospheremesh.material.transparent = true;	
	planetmesh.add(atmospheremesh);

	return {
		planet: planetmesh,
		atmosphere: atmospheremesh,
		hex: hexmesh
	};
}
		
function drawSkyBox()  {
	var stargeometry = new THREE.SphereGeometry(5000 , 20, 20);
	var starmaterial	= new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture("images/MilkyWay.jpg"),
		side: THREE.BackSide,
		});
	var starmesh	= new THREE.Mesh(stargeometry, starmaterial); 
	scene.add(starmesh);
	
	return starmesh;
}

function lights() {
	var textureFlare0 = THREE.ImageUtils.loadTexture("images/lensflare/lensflare0.png");
	var textureFlare2 = THREE.ImageUtils.loadTexture("images/lensflare/lensflare2.png");
	var textureFlare3 = THREE.ImageUtils.loadTexture("images/lensflare/lensflare3.png");

	return addLight(0.995, 0.025, 0.99, 0, 0, 0);

	function addLight(h, s, v, x, y, z) {

		var light = new THREE.PointLight(0xffffff, 1.5, 4500);
		light.color.setHSL(h, s, v);
		light.position.set(x, y, z);
		scene.add(light);

		var flareColor = new THREE.Color(0xffffff);
		flareColor.setHSL(h, s - 0.5, v + 0.5);

		var lensFlare = new THREE.LensFlare(textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor);

		lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
		lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
		lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);

		lensFlare.add(textureFlare3, 60, 0.6, THREE.AdditiveBlending);
		lensFlare.add(textureFlare3, 70, 0.7, THREE.AdditiveBlending);
		lensFlare.add(textureFlare3, 120, 0.9, THREE.AdditiveBlending);
		lensFlare.add(textureFlare3, 70, 1.0, THREE.AdditiveBlending);

		lensFlare.customUpdateCallback = function lensFlareUpdateCallback(object) {

			var f, fl = object.lensFlares.length;
			var flare;
			var vecX = -object.positionScreen.x * 2;
			var vecY = -object.positionScreen.y * 2;


			for(f = 0; f < fl; f++) {

				   flare = object.lensFlares[ f ];

				   flare.x = object.positionScreen.x + vecX * flare.distance;
				   flare.y = object.positionScreen.y + vecY * flare.distance;

				   flare.rotation = 0;

			}

			object.lensFlares[ 2 ].y += 0.025;
			object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad(45);

		}
		lensFlare.position = light.position;

		scene.add(lensFlare);
		return lensFlare;
	}		
}

